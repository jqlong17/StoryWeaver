import sys
import json
import requests
import re
import os
import time
from config import DEEPSEEK_API_KEY, DEEPSEEK_API_URL
import logging

SUPPORTED_TYPES = ["main_story", "character", "scene", "shot", "animation", "ui", "instance"]

# 通用JSON提取
def extract_json(text, debug_file_path=None):
    """
    尝试多种方式提取有效JSON字符串，只有全部失败时才写debug文件。
    debug_file_path: 仅在最终失败时才写入debug文件。
    返回: json字符串或None
    """
    original_text = text
    text = text.strip()
    errors = []
    # 1. 去除 markdown 包裹
    if text.startswith('```json'):
        text = text[7:]
    if text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    # 2. 尝试提取第一个大括号包裹的内容
    match = re.search(r"{[\s\S]*}", text)
    candidate = match.group(0) if match else text
    # 3. 尝试直接解析
    try:
        json.loads(candidate)
        return candidate
    except Exception as e1:
        errors.append(f"直接解析失败: {e1}")
    # 4. 尝试修复常见括号不匹配
    try:
        left = candidate.count('{')
        right = candidate.count('}')
        if left > right:
            candidate_fixed = candidate + ('}' * (left - right))
        elif right > left:
            candidate_fixed = candidate.rstrip('}' * (right - left))
        else:
            candidate_fixed = candidate
        json.loads(candidate_fixed)
        logging.warning("extract_json: 括号数量不匹配已自动修复。")
        return candidate_fixed
    except Exception as e2:
        errors.append(f"括号修复后解析失败: {e2}")
    # 5. 其他修复手段可扩展...
    # 6. 最终都失败才写 debug 文件
    if debug_file_path:
        with open(debug_file_path, "w", encoding="utf-8") as f:
            f.write("【原始AI输出】\n")
            f.write(original_text)
            f.write("\n\n【处理后内容】\n")
            f.write(candidate)
            f.write("\n\n【异常信息】\n")
            for err in errors:
                f.write(err + "\n")
        logging.error(f"extract_json: 所有修复均失败，已写入debug文件: {debug_file_path}")
    return None

# 自动推断类型（保留，备用）
def auto_detect_type(keyword):
    prompt = (
        f"用户输入了剧情关键词：'{keyword}'。请你根据该关键词，判断最适合生成哪种叙事类游戏内容类型。"
        "可选类型有：main_story（主线剧情）、character（角色）、scene（场景）、shot（镜头）、animation（动画）、ui（UI）、instance（副本/玩法机制）。"
        "请只返回最适合的类型英文标识（如main_story），不要输出其他内容。"
    )
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个资深的游戏剧情策划专家，擅长为各类叙事类游戏设计主线剧情、角色、场景、镜头、动画、UI和玩法机制。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 20
    }
    response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data)
    response.raise_for_status()
    type_str = response.json()["choices"][0]["message"]["content"].strip().lower()
    type_str = type_str.split("\n")[0].strip()
    if type_str not in SUPPORTED_TYPES:
        type_str = "main_story"
    return type_str

# DeepSeek API统一调用
def call_deepseek_api(prompt):
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个资深的游戏剧情策划专家，擅长为各类叙事类游戏（如奇幻、科幻、悬疑、冒险、恋爱、校园、历史、都市等）设计主线剧情、角色、场景、镜头、动画、UI和玩法机制。你熟悉中西方叙事结构，能够结合中国文化特色和现代游戏设计理念，生成结构清晰、情感丰富、逻辑严密、可落地的剧情内容。你的输出应符合以下要求："
             "- 结构化、条理清晰，适合直接用于游戏开发"
             "- 语言生动、富有画面感，兼顾文学性与可实现性"
             "- 充分考虑玩家体验、分支选择与互动性"
             "- 输出内容全部为中文"
             "- 严格遵循用户给定的主题、类型和风格提示"},
            {"role": "user", "content": prompt}
        ]
    }
    response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

# 主线剧情+结构化章节-场景-镜头生成
def get_deepseek_story_structure(keyword, genre_hint=None):
    genre_part = f"类型建议：{genre_hint}。" if genre_hint else ""
    prompt = (
        f"请以'{keyword}'为主题，生成一个适用于叙事类游戏的主线剧情结构和详细分解，要求内容丰富、细节具体，便于直接用于游戏开发。{genre_part}"
        "输出JSON，结构如下："
        "{\n  \"main_story\": {...},"
        "  \"story_structure\": {"
        "    \"chapters\": ["
        "      {"
        "        \"id\": 1, \"title\": \"章节标题\", \"desc\": \"章节简介\"," 
        "        \"scenes\": ["
        "          {"
        "            \"id\": 1, \"title\": \"场景名\", \"desc\": \"场景描述\", \"background\": \"背景图建议\"," 
        "            \"shots\": ["
        "              {\"id\": 1, \"type\": \"远景/中景/近景/特写\", \"desc\": \"镜头描述\"},"
        "              {\"id\": 2, \"type\": \"特写\", \"desc\": \"镜头描述\"}"
        "            ]"
        "          },"
        "          {\"id\": 2, ...},"
        "          {\"id\": 3, ...}"
        "        ]"
        "      },"
        "      {\"id\": 2, ...},"
        "      {\"id\": 3, ...},"
        "      {\"id\": 4, ...},"
        "      {\"id\": 5, ...}"
        "    ]"
        "  }"
        "}\n"
        "要求：所有字段必须有，内容具体、细节丰富，不能用省略号、示例或'等'字样代替真实内容。章节不少于5个，每章场景不少于3个，每场景镜头不少于2个。所有描述均为中文。"
    )
    return call_deepseek_api(prompt)

# 角色生成
def get_deepseek_character(keyword, main_story=None):
    context = f"主线剧情信息：{main_story}\n" if main_story else ""
    prompt = (
        f"{context}请基于上述主线剧情和'{keyword}'为主题，生成适用于叙事类游戏的主要角色设定。"
        "输出JSON，结构如下："
        "{\n  \"characters\": ["
        "    {\"id\": 1, \"name\": \"角色名\", \"desc\": \"一句话性格/背景描述\", \"relation\": \"与主角/其他角色关系\", \"traits\": [\"性格特征\"]},"
        "    ..."
        "  ]\n}"
        "要求：至少生成4个主要角色，性格、背景、关系各异，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

# 动画生成
def get_deepseek_animation(keyword, characters=None):
    context = f"主要角色信息：{characters}\n" if characters else ""
    prompt = (
        f"{context}请基于上述角色设定和'{keyword}'为主题，生成适用于叙事类游戏、可直接用于Live2D/Spine/DragonBones等动画引擎的动画动作库。"
        "输出JSON，结构如下："
        "{\n  \"animations\": ["
        "    {\"id\": 1, \"name\": \"动画名称\", \"desc\": \"剧情/表现描述\", \"applies_to\": [\"角色名\", \"场景名\"], \"type\": \"表情/动作/特效/过渡等\", \"live2d_motion\": \"Live2D动作名\", \"parameters\": {\"duration\": 3.5, \"loop\": false, \"expression\": \"happy\", \"effect\": \"xxx\"}, \"resources\": [\"xxx.model3.json\", \"xxx.png\", \"xxx.mp3\"], \"triggers\": [\"触发条件1\", \"触发条件2\"], \"timeline\": [{\"time\": 0, \"action\": \"start\"}, ...]}"
        "    ..."
        "  ]\n}"
        "要求：每个动画都要有工程化字段，desc为文学性描述，其余字段便于动画师/程序直接落地。至少生成6个动画，类型多样，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

# UI生成
def get_deepseek_ui(keyword, scenes=None):
    context = f"场景信息：{scenes}\n" if scenes else ""
    prompt = (
        f"{context}请基于上述场景设定和'{keyword}'为主题，生成适用于叙事类游戏的UI组件结构。"
        "输出JSON，结构如下："
        "{\n  \"ui\": ["
        "    {\"id\": 1, \"name\": \"组件名\", \"desc\": \"组件描述\", \"resource\": \"资源建议\"},"
        "    ..."
        "  ]\n}"
        "要求：至少生成5个UI组件，风格多样，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

# 副本/玩法机制生成
def get_deepseek_instance(keyword, main_story=None):
    context = f"主线剧情信息：{main_story}\n" if main_story else ""
    prompt = (
        f"{context}请基于上述主线剧情和'{keyword}'为主题，生成适用于叙事类游戏的副本与玩法机制。"
        "输出JSON，结构如下："
        "{\n  \"instances\": ["
        "    {\"id\": 1, \"name\": \"副本/机制名\", \"desc\": \"机制描述\", \"goal\": \"目标\", \"reward\": \"奖励\"},"
        "    ..."
        "  ]\n}"
        "要求：至少生成3种机制，内容丰富，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

# 角色外观与AI绘图prompt生成
def get_deepseek_character_appearance(keyword, characters=None):
    context = f"主要角色信息：{characters}\n" if characters else ""
    prompt = (
        f"{context}请为上述每个角色生成详细的外观描述和适合AI绘图的prompt。"
        "输出JSON，结构如下："
        "{\n  \"appearances\": ["
        "    {\"character_id\": 1, \"name\": \"角色名\", \"appearance\": \"外观描述\", \"prompt\": \"AI绘图prompt\"},"
        "    ..."
        "  ]\n}"
        "要求：appearance为中文，prompt为适合AI绘图的英文描述，内容具体、风格多样。"
    )
    return call_deepseek_api(prompt)

# 互动机制生成
def get_deepseek_interaction_mechanics(keyword, scene=None, main_story=None):
    context = ''
    if main_story:
        context += f"主线剧情信息：{main_story}\n"
    if scene:
        context += f"当前场景信息：{scene}\n"
    prompt = (
        f"{context}请为上述场景设计与剧情背景紧密结合的互动机制（如卡牌、骰子、答题、战斗等），要求每个机制都能影响剧情走向或角色命运。"
        "输出JSON，结构如下："
        "{\n  \"interactions\": ["
        "    {\"type\": \"卡牌/骰子/答题/战斗等\", \"desc\": \"机制描述\", \"options\": ["
        "      {\"choice\": \"选项A\", \"effect\": \"影响/后果\"},"
        "      {\"choice\": \"选项B\", \"effect\": \"影响/后果\"}"
        "    ], \"background_relevance\": \"与剧情/世界观的关联说明\"}"
        "  ]\n}"
        "要求：机制类型、描述、选项、后果、与剧情的关联都要具体，内容必须和本场景及主线剧情高度相关，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

# 剧情分支/决策点生成
def get_deepseek_story_branches(keyword, scene=None, main_story=None):
    context = ''
    if main_story:
        context += f"主线剧情信息：{main_story}\n"
    if scene:
        context += f"当前场景信息：{scene}\n"
    prompt = (
        f"{context}请为上述场景设计关键剧情分支和用户决策点，要求每个决策都能影响后续剧情、角色关系或结局。"
        "输出JSON，结构如下："
        "{\n  \"branches\": ["
        "    {\"decision_point\": \"决策描述\", \"choices\": ["
        "      {\"option\": \"选项A\", \"next_scene\": 2, \"impact\": \"后果/影响\"},"
        "      {\"option\": \"选项B\", \"next_scene\": 3, \"impact\": \"后果/影响\"}"
        "    ]}"
        "  ]\n}"
        "要求：每个分支点都要有决策描述、选项、后续场景编号、影响说明，内容必须和本场景及主线剧情高度相关，所有描述为中文。"
    )
    return call_deepseek_api(prompt)

def parse_story_structure_and_generate_scene_details(story_structure, character_list, animation_list, appearance_list, ui_list, output_dir, keyword=None, main_story=None):
    scenes_details = []
    appearance_map = {}
    if appearance_list:
        for item in appearance_list:
            if 'character_id' in item:
                appearance_map[item['character_id']] = item
            elif 'name' in item:
                appearance_map[item['name']] = item
    char_map = {c['name']: c for c in character_list} if character_list else {}
    for chapter in story_structure.get('chapters', []):
        chapter_id = chapter.get('id')
        chapter_title = chapter.get('title')
        for scene in chapter.get('scenes', []):
            scene_id = scene.get('id')
            scene_title = scene.get('title')
            scene_desc = scene.get('desc')
            shots = scene.get('shots', [])
            scene_characters = scene.get('characters', []) if 'characters' in scene else []
            characters_detail = []
            for cname in scene_characters:
                cinfo = char_map.get(cname, {'name': cname})
                appearance = None
                for a in appearance_list or []:
                    if a.get('name') == cname or a.get('character_id') == cinfo.get('id'):
                        appearance = a
                        break
                characters_detail.append({
                    'name': cname,
                    'info': cinfo,
                    'appearance': appearance
                })
            scene_animations = []
            for ani in animation_list or []:
                applies = ani.get('applies_to', [])
                if any(cname in applies for cname in scene_characters):
                    scene_animations.append(ani)
            scene_ui = []
            for ui in ui_list or []:
                if scene_title in ui.get('desc', '') or scene_title in ui.get('resource', ''):
                    scene_ui.append(ui)
            choices = scene.get('choices', [])
            if not isinstance(choices, list):
                choices = []
            interactions = scene.get('interactions', [])
            if not isinstance(interactions, list):
                interactions = []
            ending_trigger = scene.get('ending_trigger', None)
            if not isinstance(ending_trigger, dict):
                ending_trigger = {
                    'is_ending': False,
                    'ending_type': '',
                    'condition': '',
                    'desc': ''
                }
            # 新增：自动生成互动机制和分支决策
            scene_context = json.dumps({
                'chapter_id': chapter_id,
                'chapter_title': chapter_title,
                'scene_id': scene_id,
                'scene_title': scene_title,
                'scene_desc': scene_desc,
                'shots': shots
            }, ensure_ascii=False)
            # 互动机制
            interactions_data = None
            try:
                if keyword:
                    result = get_deepseek_interaction_mechanics(keyword, scene=scene_context, main_story=main_story)
                    result = extract_json(result)
                    parsed = json.loads(result)
                    interactions_data = parsed.get('interactions', [])
            except Exception as e:
                print(f"[WARNING] 互动机制生成失败: {e}")
                interactions_data = []
            # 分支决策
            branches_data = None
            try:
                if keyword:
                    result = get_deepseek_story_branches(keyword, scene=scene_context, main_story=main_story)
                    result = extract_json(result)
                    parsed = json.loads(result)
                    branches_data = parsed.get('branches', [])
            except Exception as e:
                print(f"[WARNING] 分支决策生成失败: {e}")
                branches_data = []
            scenes_details.append({
                'chapter_id': chapter_id,
                'chapter_title': chapter_title,
                'scene_id': scene_id,
                'scene_title': scene_title,
                'scene_desc': scene_desc,
                'shots': shots,
                'characters': characters_detail,
                'animations': scene_animations,
                'ui': scene_ui,
                'choices': choices,
                'interactions': interactions_data if interactions_data is not None else interactions,
                'branches': branches_data if branches_data is not None else [],
                'ending_trigger': ending_trigger
            })
    with open(os.path.join(output_dir, 'scenes_details.json'), 'w', encoding='utf-8') as f:
        json.dump({'scenes': scenes_details}, f, ensure_ascii=False, indent=2)
    print('scenes_details.json 已生成，包含分支、互动、决策等字段。')

# 主入口：一键全量生成
def main():
    if len(sys.argv) < 2:
        print("用法: python main_story_gen.py <关键词>")
        sys.exit(1)
    keyword = sys.argv[1]
    # 生成时间戳文件夹
    timestamp = time.strftime("%Y%m%d%H%M%S")
    output_dir = os.path.join(os.getcwd(), timestamp)
    os.makedirs(output_dir, exist_ok=True)
    print(f"本次生成的所有文件将保存在：{output_dir}")
    print(f"你输入的关键词是：{keyword}")
    print("正在生成主线剧情和结构化章节-场景-镜头...")
    # 1. 主线剧情+结构化章节-场景-镜头
    try:
        result = get_deepseek_story_structure(keyword)
        print("[DEBUG] AI原始返回内容（前300）：\n", result[:300])
        print("[DEBUG] AI原始返回内容（后300）：\n", result[-300:])
        print(f"[DEBUG] AI原始返回内容总长度: {len(result)}")
        # 保存原始内容
        with open(os.path.join(output_dir, "debug_ai_output_raw.txt"), "w", encoding="utf-8") as f:
            f.write(result)
        result_extracted = extract_json(result)
        if not result_extracted or not result_extracted.strip().startswith('{'):
            print("[ERROR] AI返回内容不是以'{'开头，或无法提取有效JSON！\n内容片段：", (result_extracted or '')[:200])
            # 只有此时才写debug文件
            extract_json(result, debug_file_path=os.path.join(output_dir, "debug_ai_output_extracted.txt"))
            raise ValueError("AI输出无法提取为有效JSON，请检查debug文件。")
        print(f"[DEBUG] extract_json后内容长度: {len(result_extracted)}")
        story_data = json.loads(result_extracted)
        with open(os.path.join(output_dir, "main_story.json"), "w", encoding="utf-8") as f:
            json.dump(story_data["main_story"], f, ensure_ascii=False, indent=2)
        with open(os.path.join(output_dir, "story_structure.json"), "w", encoding="utf-8") as f:
            json.dump(story_data["story_structure"], f, ensure_ascii=False, indent=2)
        print("main_story.json 和 story_structure.json 已生成。")
    except Exception as e:
        print("主线剧情/结构化剧情生成失败：", e)
        import traceback
        traceback.print_exc()
        print("[提示] 仅在AI输出无法提取为有效JSON时才写debug文件，建议人工检查JSON格式或补全缺失部分后重试。")
        story_data = {"main_story": None, "story_structure": None}
    # 2. 角色
    print("正在生成角色...")
    try:
        main_story_str = json.dumps(story_data["main_story"], ensure_ascii=False) if story_data["main_story"] else None
        result = get_deepseek_character(keyword, main_story=main_story_str)
        result = extract_json(result)
        char_data = json.loads(result)
        with open(os.path.join(output_dir, "character.json"), "w", encoding="utf-8") as f:
            json.dump(char_data["characters"], f, ensure_ascii=False, indent=2)
        print("character.json 已生成。")
    except Exception as e:
        print("角色生成失败：", e)
        char_data = {"characters": None}
    # 2.5 角色外观
    print("正在生成角色外观与AI绘图prompt...")
    try:
        characters_str = json.dumps(char_data["characters"], ensure_ascii=False) if char_data["characters"] else None
        result = get_deepseek_character_appearance(keyword, characters=characters_str)
        result = extract_json(result)
        appearance_data = json.loads(result)
        with open(os.path.join(output_dir, "character_appearance.json"), "w", encoding="utf-8") as f:
            json.dump(appearance_data["appearances"], f, ensure_ascii=False, indent=2)
        print("character_appearance.json 已生成。")
    except Exception as e:
        print("角色外观生成失败：", e)
    # 3. 动画
    print("正在生成动画...")
    try:
        result = get_deepseek_animation(keyword, characters=characters_str)
        result = extract_json(result)
        ani_data = json.loads(result)
        with open(os.path.join(output_dir, "animation.json"), "w", encoding="utf-8") as f:
            json.dump(ani_data["animations"], f, ensure_ascii=False, indent=2)
        print("animation.json 已生成。")
    except Exception as e:
        print("动画生成失败：", e)
        ani_data = {"animations": None}
    # 4. UI
    print("正在生成UI...")
    try:
        # 这里可选用story_structure.json中的场景信息作为上下文
        scenes_str = None
        if story_data.get("story_structure") and story_data["story_structure"].get("chapters"):
            scenes = []
            for chapter in story_data["story_structure"]["chapters"]:
                if chapter.get("scenes"):
                    scenes.extend(chapter["scenes"])
            scenes_str = json.dumps(scenes, ensure_ascii=False)
        result = get_deepseek_ui(keyword, scenes=scenes_str)
        result = extract_json(result)
        ui_data = json.loads(result)
        with open(os.path.join(output_dir, "ui.json"), "w", encoding="utf-8") as f:
            json.dump(ui_data["ui"], f, ensure_ascii=False, indent=2)
        print("ui.json 已生成。")
    except Exception as e:
        print("UI生成失败：", e)
        ui_data = {"ui": None}
    # 5. 副本/玩法机制
    print("正在生成副本/玩法机制...")
    try:
        result = get_deepseek_instance(keyword, main_story=main_story_str)
        result = extract_json(result)
        inst_data = json.loads(result)
        with open(os.path.join(output_dir, "story_instances.json"), "w", encoding="utf-8") as f:
            json.dump(inst_data["instances"], f, ensure_ascii=False, indent=2)
        print("story_instances.json 已生成。")
    except Exception as e:
        print("副本/玩法机制生成失败：", e)
        inst_data = {"instances": None}
    # 6. 解析story_structure，生成每幕详细信息
    print("正在解析story_structure，生成每幕详细信息...")
    try:
        # 读取各类信息
        story_structure = story_data["story_structure"] if story_data.get("story_structure") else None
        character_list = char_data["characters"] if char_data.get("characters") else None
        animation_list = ani_data["animations"] if 'ani_data' in locals() and ani_data.get("animations") else None
        appearance_list = appearance_data["appearances"] if 'appearance_data' in locals() and appearance_data.get("appearances") else None
        ui_list = ui_data["ui"] if 'ui_data' in locals() and ui_data.get("ui") else None
        main_story_obj = story_data["main_story"] if story_data.get("main_story") else None
        if story_structure and character_list:
            parse_story_structure_and_generate_scene_details(
                story_structure, character_list, animation_list, appearance_list, ui_list, output_dir, keyword=keyword, main_story=json.dumps(main_story_obj, ensure_ascii=False) if main_story_obj else None
            )
        else:
            print("story_structure或角色信息缺失，无法生成每幕详细信息。")
    except Exception as e:
        print("每幕详细信息生成失败：", e)
    print(f"全部核心剧情结构文件已生成，目录：{output_dir}")

if __name__ == "__main__":
    main() 
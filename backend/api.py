import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from zhipuai import ZhipuAI

# 你的zhipu API Key
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "d970f626f5834a2182f232a15c6604f9.VfLaEaHdkNWo4wvr")
ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
ZHIPU_IMAGE_API_URL = "https://open.bigmodel.cn/api/paas/v4/image/generate"

# 支持的模型列表
SUPPORTED_MODELS = {
    "GLM-4-FlashX-250414": "glm-4-flashx-250414",  # 文生文
    "GLM-4-Flash": "glm-4-flash",                # 文生文（原默认）
    "CogView-3-Flash": "cogview-3-flash",         # 文生图
    "GLM-Z1-Flash": "glm-z1-flash",               # 推理模型
    "CogVideoX-Flash": "cogvideox-flash",         # 视频生成
    "GLM-4.1V-Thinking-Flash": "glm-4.1v-thinking-flash", # 视觉推理
    "GLM-4V-Flash": "glm-4v-flash"                # 图像理解
}
DEFAULT_MODEL = "GLM-4-FlashX-250414"

# Ink官方语法核心片段（精简版）
INK_SYNTAX_CORE = '''
Ink官方核心语法：
- 节点与跳转：=== 节点名 ===，-> 节点名
- 分支选择：* 选项内容，+ 粘性选项，支持条件
- 变量声明与赋值：VAR name = value，~ name = value
- 条件与多重条件：{条件: 内容 - else: 其他内容}
- 函数与调用：=== function foo(x) ===，~ foo(1)
- 结尾用-> END，主入口=== start ===
示例：
=== start ===
欢迎来到冒险！
* 向左走
    -> left_path
* 向右走
    -> right_path

=== left_path ===
你选择了左边。
-> END

=== right_path ===
你选择了右边。
-> END

VAR hp = 100
~ hp = hp - 10
{hp > 0:
    你还活着。
- else:
    你死了。
}
'''
# InkPlus扩展要点（精简版）
INKPLUS_SYNTAX_CORE = '''
InkPlus扩展：
- 图片：@image[prompt: "xxx", style: "xxx"] { 描述 }
- 音效/音乐：@bgm[track: "xxx"]、@sfx[sound: "xxx"]
- 动画/转场：@typewriter{...}、@transition[type: "fade"] {-> next_scene}
- UI与样式：@style[color: "#ff6b6b"] { ... }
- 分支与变量：* [选项]、-> 分支名、VAR xxx = ...
- 小游戏/成就/存档等
'''
# 游戏设计方法论要点（精简版）
GAME_DESIGN_CORE = '''
剧情设计要点：
- 先搭建主线与章节，再填充细节。
- 每章有目标、分支、互动。
- 结构清晰，分支合理，内容丰富。
- 剧情服务于玩法。
'''

app = FastAPI()

# 允许跨域，便于前端本地开发联调
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    model: str = DEFAULT_MODEL  # 新增模型选择字段，前端可传递

class InkplusResponse(BaseModel):
    inkplus: str

class ImageGenRequest(BaseModel):
    prompt: str
    style: str = ""
    size: str = "1024x768"

class ImageGenResponse(BaseModel):
    url: str

@app.post("/generate_inkplus", response_model=InkplusResponse)
async def generate_inkplus(req: QueryRequest):
    # 选择模型
    model_key = req.model or 'glm-4-flash'
    model_name = SUPPORTED_MODELS[model_key]
    # 精简后的system prompt
    system_prompt = (
        "你是一名资深的游戏剧情脚本专家，擅长将自然语言描述转化为 InkPlus 标准的脚本语言。"
        "主干结构必须100%遵循Ink官方语法（见下方），分支、变量、节点、跳转、条件、函数等必须合规。"
        "可适当结合InkPlus扩展（如图片、音效、动画、UI、小游戏等），但主线结构必须标准Ink语法。"
        "\n【重要规范】所有分支选项（*、+）后必须有明确的跳转（-> 节点名），不得省略！否则脚本无法被引擎正确解析。"
        "如无特殊跳转需求，可跳回当前节点（如：-> 当前节点名）。"
        "反例（错误写法）：\n* 检查背包\n  你翻了翻背包。"
        "正例（正确写法）：\n* 检查背包\n  你翻了翻背包。\n  -> check_bag"
        "每个分支都要有独立的节点名，节点名需唯一、语义清晰。"
        "\n【体验优化】建议每一个章节（每个=== 节点 ===）都包含一张@image图片节点，用于提升沉浸感和视觉体验。图片内容应与当前章节场景氛围高度相关。例如：\n=== 森林入口 ===\n@image[prompt: '神秘的森林入口', style: 'fantasy'] { 你站在被雾气笼罩的森林入口。 }"
        + INK_SYNTAX_CORE + INKPLUS_SYNTAX_CORE + GAME_DESIGN_CORE +
        "请将用户输入转化为高质量InkPlus脚本，结构清晰、章节分明、分支合理、内容丰富、逻辑严密，输出仅为InkPlus脚本本身，不要添加解释说明。"
    )
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.query}
        ],
        "max_tokens": 2048,
        "temperature": 0.9
    }
    headers = {
        "Authorization": f"Bearer {ZHIPU_API_KEY}",
        "Content-Type": "application/json"
    }
    print("[generate_inkplus] 请求payload:", json.dumps(payload, ensure_ascii=False))
    print("[generate_inkplus] 请求headers:", headers)
    try:
        resp = requests.post(ZHIPU_API_URL, headers=headers, json=payload, timeout=60)
        print("[generate_inkplus] 响应状态码:", resp.status_code)
        print("[generate_inkplus] 响应内容:", resp.text)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"inkplus": content.strip()}
    except Exception as e:
        print("[generate_inkplus] 异常:", e)
        return {"inkplus": f"// 生成失败: {e}"}

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY") or "你的APIKey"
client = ZhipuAI(api_key=ZHIPU_API_KEY)

@app.post("/generate_image", response_model=ImageGenResponse)
async def generate_image(req: ImageGenRequest):
    try:
        print("[generate_image] SDK调用: model=cogview-4, prompt=", req.prompt)
        response = client.images.generations(
            model="cogview-4",
            prompt=req.prompt
        )
        url = response.data[0].url if response and response.data and response.data[0].url else ""
        print("[generate_image] 图片URL:", url)
        if not url:
            return ImageGenResponse(url="", error="图片生成失败")
        return ImageGenResponse(url=url)
    except Exception as e:
        print("[generate_image] SDK异常:", str(e))
        return ImageGenResponse(url="", error=f"图片生成异常: {e}") 
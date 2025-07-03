import React, { useState, useEffect, useRef } from 'react';

// mock InkPlus 脚本示例
const mockScripts = [
  {
    label: '卡牌剧情互动示例',
    value: `// === 森林冒险的开端 ===\n\n@image[prompt: "神秘森林入口，晨雾缭绕", style: "fantasy_art", mood: "mysterious"] {\n    你站在森林的入口，阳光透过树梢，地面上铺满落叶。\n}\n\n"你准备踏入这片未知的森林。"\n\n* [直接进入森林] 你鼓起勇气，迈步前行。\n    -> deep_forest\n* [环顾四周] 你警觉地观察四周，寻找线索。\n    -> look_around\n\n=== deep_forest ===\n@image[prompt: "森林深处，光影斑驳，隐约有魔法气息", style: "fantasy_art"] {\n    森林深处，空气中弥漫着淡淡的魔法气息。\n}\n\n@card[keywords: "火球术,治愈术,荆棘缠绕", scene: "森林深处", chapter: "冒险的开始", on_win: "victory_scene", on_lose: "fail_scene"]\n\n"你在这里遭遇了神秘的魔物，是否要使用卡牌对战？"\n\n* [进入卡牌对战] -> start_card_battle\n* [暂时撤退]\n    你选择暂时撤退，回到入口。\n    -> top\n\n=== victory_scene ===\n@image[prompt: "魔物被击败，阳光洒入森林", style: "fantasy_art"] {\n    你成功击败了魔物，森林恢复了平静。\n}\n"你获得了宝贵的经验和奖励！"\n-> next_adventure\n\n=== fail_scene ===\n@image[prompt: "主角受伤撤退，森林依旧危险", style: "fantasy_art"] {\n    你被魔物击败，只能狼狈撤退。\n}\n"你需要休整后再来挑战。"\n-> top\n\n=== look_around ===\n@image[prompt: "森林边缘，发现一只受伤的小动物", style: "watercolor"] {\n    你发现一只受伤的小狐狸，正无助地看着你。\n}\n\n"你要帮助小狐狸吗？"\n\n* [帮助小狐狸] 你用随身的药草为它包扎伤口。\n    -> fox_helped\n* [离开] 你决定不管它，转身离开。\n    -> deep_forest\n\n=== fox_helped ===\n@image[prompt: "小狐狸感激地看着你，身上泛起微光", style: "watercolor"] {\n    小狐狸获得新生，似乎对你产生了好感。\n}\n\n"小狐狸成为了你的伙伴！"\n-> deep_forest\n\n=== next_adventure ===\n"你继续踏上新的冒险旅程……"\n-> END\n\n=== top ===\n// 返回入口节点\n"你又回到了森林入口。"\n-> END\n`
  },
  {
    label: '图片描述示例',
    value: `// === 魔法森林的邂逅 ===\n\n@image[prompt: "神秘的魔法森林，晨雾缭绕，阳光穿透树梢", style: "fantasy_art", mood: "mysterious"] {\n    清晨的魔法森林中，薄雾弥漫，阳光斑驳地洒在苔藓和蘑菇上。\n}\n\n你缓缓走进森林，四周传来鸟鸣和微风拂叶的声音。\n\n@bgm[track: "forest_morning", volume: 0.6, fade_in: 2000]\n\n突然，你发现前方有一只受伤的小鹿。\n\n@image[prompt: "受伤的小鹿，躺在森林草地上", style: "realistic", mood: "gentle"] {\n    一只小鹿静静地卧在草地上，眼神中带着一丝无助。\n}\n\n* [靠近小鹿] 你小心翼翼地走近，试图安抚它。\n    @sfx[sound: "soft_steps"]\n    小鹿微微颤抖，但没有逃跑。\n    -> deer_help\n\n* [观察四周] 你警觉地环顾四周，担心有危险潜伏。\n    @sfx[sound: "rustle"]\n    你发现附近有新鲜的狼爪印。\n    -> wolf_warning\n\n=== deer_help ===\n你用随身携带的药草为小鹿包扎伤口。\n@image[prompt: "主角为小鹿包扎伤口", style: "watercolor"]\n小鹿感激地看着你，慢慢站了起来。\n\n=== wolf_warning ===\n你提高警惕，准备应对可能出现的危险。`
  },
  {
    label: '猜数字小游戏',
    value: `// === 魔法师的考验：猜数字小游戏 ===\n\n@style[class: "wizard_dialog"] {\n    "欢迎来到魔法师的试炼！"\n    "我心中有一个1到5之间的数字，你能猜中吗？"\n}\n\n@game_time[day: 2, hour: 10]\n\n@choice_style[theme: "magic", layout: "card"] {\n    * [猜1] -> guess_1\n    * [猜2] -> guess_2\n    * [猜3] -> guess_3\n    * [猜4] -> guess_4\n    * [猜5] -> guess_5\n}\n\n=== guess_3 ===\n@style[color: "#4ecdc4"] {\n    "恭喜你，猜对了！你通过了试炼。"\n}\n@achievement[id: "wizard_test", name: "魔法师的幸运儿"] {\n    你获得了魔法师的认可！\n}\n-> end\n\n=== guess_1 ===\n=== guess_2 ===\n=== guess_4 ===\n=== guess_5 ===\n@style[color: "#ff6b6b"] {\n    "很遗憾，答案不是这个数字。再试一次吧！"\n}\n-> retry\n\n=== retry ===\n"你还想再试一次吗？"\n* [再试一次] -> top\n* [放弃] -> end\n\n=== end ===\n"试炼结束，感谢你的参与！"`
  },
  {
    label: '卡牌抽取小游戏',
    value: `// === 魔法卡牌抽取 ===\n\n@image[prompt: "三张神秘的魔法卡牌背面", style: "fantasy_art", size: "600x300"] {\n    三张卡牌静静地摆放在桌面上，背面闪烁着魔法光芒。\n}\n\n"请选择一张卡牌："\n\n@choice_style[layout: "card", image: true] {\n    * [左边卡牌]\n        @image[prompt: "火焰魔法卡牌", style: "anime", size: "200x300"]\n        你抽到了火焰魔法卡！\n        -> card_fire\n    * [中间卡牌]\n        @image[prompt: "治愈魔法卡牌", style: "anime", size: "200x300"]\n        你抽到了治愈魔法卡！\n        -> card_heal\n    * [右边卡牌]\n        @image[prompt: "冰霜魔法卡牌", style: "anime", size: "200x300"]\n        你抽到了冰霜魔法卡！\n        -> card_ice\n}\n\n=== card_fire ===\n@style[color: "#ff6b6b"] {\n    火焰魔法卡：可以对敌人造成巨大伤害！\n}\n-> end\n\n=== card_heal ===\n@style[color: "#4ecdc4"] {\n    治愈魔法卡：可以恢复自身生命值！\n}\n-> end\n\n=== card_ice ===\n@style[color: "#00bfff"] {\n    冰霜魔法卡：可以冻结敌人行动！\n}\n-> end\n\n=== end ===\n"卡牌抽取结束，祝你好运！"`
  }
];

// 简单的InkPlus脚本解析器（支持图片、对话、分支、样式、小游戏）
function parseInkplus(inkplus) {
  if (!inkplus) return [];
  const blocks = [];
  // 先整体提取所有@image[xxx]{...}块，支持多行
  const imageBlockRegex = /@image\[([^\]]+)\]\s*\{([\s\S]*?)\}/g;
  let lastIndex = 0;
  let match;
  while ((match = imageBlockRegex.exec(inkplus)) !== null) {
    if (match.index > lastIndex) {
      const before = inkplus.slice(lastIndex, match.index);
      // 新增：分支组解析
      parseLinesToBlocks(before.split(/\r?\n/), blocks);
    }
    // 解析图片参数
    const paramStr = match[1];
    const desc = match[2].trim();
    const params = {};
    paramStr.split(',').forEach(pair => {
      const [k, v] = pair.split(':').map(s => s.trim());
      if (k && v) params[k] = v.replace(/^"|"$/g, '');
    });
    blocks.push({ type: 'image', params, desc });
    lastIndex = match.index + match[0].length;
  }
  // 新增：整体提取@card[...]块
  const cardBlockRegex = /@card\[([^\]]+)\]/g;
  let cardLastIndex = 0;
  let cardMatch;
  let tempInkplus = inkplus;
  while ((cardMatch = cardBlockRegex.exec(tempInkplus)) !== null) {
    if (cardMatch.index > cardLastIndex) {
      // 解析前面的内容
      const before = tempInkplus.slice(cardLastIndex, cardMatch.index);
      parseLinesToBlocks(before.split(/\r?\n/), blocks);
    }
    // 解析@card参数
    const paramStr = cardMatch[1];
    const params = {};
    paramStr.split(',').forEach(pair => {
      const [k, v] = pair.split(':').map(s => s.trim());
      if (k && v) params[k] = v.replace(/^"|"$/g, '');
    });
    blocks.push({ type: 'card_jump', params });
    cardLastIndex = cardMatch.index + cardMatch[0].length;
  }
  if (cardLastIndex < tempInkplus.length) {
    const after = tempInkplus.slice(cardLastIndex);
    parseLinesToBlocks(after.split(/\r?\n/), blocks);
  }
  // 处理最后一段内容（兼容@image和@card混用）
  if (lastIndex < inkplus.length && lastIndex > cardLastIndex) {
    const after = inkplus.slice(lastIndex);
    parseLinesToBlocks(after.split(/\r?\n/), blocks);
  }
  return blocks;
}

// 新增：分支组解析函数，支持连续多个* 选项 + -> 跳转
function parseLinesToBlocks(lines, blocks) {
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i].trim();
    if (!l || l.startsWith('//')) continue;
    
    // 新增：跳过Ink变量声明和逻辑代码
    if (l.startsWith('VAR ') || l.startsWith('~ ') || l.match(/^\{.*:/) || l.match(/^-\s*else\s*:/) || l === '}') {
      continue;
    }
    
    // 新增：支持=== 节点名 ===作为scene
    if (/^===\s*.+\s*===/.test(l)) {
      blocks.push({ type: 'scene', text: l.replace(/^=+|=+$/g, '').trim() });
      continue;
    }
    if (l.startsWith('##')) { blocks.push({ type: 'scene', text: l.replace(/^#+/, '').trim() }); continue; }
    if (l.startsWith('#')) { blocks.push({ type: 'scene', text: l.replace(/^#+/, '').trim() }); continue; }
    
    // 分支组解析
    if (l.startsWith('* ')) {
      // 连续收集所有* 选项 + -> 跳转
      while (i < lines.length && lines[i].trim().startsWith('* ')) {
        const optLine = lines[i].trim();
        // 只取label内容，不拼接target
        const optMatch = optLine.match(/^\*\s+\[([^\]]+)\]/);
        const label = optMatch ? optMatch[1] : '';
        let target = null;
        // 查找下一行是否为->
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('->')) {
          target = lines[i + 1].trim().replace('->', '').trim();
          i++; // 跳过跳转行
        } else if (label) {
          // 没有->跳转时，target设为label，防止target为null
          target = label;
        }
        blocks.push({ type: 'choice', label, target });
        i++;
      }
      i--; // while多加了一次
      continue;
    }
    
    if (l.startsWith('->')) { 
      blocks.push({ type: 'jump', text: l.replace('->', '').trim() }); 
      continue; 
    }
    
    if (l.startsWith('@bgm')) { blocks.push({ type: 'bgm', text: l }); continue; }
    if (l.startsWith('@sfx')) { blocks.push({ type: 'sfx', text: l }); continue; }
    if (l.startsWith('@achievement')) { blocks.push({ type: 'achievement', text: l }); continue; }
    if (l.startsWith('@game_time')) { blocks.push({ type: 'game_time', text: l }); continue; }
    if (l.startsWith('@choice_style')) { blocks.push({ type: 'choice_style', text: l }); continue; }
    if (l.startsWith('"') && l.endsWith('"')) { blocks.push({ type: 'dialogue', text: l.replace(/^"|"$/g, '') }); continue; }
    if (l) blocks.push({ type: 'dialogue', text: l });
  }
}

export default function App() {
  const [input, setInput] = useState('');
  const [inkplus, setInkplus] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const loadingTimer = useRef(null);
  const [error, setError] = useState('');
  // 新增：当前章节scene索引
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectValue, setSelectValue] = useState('');
  // 新增：图片url缓存，避免重复请求
  const [imageMap, setImageMap] = useState({}); // key: JSON.stringify(params), value: {url, loading, error}
  // 新增：变量存储
  const [vars, setVars] = useState({});

  // 选择mock脚本，自动生成
  const handleMockSelect = async e => {
    const val = e.target.value;
    console.log('[用户操作] 选择示例脚本:', val);
    setSelectValue(val);
    setInput(val);
    setCurrentSceneIdx(0);
    setHistory([]);
    setError('');
    if (val) {
      setLoading(true);
      setInkplus('');
      // 模拟生成（直接用mock内容）
      setTimeout(() => {
        setInkplus(val);
        setLoading(false);
      }, 200); // 模拟网络延迟
    } else {
      setInkplus('');
    }
  };

  // 调用后端生成inkplus脚本
  const handleConvert = async () => {
    console.log('[用户操作] 点击生成InkPlus脚本，输入内容:', input);
    setLoading(true);
    setLoadingSeconds(0);
    setError('');
    setInkplus('');
    setCurrentSceneIdx(0);
    setHistory([]);
    try {
      const resp = await fetch('/generate_inkplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      if (!resp.ok) throw new Error('后端服务异常');
      const data = await resp.json();
      setInkplus(data.inkplus);
    } catch (e) {
      setError('生成失败，请检查后端服务或网络连接。');
    } finally {
      setLoading(false);
    }
  };

  // 解析inkplus为剧情块
  const blocks = parseInkplus(inkplus);

  // 新增：inkplus变化时自动跳到第一个scene
  useEffect(() => {
    if (blocks.length > 0) {
      const firstSceneIdx = blocks.findIndex(b => b.type === 'scene');
      setCurrentSceneIdx(firstSceneIdx !== -1 ? firstSceneIdx : 0);
    }
    // eslint-disable-next-line
  }, [inkplus]);

  // 自动推进到有内容的scene，并执行变量赋值
  useEffect(() => {
    if (!blocks.length) return;
    let idx = currentSceneIdx;
    let visited = new Set();
    let tempVars = { ...vars };
    let changed = false;
    while (true) {
      if (visited.has(idx)) break;
      visited.add(idx);
      // 收集该scene下的内容
      const sceneBlocks = [];
      let i = idx + 1;
      while (i < blocks.length && blocks[i].type !== 'scene') {
        sceneBlocks.push(blocks[i]);
        i++;
      }
      // 跳过完全没有内容的scene（sceneBlocks为空）
      const nonAssign = sceneBlocks.filter(b => !(b.type === 'dialogue' && b.text.trim().startsWith('~')));
      if (sceneBlocks.length === 0) {
        // 跳到下一个scene
        const nextIdx = blocks.findIndex((b, j) => b.type === 'scene' && j > idx);
        if (nextIdx !== -1) {
          idx = nextIdx;
          setCurrentSceneIdx(nextIdx);
          continue;
        }
        break;
      }
      // 处理变量赋值
      sceneBlocks.forEach(b => {
        if (b.type === 'dialogue' && b.text.trim().startsWith('~')) {
          // 解析~变量赋值
          const assign = b.text.trim().slice(1).trim();
          // 只支持简单表达式: a = b - 1
          const m = assign.match(/^(\w+)\s*=\s*([\w\.]+)\s*([-+*/])\s*(\d+)$/);
          if (m) {
            const v = m[2] in tempVars ? tempVars[m[2]] : parseFloat(m[2]);
            let val = v;
            const n = parseFloat(m[4]);
            if (m[3] === '+') val = v + n;
            if (m[3] === '-') val = v - n;
            if (m[3] === '*') val = v * n;
            if (m[3] === '/') val = v / n;
            tempVars[m[1]] = val;
            changed = true;
          } else {
            // 直接赋值 ~ hp = 100
            const m2 = assign.match(/^(\w+)\s*=\s*([\w\.\-]+)/);
            if (m2) {
              tempVars[m2[1]] = isNaN(Number(m2[2])) ? m2[2] : Number(m2[2]);
              changed = true;
            }
          }
        }
      });
      // 自动跳转逻辑：如果scene只有jump跳转（可能还有变量赋值和对话）
      const jumpBlocks = sceneBlocks.filter(b => b.type === 'jump');
      const choiceBlocks = sceneBlocks.filter(b => b.type === 'choice');
      
      // 如果有jump且没有choice，则自动跳转
      if (jumpBlocks.length === 1 && choiceBlocks.length === 0) {
        const target = jumpBlocks[0].text.trim();
        if (target && target !== 'END') {
          const nextIdx = blocks.findIndex(b => b.type === 'scene' && b.text.trim() === target);
          if (nextIdx !== -1) {
            idx = nextIdx;
            setCurrentSceneIdx(nextIdx);
            continue;
          }
        }
      }
      break;
    }
    if (changed) setVars(tempVars);
    // eslint-disable-next-line
  }, [currentSceneIdx, inkplus]);

  // 预览区：只渲染当前scene及其后内容，遇到下一个scene/jump/分支组时停止
  const currentBlocks = [];
  let i = currentSceneIdx;
  while (i < blocks.length) {
    const b = blocks[i];
    if (i !== currentSceneIdx && (b.type === 'scene' || b.type === 'jump')) break;
    currentBlocks.push(b);
    if (b.type === 'choice') {
      // 收集本组所有choice
      let j = i + 1;
      while (j < blocks.length && blocks[j].type === 'choice') {
        currentBlocks.push(blocks[j]);
        j++;
      }
      break;
    }
    if (b.type === 'jump') {
      break;
    }
    i++;
  }

  // 处理选择
  const handleChoice = (target) => {
    console.log('[用户操作] 点击分支按钮，跳转目标scene:', target);
    if (!target || typeof target !== 'string') {
      alert('分支target无效: ' + target);
      console.warn('[WARN] 分支target无效:', target);
      return;
    }
    // 只要target为'进入卡牌对战'或'start_card_battle'，全局查找第一个@card并跳转
    if (target === 'start_card_battle' || target === '进入卡牌对战') {
      const cardBlock = blocks.find(b => b.type === 'card_jump');
      if (cardBlock) {
        const keywords = cardBlock.params.keywords || '';
        const scene = cardBlock.params.scene || '';
        const chapter = cardBlock.params.chapter || '';
        const on_win = cardBlock.params.on_win || '';
        const on_lose = cardBlock.params.on_lose || '';
        const on_draw = cardBlock.params.on_draw || '';
        const url = `/card/card_game.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}&on_win=${encodeURIComponent(on_win)}&on_lose=${encodeURIComponent(on_lose)}&on_draw=${encodeURIComponent(on_draw)}`;
        console.log('[DEBUG] 跳转卡牌页面:', url);
        window.open(url, '_blank');
      } else {
        alert('全局未检测到@card节点，无法进入卡牌对战！');
        console.warn('[WARN] 全局未找到@card block');
      }
      return;
    }
    // 精确匹配scene节点名
    const targetIdx = blocks.findIndex(
      b => b.type === 'scene' && b.text.trim() === target.trim()
    );
    if (targetIdx !== -1) {
      setCurrentSceneIdx(targetIdx);
      setHistory([...history, target]);
    }
  };

  // 新增：图片生成副作用
  useEffect(() => {
    // 只对当前展示的图片块做处理
    currentBlocks.forEach((b, idx) => {
      if (b.type === 'image') {
        const key = JSON.stringify(b.params);
        if (!imageMap[key] && b.params.prompt) {
          // 标记为loading
          setImageMap(prev => ({ ...prev, [key]: { url: '', loading: true, error: '' } }));
          // 请求后端生成图片
          fetch('/generate_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: b.params.prompt,
              style: b.params.style || '',
              size: b.params.size || '1024x768'
            })
          })
            .then(resp => resp.json())
            .then(data => {
              if (data.url && !data.url.startsWith('// 生成失败')) {
                setImageMap(prev => ({ ...prev, [key]: { url: data.url, loading: false, error: '' } }));
              } else {
                setImageMap(prev => ({ ...prev, [key]: { url: '', loading: false, error: data.url || '图片生成失败' } }));
              }
            })
            .catch(e => {
              setImageMap(prev => ({ ...prev, [key]: { url: '', loading: false, error: '图片生成失败' } }));
            });
        }
      }
    });
    // eslint-disable-next-line
  }, [currentBlocks]);

  // 生成中计时副作用
  useEffect(() => {
    if (loading) {
      loadingTimer.current = setInterval(() => {
        setLoadingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    }
    return () => {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    };
  }, [loading]);

  // 监听卡牌页面结果
  useEffect(() => {
    function handleCardResult(event) {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'card_battle_result') {
        const result = event.data.result; // 'win' | 'lose' | 'draw'
        // 查找当前@card block
        const cardBlockIdx = blocks.findIndex(b => b.type === 'card_jump');
        if (cardBlockIdx !== -1) {
          const cardBlock = blocks[cardBlockIdx];
          let targetScene = null;
          if (result === 'win' && cardBlock.params.on_win) targetScene = cardBlock.params.on_win;
          if (result === 'lose' && cardBlock.params.on_lose) targetScene = cardBlock.params.on_lose;
          if (result === 'draw' && cardBlock.params.on_draw) targetScene = cardBlock.params.on_draw;
          if (targetScene) {
            const targetIdx = blocks.findIndex(
              b => b.type === 'scene' && b.text.trim() === targetScene.trim()
            );
            if (targetIdx !== -1) {
              setCurrentSceneIdx(targetIdx);
              setHistory([...history, targetScene]);
            }
          }
        }
      }
    }
    window.addEventListener('message', handleCardResult);
    return () => window.removeEventListener('message', handleCardResult);
    // eslint-disable-next-line
  }, [blocks, history]);

  let renderedChoice = false;
  return (
    <div className="main-wrapper">
      {/* 顶栏 */}
      <header className="topbar">
        <span className="site-title">剧情生成器</span>
      </header>
      {/* 主体三栏 */}
      <div className="container">
        {/* 左侧：自然语言输入+mock选择 */}
        <div className="panel left-panel">
          <h2>自然语言输入</h2>
          <select style={{marginBottom:12}} onChange={handleMockSelect} value={selectValue}>
            <option value="">选择一个示例脚本体验</option>
            {mockScripts.map((m, i) => (
              <option key={i} value={m.value}>{m.label}</option>
            ))}
          </select>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setSelectValue(''); }}
            placeholder="请输入剧情、分支、体验等描述..."
            rows={18}
          />
          <button onClick={handleConvert} disabled={loading}>
            {loading ? '生成中...' : '生成InkPlus脚本'}
          </button>
          {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}
        </div>
        {/* 中间：InkPlus脚本展示 */}
        <div className="panel center-panel">
          <h2>InkPlus脚本</h2>
          <pre className="inkplus-box">{inkplus || (loading ? `生成中...(${loadingSeconds}秒)` : '// 这里将展示自动生成的InkPlus脚本')}</pre>
        </div>
        {/* 右侧：效果预览 */}
        <div className="panel right-panel">
          <h2>效果预览</h2>
          <div className="preview-box">
            {inkplus ? (
              <div>
                {currentBlocks.map((b, idx) => {
                  if (b.type === 'scene') return <div key={idx} style={{fontWeight:'bold',marginBottom:8}}>{b.text}</div>;
                  if (b.type === 'dialogue') return <div key={idx} style={{marginBottom:8}}>{b.text}</div>;
                  if (b.type === 'image') {
                    const key = JSON.stringify(b.params);
                    const img = imageMap[key] || {};
                    return (
                      <div key={idx} style={{margin:'12px 0',textAlign:'center'}}>
                        <div style={{border:'1px solid #eee',borderRadius:8,padding:8,background:'#fafbfc',display:'inline-block'}}>
                          <div style={{fontSize:12,color:'#888',marginBottom:4}}>[图片] {b.params.prompt || ''}</div>
                          <div style={{width: b.params.size?.split('x')[0] || 240, height: b.params.size?.split('x')[1] || 120, background:'#e0e7ef',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:14,overflow:'hidden'}}>
                            {img.loading ? '图片生成中...' : img.url ? (
                              <img src={img.url} alt={b.params.prompt} style={{maxWidth:'100%',maxHeight:'100%',borderRadius:6}} />
                            ) : img.error ? (
                              <span style={{color:'#f00'}}>{img.error}</span>
                            ) : '图片占位符'}
                          </div>
                          {b.desc && <div style={{fontSize:12,color:'#666',marginTop:4}}>{b.desc}</div>}
                        </div>
                      </div>
                    );
                  }
                  if (b.type === 'styled') return <div key={idx} style={{color:b.style.color||'#222',fontWeight:b.style.weight==='bold'?'bold':undefined,marginBottom:8}}>{b.content}</div>;
                  if (b.type === 'choice') {
                    if (renderedChoice) return null;
                    renderedChoice = true;
                    const choices = currentBlocks.filter(x => x.type === 'choice');
                    return (
                      <div key={idx} style={{marginTop:16}}>
                        <div style={{fontWeight:'bold',marginBottom:4}}>请选择：</div>
                        {choices.map((c, i) => (
                          <button key={i} style={{marginRight:8,marginBottom:4}} onClick={()=>handleChoice(c.target)}>{c.label}</button>
                        ))}
                      </div>
                    );
                  }
                  if (b.type === 'jump') return null; // 跳转不显示，由自动跳转逻辑处理
                  if (b.type === 'achievement') return <div key={idx} style={{color:'#ffb300',margin:'8px 0'}}>🏆 成就达成！</div>;
                  if (b.type === 'bgm') return <div key={idx} style={{color:'#4ecdc4',fontSize:12,margin:'4px 0'}}>🎵 背景音乐：{b.text}</div>;
                  if (b.type === 'sfx') return <div key={idx} style={{color:'#888',fontSize:12,margin:'4px 0'}}>🔊 音效：{b.text}</div>;
                  if (b.type === 'game_time') return <div key={idx} style={{color:'#888',fontSize:12,margin:'4px 0'}}>⏰ {b.text}</div>;
                  if (b.type === 'choice_style') return null;
                  if (b.type === 'card_jump') {
                    const keywords = b.params.keywords || '';
                    const scene = b.params.scene || '';
                    const chapter = b.params.chapter || '';
                    const on_win = b.params.on_win || '';
                    const on_lose = b.params.on_lose || '';
                    const on_draw = b.params.on_draw || '';
                    // 使用相对路径，传递on_win/on_lose参数
                    const url = `/card/card_game.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}&on_win=${encodeURIComponent(on_win)}&on_lose=${encodeURIComponent(on_lose)}&on_draw=${encodeURIComponent(on_draw)}`;
                    return (
                      <div key={idx} style={{margin:'16px 0',textAlign:'center'}}>
                        <div style={{marginBottom:8}}>
                          @card[keywords: "{keywords}", scene: "{scene}", chapter: "{chapter}", on_win: "{on_win}", on_lose: "{on_lose}"]
                        </div>
                        <div>你在这里遭遇了神秘的魔物，是否要使用卡牌对战？<br/>胜利/失败将自动进入不同剧情分支。</div>
                        <div style={{marginTop:8}}>
                          <button onClick={() => window.open(url, '_blank')} style={{padding:'10px 24px',fontSize:'1.1rem',borderRadius:8,background:'#3b82f6',color:'#fff',border:'none',cursor:'pointer',marginRight:12}}>
                            进入卡牌对战
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <p>（此处预览最终效果，包括图片、音乐、分支等）</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
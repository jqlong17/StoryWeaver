import React, { useState, useEffect, useRef } from 'react';

// mock InkPlus 脚本示例
const mockScripts = [
  {
    label: '卡牌剧情互动示例（对战类）',
    value: `// === 魔法森林冒险 ===

@image[prompt: "神秘森林入口，晨雾缭绕", style: "fantasy_art", mood: "mysterious"] {
    你站在森林的入口，阳光透过树梢，地面上铺满落叶。
}

"你准备踏入这片未知的森林，寻找传说中的魔法水晶。"

* [直接进入森林] 你鼓起勇气，迈步前行。
    -> deep_forest
* [环顾四周] 你警觉地观察四周，发现一只受伤的小狐狸。
    -> fox_event

=== deep_forest ===
@image[prompt: "森林深处，光影斑驳，隐约有魔法气息", style: "fantasy_art"] {
    森林深处，空气中弥漫着淡淡的魔法气息。
}

@card[keywords: "火球术,治愈术,荆棘缠绕", scene: "森林深处", chapter: "冒险的开始", on_win: "victory_scene", on_lose: "fail_scene", type: "battle"]

"你在这里遭遇了神秘的魔物，是否要使用卡牌对战？"

* [进入卡牌对战] -> start_card_battle
* [暂时撤退]
    你选择暂时撤退，回到入口。
    -> top

=== start_card_battle ===
"你进入了卡牌对战页面，准备迎战魔物！"
-> END

=== victory_scene ===
@image[prompt: "魔物被击败，阳光洒入森林", style: "fantasy_art"] {
    你成功击败了魔物，获得了魔法水晶碎片。
}
"你获得了宝贵的经验和奖励！"
* [继续深入] -> crystal_clearing
* [返回入口] -> top

=== fail_scene ===
@image[prompt: "主角受伤撤退，森林依旧危险", style: "fantasy_art"] {
    你被魔物击败，只能狼狈撤退。
}
"你需要休整后再来挑战。"
-> top

=== crystal_clearing ===
@image[prompt: "阳光洒落的林间空地，中央有一块发光的水晶", style: "fantasy_art"] {
    你在空地中央发现了完整的魔法水晶。
}
"你完成了本次冒险，成为了村庄的英雄！"
-> END

=== top ===
"你又回到了森林入口。"
-> END

=== fox_event ===
@image[prompt: "森林边缘，受伤的小狐狸", style: "watercolor"] {
    你发现一只受伤的小狐狸，正无助地看着你。
}

* [帮助小狐狸] 你用随身的药草为它包扎伤口。
    -> fox_helped
* [离开] 你决定不管它，转身离开。
    -> deep_forest

=== fox_helped ===
@image[prompt: "小狐狸感激地看着你，身上泛起微光", style: "watercolor"] {
    小狐狸获得新生，似乎对你产生了好感。
}
"小狐狸成为了你的伙伴，在后续冒险中会帮助你。"
-> deep_forest
`
  },
  {
    label: '卡牌抽取收集示例（收集类）',
    value: `// === 魔法学院的卡牌收集 ===

@image[prompt: "宏伟的魔法学院大门，晨光下的学生们", style: "fantasy_art", size: "600x300"] {
    你来到魔法学院，准备开启新学期的冒险。
}

"新学期开始了，导师布置了卡牌收集任务。"

* [前往导师办公室] -> mentor_office
* [在校园闲逛] -> campus_event

=== mentor_office ===
@image[prompt: "导师办公室，书架和魔法道具", style: "fantasy_art"] {
    导师微笑着递给你一份卡牌收集清单。
}

@card[keywords: "火球术,治愈术,冰锥术,魔力激荡,闪电链", type: "collection", scene: "卡牌收集", chapter: "魔法卡牌册"]

* [进入卡牌收集] -> start_card_collection
* [返回校园] -> campus_event

=== start_card_collection ===
"你获得了一批新卡牌，快去卡牌收集页面看看吧！"
-> END

=== campus_event ===
@image[prompt: "学院花园，学生们交流卡牌", style: "fantasy_art"] {
    你在花园遇到同学艾莉丝，她邀请你一起交换卡牌。
}
* [和艾莉丝交换卡牌] -> exchange_success
* [独自收集卡牌] -> solo_collect

=== exchange_success ===
"你和艾莉丝交换到了稀有卡牌，收集进度大幅提升！"
-> END

=== solo_collect ===
"你独自努力收集卡牌，虽然进度慢一些，但也很有成就感。"
-> END
`
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
    // 只要target为'进入卡牌对战'或'start_card_battle'或'进入卡牌收集'或'start_card_collection'，全局查找第一个@card并跳转
    if (
      target === 'start_card_battle' || target === '进入卡牌对战' ||
      target === 'start_card_collection' || target === '进入卡牌收集'
    ) {
      const cardBlock = blocks.find(b => b.type === 'card_jump');
      if (cardBlock) {
        const keywords = cardBlock.params.keywords || '';
        const scene = cardBlock.params.scene || '';
        const chapter = cardBlock.params.chapter || '';
        const on_win = cardBlock.params.on_win || '';
        const on_lose = cardBlock.params.on_lose || '';
        const on_draw = cardBlock.params.on_draw || '';
        const type = cardBlock.params.type || '';
        let url = '';
        if (type === 'collection') {
          url = `/card/card_collection.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}`;
        } else {
          url = `/card/card_game.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}&on_win=${encodeURIComponent(on_win)}&on_lose=${encodeURIComponent(on_lose)}&on_draw=${encodeURIComponent(on_draw)}`;
        }
        console.log('[DEBUG] 跳转卡牌页面:', url);
        window.open(url, '_blank');
      } else {
        alert('全局未检测到@card节点，无法进入卡牌页面！');
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
                    const type = b.params.type || '';
                    // 新增：根据type跳转不同html
                    let url = '';
                    if (type === 'collection') {
                      url = `/card/card_collection.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}`;
                    } else {
                      url = `/card/card_game.html?card_keywords=${encodeURIComponent(keywords)}&scene=${encodeURIComponent(scene)}&chapter=${encodeURIComponent(chapter)}&on_win=${encodeURIComponent(on_win)}&on_lose=${encodeURIComponent(on_lose)}&on_draw=${encodeURIComponent(on_draw)}`;
                    }
                    return (
                      <div key={idx} style={{margin:'16px 0',textAlign:'center'}}>
                        <div style={{marginBottom:8}}>
                          @card[keywords: "{keywords}", scene: "{scene}", chapter: "{chapter}", type: "{type}", on_win: "{on_win}", on_lose: "{on_lose}"]
                        </div>
                        <div>
                          {type === 'collection' ? '你获得了一批新卡牌，快来收集吧！' : '你在这里遭遇了神秘的魔物，是否要使用卡牌对战？胜利/失败将自动进入不同剧情分支。'}
                        </div>
                        <div style={{marginTop:8}}>
                          <button onClick={() => window.open(url, '_blank')} style={{padding:'10px 24px',fontSize:'1.1rem',borderRadius:8,background:'#3b82f6',color:'#fff',border:'none',cursor:'pointer',marginRight:12}}>
                            {type === 'collection' ? '进入卡牌收集' : '进入卡牌对战'}
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
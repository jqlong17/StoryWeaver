# InkPlus 扩展语法规范

> 基于原版 Ink 语法的现代剧情生成器扩展语言

## 概述

InkPlus 是对经典 Ink 叙事语言的现代化扩展，在保持原有语法兼容的基础上，增加了AI图片生成、音效控制、动画效果、UI定制等现代游戏开发所需的功能。

## 设计原则

1. **向后兼容** - 所有原版 Ink 语法完全支持
2. **渐进增强** - 扩展功能可选，不影响基础功能
3. **AI友好** - 支持现代AI工具链集成
4. **开发效率** - 简化多媒体内容创作流程
5. **跨平台** - 支持Web、移动端、桌面端部署

---

## 一、图片系统扩展

### 1.1 图片描述与生成

#### 基础语法
```inkplus
@image[prompt] {
    描述文本
}
```

#### 详细参数
```inkplus
@image[prompt: "森林中的小屋", style: "oil_painting", size: "1024x768"] {
    夕阳西下，森林深处有一座被藤蔓包围的古老小屋，
    温暖的灯光从窗户透出，烟囱冒着白烟。
    风格：油画，暖色调，梦幻感
}
```

#### 参数说明
- `prompt`: 图片生成的主要描述
- `style`: 艺术风格 (`realistic`, `anime`, `oil_painting`, `watercolor`, `pixel_art`)
- `size`: 图片尺寸 (`1024x768`, `512x512`, `1920x1080`)
- `mood`: 情绪色调 (`bright`, `dark`, `warm`, `cold`, `mysterious`)
- `quality`: 生成质量 (`draft`, `standard`, `high`, `ultra`)

#### 条件图片生成
```inkplus
{player_class == "wizard":
    @image[prompt: "法师召唤火球"] {
        一位身穿蓝色法袍的法师正在施法，
        手中凝聚着明亮的火球，魔法符文在空中闪烁
    }
- player_class == "warrior":
    @image[prompt: "战士挥舞巨剑"] {
        一位身着重甲的战士高举双手巨剑，
        剑刃反射着阳光，威武不凡
    }
}
```

#### 图片变量引用
```inkplus
VAR current_location = "forest"
VAR weather = "rainy"

@image[prompt: "{player_name}在{current_location}中行走", weather: "{weather}"] {
    {player_name}在{weather}的{current_location}中缓缓前行
}
```

### 1.2 图片缓存与复用

```inkplus
// 定义可复用的图片
@define_image[id: "forest_entrance"] {
    prompt: "森林入口，古老的石碑",
    style: "realistic",
    描述：阳光透过茂密的树叶洒在古老的石碑上
}

// 使用预定义图片
@use_image[id: "forest_entrance"]

// 带变化的复用
@use_image[id: "forest_entrance", filter: "sepia", mood: "dark"]
```

---

## 二、音效系统扩展

### 2.1 背景音乐控制

```inkplus
@bgm[track: "forest_theme", volume: 0.7, loop: true, fade_in: 2000]

// 音乐切换
@bgm[track: "battle_theme", fade_out: 1000, fade_in: 1500]

// 停止音乐
@bgm[stop, fade_out: 2000]
```

### 2.2 音效播放

```inkplus
// 基础音效
@sfx[sound: "sword_clash"]

// 带参数的音效
@sfx[sound: "footsteps", volume: 0.5, pitch: 1.2, delay: 500]

// 条件音效
{dragon_defeated:
    @sfx[sound: "victory_fanfare", volume: 1.0]
- else:
    @sfx[sound: "tension_sting", volume: 0.8]
}
```

### 2.3 环境音效

```inkplus
@ambient[
    rain: 0.6,
    wind: 0.3,
    birds: 0.2
]

// 动态环境音
{current_location == "forest":
    @ambient[birds: 0.8, wind: 0.4]
- current_location == "cave":
    @ambient[echo: 0.7, dripping: 0.3]
}
```

---

## 三、动画与视觉效果

### 3.1 文本动画

```inkplus
// 打字机效果
@typewriter[speed: 50] {
    这段文字将以打字机的效果逐字显示...
}

// 渐入效果
@fade_in[duration: 1000] {
    这段文字将淡入显示
}

// 震动效果
@shake[intensity: 3, duration: 500] {
    战斗的冲击波震撼着大地！
}
```

### 3.2 屏幕效果

```inkplus
// 闪烁效果
@flash[color: "white", duration: 200]

// 屏幕震动
@screen_shake[intensity: 5, duration: 1000]

// 颜色滤镜
@color_filter[type: "sepia", intensity: 0.5, duration: 2000]

// 模糊效果
@blur[intensity: 0.3, duration: 1500, fade_out: true]
```

### 3.3 转场效果

```inkplus
// 淡出淡入
@transition[type: "fade", duration: 1000] {
    -> next_scene
}

// 滑动转场
@transition[type: "slide_left", duration: 800] {
    -> castle_interior
}

// 自定义转场
@transition[type: "custom", effect: "spiral", duration: 1200] {
    -> dream_sequence
}
```

---

## 四、UI样式控制

### 4.1 文本样式

```inkplus
// 基础样式
@style[color: "#ff6b6b", size: "large", weight: "bold"] {
    这是重要的红色大字
}

// 预定义样式类
@style[class: "narrator"] {
    旁白：时间已经不多了...
}

@style[class: "character_dialog", character: "艾莉丝"] {
    "我们必须马上行动！"
}

// 内联样式
这是普通文字，<@color="#4ecdc4">这是青色文字</@color>，<@bold>这是粗体</@bold>。
```

### 4.2 布局控制

```inkplus
// 居中显示
@layout[align: "center"] {
    第三章：失落的王国
}

// 分栏显示
@layout[columns: 2] {
    左侧：你看到一扇古老的门。
    右侧：墙上挂着一幅肖像画。
}

// 边框装饰
@layout[border: "ornate", padding: "20px"] {
    重要提示：这里隐藏着重要的线索！
}
```

### 4.3 选择样式定制

```inkplus
// 自定义选择按钮样式
@choice_style[theme: "medieval", icon: "sword"] {
    * [战斗] -> battle_sequence
    * [逃跑] -> escape_route
}

// 卡片式选择
@choice_style[layout: "card", image: true] {
    * [选择法师] 
        @image[prompt: "年轻的法师", size: "300x200"]
        掌握神秘的魔法力量
        -> choose_mage
    * [选择战士]
        @image[prompt: "勇敢的战士", size: "300x200"] 
        拥有强大的近战能力
        -> choose_warrior
}
```

---

## 五、高级功能扩展

### 5.1 时间系统

```inkplus
// 实时时间
@real_time[format: "HH:mm"] {
    当前时间：{real_time}
}

// 游戏内时间
@game_time[day: 1, hour: 8] {
    游戏时间：第{game_day}天 {game_hour}:00
}

// 时间推进
@advance_time[hours: 2] {
    时间过去了2小时...
}

// 定时事件
@timer[duration: 10000, event: "alarm_rings"] {
    你有10秒时间做出选择！
}
```

### 5.2 存档增强

```inkplus
// 自动存档点
@checkpoint[id: "forest_entrance", description: "森林入口"]

// 手动存档
@save_point {
    * [保存游戏] -> save_game
    * [加载游戏] -> load_game
    * [继续] -> continue_story
}

// 分支存档
@branch_save[id: "major_choice_1"] {
    这是一个重要的选择，会影响后续剧情。
}
```

### 5.3 数据收集与分析

```inkplus
// 记录玩家行为
@track[event: "choice_made", choice: "help_villager", location: "village"]

// 统计信息
@stats[display: true] {
    游戏时长：{play_time}
    做出选择：{total_choices}
    探索区域：{areas_visited}
}

// 成就系统
@achievement[id: "first_choice", name: "初来乍到"] {
    恭喜！你做出了第一个选择。
}
```

### 5.4 外部API集成

```inkplus
// AI助手集成
@ai[service: "gpt", prompt: "根据当前剧情生成一个提示"] {
    AI建议：{ai_response}
}

// 翻译服务
@translate[target: "en", text: "你好，世界"] {
    Translation: {translated_text}
}

// 语音合成
@tts[voice: "female", speed: 1.0, text: "欢迎来到这个奇幻世界"]
```

---

## 六、响应式设计

### 6.1 设备适配

```inkplus
// 设备检测
{device_type == "mobile":
    @layout[mobile_optimized: true]
    @choice_style[touch_friendly: true]
- device_type == "desktop":
    @layout[desktop_layout: true]
    @hotkeys[enabled: true]
}

// 屏幕尺寸适配
@responsive {
    small: { font_size: "14px", margin: "10px" },
    medium: { font_size: "16px", margin: "20px" },
    large: { font_size: "18px", margin: "30px" }
}
```

### 6.2 无障碍支持

```inkplus
// 屏幕阅读器支持
@accessibility[screen_reader: true, high_contrast: false] {
    这段文字将被屏幕阅读器朗读
}

// 键盘导航
@navigation[keyboard: true, tab_order: "1,2,3"]

// 色盲友好
@color_blind[type: "deuteranopia", alternative_indicators: true]
```

---

## 七、性能优化

### 7.1 资源预加载

```inkplus
// 预加载图片
@preload[type: "image"] {
    "forest_bg.jpg",
    "character_portrait.png",
    "ui_elements.png"
}

// 预加载音频
@preload[type: "audio"] {
    "background_music.mp3",
    "sword_sound.wav",
    "footsteps.ogg"
}
```

### 7.2 懒加载与缓存

```inkplus
// 懒加载设置
@lazy_load[threshold: "50%", placeholder: "loading..."]

// 缓存策略
@cache[images: "aggressive", audio: "conservative", text: "memory_only"]
```

---

## 八、调试与开发工具

### 8.1 调试信息

```inkplus
// 开发模式
@debug[enabled: true] {
    当前变量状态：
    player_hp: {player_hp}
    current_location: {current_location}
}

// 性能监控
@performance[monitor: true, log_fps: true, log_memory: true]

// 测试断点
@breakpoint[condition: "player_hp < 10", message: "玩家生命值过低"]
```

### 8.2 热重载支持

```inkplus
// 热重载配置
@hot_reload[enabled: true, watch_files: ["*.inkplus", "assets/*"]]

// 实时预览
@live_preview[port: 3000, auto_refresh: true]
```

---

## 九、实际使用示例

### 9.1 完整场景示例

```inkplus
// === 森林遭遇战 ===

@image[prompt: "黑暗森林中的狼群", style: "realistic", mood: "dark"] {
    月光透过密林，照亮了几双闪烁的绿色眼睛
}

@bgm[track: "tension_theme", volume: 0.6, fade_in: 2000]
@ambient[wind: 0.4, owl: 0.2]

@typewriter[speed: 40] {
    你在森林深处遇到了一群饥饿的狼。它们缓缓围了上来，低声咆哮着。
}

@choice_style[theme: "combat", urgent: true] {
    * [拔出武器准备战斗]
        @sfx[sound: "sword_unsheath"]
        @image[prompt: "勇敢的冒险者拔剑迎敌"]
        -> combat_sequence
        
    * [尝试慢慢后退]
        @sfx[sound: "careful_footsteps", volume: 0.3]
        @image[prompt: "小心翼翼后退的身影"]
        -> stealth_escape
        
    * [大声喊叫试图吓跑它们]
        @sfx[sound: "loud_shout"]
        @screen_shake[intensity: 2, duration: 300]
        -> intimidation_attempt
}

=== combat_sequence ===
@transition[type: "fade", duration: 500]
@bgm[track: "battle_theme", fade_out: 1000, fade_in: 800]

@image[prompt: "激烈的战斗场面", style: "dynamic", mood: "intense"] {
    刀光剑影中，战斗一触即发
}

战斗开始了！

{player_class == "warrior":
    @sfx[sound: "battle_cry"]
    你发出战吼，勇猛地冲向狼群！
- player_class == "mage":
    @sfx[sound: "spell_cast"]
    @flash[color: "blue", duration: 300]
    你念动咒语，魔法在手中凝聚！
}

// ... 战斗逻辑继续
```

### 9.2 角色对话示例

```inkplus
=== meet_sage ===

@image[prompt: "智慧的老法师在古老的图书馆中", style: "fantasy_art"] {
    一位白发苍苍的老法师坐在堆满古籍的桌前，
    炯炯有神的眼睛透露着深邃的智慧
}

@bgm[track: "mystical_theme", volume: 0.5]
@ambient[fire_crackling: 0.3, pages_turning: 0.1]

@style[class: "sage_dialog", voice: "deep"] {
    "年轻的冒险者，我已经等你很久了。"
}

老法师缓缓抬起头，审视着你。

@choice_style[layout: "dialog", character_emotion: true] {
    * [保持礼貌] "您好，智者。我来寻求指导。"
        @track[event: "polite_response"]
        ~ reputation_mages += 1
        -> sage_pleased
        
    * [直截了当] "我需要关于龙之心的信息。"
        @track[event: "direct_approach"] 
        -> sage_neutral
        
    * [保持警惕] "你怎么知道我会来？"
        @track[event: "suspicious_response"]
        -> sage_amused
}
```

---

## 十、编译器与工具链

### 10.1 InkPlus编译器

```bash
# 编译InkPlus文件
inkplus-compiler story.inkplus -o story.json --target web

# 开发模式
inkplus-compiler story.inkplus --dev --watch --hot-reload

# 优化编译
inkplus-compiler story.inkplus -o story.json --optimize --minify
```

### 10.2 IDE支持

支持的功能：
- 语法高亮
- 代码补全
- 错误检查
- 实时预览
- 资源管理
- 版本控制集成

### 10.3 运行时库

```javascript
// JavaScript运行时
import { InkPlusEngine } from 'inkplus-engine';

const engine = new InkPlusEngine({
    imageAPI: 'dalle-3',
    audioEnabled: true,
    debugMode: false
});

engine.loadStory('story.json').then(() => {
    engine.start();
});
```

---

## 十一、迁移指南

### 11.1 从Ink迁移

现有的Ink文件完全兼容，只需：
1. 将文件扩展名改为`.inkplus`
2. 逐步添加新功能
3. 使用InkPlus编译器编译

### 11.2 渐进式增强

```inkplus
// 传统Ink语法仍然有效
你站在十字路口。

* 向左走
    你选择了左边的道路。
* 向右走  
    你选择了右边的道路。

// 可以逐步添加InkPlus功能
@image[prompt: "十字路口的选择"]
你站在十字路口。

@choice_style[theme: "modern"]
* 向左走
    @transition[type: "slide_left"]
    你选择了左边的道路。
* 向右走
    @transition[type: "slide_right"] 
    你选择了右边的道路。
```

---

## 十二、最佳实践

### 12.1 性能建议

1. **图片优化**：合理设置图片尺寸，使用预加载
2. **音频管理**：及时停止不需要的音频，使用压缩格式
3. **资源缓存**：充分利用缓存机制
4. **懒加载**：对非关键资源使用懒加载

### 12.2 用户体验

1. **渐进增强**：确保基础功能在所有设备上可用
2. **无障碍**：考虑视障、听障用户的需求
3. **响应式**：适配不同屏幕尺寸
4. **性能感知**：提供加载指示器和反馈

### 12.3 内容创作

1. **模块化**：将复杂剧情分解为小模块
2. **复用性**：定义可复用的样式和资源
3. **测试驱动**：为关键剧情分支编写测试
4. **版本控制**：使用Git管理剧情版本

---

这个InkPlus扩展规范在保持Ink简洁性的同时，为现代剧情游戏开发提供了强大的多媒体和AI集成能力。通过渐进式增强的方式，开发者可以从简单的文本开始，逐步添加复杂的视觉和音频效果。 
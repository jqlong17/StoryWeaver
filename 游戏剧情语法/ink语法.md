# Ink 语法指南

## 简介

Ink 是一种专门用于创建互动叙事的脚本语言，由 Inkle 公司开发。它简洁易学，功能强大，广泛用于游戏和互动小说的开发。

## 基础语法

### 1. 简单文本

```ink
Hello, world!
这是一行简单的文本。
```

### 2. 分支选择

使用 `*` 表示选择项：

```ink
* 向左走
  你选择了向左走。
* 向右走
  你选择了向右走。
* 停在原地
  你决定停在原地观察。
```

### 3. 粘性选择和一次性选择

- `*` 一次性选择（选择后不再显示）
- `+` 粘性选择（可以重复选择）

```ink
* 检查背包
  你翻了翻背包。
+ 查看地图
  地图显示你在森林中。
```

### 4. 条件选择

```ink
* {has_key} 用钥匙开门
  你用钥匙打开了门。
* {not has_key} 推门
  门被锁住了。
```

## 变量和逻辑

### 1. 变量声明

```ink
VAR health = 100
VAR has_sword = false
VAR player_name = "勇者"
```

### 2. 变量修改

```ink
~ health = health - 10
~ has_sword = true
~ player_name = "传奇勇者"
```

### 3. 条件语句

```ink
{health > 50:
    你感觉身体还不错。
- else:
    你感觉很虚弱。
}
```

### 4. 多重条件

```ink
{health > 80:
    你精神抖擞！
- health > 50:
    你感觉还行。
- health > 20:
    你有些疲惫。
- else:
    你几乎要倒下了。
}
```

## 高级功能

### 1. 函数

```ink
=== function attack(damage)
~ health = health - damage
{health <= 0:
    你死了！
    -> END
}

~ attack(15)
```

### 2. 节点和跳转

```ink
=== start ===
欢迎来到冒险游戏！
-> forest

=== forest ===
你在一片森林中。
* 探索深处
    -> deep_forest
* 返回村庄
    -> village

=== deep_forest ===
深林中很危险...
-> END

=== village ===
你回到了安全的村庄。
-> END
```

### 3. 线程和并行

```ink
=== thread_1 ===
这是第一个线程。
-> DONE

=== thread_2 ===
这是第二个线程。
-> DONE

// 并行执行
<- thread_1
<- thread_2
```

### 4. 列表

```ink
LIST weapons = sword, bow, staff
LIST locations = forest, village, castle

~ weapons += sword
~ weapons -= bow

{LIST_COUNT(weapons) > 0:
    你有武器。
}
```

### 5. 随机性

```ink
{RANDOM(1,3):
- 1: 你找到了金币！
- 2: 你遇到了怪物！
- 3: 路上什么都没有。
}
```

## 文本格式化

### 1. 变量插值

```ink
VAR player_name = "艾莉丝"
你好，{player_name}！
```

### 2. 条件文本

```ink
你{health < 30:虚弱地|坚定地}向前走。
```

### 3. 文本修饰

```ink
// 粗体
**这是粗体文本**

// 斜体
*这是斜体文本*

// 删除线
~~这是删除线文本~~
```

## 循环和重复

### 1. 循环语法

```ink
{for_each(item, inventory):
    你有 {item}。
}
```

### 2. 序列和循环

```ink
{&天气很好|下雨了|阳光明媚|多云}
// 第一次：天气很好
// 第二次：下雨了
// 第三次：阳光明媚
// 第四次：多云
// 之后循环

{!天气很好|下雨了|阳光明媚}
// 随机选择一个
```

## 状态跟踪

### 1. 访问计数

```ink
{village:
    你第{village}次来到村庄。
}
```

### 2. 全局状态

```ink
INCLUDE globals.ink

// globals.ink 文件中定义全局变量
VAR global_day = 1
VAR global_reputation = 0
```

## 外部函数

```ink
EXTERNAL show_image(image_name)
EXTERNAL play_sound(sound_name)

~ show_image("forest.jpg")
~ play_sound("birds.wav")
```

## 注释

```ink
// 单行注释

/*
多行注释
可以跨越多行
*/

TODO: 这里需要添加更多内容
```

## 调试

### 1. 调试输出

```ink
~ temp debug_var = health + 10
// debug_var 不会在游戏中显示
```

### 2. 断言

```ink
{health >= 0:
    // 健康值应该总是非负的
}
```

## 最佳实践

1. **模块化**: 将大型故事分割为多个文件
2. **命名规范**: 使用清晰的变量和节点名称
3. **注释**: 为复杂逻辑添加注释
4. **测试**: 定期测试所有分支路径
5. **版本控制**: 使用 Git 等工具管理版本

## 常用模式

### 1. 库存系统

```ink
LIST inventory = ()
LIST items = sword, potion, key

* 拾取剑
    ~ inventory += sword
    你获得了剑！

{LIST_COUNT(inventory) == 0:
    你的背包是空的。
- else:
    背包中有：{inventory}
}
```

### 2. 角色关系

```ink
VAR friendship_alice = 0
VAR friendship_bob = 0

* 帮助爱丽丝
    ~ friendship_alice += 1
    爱丽丝很感激你。

{friendship_alice > 5:
    爱丽丝现在完全信任你了。
}
```

### 3. 时间系统

```ink
VAR current_hour = 9
VAR current_day = 1

{current_hour < 12:
    现在是上午。
- current_hour < 18:
    现在是下午。
- else:
    现在是晚上。
}
```

## 错误排查

### 常见错误：

1. **忘记添加 `~`**: 变量赋值必须以 `~` 开头
2. **缺少节点**: 跳转到不存在的节点
3. **无限循环**: 检查跳转逻辑
4. **语法错误**: 检查括号和引号匹配

## 工具和编辑器

- **Inky**: 官方编辑器和编译器
- **VSCode**: 有 Ink 语法高亮插件
- **Unity**: 有 Ink 插件用于游戏开发

## 参考资源

- [官方文档](https://github.com/inkle/ink)
- [Writing with Ink](https://www.inklestudios.com/ink/)
- [Ink Unity 集成](https://github.com/inkle/ink-unity-integration)

---

# InkJS 使用指南

## 什么是 InkJS？

InkJS 是 ink 脚本语言的 JavaScript 移植版本，允许您在浏览器和 Node.js 环境中运行 ink 故事。它与原版完全兼容，零依赖，可以在所有现代浏览器中工作。

## 安装方式

### 1. 使用 npm 安装

```bash
npm install inkjs
```

### 2. 直接下载使用

从 [GitHub Releases](https://github.com/y-lohse/inkjs/releases) 下载最新版本，然后在 HTML 中引用：

```html
<script src="ink.js"></script>
```

### 3. 对于旧浏览器

如果需要支持不支持 ES2015 的旧浏览器：

```javascript
import ink from 'inkjs/dist/ink.js'
```

## 基本使用方法

### 1. 在浏览器中使用

#### 方法一：直接嵌入故事内容

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的 Ink 故事</title>
    <script src="ink.js"></script>
</head>
<body>
    <div id="story"></div>
    <div id="choices"></div>

    <script>
        // 您的 ink 故事内容（JSON 格式）
        var storyContent = `{
            "inkVersion": 21,
            "root": [[["^你站在森林的入口处。"],"\\n",["ev",{"^->":"0.8.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":".^.c","flg":18},"^你看到一条小径向北延伸。",{"->":"0.11"},{"#f":5}],["ev",{"^->":"0.15.$r1"},{"temp=":"$r"},"str",{"->":".^.s"},[{"#n":"$r1"}],"/str","/ev",{"*":".^.c","flg":18},"^另一条路向东蜿蜒。",{"->":"0.18"},{"#f":5}],["done",{"#f":5}],"end"],"done",{},null],"listDefs":{}}`

        var story = new inkjs.Story(storyContent);
        
        function continueStory() {
            var storyDiv = document.getElementById('story');
            var choicesDiv = document.getElementById('choices');
            
            // 清空选择
            choicesDiv.innerHTML = '';
            
            // 继续故事直到需要选择
            while(story.canContinue) {
                storyDiv.innerHTML += story.Continue();
            }
            
            // 显示选择
            if(story.currentChoices.length > 0) {
                story.currentChoices.forEach(function(choice, index) {
                    var choiceBtn = document.createElement('button');
                    choiceBtn.innerHTML = choice.text;
                    choiceBtn.onclick = function() {
                        story.ChooseChoiceIndex(index);
                        continueStory();
                    };
                    choicesDiv.appendChild(choiceBtn);
                });
            }
        }
        
        // 开始故事
        continueStory();
    </script>
</body>
</html>
```

#### 方法二：从 JSON 文件加载

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的 Ink 故事</title>
    <script src="ink.js"></script>
</head>
<body>
    <div id="story"></div>
    <div id="choices"></div>

    <script>
        var story;
        
        // 从文件加载故事
        fetch('story.json')
            .then(function(response) {
                return response.text();
            })
            .then(function(storyContent) {
                story = new inkjs.Story(storyContent);
                continueStory();
            });
        
        function continueStory() {
            // ... 与上面相同的 continueStory 函数
        }
    </script>
</body>
</html>
```

### 2. 在 Node.js 中使用

#### 安装和导入

```javascript
// 使用 require
var Story = require('inkjs').Story;

// 或使用 import
import { Story } from 'inkjs';
```

#### 完整示例

```javascript
const fs = require('fs');
const { Story } = require('inkjs');

// 读取 ink JSON 文件
var json = fs.readFileSync('./story.json', 'UTF-8').replace(/^\uFEFF/, ''); // 去除 BOM

// 创建故事实例
var story = new Story(json);

// 游戏循环
function playStory() {
    // 输出所有可继续的内容
    while(story.canContinue) {
        console.log(story.Continue());
    }
    
    // 如果有选择，显示并等待用户输入
    if(story.currentChoices.length > 0) {
        story.currentChoices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice.text}`);
        });
        
        // 这里您需要添加获取用户输入的逻辑
        // 例如使用 readline 模块
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('请选择 (输入数字): ', (answer) => {
            const choiceIndex = parseInt(answer) - 1;
            if(choiceIndex >= 0 && choiceIndex < story.currentChoices.length) {
                story.ChooseChoiceIndex(choiceIndex);
                playStory(); // 递归继续游戏
            } else {
                console.log('无效选择，请重试');
                playStory();
            }
            rl.close();
        });
    } else {
        console.log('故事结束');
    }
}

// 开始游戏
playStory();
```

## 变量操作

### 在支持 ES2015 Proxy 的环境中

```javascript
// 设置变量
story.variablesState["player_health"] = 100;
story.variablesState["player_name"] = "勇者";

// 获取变量
var health = story.variablesState["player_health"];
var name = story.variablesState["player_name"];
```

### 在旧环境中（不支持 Proxy）

```javascript
// 设置变量
story.variablesState.$('player_health', 100);
story.variablesState.$('player_name', '勇者');

// 获取变量
var health = story.variablesState.$('player_health');
var name = story.variablesState.$('player_name');
```

## 调用 Ink 函数

```javascript
// 基本调用
var result = story.EvaluateFunction('my_function', ['arg1', 'arg2']);

// 获取函数输出的文本
var result = story.EvaluateFunction('my_function', ['arg1', 'arg2'], true);
// result.returned 是返回值
// result.output 是函数执行期间输出的文本
```

## 编译 Ink 文件

### 使用命令行编译器

```bash
# 全局安装
npm install -g inkjs

# 编译 ink 文件
inkjs-compiler story.ink -o story.json

# 或使用 npx
npx inkjs story.ink -o story.json
```

### 在代码中编译

```javascript
const inkjs = require("inkjs/full"); // 包含编译器的完整版本

// 从 ink 源码创建故事
const story = new inkjs.Compiler(`
=== start ===
你好，世界！
* 选择一
    你选择了选项一。
* 选择二  
    你选择了选项二。
-> END
`).Compile();

// 获取 JSON 字节码用于保存
const jsonBytecode = story.ToJson();
```

## 使用 TypeScript

```typescript
import { Story, Compiler } from 'inkjs/types';

let story: Story;
let compiler: Compiler;

// 或深度导入
import { Story } from 'inkjs/engine/Story';
import { Choice } from 'inkjs/engine/Choice';
```

## 完整的网页示例

让我为您创建一个完整的示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ink 故事演示</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        #story {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 200px;
            white-space: pre-wrap;
        }
        
        #choices {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .choice-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        
        .choice-btn:hover {
            background: #0056b3;
        }
        
        #restart {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Ink 故事演示</h1>
    <div id="story"></div>
    <div id="choices"></div>
    <button id="restart" onclick="restartStory()" style="display: none;">重新开始</button>

    <script src="https://cdn.jsdelivr.net/npm/inkjs@latest/dist/ink.js"></script>
    <script>
        // 示例故事内容（这里应该是您编译后的 JSON）
        var storyContent = `您的故事JSON内容`;
        
        var story;
        var storyDiv = document.getElementById('story');
        var choicesDiv = document.getElementById('choices');
        var restartBtn = document.getElementById('restart');
        
        function startStory() {
            story = new inkjs.Story(storyContent);
            storyDiv.innerHTML = '';
            restartBtn.style.display = 'none';
            continueStory();
        }
        
        function continueStory() {
            choicesDiv.innerHTML = '';
            
            while(story.canContinue) {
                storyDiv.innerHTML += story.Continue();
            }
            
            if(story.currentChoices.length > 0) {
                story.currentChoices.forEach(function(choice, index) {
                    var choiceBtn = document.createElement('button');
                    choiceBtn.className = 'choice-btn';
                    choiceBtn.innerHTML = choice.text;
                    choiceBtn.onclick = function() {
                        story.ChooseChoiceIndex(index);
                        continueStory();
                    };
                    choicesDiv.appendChild(choiceBtn);
                });
            } else {
                restartBtn.style.display = 'block';
            }
        }
        
        function restartStory() {
            startStory();
        }
        
        // 页面加载时开始故事
        window.onload = function() {
            startStory();
        };
    </script>
</body>
</html>
```

## 常见问题和注意事项

### 1. CORS 问题
在浏览器中加载本地 JSON 文件时，需要运行本地服务器，不能直接打开 HTML 文件。

### 2. BOM 编码问题
使用 inklecate 编译器生成的 JSON 文件可能包含 BOM，在 Node.js 中读取时需要去除：

```javascript
var json = fs.readFileSync('./story.json', 'UTF-8').replace(/^\uFEFF/, '');
```

### 3. 版本兼容性
确保您的 ink 源文件版本与 inkjs 版本兼容。参考文档中的兼容性表格。

### 4. TypeScript 支持
如果使用 TypeScript，可以获得更好的类型检查和 IntelliSense 支持。

这样您就可以开始使用 inkjs 来创建和运行您的互动故事了！

---

# 复杂游戏项目中的 Ink 应用实例

虽然 Ink 语法看起来简单，但它可以构建极其复杂的游戏系统。以下是一些真实的应用场景：

## 🎮 商业游戏成功案例

### 1. **《80 Days》** - Inkle Studios
- **规模**：50万+ 字的对话内容
- **复杂性**：500+ 城市，动态路线生成
- **系统**：资源管理、时间限制、声望系统

### 2. **《Heaven's Vault》** - Inkle Studios
- **特色**：动态语言翻译系统
- **复杂性**：考古发现影响整个世界观
- **叙事**：非线性时间线，多重结局

### 3. **《Sorcery!》系列** - Inkle Studios
- **机制**：战斗系统与叙事深度结合
- **复杂性**：法术系统、库存管理、地图探索

## 🔧 复杂RPG游戏示例

以下是一个复杂RPG游戏中可能用到的ink系统：

> **重要说明**：LIST在ink中的正确用法是先定义LIST类型，然后用VAR创建实际的LIST变量。不能在LIST定义中直接包含空括号()。

### 角色系统与声望管理

```ink
// === 复杂的角色关系系统 ===
VAR reputation_wizard_guild = 0
VAR reputation_thieves_guild = 0
VAR reputation_nobles = 0
VAR reputation_commoners = 0

VAR player_class = "warrior"
VAR player_level = 1
VAR player_gold = 100
VAR player_hp = 100
VAR player_mp = 50

LIST guild_membership = none, wizard_apprentice, wizard_member, wizard_master, thieves_contact, thieves_member, thieves_lieutenant
LIST equipment = sword, magic_sword, leather_armor, plate_armor, healing_potion, mana_potion
LIST spells_known = fireball, heal, lightning, teleport, mind_read

// 初始化玩家当前状态（空LIST）
VAR current_guild_membership = ()
VAR current_equipment = ()
VAR current_spells = ()

// === 复杂的任务系统 ===
VAR main_quest_stage = 0
VAR rescue_princess_started = false
VAR rescue_princess_completed = false
VAR dragon_defeated = false
VAR ancient_artifact_found = false

LIST side_quests_completed = delivery, combat, exploration, social
LIST npcs_met = guild_master, merchant, princess, dragon
LIST locations_visited = town_square, wizard_guild, thieves_den, castle

// === 动态对话系统 ===
=== meet_guild_master ===
{reputation_wizard_guild < 0:
    法师公会会长冷冷地看着你。
    "你在这里不受欢迎，离开！"
    -> END
- reputation_wizard_guild >= 50:
    "啊，是我们受人尊敬的朋友！"
    + [询问高级任务]
        -> advanced_quests
    + [请求训练]
        -> magic_training
- else:
    "你好，冒险者。"
    + [申请加入公会]
        -> join_guild_attempt
    + [询问任务]
        -> basic_quests
}

=== join_guild_attempt ===
{player_class == "mage":
    "一个法师！我们当然欢迎你。"
    ~ current_guild_membership += wizard_apprentice
    ~ reputation_wizard_guild += 10
- player_class == "warrior" && reputation_wizard_guild >= 20:
    "虽然你不是法师，但你的声誉为你说话。"
    ~ current_guild_membership += wizard_apprentice
    ~ reputation_wizard_guild += 5
- else:
    "抱歉，我们只接受有魔法天赋的人。"
    {current_spells has fireball:
        等等...你会火球术？也许我们可以考虑一下。
        + [展示法术能力]
            -> magic_demonstration
        + [算了，告辞]
            -> END
    - else:
        "真的很抱歉，但规则就是规则。"
    }
}
-> town_square

// === 复杂的战斗系统集成 ===
=== dragon_encounter ===
巨龙从巢穴中走出，火焰从它的鼻孔中喷出！

{player_level < 10:
    你感到一阵恐惧 - 你还没有强大到足以面对这样的敌人。
    * [逃跑] -> coward_ending
    * [战斗] -> hopeless_battle
- current_equipment has magic_sword && current_spells has lightning:
    你握紧魔法剑，感受到雷电法术的力量。这场战斗是可能获胜的！
    * [使用雷电法术] -> lightning_attack
    * [用魔法剑近战] -> sword_combat
    * [尝试谈判] -> dragon_negotiation
- current_equipment has magic_sword:
    你的魔法剑闪闪发光，但你怀疑这是否足够。
    * [勇敢战斗] -> difficult_battle
    * [寻找弱点] -> tactical_approach
- else:
    用普通武器对付巨龙？这几乎是自杀！
    * [孤注一掷] -> desperate_fight
    * [智取] -> clever_strategy
}

// === 复杂的经济系统 ===
=== merchant_interaction ===
商人热情地迎接你。
"欢迎！我这里有最好的装备！"

{reputation_commoners >= 30:
    "对于我们受人尊敬的朋友，我有特别优惠！"
    ~ temp discount = 0.8
- reputation_thieves_guild > 0:
    他眨了眨眼。"我听说你和某些...组织有联系。也许我们可以做特殊交易。"
    ~ temp discount = 0.7
- else:
    ~ temp discount = 1.0
}

* {player_gold >= 50 * discount} [购买治疗药水 ({50 * discount}金币)]
    ~ player_gold -= 50 * discount
    ~ current_equipment += healing_potion
    "明智的选择！这些药水救过很多冒险者的命。"

* {player_gold >= 200 * discount} [购买魔法剑 ({200 * discount}金币)]
    ~ player_gold -= 200 * discount
    ~ current_equipment += magic_sword
    "这把剑曾经属于一位伟大的英雄！"

+ [只是看看] 
    "随时欢迎！记住，好装备能救命！"

-> town_square

// === 复杂的时间和天气系统 ===
VAR current_day = 1
VAR current_hour = 8
VAR weather = "sunny"

=== advance_time(hours) ===
~ current_hour += hours
{current_hour >= 24:
    ~ current_day += 1
    ~ current_hour = current_hour - 24
}

// 天气影响事件
{current_hour >= 20 || current_hour <= 6:
    夜晚来临...
    {weather == "stormy":
        暴风雨让街道变得危险。
        ~ temp danger_modifier = 2
    - else:
        月光洒在街道上。
        ~ temp danger_modifier = 1
    }
- else:
    {weather == "sunny":
        阳光明媚的一天。
    - weather == "rainy":
        细雨绵绵。
    }
}
-> DONE

// === 复杂的结局系统 ===
=== calculate_ending ===
{rescue_princess_completed && dragon_defeated && reputation_wizard_guild >= 50:
    -> legendary_hero_ending
- rescue_princess_completed && !dragon_defeated:
    -> partial_hero_ending  
- dragon_defeated && reputation_thieves_guild > reputation_wizard_guild:
    -> dark_hero_ending
- current_guild_membership has thieves_lieutenant:
    -> crime_lord_ending
- player_gold >= 1000:
    -> wealthy_merchant_ending
- else:
    -> ordinary_adventurer_ending
}

=== legendary_hero_ending ===
你成为了传说中的英雄！
公主得救，巨龙被击败，魔法公会授予你最高荣誉。
你的名字将被永远铭记在历史中！

{reputation_wizard_guild >= 100:
    你被选为新的大法师！
}
{reputation_commoners >= 100:
    人民为你建立了雕像！
}
-> END
```

### 程序化内容生成

```ink
// === 动态任务生成系统 ===
=== generate_random_quest ===
~ temp quest_type = RANDOM(1,4)
~ temp quest_location = RANDOM(1,5)
~ temp quest_reward = RANDOM(50,200)

{quest_type:
- 1: -> delivery_quest(quest_location, quest_reward)
- 2: -> combat_quest(quest_location, quest_reward)  
- 3: -> exploration_quest(quest_location, quest_reward)
- 4: -> social_quest(quest_location, quest_reward)
}

=== delivery_quest(location, reward) ===
~ temp random_location = LIST_RANDOM(locations_visited)
任务发布员说："我需要你把这个包裹送到{random_location}。报酬是{reward}金币。"
* [接受任务]
    ~ current_quest_type = "delivery"
    ~ current_quest_target = location
    ~ current_quest_reward = reward
    "太好了！记住要小心路上的盗贼。"
* [拒绝任务]
    "好吧，也许其他冒险者会感兴趣。"
-> town_square

// === 复杂的库存管理 ===
=== use_item ===
你的背包里有：{current_equipment}

{LIST_COUNT(current_equipment) == 0:
    背包是空的！
    -> END
}

{current_equipment has healing_potion:
    * [使用治疗药水]
        ~ current_equipment -= healing_potion
        ~ player_hp = MIN(player_hp + 50, 100)
        你感觉好多了！生命值恢复了50点。
}

{current_equipment has mana_potion:
    * [使用法力药水]
        ~ current_equipment -= mana_potion
        ~ player_mp = MIN(player_mp + 30, 100)
        魔法能量在你体内流淌！
}

+ [关闭背包]
-> previous_location

// === 实时世界状态系统 ===
=== world_state_update ===
// 根据玩家行为动态改变世界

{dragon_defeated:
    ~ reputation_commoners += 20
    村民们都在谈论你击败巨龙的英勇事迹。
}

{current_guild_membership has thieves_member && reputation_nobles < 0:
    贵族们开始怀疑你的真实身份...
    ~ temp guards_suspicious = true
}

{reputation_wizard_guild >= 80:
    其他法师开始向你寻求建议。
    ~ temp approached_by_mages = true
}

-> DONE
```

## 🎯 为什么复杂项目选择 Ink？

### 1. **可扩展性**
- 单个项目可以有数十万行对话
- 模块化设计支持团队协作
- 版本控制友好

### 2. **与游戏引擎深度集成**
```cpp
// Unreal Engine C++ 代码示例
void AMyGameMode::UpdateStoryVariable(FString VarName, int32 Value) {
    if (InkStory) {
        InkStory->SetInt(VarName, Value);
    }
}
```

### 3. **实时调试和修改**
- Blotter工具可以在运行时修改变量
- 支持热重载，无需重启游戏
- 可视化故事流程

### 4. **性能优化**
- C++原生运行时性能优异
- 支持异步加载大型故事文件
- 内存管理优化

## 🚀 实际应用优势

### **开发效率**
- 编剧可以直接编写逻辑，无需程序员介入
- 快速原型测试
- 自动化测试覆盖

### **内容管理**
- 支持本地化（多语言）
- 版本控制和分支合并
- 自动化内容验证

### **用户体验**
- 无缝的故事分支切换
- 保存/加载系统自动处理
- 自然的对话流程

这就是为什么看似"简单"的 Ink 能够支撑复杂商业游戏的原因 - **简单的语法 + 强大的系统设计 + 专业的工具链 = 无限的可能性**！

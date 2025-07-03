"""
卡牌游戏引擎
用于处理剧情卡牌系统的核心逻辑
"""

import json
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class CardType(Enum):
    ACTION = "action"
    CHARACTER = "character"
    EVENT = "event"
    CHOICE = "choice"
    SPECIAL = "special"

class Rarity(Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    LEGENDARY = "legendary"
    STORY_CRITICAL = "story_critical"

@dataclass
class GameState:
    """游戏状态"""
    energy: int = 3
    max_energy: int = 3
    hand_size: int = 5
    
    # 剧情属性
    friendship: int = 0
    courage: int = 0
    mystery: int = 0
    reputation: int = 0
    health: int = 5
    
    # 游戏进度
    current_scene: str = ""
    story_progress: int = 0
    
    def to_dict(self) -> Dict:
        """转换为字典格式"""
        return {
            "energy": self.energy,
            "max_energy": self.max_energy,
            "hand_size": self.hand_size,
            "friendship": self.friendship,
            "courage": self.courage,
            "mystery": self.mystery,
            "reputation": self.reputation,
            "health": self.health,
            "current_scene": self.current_scene,
            "story_progress": self.story_progress
        }

class CardGameEngine:
    """卡牌游戏引擎"""
    
    def __init__(self, card_database_path: str = "card/card_database.json"):
        """初始化卡牌引擎"""
        self.card_database = self._load_card_database(card_database_path)
        self.game_state = GameState()
        self.player_deck = []
        self.player_hand = []
        self.played_cards = []
        self.current_events = []
        
    def _load_card_database(self, path: str) -> Dict:
        """加载卡牌数据库"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # 如果文件不存在，返回空数据库
            return {"card_database": {}}
    
    def initialize_game(self, story_context: Dict) -> Dict:
        """初始化游戏状态"""
        # 根据剧情上下文设置初始状态
        self.game_state.current_scene = story_context.get("scene", "")
        
        # 生成初始卡组
        self.player_deck = self._generate_initial_deck(story_context)
        
        # 抽取初始手牌
        self.draw_cards(self.game_state.hand_size)
        
        return {
            "game_state": self.game_state.to_dict(),
            "hand": self.player_hand,
            "deck_size": len(self.player_deck)
        }
    
    def _generate_initial_deck(self, story_context: Dict) -> List[Dict]:
        """生成初始卡组"""
        deck = []
        story_type = story_context.get("genre", "fantasy")
        scene_type = story_context.get("scene_type", "exploration")
        
        # 从数据库中筛选适合的卡牌
        card_db = self.card_database.get("card_database", {})
        
        # 添加基础行动卡
        action_cards = card_db.get("action_cards", [])
        for card in action_cards:
            if self._is_card_suitable(card, story_context):
                deck.append(card)
        
        # 添加角色卡
        character_cards = card_db.get("character_cards", [])
        for card in character_cards:
            if story_type in card.get("compatible_stories", []):
                deck.append(card)
        
        # 添加一些事件卡
        event_cards = card_db.get("event_cards", [])
        suitable_events = [card for card in event_cards if 
                          any(condition in scene_type for condition in card.get("trigger_conditions", []))]
        deck.extend(random.sample(suitable_events, min(3, len(suitable_events))))
        
        return deck
    
    def _is_card_suitable(self, card: Dict, story_context: Dict) -> bool:
        """判断卡牌是否适合当前剧情"""
        compatible_scenes = card.get("compatible_scenes", [])
        scene_type = story_context.get("scene_type", "")
        
        # 检查解锁条件
        unlock_condition = card.get("unlock_condition", "none")
        if unlock_condition != "none" and not self._check_unlock_condition(unlock_condition):
            return False
        
        # 检查场景兼容性
        if compatible_scenes and scene_type:
            return any(scene in scene_type for scene in compatible_scenes)
        
        return True
    
    def _check_unlock_condition(self, condition: str) -> bool:
        """检查卡牌解锁条件"""
        if condition == "none":
            return True
        
        # 解析条件字符串 (如 "courage >= 1")
        try:
            # 简单的条件解析
            if ">=" in condition:
                attr, value = condition.split(">=")
                attr = attr.strip()
                value = int(value.strip())
                return getattr(self.game_state, attr, 0) >= value
            elif ">" in condition:
                attr, value = condition.split(">")
                attr = attr.strip()
                value = int(value.strip())
                return getattr(self.game_state, attr, 0) > value
        except:
            pass
        
        return False
    
    def draw_cards(self, count: int) -> List[Dict]:
        """抽取卡牌"""
        drawn_cards = []
        for _ in range(count):
            if self.player_deck:
                card = self.player_deck.pop(0)
                self.player_hand.append(card)
                drawn_cards.append(card)
        
        return drawn_cards
    
    def play_card(self, card_id: str, target: Optional[str] = None) -> Dict:
        """打出卡牌"""
        # 查找手牌中的卡牌
        card = None
        for i, hand_card in enumerate(self.player_hand):
            if hand_card.get("id") == card_id:
                card = self.player_hand.pop(i)
                break
        
        if not card:
            return {"success": False, "message": "卡牌不在手中"}
        
        # 检查能量是否足够
        cost = card.get("cost", 0)
        if self.game_state.energy < cost:
            self.player_hand.append(card)  # 放回手牌
            return {"success": False, "message": "能量不足"}
        
        # 扣除能量
        self.game_state.energy -= cost
        
        # 执行卡牌效果
        effect_result = self._execute_card_effect(card, target)
        
        # 将卡牌移到已打出区域
        self.played_cards.append(card)
        
        return {
            "success": True,
            "card": card,
            "effect": effect_result,
            "game_state": self.game_state.to_dict()
        }
    
    def _execute_card_effect(self, card: Dict, target: Optional[str] = None) -> Dict:
        """执行卡牌效果"""
        effect = card.get("effect", "")
        result = {"message": "", "changes": {}}
        
        # 解析效果字符串
        if "勇气+" in effect:
            value = int(effect.split("勇气+")[1].split("，")[0].split(" ")[0])
            self.game_state.courage += value
            result["changes"]["courage"] = value
        
        if "友情+" in effect:
            value = int(effect.split("友情+")[1].split("，")[0].split(" ")[0])
            self.game_state.friendship += value
            result["changes"]["friendship"] = value
        
        if "生命值+" in effect:
            value = int(effect.split("生命值+")[1].split("，")[0].split(" ")[0])
            self.game_state.health += value
            result["changes"]["health"] = value
        
        if "生命值-" in effect:
            value = int(effect.split("生命值-")[1].split("，")[0].split(" ")[0])
            self.game_state.health -= value
            result["changes"]["health"] = -value
        
        # 特殊效果处理
        if "抽取" in effect and "卡牌" in effect:
            try:
                count = int(effect.split("抽取")[1].split("张")[0])
                drawn = self.draw_cards(count)
                result["message"] = f"抽取了{len(drawn)}张卡牌"
            except:
                pass
        
        result["message"] = effect
        return result
    
    def end_turn(self) -> Dict:
        """结束回合"""
        # 恢复能量
        self.game_state.energy = self.game_state.max_energy
        
        # 抽取新卡牌
        drawn_cards = self.draw_cards(1)
        
        # 处理持续效果
        self._process_ongoing_effects()
        
        return {
            "game_state": self.game_state.to_dict(),
            "drawn_cards": drawn_cards,
            "hand": self.player_hand
        }
    
    def _process_ongoing_effects(self):
        """处理持续效果"""
        # 处理当前生效的事件卡
        for event in self.current_events[:]:
            duration = event.get("duration", "")
            if duration == "本回合":
                self.current_events.remove(event)
    
    def generate_story_choice_cards(self, story_context: Dict) -> List[Dict]:
        """根据剧情上下文生成选择卡"""
        choice_cards = []
        
        # 从数据库获取选择卡
        card_db = self.card_database.get("card_database", {})
        available_choices = card_db.get("choice_cards", [])
        
        # 根据当前剧情状态筛选合适的选择
        for choice in available_choices:
            if self._is_choice_relevant(choice, story_context):
                choice_cards.append(choice)
        
        return choice_cards
    
    def _is_choice_relevant(self, choice: Dict, story_context: Dict) -> bool:
        """判断选择是否与当前剧情相关"""
        choice_type = choice.get("type", "")
        scene_type = story_context.get("scene_type", "")
        
        # 根据选择类型和场景类型判断相关性
        relevance_map = {
            "道德选择": ["冲突", "危机", "救援"],
            "能力选择": ["战斗", "挑战", "竞争"],
            "信息选择": ["探索", "调查", "秘密"]
        }
        
        relevant_scenes = relevance_map.get(choice_type, [])
        return any(scene in scene_type for scene in relevant_scenes)
    
    def make_story_choice(self, choice_id: str, option_index: int) -> Dict:
        """做出剧情选择"""
        # 查找选择卡
        choice_card = None
        card_db = self.card_database.get("card_database", {})
        for choice in card_db.get("choice_cards", []):
            if choice.get("id") == choice_id:
                choice_card = choice
                break
        
        if not choice_card:
            return {"success": False, "message": "选择不存在"}
        
        options = choice_card.get("options", [])
        if option_index >= len(options):
            return {"success": False, "message": "选项索引超出范围"}
        
        selected_option = options[option_index]
        
        # 执行选择效果
        effect_result = self._execute_card_effect(selected_option, None)
        
        return {
            "success": True,
            "choice": choice_card,
            "selected_option": selected_option,
            "effect": effect_result,
            "next_scene": selected_option.get("next_scene"),
            "game_state": self.game_state.to_dict()
        }
    
    def get_game_status(self) -> Dict:
        """获取游戏状态"""
        return {
            "game_state": self.game_state.to_dict(),
            "hand": self.player_hand,
            "deck_size": len(self.player_deck),
            "played_cards": len(self.played_cards),
            "current_events": self.current_events
        }
    
    def save_game(self, filename: str) -> bool:
        """保存游戏状态"""
        try:
            save_data = {
                "game_state": self.game_state.to_dict(),
                "player_deck": self.player_deck,
                "player_hand": self.player_hand,
                "played_cards": self.played_cards,
                "current_events": self.current_events
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            print(f"保存游戏失败: {e}")
            return False
    
    def load_game(self, filename: str) -> bool:
        """加载游戏状态"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                save_data = json.load(f)
            
            # 恢复游戏状态
            state_data = save_data["game_state"]
            self.game_state = GameState(**state_data)
            
            self.player_deck = save_data["player_deck"]
            self.player_hand = save_data["player_hand"]
            self.played_cards = save_data["played_cards"]
            self.current_events = save_data["current_events"]
            
            return True
        except Exception as e:
            print(f"加载游戏失败: {e}")
            return False

# 使用示例
if __name__ == "__main__":
    # 创建游戏引擎
    engine = CardGameEngine()
    
    # 初始化游戏
    story_context = {
        "genre": "fantasy",
        "scene": "魔法学院",
        "scene_type": "exploration"
    }
    
    result = engine.initialize_game(story_context)
    print("游戏初始化完成:")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # 获取游戏状态
    status = engine.get_game_status()
    print("\n当前游戏状态:")
    print(json.dumps(status, ensure_ascii=False, indent=2)) 
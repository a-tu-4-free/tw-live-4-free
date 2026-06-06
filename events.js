// ============================================================
// custom_cards.js — 自訂擴充卡牌
// 在這裡加入你自己的卡牌，格式同 cards_taiwan.js / cards_ccp.js
//
// 加完後不需要改其他檔案，系統會自動載入。
// 加台灣牌放 CUSTOM_TAIWAN_CARDS，加中共牌放 CUSTOM_CCP_CARDS。
// ============================================================

// ── 範例：如何新增臺灣卡牌 ────────────────────────────────
// {
//   id: 'tw_my_card',           // 唯一ID，tw_ 開頭
//   name: '我的卡牌',
//   category: '軍事',           // 軍事 / 科技 / 外交 / 社會 / 軟實力 / 經濟 / 情報
//   cost: 1,                    // 行動點費用 1~3
//   desc: '效果描述',
//   flavor: '引言文字',
//   effects: { military: 10, economy: 5 },
//   sideEffects: { diplomacy: -3 },   // 可選
//   cooldown: 2,                       // 可選，冷卻回合數
//   triggersCCP: 'ccp_mil_exercise',   // 可選，觸發中共反應
// }

const CUSTOM_TAIWAN_CARDS = [
  // 在這裡新增台灣卡牌
];

// ── 範例：如何新增中共卡牌 ────────────────────────────────
// {
//   id: 'ccp_my_card',          // 唯一ID，ccp_ 開頭
//   name: '我的卡牌',
//   category: '軍事',           // 軍事 / 滲透 / 認知 / 經濟 / 外交 / 網路 / 灰色地帶
//   cost: 1,
//   desc: '效果描述',
//   flavor: '引言文字',
//   effects: { military: 8, tension: 5 },
//   sideEffects: { tw_morale: -8 },
//   cooldown: 2,
//   triggersTW: 'tw_counter_intel',
// }

const CUSTOM_CCP_CARDS = [
  // 在這裡新增中共卡牌
];

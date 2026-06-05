// ============================================================
// events.js — 事件腳本庫
// 每個事件結構：
//   id, title, body(新聞稿文字), type(global/tw_triggered/ccp_triggered)
//   condition: fn(state) => bool   (可選，特定條件才觸發)
//   effects: { stat: delta, ... }
//   weight: 1~5  (出現機率權重)
// ============================================================

const EVENTS = [

  // ──────────────────────────────────────────────
  // 全球/國際事件
  // ──────────────────────────────────────────────
  {
    id: 'ev_us_taiwan_act',
    title: '美國通過《台灣政策法》強化版',
    body: '美國國會以壓倒性多數通過新版台灣政策法，明確提升台美關係層級，並承諾提供更多防禦性武器。',
    type: 'global',
    effects: { tw_diplomacy: 10, tw_military: 8, tension: 6 },
    weight: 2,
  },
  {
    id: 'ev_g7_taiwan',
    title: 'G7峰會發表涉台聯合聲明',
    body: '七大工業國集團峰會結束，聯合聲明首次明確反對任何單方面改變台海現狀的企圖。',
    type: 'global',
    effects: { tw_diplomacy: 9, ccp_diplomacy: -6 },
    weight: 2,
  },
  {
    id: 'ev_chip4_alliance',
    title: 'Chip4半導體聯盟深化',
    body: '美日韓台四方半導體聯盟宣布擴大合作，建立去中化供應鏈，排除中國大陸參與關鍵製程。',
    type: 'global',
    effects: { tw_chip: 10, tw_diplomacy: 7, ccp_economy: -8 },
    weight: 2,
  },
  {
    id: 'ev_ukraine_lessons',
    title: '烏克蘭抵抗精神鼓舞台灣',
    body: '烏克蘭持續抵抗俄羅斯入侵的消息傳來，台灣民調顯示願意保衛家園的比例創歷史新高。',
    type: 'global',
    effects: { tw_morale: 12, tw_military: 5 },
    weight: 3,
  },
  {
    id: 'ev_south_china_sea',
    title: '南海緊張：中菲對峙升溫',
    body: '中菲南海衝突持續升溫，美菲聯合軍演規模擴大，區域緊張氣氛蔓延至台海。',
    type: 'global',
    effects: { tension: 7, tw_diplomacy: 4 },
    weight: 3,
  },
  {
    id: 'ev_russia_distract',
    title: '俄烏戰事持續，美軍注意力分散',
    body: '俄羅斯對烏克蘭發動新一輪攻勢，美國需同時應對兩個戰場，印太資源排擠效應引發擔憂。',
    type: 'global',
    effects: { tension: 8, tw_diplomacy: -5, tw_morale: -6 },
    weight: 2,
  },
  {
    id: 'ev_who_rejected',
    title: '台灣再度被拒於WHO門外',
    body: '世界衛生大會在中國大陸壓力下，再度拒絕台灣以觀察員身分出席，國際社會批評聲浪高漲。',
    type: 'global',
    effects: { tw_diplomacy: -6, tw_morale: -5, tw_softpower: 5 },
    weight: 3,
  },
  {
    id: 'ev_indo_pacific_framework',
    title: '印太經濟框架擴大納台',
    body: '美國主導的印太經濟框架宣布以特別安排納入台灣，強化經貿連結並降低台灣對中依賴。',
    type: 'global',
    effects: { tw_diplomacy: 10, tw_economy: 8 },
    weight: 2,
  },
  {
    id: 'ev_china_economy_slowdown',
    title: '中國大陸經濟成長大幅放緩',
    body: '中國大陸GDP成長率跌至近年低點，房地產危機持續，外資撤離加速，軍費壓力浮現。',
    type: 'global',
    effects: { ccp_economy: -10, ccp_military: -4, tension: -5 },
    weight: 2,
  },
  {
    id: 'ev_taiwan_quake',
    title: '強烈地震侵襲台灣',
    body: '規模7.4強震重創台灣東部，部分半導體廠短暫停工，國際社會紛紛表達關切與援助意願。',
    type: 'global',
    effects: { tw_economy: -8, tw_morale: -5, tw_chip: -4, tw_diplomacy: 6 },
    weight: 2,
  },
  {
    id: 'ev_typhoon',
    title: '超強颱風侵台',
    body: '超強颱風登陸台灣，造成基礎設施損傷，但全民動員展現強大韌性，外界讚許台灣應變能力。',
    type: 'global',
    effects: { tw_economy: -6, tw_resilience: 5, tw_morale: -3 },
    weight: 3,
  },

  // ──────────────────────────────────────────────
  // 臺灣優勢事件
  // ──────────────────────────────────────────────
  {
    id: 'ev_tsmc_breakthrough',
    title: '臺積電突破1奈米製程',
    body: '臺積電宣布率先實現1奈米量產，全球科技業爭相下單，台灣晶片優勢再度擴大。',
    type: 'tw_triggered',
    condition: (s) => s.tw.chip > 70,
    effects: { tw_chip: 10, tw_economy: 12, tw_diplomacy: 8 },
    weight: 2,
  },
  {
    id: 'ev_mask_diplomacy_win',
    title: '口罩外交引發國際迴響',
    body: '台灣向超過80個國家捐贈醫療物資，「Taiwan Can Help」登上各大國際媒體頭版，全球好感度大幅提升。',
    type: 'tw_triggered',
    condition: (s) => s.tw.softpower > 50,
    effects: { tw_softpower: 10, tw_diplomacy: 10, tw_morale: 8 },
    weight: 2,
  },
  {
    id: 'ev_democracy_recognition',
    title: '國際民主指數台灣名列前茅',
    body: '自由之家年度報告將台灣列為亞洲民主最鞏固國家，吸引更多國際組織尋求合作。',
    type: 'tw_triggered',
    condition: (s) => s.tw.morale > 65,
    effects: { tw_softpower: 8, tw_diplomacy: 9 },
    weight: 2,
  },
  {
    id: 'ev_intel_coup',
    title: '情報大捷：滲透網絡曝光',
    body: '台灣情報單位一舉逮捕多名共諜，並公開中共滲透網絡細節，國際社會震驚，支持台灣聲浪高漲。',
    type: 'tw_triggered',
    condition: (s) => s.tw.intel > 70,
    effects: { tw_intel: 8, tw_morale: 10, ccp_infiltration: -15, tw_diplomacy: 6 },
    weight: 1,
  },

  // ──────────────────────────────────────────────
  // 中共壓力事件
  // ──────────────────────────────────────────────
  {
    id: 'ev_ccp_missiles_near',
    title: '中共飛彈落點進入台灣EEZ',
    body: '解放軍實彈演習飛彈落入台灣專屬經濟區，日本強烈抗議，美軍艦艇緊急靠近台海。',
    type: 'ccp_triggered',
    condition: (s) => s.tension > 55,
    effects: { tension: 10, tw_morale: -10, tw_economy: -5, tw_diplomacy: 8 },
    weight: 2,
  },
  {
    id: 'ev_blackout',
    title: '台灣發生大規模停電事故',
    body: '疑似遭網路攻擊，台灣北部電網短暫中斷，調查結果指向境外勢力介入。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.cyber > 60,
    effects: { tw_resilience: -10, tw_economy: -8, tw_morale: -8 },
    weight: 2,
  },
  {
    id: 'ev_spy_arrested',
    title: '現役軍官遭逮涉共諜案',
    body: '台灣陸軍少將被捕，涉嫌向中共提供重要軍事情報，軍中士氣與信任度受到嚴重打擊。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.infiltrated && (s.ccp.infiltrated.retired_officers || s.ccp.infiltrated.legislators),
    effects: { tw_military: -10, tw_intel: -8, tw_morale: -10 },
    weight: 2,
  },
  {
    id: 'ev_diplomatic_ally_lost',
    title: '太平洋邦交國宣布與台斷交',
    body: '在中國大陸開出巨額支票後，又一太平洋島國宣布與台灣斷交，轉而承認北京。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.diplomacy > 60,
    effects: { tw_diplomacy: -10, tw_morale: -8, tw_softpower: -5 },
    weight: 3,
  },
  {
    id: 'ev_media_scandal',
    title: '媒體人收受中資醜聞爆發',
    body: '多名電視評論員被查出收受中資，台灣輿論嘩然，對媒體公信力的信任降至低點。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.infiltrated && s.ccp.infiltrated.journalists,
    effects: { tw_morale: -10, tw_resilience: -8, tw_softpower: -5 },
    weight: 2,
  },
  {
    id: 'ev_deepfake_scandal',
    title: '總統深偽影片瘋傳',
    body: '一段疑似總統宣布投降的深偽影片在社群媒體上爆炸性擴散，引發短暫恐慌，辨識真假成全民挑戰。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.propaganda > 65,
    effects: { tw_morale: -12, tw_resilience: -8 },
    weight: 2,
  },
  {
    id: 'ev_opposition_budget_cut',
    title: '國防預算遭大幅刪減',
    body: '立法院在程序爭議中通過大幅削減國防預算案，軍方震怒，外界質疑台灣自我防衛決心。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.infiltrated && s.ccp.infiltrated.legislators,
    effects: { tw_military: -12, tw_morale: -8, tw_diplomacy: -5 },
    weight: 2,
  },
  {
    id: 'ev_economic_slowdown',
    title: '台灣出口受中共制裁衝擊',
    body: '中共擴大對台灣產品進口限制，多個傳統出口產業受創，廠商出走或轉移供應鏈壓力劇增。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.economy > 55,
    effects: { tw_economy: -10, tw_morale: -6 },
    weight: 3,
  },
];

// 依類型索引供快速查詢
function getEventsByType(type) {
  return EVENTS.filter(e => e.type === type);
}

// 加權隨機抽事件
function drawRandomEvent(state) {
  const eligible = EVENTS.filter(e => {
    if (e.condition && !e.condition(state)) return false;
    return true;
  });
  const totalWeight = eligible.reduce((sum, e) => sum + (e.weight || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const ev of eligible) {
    rand -= (ev.weight || 1);
    if (rand <= 0) return ev;
  }
  return eligible[eligible.length - 1];
}

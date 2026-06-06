// ============================================================
// advisors.js — 軍師系統
// 每季隨機出現一位軍師，提供三個選項
// 舔共軍師：1正牌 + 2偽裝中共牌
// 反共軍師：3正牌（但用多有副作用）
// ============================================================

// ── 反共軍師 ─────────────────────────────────────────────
const PRO_TW_ADVISORS = [
  {
    id: 'cao_dong',
    name: '曹董',
    fullName: '曹董（曹興誠，聯電創辦人）',
    avatar: '👴',
    personality: '台灣護台之聲，出手闊綽，直接',
    intro: '「台灣沒有退路，中共打來就是打來，投資防衛就是投資生存。我曹興誠說的。」',
    type: 'pro_tw',
  },
  {
    id: 'lee_president',
    name: '李前總',
    fullName: '李前總（李登輝，前總統）',
    avatar: '🎖️',
    personality: '民主台灣之父，戰略深遠',
    intro: '「台灣是台灣人的台灣。這句話，我說了幾十年，今天還是真的。」',
    type: 'pro_tw',
  },
  {
    id: 'cheng_xiaoyi',
    name: '鄭小儀',
    fullName: '鄭小儀（鄭弘儀，主持人）',
    avatar: '🎙️',
    personality: '熱血台灣魂，嘴砲戰力滿格',
    intro: '「三小！中共搞這招？給我拿麥克風！台灣人不是軟柿子！」',
    type: 'pro_tw',
  },
  {
    id: 'flasher',
    name: '閃靈',
    fullName: '閃靈（林昶佐，前立委暨樂手）',
    avatar: '🤘',
    personality: '金屬魂護台，結合文化與抵抗',
    intro: '「用音樂對抗威權，用選票守護民主。台灣的聲音要讓全世界聽到！」',
    type: 'pro_tw',
  },
  {
    id: 'ming_xiaozheng',
    name: '明小正',
    fullName: '明小正（明居正，台大教授）',
    avatar: '📚',
    personality: '反共學者，分析精準毒辣',
    intro: '「中共的每一步都是有意圖的，不要幻想，要清醒。我在課堂講了二十年，現在換你們上場。」',
    type: 'pro_tw',
  },
  {
    id: 'guo_nasa',
    name: '郭NASA',
    fullName: '郭NASA（郭正光，前NASA工程師）',
    avatar: '🚀',
    personality: '科技理性，數據說話',
    intro: '「用工程思維看台灣防禦：系統要有冗餘，單點失效就全垮。科技是台灣的護盾。」',
    type: 'pro_tw',
  },
  {
    id: 'wang_xiaoho',
    name: '汪小浩',
    fullName: '汪小浩（汪浩，歷史學者）',
    avatar: '🔍',
    personality: '歷史縱深，看透中共本質',
    intro: '「讀懂歷史才能看清未來。中共從來沒有放棄過台灣，我們也不能放棄自己。」',
    type: 'pro_tw',
  },
  {
    id: 'li_xiaozhe',
    name: '李小哲',
    fullName: '李小哲（李明哲，人權工作者）',
    avatar: '✊',
    personality: '親身坐過中共監獄，最清楚中共本質',
    intro: '「我在中國坐了五年牢。那裡沒有法律，只有黨的意志。台灣絕對不能讓那樣的東西進來。」',
    type: 'pro_tw',
  },
  {
    id: 'pig_head',
    name: '豬頭皮',
    fullName: '豬頭皮（朱約信，音樂人）',
    avatar: '🎵',
    personality: '台灣本土意識，用音樂說真話',
    intro: '「台灣的土地、台灣的人、台灣的歌。這些東西沒有人可以拿走。」',
    type: 'pro_tw',
  },
  {
    id: 'ba_jiong',
    name: '八炯',
    fullName: '八炯（YouTuber，反共創作者）',
    avatar: '📹',
    personality: '網路反共戰士，懂年輕人語言',
    intro: '「中共的認知作戰打的是你的手機螢幕。你每天滑什麼，決定你相信什麼。醒醒。」',
    type: 'pro_tw',
  },
  {
    id: 'shen_bear',
    name: '沈黑熊',
    fullName: '沈黑熊（沈伯洋，黑熊學院創辦人）',
    avatar: '🐻',
    personality: '民防專家，務實訓練台灣人',
    intro: '「民防不是軍事，是每個公民的基本責任。你知道家附近的防空洞在哪嗎？」',
    type: 'pro_tw',
  },
];

// ── 舔共軍師 ─────────────────────────────────────────────
const PRO_CCP_ADVISORS = [
  {
    id: 'fu_xiaopao',
    name: '傅小砲',
    fullName: '傅小砲（傅崐萁，國民黨立委）',
    avatar: '💣',
    personality: '嘴砲無敵，幫中共開後門第一名',
    intro: '「兩岸要和平嘛！打打殺殺不好，我去北京幫你們談一談——順便考察一下。」',
    type: 'pro_ccp',
  },
  {
    id: 'chen_xiaozhen',
    name: '陳小珍',
    fullName: '陳小珍（陳玉珍，國民黨立委）',
    avatar: '🌸',
    personality: '金門代表，天然親中體質',
    intro: '「金門人最了解兩岸，要交流要溝通，開放一點有什麼關係？」',
    type: 'pro_ccp',
  },
  {
    id: 'luo_xiaowei',
    name: '羅小偉',
    fullName: '羅小偉（羅廷偉，國民黨立委）',
    avatar: '🎭',
    personality: '低調親中，默默刪預算',
    intro: '「國防預算太高了，省下來做社會福利不好嗎？打仗又不一定打得起來。」',
    type: 'pro_ccp',
  },
  {
    id: 'han_xiaoyou',
    name: '韓小瑜',
    fullName: '韓小瑜（韓國瑜，立法院長）',
    avatar: '🌊',
    personality: '庶民風格，兩岸一家親信徒',
    intro: '「賣韭菜、賣茶葉，兩岸人民都要吃飯嘛！愛台灣也可以愛大陸嘛！」',
    type: 'pro_ccp',
  },
  {
    id: 'ma_xiaojiu',
    name: '馬小九',
    fullName: '馬小九（馬英九，前總統）',
    avatar: '🏌️',
    personality: '終極兩岸一家親，去中國哭陵專業戶',
    intro: '「中華民族！炎黃子孫！我在中山陵說過的，兩岸一家親，習先生人很好的。」',
    type: 'pro_ccp',
  },
  {
    id: 'jiang_xiaochen',
    name: '江小臣',
    fullName: '江小臣（江啟臣，國民黨立委）',
    avatar: '🤝',
    personality: '溫和外表，骨子裡交流派',
    intro: '「我們要務實，兩岸交流才是正道，對抗只會讓人民受苦。」',
    type: 'pro_ccp',
  },
  {
    id: 'zhao_xiaokang',
    name: '趙小康',
    fullName: '趙小康（趙少康，媒體人）',
    avatar: '📺',
    personality: '媒體大砲，親中論述包裝精美',
    intro: '「台灣媒體我最懂！兩岸關係要理性，不要被民進黨牽著走！」',
    type: 'pro_ccp',
  },
  {
    id: 'yu_xiaoming',
    name: '郁小明',
    fullName: '郁小明（郁慕明，新黨主席）',
    avatar: '🇨🇳',
    personality: '統一派先鋒，毫不掩飾',
    intro: '「統一是歷史的必然！兩岸同文同種，早晚要走到一起！」',
    type: 'pro_ccp',
  },
  {
    id: 'xia_xiaayan',
    name: '夏小言',
    fullName: '夏小言（夏立言，國民黨副主席）',
    avatar: '✈️',
    personality: '跑北京最勤，傳話專業戶',
    intro: '「我剛從北京回來，那邊釋出善意，我們要把握機會……」',
    type: 'pro_ccp',
  },
  {
    id: 'hong_xiaozhu',
    name: '洪小柱',
    fullName: '洪小柱（洪秀柱，前國民黨主席）',
    avatar: '🌹',
    personality: '深藍鐵桿，統一意志堅定',
    intro: '「九二共識就是一個中國！台獨是死路一條！我洪秀柱說了算！」',
    type: 'pro_ccp',
  },
  {
    id: 'wu_xiaohuai',
    name: '吳小懷',
    fullName: '吳小懷（吳斯懷，前國民黨立委）',
    avatar: '🎖️',
    personality: '退將親中，去北京閱兵站第一排',
    intro: '「以軍人立場來看，兩岸若能和平統一，是最好的結果……」',
    type: 'pro_ccp',
  },
  {
    id: 'gaojin',
    name: '高金',
    fullName: '高金（高金素梅，無黨籍立委）',
    avatar: '🏔️',
    personality: '原住民身分包裝，骨子裡親北京',
    intro: '「我代表台灣原住民，我們不需要台獨，我們需要和平！（然後飛去北京）」',
    type: 'pro_ccp',
  },
  {
    id: 'zheng_xiaowen',
    name: '鄭小文',
    fullName: '鄭小文（鄭麗文，國民黨立委）',
    avatar: '🎪',
    personality: '前民進黨員，現在幫中共開後門，自己也搞不清楚在幹嘛',
    intro: '「我以前在民進黨，我最了解他們的問題！現在嘛……（停頓三秒）總之兩岸要交流！（她自己其實也不確定自己在說什麼）」',
    type: 'pro_ccp',
  },
  {
    id: 'roudai',
    name: '肉呆',
    fullName: '肉呆（館長陳之漢，前反共網紅）',
    avatar: '💪',
    personality: '曾是最猛反共戰士，現在神秘轉向，讓所有人看不懂',
    intro: '「我館長說！兩岸……（聲音突然變小）……其實可以談啦……（全台灣粉絲當場昏倒）」',
    type: 'pro_ccp',
  },
];

// ── 軍師建議卡池 ─────────────────────────────────────────
// 反共軍師的3張正向牌
const PRO_TW_ADVISOR_CARDS = [
  { name: '強化民防訓練', desc: '提升基層抵抗能力', effects: { tw_military: 8, tw_morale: 6, tw_resilience: 5 }, realEffect: true },
  { name: '晶片外交攻勢', desc: '以晶片換取更多盟友支持', effects: { tw_chip: 6, tw_diplomacy: 10 }, realEffect: true },
  { name: '反滲透立法', desc: '清查中共代理人網絡', effects: { tw_intel: 10, tw_resilience: 8 }, realEffect: true },
  { name: '全民媒體識讀', desc: '強化社會對假訊息的免疫力', effects: { tw_resilience: 10, tw_morale: 8 }, realEffect: true },
  { name: '擴大後備訓練', desc: '提升戰時動員能量', effects: { tw_military: 10, tw_morale: 5 }, realEffect: true },
  { name: '加強情報蒐集', desc: '掌握敵方動態', effects: { tw_intel: 12, tw_military: 4 }, realEffect: true },
  { name: '深化美台軍事交流', desc: '引進不對稱作戰技術', effects: { tw_military: 10, tw_diplomacy: 6 }, realEffect: true },
  { name: '推動供應鏈去中化', desc: '降低對中依賴', effects: { tw_economy: 8, tw_resilience: 7 }, realEffect: true },
  { name: '強化軟實力輸出', desc: '讓世界看見台灣', effects: { tw_softpower: 10, tw_diplomacy: 8 }, realEffect: true },
  { name: '能源自主計畫', desc: '減少戰時能源被掐死的風險', effects: { tw_resilience: 10, tw_economy: 5 }, realEffect: true },
];

// 舔共軍師的2張偽裝牌（看起來是好牌，實際上害台灣）
const FAKE_ADVISOR_CARDS = [
  { name: '開放兩岸經貿交流', desc: '「促進繁榮」（實際上是讓中共滲透經濟）', effects: { tw_economy: 3, ccp_infiltration: 10, tw_resilience: -8 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：中共滲透+10，韌性-8' },
  { name: '縮減國防預算', desc: '「省下來做社福」（實際上削弱防衛）', effects: { tw_military: -12, tw_morale: -6, ccp_military: 5 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：台灣軍事-12' },
  { name: '邀請中國學者來台交流', desc: '「促進理解」（實際上是情報蒐集）', effects: { ccp_infiltration: 8, tw_intel: -8, tw_resilience: -5 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：中共情報大增' },
  { name: '放寬中資投資限制', desc: '「吸引投資」（實際上讓中共買走台灣）', effects: { tw_economy: 4, ccp_infiltration: 12, tw_resilience: -10 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：滲透+12' },
  { name: '停止對美軍購', desc: '「降低緊張」（實際上自廢武功）', effects: { tw_military: -10, tension: -3, ccp_military: 8 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：台灣軍事崩潰' },
  { name: '推動兩岸和平協議', desc: '「換取和平」（實際上是自我繳械）', effects: { tension: -5, tw_military: -8, tw_diplomacy: -10, ccp_infiltration: 10 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：外交崩潰+中共滲透大增' },
  { name: '開放離島中國建設', desc: '「改善民生」（實際上埋下軍事隱患）', effects: { tw_economy: 3, ccp_infiltration: 8, tw_military: -6 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：中共在離島留後手' },
  { name: '取消共諜調查預算', desc: '「節省資源」（實際上是讓共諜橫行）', effects: { tw_intel: -12, ccp_infiltration: 10, tw_resilience: -6 }, realEffect: false, warning: '⚠️ 這是偽裝的！實際效果：情報系統崩潰' },
];

// ── 副作用追蹤：同一張牌用太多次 ─────────────────────────
function getCardOveruseEffect(cardId, usedCards) {
  const count = usedCards.filter(id => id === cardId).length;
  if (count >= 5) return { penalty: -8, msg: '過度依賴此策略，邊際效益大減且產生副作用！' };
  if (count >= 3) return { penalty: -4, msg: '此策略重複使用，效果開始打折。' };
  return null;
}

// ── 隨機抽取本季軍師 ─────────────────────────────────────
function drawAdvisor(turnsPlayed) {
  // 前兩季不出現軍師（玩家先熟悉遊戲）
  if (turnsPlayed < 2) return null;
  // 每季30%機率出現軍師
  if (Math.random() > 0.30) return null;

  const isProCCP = Math.random() > 0.45; // 55%機率舔共軍師
  const pool = isProCCP ? PRO_CCP_ADVISORS : PRO_TW_ADVISORS;
  const advisor = pool[Math.floor(Math.random() * pool.length)];

  let choices;
  if (isProCCP) {
    // 舔共：1正牌 + 2偽裝牌，打亂順序
    const realCard = PRO_TW_ADVISOR_CARDS[Math.floor(Math.random() * PRO_TW_ADVISOR_CARDS.length)];
    const fakes = [...FAKE_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 2);
    choices = [realCard, ...fakes].sort(() => Math.random() - 0.5);
  } else {
    // 反共：3正牌
    choices = [...PRO_TW_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  return { advisor, choices, isProCCP };
}

// ── 套用軍師建議效果 ─────────────────────────────────────
function applyAdvisorCard(state, card) {
  let s = deepClone(state);
  for (const [key, delta] of Object.entries(card.effects || {})) {
    if (key === 'tension') { s.tension = clamp(s.tension + delta); }
    else if (key.startsWith('tw_')) { const k=key.slice(3); if(s.tw[k]!==undefined) s.tw[k]=clamp(s.tw[k]+delta); }
    else if (key.startsWith('ccp_')) { const k=key.slice(4); if(s.ccp[k]!==undefined) s.ccp[k]=clamp(s.ccp[k]+delta); }
  }
  return s;
}

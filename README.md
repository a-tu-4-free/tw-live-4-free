// ============================================================
// advisors.js — 建議系統
//
// 台灣模式：反共建議者（3正）或可疑建議者（1正+2偽）
// 中共模式：黨內建議（3正中共牌）或舔共建議（1正中共+2偽裝台灣牌）
//
// 版面邏輯：
//   第一行 — 大方向聽起來正確，讓人覺得建議很好
//   第二行 — 三張卡牌，舔共/假建議者藏陷阱在裡面
// ============================================================

// ══════════════════════════════════════════════════════════
// 反共建議者（台灣模式出現，3張正向牌）
// ══════════════════════════════════════════════════════════
const PRO_TW_ADVISORS = [
  {
    id: 'cao_dong',
    name: '曹董',
    fullName: '曹興誠｜聯電創辦人',
    avatar: '👴',
    tagline: '強化台灣的科技護城河，讓中共在技術上永遠追不上',
    intro: '「台灣沒有退路，中共打來就是打來，投資防衛就是投資生存。我曹興誠說的。」',
    type: 'pro_tw',
  },
  {
    id: 'lee_president',
    name: '李前總',
    fullName: '李登輝｜前總統',
    avatar: '🎖️',
    tagline: '台灣是台灣人的台灣，主體意識才是最強的防線',
    intro: '「台灣是台灣人的台灣。這句話，我說了幾十年，今天還是真的。」',
    type: 'pro_tw',
  },
  {
    id: 'cheng_xiaoyi',
    name: '鄭小儀',
    fullName: '鄭弘儀｜主持人',
    avatar: '🎙️',
    tagline: '全民覺醒才是抵抗的根本，媒體識讀決定勝負',
    intro: '「三小！中共搞這招？給我拿麥克風！台灣人不是軟柿子！」',
    type: 'pro_tw',
  },
  {
    id: 'flasher',
    name: '閃靈',
    fullName: '林昶佐｜前立委暨樂手',
    avatar: '🤘',
    tagline: '文化認同就是國家認同，軟實力是看不見的軍隊',
    intro: '「用音樂對抗威權，用選票守護民主。台灣的聲音要讓全世界聽到！」',
    type: 'pro_tw',
  },
  {
    id: 'ming_xiaozheng',
    name: '明小正',
    fullName: '明居正｜台大政治系教授',
    avatar: '📚',
    tagline: '認清中共本質，才能制定正確的對抗策略',
    intro: '「中共的每一步都是有意圖的，不要幻想，要清醒。我在課堂講了二十年。」',
    type: 'pro_tw',
  },
  {
    id: 'guo_nasa',
    name: '郭NASA',
    fullName: '郭正光｜前NASA工程師',
    avatar: '🚀',
    tagline: '用系統工程思維建構台灣防禦，科技是最可靠的盾牌',
    intro: '「系統要有冗餘，單點失效就全垮。台灣的防禦邏輯要像太空任務一樣嚴謹。」',
    type: 'pro_tw',
  },
  {
    id: 'wang_xiaoho',
    name: '汪小浩',
    fullName: '汪浩｜歷史學者',
    avatar: '🔍',
    tagline: '讀懂歷史才能看清未來，中共從未放棄過台灣',
    intro: '「讀懂歷史才能看清未來。中共從來沒有放棄過台灣，我們也不能放棄自己。」',
    type: 'pro_tw',
  },
  {
    id: 'li_xiaozhe',
    name: '李小哲',
    fullName: '李明哲｜人權工作者',
    avatar: '✊',
    tagline: '親身見證中共體制，台灣的民主自由值得用一切守護',
    intro: '「我在中國坐了五年牢。那裡沒有法律，只有黨的意志。台灣絕對不能讓那樣的東西進來。」',
    type: 'pro_tw',
  },
  {
    id: 'pig_head',
    name: '豬頭皮',
    fullName: '朱約信｜音樂人',
    avatar: '🎵',
    tagline: '台灣的土地台灣的人，本土意識是最後的防線',
    intro: '「台灣的土地、台灣的人、台灣的歌。這些東西沒有人可以拿走。」',
    type: 'pro_tw',
  },
  {
    id: 'ba_jiong',
    name: '八炯',
    fullName: '八炯｜反共YouTuber',
    avatar: '📹',
    tagline: '資訊戰從你的手機螢幕開始，覺醒才是最強的武器',
    intro: '「中共的認知作戰打的是你的手機螢幕。你每天滑什麼，決定你相信什麼。醒醒。」',
    type: 'pro_tw',
  },
  {
    id: 'shen_bear',
    name: '沈黑熊',
    fullName: '沈伯洋｜黑熊學院創辦人',
    avatar: '🐻',
    tagline: '民防訓練是每個公民的責任，全民備戰才能嚇阻戰爭',
    intro: '「民防不是軍事，是每個公民的基本責任。你知道家附近的防空洞在哪嗎？」',
    type: 'pro_tw',
  },
];

// ══════════════════════════════════════════════════════════
// 可疑建議者（台灣模式：1正+2偽；中共模式也可出現）
// ══════════════════════════════════════════════════════════
const PRO_CCP_ADVISORS = [
  {
    id: 'fu_xiaopao',
    name: '傅小砲',
    fullName: '傅崐萁｜國民黨立委',
    avatar: '💣',
    tagline: '兩岸和平才是台灣人民的最大利益，交流比對抗更聰明',
    intro: '「兩岸要和平嘛！打打殺殺不好，我去北京幫你們談一談——順便考察一下。」',
    type: 'pro_ccp',
  },
  {
    id: 'chen_xiaozhen',
    name: '陳小珍',
    fullName: '陳玉珍｜國民黨立委',
    avatar: '🌸',
    tagline: '開放交流才能降低誤判風險，金門模式可以推廣全台',
    intro: '「金門人最了解兩岸，要交流要溝通，開放一點有什麼關係？」',
    type: 'pro_ccp',
  },
  {
    id: 'luo_xiaowei',
    name: '羅小偉',
    fullName: '羅廷偉｜國民黨立委',
    avatar: '🎭',
    tagline: '降低軍事對抗可以釋放更多資源發展經濟民生',
    intro: '「國防預算太高了，省下來做社會福利不好嗎？打仗又不一定打得起來。」',
    type: 'pro_ccp',
  },
  {
    id: 'han_xiaoyou',
    name: '韓小瑜',
    fullName: '韓國瑜｜立法院長',
    avatar: '🌊',
    tagline: '拚經濟顧民生才是正道，兩岸貿易互利共贏',
    intro: '「賣韭菜、賣茶葉，兩岸人民都要吃飯嘛！愛台灣也可以愛大陸嘛！」',
    type: 'pro_ccp',
  },
  {
    id: 'ma_xiaojiu',
    name: '馬小九',
    fullName: '馬英九｜前總統',
    avatar: '🏌️',
    tagline: '九二共識是兩岸和平的基石，維護現狀才能避免戰爭',
    intro: '「中華民族！炎黃子孫！習先生人很好的，兩岸一家親。」',
    type: 'pro_ccp',
  },
  {
    id: 'jiang_xiaochen',
    name: '江小臣',
    fullName: '江啟臣｜國民黨立委',
    avatar: '🤝',
    tagline: '務實外交才能為台灣爭取最大利益，理性對話優於對抗',
    intro: '「我們要務實，兩岸交流才是正道，對抗只會讓人民受苦。」',
    type: 'pro_ccp',
  },
  {
    id: 'zhao_xiaokang',
    name: '趙小康',
    fullName: '趙少康｜媒體人',
    avatar: '📺',
    tagline: '媒體要理性客觀，不要被政治操弄，兩岸關係需要冷靜',
    intro: '「台灣媒體我最懂！兩岸關係要理性，不要被民進黨牽著走！」',
    type: 'pro_ccp',
  },
  {
    id: 'hong_xiaozhu',
    name: '洪小柱',
    fullName: '洪秀柱｜前國民黨主席',
    avatar: '🌹',
    tagline: '兩岸和平統一是最好的結局，避免戰爭才是真正愛台灣',
    intro: '「九二共識就是一個中國！台獨是死路一條！我洪秀柱說了算！」',
    type: 'pro_ccp',
  },
  {
    id: 'wu_xiaohuai',
    name: '吳小懷',
    fullName: '吳斯懷｜前國民黨立委',
    avatar: '🎖️',
    tagline: '從軍事角度看，和平統一比武力對抗更符合台灣利益',
    intro: '「以軍人立場來看，兩岸若能和平統一，是最好的結果……」',
    type: 'pro_ccp',
  },
  {
    id: 'gaojin',
    name: '高金',
    fullName: '高金素梅｜無黨籍立委',
    avatar: '🏔️',
    tagline: '原住民族需要和平，戰爭的代價由弱勢族群承擔',
    intro: '「我代表台灣原住民，我們不需要台獨，我們需要和平！（然後飛去北京）」',
    type: 'pro_ccp',
  },
  {
    id: 'zheng_xiaowen',
    name: '鄭小文',
    fullName: '鄭麗文｜國民黨立委',
    avatar: '🎪',
    tagline: '兩岸交流有助於降低緊張，開放才能帶來真正的和平',
    intro: '「我以前在民進黨，我最了解他們！現在嘛……（停頓）總之兩岸要交流！（她自己也不確定在說什麼）」',
    type: 'pro_ccp',
  },
  {
    id: 'roudai',
    name: '肉呆',
    fullName: '陳之漢（館長）｜前反共網紅',
    avatar: '💪',
    tagline: '強壯的身體需要強壯的經濟，兩岸合作才能讓台灣更強',
    intro: '「我館長說！兩岸……（聲音突然變小）……其實可以談啦……（全台灣粉絲當場昏倒）」',
    type: 'pro_ccp',
  },
];

// ══════════════════════════════════════════════════════════
// 中共黨內建議者（中共模式出現，3張正向中共牌）
// ══════════════════════════════════════════════════════════
const CCP_INTERNAL_ADVISORS = [
  {
    id: 'xi_jinping',
    name: '習總',
    fullName: '習近平｜中共中央總書記',
    avatar: '🐻',
    tagline: '民族復興是歷史的必然，台灣回歸是中華民族共同意志',
    intro: '「實現祖國完全統一，是實現中華民族偉大復興的必然要求。歷史的車輪滾滾向前，誰也阻擋不了。」',
    type: 'ccp_internal',
  },
  {
    id: 'wang_yi',
    name: '王外長',
    fullName: '王毅｜中共外交部長',
    avatar: '🎩',
    tagline: '台灣問題是中國核心利益，外交佈局決定統一時間表',
    intro: '「台灣是中國領土不可分割的一部分，任何圖謀分裂中國的行為都注定失敗。中方立場一貫明確。」',
    type: 'ccp_internal',
  },
  {
    id: 'mao_ning',
    name: '毛發言人',
    fullName: '毛寧｜外交部發言人',
    avatar: '📢',
    tagline: '掌握輿論主動權，讓國際社會接受中國的敘事框架',
    intro: '「中方對此強烈譴責，堅決反對。敦促有關方面停止干涉中國內政，停止向台灣發出錯誤信號。」',
    type: 'ccp_internal',
  },
  {
    id: 'song_tao',
    name: '宋主任',
    fullName: '宋濤｜國台辦主任',
    avatar: '🏮',
    tagline: '惠台措施是統一的前奏，讓台灣民心向背自然轉變',
    intro: '「我們推出的惠台措施，是為了讓台灣同胞感受到祖國大家庭的溫暖，兩岸一家親。」',
    type: 'ccp_internal',
  },
  {
    id: 'zhang_youxia',
    name: '張副主席',
    fullName: '張又俠｜中央軍委副主席',
    avatar: '⭐',
    tagline: '軍事威懾是維護主權的必要手段，解放軍時刻準備',
    intro: '「解放軍有能力、有信心挫敗任何形式的台獨分裂活動和外部勢力干涉。我們說到做到。」',
    type: 'ccp_internal',
  },
  {
    id: 'hu_xijin',
    name: '胡總編',
    fullName: '胡錫進｜環球時報前總編',
    avatar: '🔥',
    tagline: '輿論戰是現代戰爭的第一戰場，強硬聲音讓敵人知道代價',
    intro: '「如果美軍敢介入台海，解放軍將把美國航母送入海底。這不是威脅，這是警告。」',
    type: 'ccp_internal',
  },
  {
    id: 'qin_gang',
    name: '秦前部長',
    fullName: '秦剛｜前外長（神秘失蹤中）',
    avatar: '👻',
    tagline: '台海穩定符合各方利益，但中國核心利益不容妥協',
    intro: '「中方致力於台海和平穩定，但有人應該清楚，玩火者必自焚……（此後再未現身）」',
    type: 'ccp_internal',
  },
];

// ══════════════════════════════════════════════════════════
// 台灣正向建議牌池
// ══════════════════════════════════════════════════════════
const PRO_TW_ADVISOR_CARDS = [
  { name: '強化民防訓練', desc: '提升基層抵抗能力，讓每個公民都是守土的一份子', effects: { tw_military: 8, tw_morale: 6, tw_resilience: 5 }, realEffect: true },
  { name: '晶片外交攻勢', desc: '以半導體優勢換取更多盟友的政治支持', effects: { tw_chip: 6, tw_diplomacy: 10 }, realEffect: true },
  { name: '反滲透立法', desc: '清查中共代理人網絡，讓滲透無所遁形', effects: { tw_intel: 10, tw_resilience: 8 }, realEffect: true },
  { name: '全民媒體識讀', desc: '強化社會對假訊息的免疫力，從根源切斷認知戰', effects: { tw_resilience: 10, tw_morale: 8 }, realEffect: true },
  { name: '擴大後備訓練', desc: '提升戰時動員能量，讓後備部隊真正有戰力', effects: { tw_military: 10, tw_morale: 5 }, realEffect: true },
  { name: '加強情報蒐集', desc: '掌握敵方動態，讓台灣永遠不被突襲', effects: { tw_intel: 12, tw_military: 4 }, realEffect: true },
  { name: '深化美台軍事交流', desc: '引進不對稱作戰技術，讓解放軍知道代價', effects: { tw_military: 10, tw_diplomacy: 6 }, realEffect: true },
  { name: '供應鏈去中化', desc: '降低對中依賴，讓台灣在封鎖下仍能生存', effects: { tw_economy: 8, tw_resilience: 7 }, realEffect: true },
  { name: '強化軟實力輸出', desc: '讓世界看見台灣，讓台灣的故事被世界聽見', effects: { tw_softpower: 10, tw_diplomacy: 8 }, realEffect: true },
  { name: '能源自主計畫', desc: '擺脫能源被掐死的風險，韌性從能源開始', effects: { tw_resilience: 10, tw_economy: 5 }, realEffect: true },
];

// ══════════════════════════════════════════════════════════
// 中共正向建議牌池（中共模式用）
// ══════════════════════════════════════════════════════════
const PRO_CCP_ADVISOR_CARDS = [
  { name: '加速軍事現代化', desc: '強化解放軍戰力，讓台灣知道武統的代價', effects: { ccp_military: 10, tension: 5 }, realEffect: true },
  { name: '擴大認知作戰', desc: '深化台灣社會分裂，讓他們從內部瓦解', effects: { ccp_narrative: 10, tw_morale: -8 }, realEffect: true },
  { name: '惠台政策加碼', desc: '以利誘讓台灣人向往大陸，讓滲透更自然', effects: { ccp_infiltration: 8, ccp_economy: 3 }, realEffect: true },
  { name: '外交孤立台灣', desc: '繼續挖邦交國，讓台灣在國際上孤立無援', effects: { ccp_diplomacy: 10, tw_diplomacy: -8 }, realEffect: true },
  { name: '海上灰色地帶行動', desc: '以漁船民兵持續騷擾，測試台灣底線', effects: { ccp_military: 6, tension: 7, tw_morale: -5 }, realEffect: true },
  { name: '滲透媒體輿論', desc: '收買記者，讓台灣媒體幫我們說話', effects: { ccp_narrative: 8, ccp_infiltration: 6 }, realEffect: true },
  { name: '科技突圍計畫', desc: '突破晶片封鎖，自主研發關鍵技術', effects: { ccp_tech: 10, ccp_economy: 5 }, realEffect: true },
  { name: '強化一帶一路', desc: '拉攏更多國家，在聯合國為台灣問題鋪路', effects: { ccp_diplomacy: 10, ccp_economy: 4 }, realEffect: true },
];

// ══════════════════════════════════════════════════════════
// 偽裝牌池：看起來對台灣好，實際上害台灣
// ══════════════════════════════════════════════════════════
const FAKE_ADVISOR_CARDS = [
  { name: '開放兩岸經貿', desc: '「促進繁榮互利」——實際讓中共滲透經濟命脈', effects: { tw_economy: 3, ccp_infiltration: 10, tw_resilience: -8 }, realEffect: false, warning: '⚠️ 這是陷阱！中共滲透+10，韌性-8' },
  { name: '縮減國防預算', desc: '「省下來做社福」——實際上自廢武功', effects: { tw_military: -12, tw_morale: -6 }, realEffect: false, warning: '⚠️ 這是陷阱！台灣軍事-12，士氣-6' },
  { name: '邀請中國學者交流', desc: '「促進理解」——實際上是情報蒐集管道', effects: { ccp_infiltration: 8, tw_intel: -8 }, realEffect: false, warning: '⚠️ 這是陷阱！中共情報大增，我方情報-8' },
  { name: '放寬中資限制', desc: '「吸引投資」——實際上讓中共買走台灣', effects: { tw_economy: 4, ccp_infiltration: 12, tw_resilience: -10 }, realEffect: false, warning: '⚠️ 這是陷阱！中共滲透+12' },
  { name: '停止對美軍購', desc: '「降低緊張局勢」——實際上自廢武功', effects: { tw_military: -10, tension: -3, ccp_military: 5 }, realEffect: false, warning: '⚠️ 這是陷阱！軍事崩潰，中共反而更強' },
  { name: '推動兩岸和平協議', desc: '「換取和平」——實際上是自我繳械', effects: { tension: -4, tw_military: -8, tw_diplomacy: -10, ccp_infiltration: 10 }, realEffect: false, warning: '⚠️ 這是陷阱！外交崩潰+中共滲透暴增' },
  { name: '取消共諜調查', desc: '「節省資源促和平」——讓共諜橫行無忌', effects: { tw_intel: -12, ccp_infiltration: 10 }, realEffect: false, warning: '⚠️ 這是陷阱！情報系統崩潰' },
  { name: '開放離島中國建設', desc: '「改善民生」——實際埋下軍事隱患', effects: { tw_economy: 3, ccp_infiltration: 8, tw_military: -6 }, realEffect: false, warning: '⚠️ 這是陷阱！中共在離島留下後手' },
];

// ══════════════════════════════════════════════════════════
// 核心函式
// ══════════════════════════════════════════════════════════

// 抽取本季建議者
function drawAdvisor(turnsPlayed, playerFaction) {
  if (turnsPlayed < 2) return null;
  if (Math.random() > 0.32) return null;

  if (playerFaction === 'ccp') {
    // 中共模式：60%黨內建議，40%舔共建議
    const useCCPInternal = Math.random() < 0.60;
    if (useCCPInternal) {
      const advisor = CCP_INTERNAL_ADVISORS[Math.floor(Math.random() * CCP_INTERNAL_ADVISORS.length)];
      const cards = [...PRO_CCP_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
      return { advisor, choices: cards, advisorType: 'ccp_internal' };
    } else {
      // 舔共出現在中共模式：3張偽裝牌看起來幫台灣，選了實際幫中共
      const advisor = PRO_CCP_ADVISORS[Math.floor(Math.random() * PRO_CCP_ADVISORS.length)];
      // 在中共模式下 舔共軍師提的是「對中共有利的台灣弱化建議」
      const cards = [...FAKE_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
      return { advisor, choices: cards, advisorType: 'ccp_friendly' };
    }
  } else {
    // 台灣模式：45%反共建議，55%可疑建議
    const useProTW = Math.random() < 0.45;
    if (useProTW) {
      const advisor = PRO_TW_ADVISORS[Math.floor(Math.random() * PRO_TW_ADVISORS.length)];
      const cards = [...PRO_TW_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
      return { advisor, choices: cards, advisorType: 'pro_tw' };
    } else {
      const advisor = PRO_CCP_ADVISORS[Math.floor(Math.random() * PRO_CCP_ADVISORS.length)];
      const realCard = PRO_TW_ADVISOR_CARDS[Math.floor(Math.random() * PRO_TW_ADVISOR_CARDS.length)];
      const fakes = [...FAKE_ADVISOR_CARDS].sort(() => Math.random() - 0.5).slice(0, 2);
      const choices = [realCard, ...fakes].sort(() => Math.random() - 0.5);
      return { advisor, choices, advisorType: 'pro_ccp' };
    }
  }
}

// 套用建議牌效果
function applyAdvisorCard(state, card) {
  let s = deepClone(state);
  for (const [key, delta] of Object.entries(card.effects || {})) {
    if (key === 'tension') { s.tension = clamp(s.tension + delta); }
    else if (key.startsWith('tw_')) { const k=key.slice(3); if(s.tw[k]!==undefined) s.tw[k]=clamp(s.tw[k]+delta); }
    else if (key.startsWith('ccp_')) { const k=key.slice(4); if(s.ccp[k]!==undefined) s.ccp[k]=clamp(s.ccp[k]+delta); }
    else if (s.tw[key]!==undefined) s.tw[key]=clamp(s.tw[key]+delta);
    else if (s.ccp[key]!==undefined) s.ccp[key]=clamp(s.ccp[key]+delta);
  }
  return s;
}

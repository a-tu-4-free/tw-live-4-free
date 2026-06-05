// ============================================================
// events.js — 事件腳本庫
// type: 'global'       — 隨機出現，好壞都有
//       'tw_bad'       — 台灣自己搞事（負面，台灣人太安逸系列）
//       'ccp_internal' — 中共內傷自爆
//       'tw_triggered' — 台灣數值高時觸發好事
//       'ccp_triggered'— 中共數值高時觸發壞事
// weight: 出現機率權重
// ============================================================

const EVENTS = [

  // ══════════════════════════════════════════════════════════
  // 全球/國際事件
  // ══════════════════════════════════════════════════════════
  {
    id: 'ev_us_taiwan_act',
    title: '美國通過《台灣政策法》強化版',
    body: '美國國會以壓倒性多數通過新版台灣政策法，明確提升台美關係層級，並承諾提供更多防禦性武器。白宮：「我們挺台灣，這不是選項，這是事實。」',
    type: 'global',
    effects: { tw_diplomacy: 10, tw_military: 8, tension: 6 },
    weight: 2,
  },
  {
    id: 'ev_g7_taiwan',
    title: 'G7峰會發表涉台聯合聲明',
    body: '七大工業國峰會聯合聲明首次明確反對任何單方面改變台海現狀的企圖。中共外交部：「強烈譴責，堅決反對。」（第1082次）',
    type: 'global',
    effects: { tw_diplomacy: 9, ccp_diplomacy: -6 },
    weight: 2,
  },
  {
    id: 'ev_chip4',
    title: 'Chip4半導體聯盟深化',
    body: '美日韓台四方半導體聯盟宣布擴大合作，建立去中化供應鏈。中共：「這是科技霸權主義！」然後繼續買AMD。',
    type: 'global',
    effects: { tw_chip: 10, tw_diplomacy: 7, ccp_economy: -8 },
    weight: 2,
  },
  {
    id: 'ev_ukraine',
    title: '烏克蘭抵抗精神鼓舞台灣',
    body: '烏克蘭持續抵抗俄羅斯入侵，台灣民調顯示願意保衛家園的比例創歷史新高。同時也有人說「反正打不過」，然後繼續滑手機。',
    type: 'global',
    effects: { tw_morale: 12, tw_military: 5 },
    weight: 3,
  },
  {
    id: 'ev_south_sea',
    title: '南海緊張：中菲對峙升溫',
    body: '中菲南海衝突持續升溫，美菲聯合軍演規模擴大。台灣：「我們是不是也在名單上？」（答案：一直都是）',
    type: 'global',
    effects: { tension: 7, tw_diplomacy: 4 },
    weight: 3,
  },
  {
    id: 'ev_russia_distract',
    title: '俄烏戰事拖住美國注意力',
    body: '俄羅斯對烏克蘭發動新一輪攻勢，美國國會為了預算吵架，印太資源排擠效應浮現。台灣網友：「美國靠不住！」然後繼續期待美國靠得住。',
    type: 'global',
    effects: { tension: 8, tw_diplomacy: -5, tw_morale: -6 },
    weight: 2,
  },
  {
    id: 'ev_who_blocked',
    title: '台灣再度被拒於WHO門外',
    body: '世界衛生大會在中共壓力下再度拒絕台灣出席。諷刺的是，台灣的防疫成績讓許多WHO會員國汗顏。民主不保庇，但良心會。',
    type: 'global',
    effects: { tw_diplomacy: -6, tw_morale: -5, tw_softpower: 5 },
    weight: 3,
  },
  {
    id: 'ev_ipef',
    title: '印太經濟框架擴大納台',
    body: '美國主導的印太經濟框架以特別安排納入台灣，強化經貿連結。中共大怒，發表聲明，沒人在乎。',
    type: 'global',
    effects: { tw_diplomacy: 10, tw_economy: 8 },
    weight: 2,
  },
  {
    id: 'ev_china_slowdown',
    title: '中國大陸經濟成長大幅放緩',
    body: '中國大陸GDP跌至近年低點，房地產危機持續，李克強在天上看了也搖頭。習維尼說一切都是境外勢力的錯。',
    type: 'global',
    effects: { ccp_economy: -10, ccp_military: -4, tension: -5 },
    weight: 2,
  },
  {
    id: 'ev_quake',
    title: '強烈地震侵襲台灣',
    body: '規模7.4強震重創台灣東部，部分半導體廠短暫停工。國際社會紛紛伸援手。中共：「這是祖國土地的自然現象。」',
    type: 'global',
    effects: { tw_economy: -8, tw_morale: -5, tw_chip: -4, tw_diplomacy: 6 },
    weight: 2,
  },
  {
    id: 'ev_typhoon',
    title: '超強颱風侵台',
    body: '超強颱風登陸台灣，基礎設施受損，但全民動員展現強大韌性。中共媒體頭版：「台灣同胞受苦，歡迎回歸祖國懷抱。」',
    type: 'global',
    effects: { tw_economy: -6, tw_resilience: 5, tw_morale: -3 },
    weight: 3,
  },

  // ══════════════════════════════════════════════════════════
  // 台灣自己搞事（tw_bad）— 台灣人太安逸系列
  // ══════════════════════════════════════════════════════════
  {
    id: 'ev_tw_corrupt_chair',
    title: '抓到貪污的黨主席',
    body: '某黨主席涉嫌收受政治獻金，案情複雜牽連廣，調查中。立法院趁機大亂鬥，國防預算審查再度卡關。民眾：「政治人物都一樣啦。」然後繼續不去投票。',
    type: 'tw_bad',
    effects: { tw_morale: -10, tw_diplomacy: -5, tw_resilience: -4 },
    weight: 3,
  },
  {
    id: 'ev_tw_ccp_journalist',
    title: '抓到舔共記者',
    body: '知名政論節目主持人被查出長期收受中資，在節目上散播「台灣沒有抵抗能力」論述已長達七年。民眾震驚三秒，然後繼續看他的節目。',
    type: 'tw_bad',
    effects: { tw_morale: -8, tw_resilience: -8, tw_intel: -5 },
    weight: 3,
  },
  {
    id: 'ev_tw_yellow_dad',
    title: '黃爸爸狗園發動',
    body: '自稱愛台灣的黃爸爸帶著他的網軍狗園，在社群媒體上針對國防部長發動車輪戰，散播「戰爭必敗論」。結果：國防部長精神耗損，台灣士氣下滑，黃爸爸粉專按讚數創新高。',
    type: 'tw_bad',
    effects: { tw_morale: -12, tw_resilience: -6, tw_military: -3 },
    weight: 3,
  },
  {
    id: 'ev_tw_chinese_years',
    title: '中配六年改四秒',
    body: '立法院通過新修正案，中國配偶居留年限從六年大幅縮短。倡議者說這是人道主義，反對者說這是安全漏洞。兩邊都有道理，都各說各話，沒有人想清楚到底要什麼。',
    type: 'tw_bad',
    effects: { tw_resilience: -8, tw_intel: -6, ccp_infiltration: 5 },
    weight: 2,
  },
  {
    id: 'ev_tw_open_china_capital',
    title: '開放陸資大量進場',
    body: '「拚經濟」的口號下，政策鬆綁讓中資透過第三地悄悄買進台灣媒體、科技公司與房地產。有人說這叫招商引資，有人說這叫引狼入室。五年後見真章。',
    type: 'tw_bad',
    effects: { tw_economy: 4, tw_resilience: -10, tw_intel: -8, ccp_infiltration: 8 },
    weight: 2,
  },
  {
    id: 'ev_tw_chinese_president',
    title: '開放中國人參選台灣總統',
    body: '某修憲提案主張放寬總統候選人資格，引發軒然大波。提案人說「這叫民主開放」。全台灣的情報人員同時噴出一口老血。',
    type: 'tw_bad',
    effects: { tw_morale: -8, tw_resilience: -12, tw_diplomacy: -6 },
    weight: 1,
  },
  {
    id: 'ev_tw_china_doctors',
    title: '開放離島中國醫生進駐',
    body: '金門、馬祖醫療資源不足，政策開放中國醫師前來執業。人道主義上說得通，情報風險上令人頭皮發麻。離島居民：「有醫生就好啊，管他哪裡來的。」',
    type: 'tw_bad',
    effects: { tw_resilience: -7, tw_intel: -5, ccp_infiltration: 5 },
    weight: 2,
  },
  {
    id: 'ev_tw_china_construction',
    title: '開放離島中國建設',
    body: '離島基礎建設引入中國承包商，工程快速推進，價格低廉。幾年後有人發現某座橋的鋼筋規格「特別有彈性」，電信設備裡有「不明元件」。',
    type: 'tw_bad',
    effects: { tw_economy: 3, tw_resilience: -10, tw_military: -5, ccp_infiltration: 6 },
    weight: 2,
  },
  {
    id: 'ev_tw_pro_ccp_artist',
    title: '舔共藝人讚嘆祖國',
    body: '台灣知名藝人在微博發文：「感謝偉大祖國，身為中國人無比驕傲！」下方留言被台灣粉絲洗版。藝人本人繼續住在台灣，享受健保，繳最低稅率。',
    type: 'tw_bad',
    effects: { tw_morale: -9, tw_softpower: -8, tw_resilience: -4 },
    weight: 3,
  },
  {
    id: 'ev_tw_too_comfortable',
    title: '民調：過半民眾認為戰爭不會發生',
    body: '最新民調顯示，52%的台灣民眾認為「兩岸不會真的開戰」。同一份民調也顯示，68%的人不知道家附近的防空洞在哪裡。解放軍默默記下這個數字。',
    type: 'tw_bad',
    effects: { tw_morale: -10, tw_resilience: -8, tw_military: -3 },
    weight: 3,
  },
  {
    id: 'ev_tw_budget_cut',
    title: '國防預算遭立法院大砍',
    body: '以「社會福利優先」為由，國防預算在程序混亂中被刪減15%。軍方欲哭無淚，某立委：「台灣又沒在打仗，要那麼多錢幹嘛。」解放軍：「謝謝。」',
    type: 'tw_bad',
    effects: { tw_military: -12, tw_morale: -8, tw_intel: -5 },
    weight: 2,
  },
  {
    id: 'ev_tw_election_chaos',
    title: '選舉期間社會嚴重撕裂',
    body: '大選前三個月，台灣社群媒體充斥假新聞與對立情緒，統獨問題再度成為主軸，防衛政策反而沒人討論。北京的輿論操弄組加班加點，績效考核全A。',
    type: 'tw_bad',
    effects: { tw_morale: -12, tw_resilience: -10, ccp_propaganda: 6 },
    weight: 2,
  },
  {
    id: 'ev_tw_youth_apathy',
    title: '年輕世代政治冷漠創新高',
    body: '研究顯示，18-35歲台灣青年中，僅有23%能說出台灣海峽的軍事意義。但99%都能說出最新韓劇男主角的名字。中共認知作戰部門：「我們的錢沒白花。」',
    type: 'tw_bad',
    effects: { tw_morale: -8, tw_resilience: -7, tw_softpower: -4 },
    weight: 3,
  },

  // ══════════════════════════════════════════════════════════
  // 中共內傷自爆（ccp_internal）
  // ══════════════════════════════════════════════════════════
  {
    id: 'ev_ccp_evergrande',
    title: '恆大事件引發連鎖崩潰',
    body: '恆大集團正式宣告無法償付債務，中國房地產市場骨牌效應啟動。數百萬購屋者的錢打了水漂，地方政府財政崩盤。習維尼：「這是正常的市場調節。」購屋者：「……」',
    type: 'ccp_internal',
    effects: { ccp_economy: -14, ccp_diplomacy: -5, tension: -4 },
    weight: 3,
  },
  {
    id: 'ev_ccp_rotten_buildings',
    title: '爛尾樓潮席捲全中國',
    body: '數千棟已付款卻爛尾的樓盤讓業主走上街頭，「停貸運動」擴散至三百多個城市。地方官員的解決方案：逮捕帶頭抗議的業主。房子還是爛著。',
    type: 'ccp_internal',
    effects: { ccp_economy: -10, ccp_propaganda: -6, tw_morale: 5 },
    weight: 3,
  },
  {
    id: 'ev_ccp_purge',
    title: '習維尼大規模清洗異己',
    body: '習近平再度發動黨內整風，數名政治局委員「接受調查」，兩名上將「因個人原因」消失。官方說法：打貪腐。外界說法：打不聽話的人。效果：人人自危，無人敢說真話。',
    type: 'ccp_internal',
    effects: { ccp_military: -8, ccp_economy: -5, ccp_diplomacy: -4, tw_morale: 6 },
    weight: 2,
  },
  {
    id: 'ev_ccp_harvest_merchants',
    title: '習維尼開始收割民營企業家',
    body: '科技、教育、遊戲業監管整頓接連發動，數千億市值蒸發。馬雲消失又出現，出現又消失。中國富豪開始悄悄移民，資金外流規模創十年新高。',
    type: 'ccp_internal',
    effects: { ccp_economy: -12, ccp_diplomacy: -6, tw_economy: 4 },
    weight: 2,
  },
  {
    id: 'ev_ccp_secretary_corrupt',
    title: '某省委書記貪污案震驚全黨',
    body: '某重要省份書記落馬，查扣現金超過十億人民幣，另有名畫、古董、情婦若干。中央：「這是個別案例。」（同月第三起）地方財政窟窿難以遮掩。',
    type: 'ccp_internal',
    effects: { ccp_economy: -8, ccp_propaganda: -5, ccp_infiltration: -5, tw_morale: 4 },
    weight: 3,
  },
  {
    id: 'ev_ccp_anti_xi',
    title: '反共勢力在黨內悄悄擴張',
    body: '多份洩露文件顯示，部分黨內官員對習近平路線私下強烈不滿，「文革2.0」之說在高層小圈子流傳。沒有人敢公開說，但人人都聽到風聲。',
    type: 'ccp_internal',
    condition: (s) => s.turnsPlayed >= 6,
    effects: { ccp_military: -5, ccp_propaganda: -7, tension: -5 },
    weight: 2,
  },
  {
    id: 'ev_ccp_overseas_dissidents',
    title: '國際反共人士串聯行動擴大',
    body: '海外維權人士、前黨員、學者組成跨國聯盟，向多國政府提供中共滲透證據，促使數個國家驅逐中共外交官。中共：「境外敵對勢力！」（這次是真的）',
    type: 'ccp_internal',
    effects: { ccp_diplomacy: -10, ccp_propaganda: -6, tw_diplomacy: 5 },
    weight: 2,
  },
  {
    id: 'ev_ccp_xi_kim',
    title: '習維尼與金小胖密會',
    body: '習近平與金正恩在平壤密會，聯合聲明充滿「深化戰略夥伴關係」等廢話。西方世界：「獨裁者互相取暖。」台灣：「呵，所以這就是台灣的鄰居。」',
    type: 'ccp_internal',
    effects: { tension: 6, ccp_diplomacy: -5, tw_diplomacy: 4 },
    weight: 2,
  },
  {
    id: 'ev_ccp_xi_putin',
    title: '習維尼與普丁簽署「無上限友誼」',
    body: '習普再度會面，宣示「無上限戰略夥伴關係」。西方制裁升級，中國成為俄羅斯經濟救生圈，代價是被西方視為共謀。中國企業開始感受到次級制裁的滋味。',
    type: 'ccp_internal',
    effects: { ccp_economy: -8, ccp_diplomacy: -10, tension: 7, tw_diplomacy: 8 },
    weight: 2,
  },
  {
    id: 'ev_ccp_xi_dead',
    title: '習維尼突然死亡，中共陷入權力真空',
    body: '習近平突然離世，死因「自然」。接班人選不明，派系鬥爭白熱化，解放軍高層互相觀望。這是中共建政以來最大的政治不確定期。台灣：「……現在是機會？還是更危險？」（答：不知道）',
    type: 'ccp_internal',
    condition: (s) => s.turnsPlayed >= 12,
    effects: { ccp_military: -15, ccp_propaganda: -12, ccp_infiltration: -15, ccp_economy: -8, tension: -15, tw_morale: 15 },
    weight: 1,
  },
  {
    id: 'ev_ccp_covid_collapse',
    title: '清零政策崩潰，民心大失',
    body: '動態清零突然喊停，感染人數瞬間爆炸，醫療系統崩潰，官方一句話都沒解釋。民眾從「清零萬歲」到「我操你的清零」，只花了四十八小時。',
    type: 'ccp_internal',
    effects: { ccp_economy: -9, ccp_propaganda: -10, tw_morale: 6 },
    weight: 2,
  },
  {
    id: 'ev_ccp_youth_unemployment',
    title: '中國青年失業率突破40%',
    body: '中國官方宣布停止公布青年失業率數據，理由是「需要改進統計方法」。民間估計實際失業率已超過40%。一億「躺平族」對習維尼的「中國夢」沉默以對。',
    type: 'ccp_internal',
    effects: { ccp_economy: -7, ccp_propaganda: -8, ccp_military: -3 },
    weight: 3,
  },
  {
    id: 'ev_ccp_pla_corruption',
    title: '解放軍火箭軍高層集體腐敗',
    body: '火箭軍多名中將以上將領同時「被調查」，傳出飛彈燃料被換成水、導引系統維護金流外流等醜聞。習維尼斥資萬億打造的核威懾，有多少是真的？',
    type: 'ccp_internal',
    effects: { ccp_military: -14, ccp_propaganda: -6, tw_morale: 10, tension: -8 },
    weight: 2,
  },
  {
    id: 'ev_ccp_ai_lag',
    title: '中共AI發展被晶片禁令卡死',
    body: '美國持續收緊對中AI晶片出口管制，中國大廠訓練大模型所需算力嚴重不足。華為Ascend晶片良率據稱不到台積電的三分之一。「彎道超車」在直路上撞牆了。',
    type: 'ccp_internal',
    condition: (s) => s.tw.chip > 80,
    effects: { ccp_economy: -6, ccp_cyber: -10, tw_chip: 4 },
    weight: 2,
  },

  // ══════════════════════════════════════════════════════════
  // 台灣優勢觸發（tw_triggered）
  // ══════════════════════════════════════════════════════════
  {
    id: 'ev_tsmc_1nm',
    title: '臺積電突破1奈米量產',
    body: '台積電宣布率先實現1奈米量產，三星和Intel的追趕時程再度落後五年。全球科技業爭相下單。中共：「我們的芯片完全自主！」（良率12%，但不重要）',
    type: 'tw_triggered',
    condition: (s) => s.tw.chip > 75,
    effects: { tw_chip: 10, tw_economy: 12, tw_diplomacy: 8 },
    weight: 2,
  },
  {
    id: 'ev_mask_diplomacy',
    title: '口罩外交引發國際迴響',
    body: '台灣向超過80個國家捐贈醫療物資，「Taiwan Can Help」登上各大國際媒體頭版。WHO依然不讓台灣入場，但全世界都知道那個諷刺。',
    type: 'tw_triggered',
    condition: (s) => s.tw.softpower > 50,
    effects: { tw_softpower: 10, tw_diplomacy: 10, tw_morale: 8 },
    weight: 2,
  },
  {
    id: 'ev_democracy_award',
    title: '台灣民主指數亞洲第一',
    body: '自由之家年度報告將台灣列為亞洲最鞏固民主國家。中共：「台灣那叫什麼民主，我們全過程人民民主才是真民主。」沒有人在聽。',
    type: 'tw_triggered',
    condition: (s) => s.tw.morale > 70,
    effects: { tw_softpower: 8, tw_diplomacy: 9, tw_morale: 5 },
    weight: 2,
  },
  {
    id: 'ev_counter_intel_win',
    title: '情報大捷：共諜網絡曝光',
    body: '台灣情報單位一舉逮捕多名共諜，公開中共滲透細節。中共外交部連發三篇聲明，第一篇說子虛烏有，第二篇說干涉內政，第三篇說中華民族。沒有一篇回應任何事實。',
    type: 'tw_triggered',
    condition: (s) => s.tw.intel > 70,
    effects: { tw_intel: 8, tw_morale: 10, ccp_infiltration: -15, tw_diplomacy: 6 },
    weight: 1,
  },

  // ══════════════════════════════════════════════════════════
  // 中共壓力觸發（ccp_triggered）
  // ══════════════════════════════════════════════════════════
  {
    id: 'ev_ccp_missiles',
    title: '中共飛彈落入台灣EEZ',
    body: '解放軍實彈演習飛彈落入台灣專屬經濟區，日本強烈抗議，美軍艦艇靠近台海。台灣民眾：「要打了嗎？」然後繼續去夜市吃東西。',
    type: 'ccp_triggered',
    condition: (s) => s.tension > 55,
    effects: { tension: 10, tw_morale: -10, tw_economy: -5, tw_diplomacy: 8 },
    weight: 2,
  },
  {
    id: 'ev_blackout',
    title: '台灣發生大規模停電',
    body: '疑似遭網路攻擊，台灣北部電網短暫中斷三小時。全台便利商店現金機用光，無現金支付全部失效。台灣人這才想起：原來現金還是有用的。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.cyber > 65,
    effects: { tw_resilience: -10, tw_economy: -8, tw_morale: -8 },
    weight: 2,
  },
  {
    id: 'ev_spy_arrested',
    title: '現役少將涉共諜案被捕',
    body: '陸軍少將被捕，涉嫌長期提供軍事機密。更難堪的是：他的年薪只有180萬，卻在信義區買了三棟房。財產申報寫的是「投資股票獲利」。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.infiltrated.retired_officers || s.ccp.infiltrated.legislators,
    effects: { tw_military: -10, tw_intel: -8, tw_morale: -10 },
    weight: 2,
  },
  {
    id: 'ev_ally_lost',
    title: '太平洋邦交國宣布與台斷交',
    body: '又一個太平洋島國拿了北京的支票轉向，這次是一棟體育館加三條路加兩千萬美元。台灣外交部：「嚴正譴責。」外交部長臉上寫滿了「我也沒辦法」。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.diplomacy > 65,
    effects: { tw_diplomacy: -10, tw_morale: -8, tw_softpower: -5 },
    weight: 3,
  },
  {
    id: 'ev_deepfake',
    title: '總統深偽影片在全台瘋傳',
    body: '一段疑似總統宣布「接受和平統一」的深偽影片在社群媒體爆炸性擴散，即使官方緊急闢謠，恐慌持續了整整48小時。有人已經開始打包行李。',
    type: 'ccp_triggered',
    condition: (s) => s.ccp.propaganda > 65,
    effects: { tw_morale: -12, tw_resilience: -8 },
    weight: 2,
  },
];

// ── 加權隨機抽事件（依 type 分組）────────────────────────
function drawRandomEvent(state) {
  const t = state.turnsPlayed;

  // 每季必抽一個全球/觸發事件
  // 每3季額外抽一個tw_bad或ccp_internal
  const pool = EVENTS.filter(e => {
    if (e.condition && !e.condition(state)) return false;
    // tw_bad 和 ccp_internal 降低出現頻率
    if (e.type === 'tw_bad' || e.type === 'ccp_internal') {
      return t % 2 === 0; // 隔季才進入池
    }
    return true;
  });

  const totalWeight = pool.reduce((s, e) => s + (e.weight || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const ev of pool) {
    rand -= (ev.weight || 1);
    if (rand <= 0) return ev;
  }
  return pool[pool.length - 1];
}

// 依類型取得事件列表
function getEventsByType(type) {
  return EVENTS.filter(e => e.type === type);
}

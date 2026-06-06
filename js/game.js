// ============================================================
// game.js — 遊戲狀態、核心邏輯、結局系統
// ============================================================

function createInitialState(playerFaction) {
  // playerFaction: 'tw' | 'ccp'
  return {
    year: 2026, quarter: 1,
    tension: 52,
    gameOver: false, gameOverId: null, winner: null,
    playerFaction: playerFaction || 'tw',
    thisQuarterLog: [],
    mapEvents: [],

    tw: {
      ap: 3, maxAp: 3,
      military:   58,
      economy:    82,
      chip:       92,
      diplomacy:  48,
      morale:     62,
      intel:      55,
      resilience: 50,
      softpower:  65,
      score: 0,
      cooldowns: {},
      infiltrationCleared: 0,
      usedCards: [],   // 本局出過的牌id
      revealedCards: [], // 對方已看到的牌id
    },

    ccp: {
      ap: 3, maxAp: 3,
      military:   88,
      economy:    58,
      tech:       65,   // 對應台灣晶片
      diplomacy:  65,
      loyalty:    72,   // 黨心（對應士氣）
      intel:      60,
      stability:  68,   // 維穩（對應韌性）
      narrative:  72,   // 話語權（對應軟實力）
      score: 0,
      cooldowns: {},
      infiltration: 48,
      infiltrated: {
        retired_officers: false,
        legislators:      false,
        journalists:      false,
        students:         false,
      },
      usedCards: [],
      revealedCards: [],
    },

    log: [], eventHistory: [], turnsPlayed: 0,
  };
}

// ── 數值邊界 ─────────────────────────────────────────────
function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

// ── 套用效果 ─────────────────────────────────────────────
// 欄位別名：舊卡牌用的名字 → 新欄位名
const STAT_ALIAS = {
  propaganda: 'narrative',  // 中共宣傳 → 話語權
  cyber: 'tech',            // 中共網軍計入科技
};

function applyEffects(state, effects) {
  if (!effects) return state;
  const s = deepClone(state);
  for (let [key, delta] of Object.entries(effects)) {
    // 別名對應
    if (key.startsWith('ccp_') && STAT_ALIAS[key.slice(4)]) {
      key = 'ccp_' + STAT_ALIAS[key.slice(4)];
    } else if (STAT_ALIAS[key] && s.ccp[key] === undefined) {
      key = STAT_ALIAS[key];
    }
    if (key === 'tension') {
      s.tension = clamp(s.tension + delta, 0, 100);
    } else if (key.startsWith('tw_')) {
      const stat = key.slice(3);
      if (s.tw[stat] !== undefined) s.tw[stat] = clamp(s.tw[stat] + delta);
    } else if (key.startsWith('ccp_')) {
      const stat = key.slice(4);
      if (s.ccp[stat] !== undefined) s.ccp[stat] = clamp(s.ccp[stat] + delta);
    } else if (s.tw[key] !== undefined) {
      s.tw[key] = clamp(s.tw[key] + delta);
    } else if (s.ccp[key] !== undefined) {
      s.ccp[key] = clamp(s.ccp[key] + delta);
    }
  }
  return s;
}

// ── 出牌：臺灣 ───────────────────────────────────────────
function playTaiwanCard(state, cardId) {
  const card = getAllTaiwanCards().find(c => c.id === cardId);
  if (!card) return { state, error: '找不到卡牌' };
  if (state.tw.ap < card.cost) return { state, error: '行動點不足' };
  if ((state.tw.cooldowns[cardId] || 0) > 0)
    return { state, error: `冷卻中，還需 ${state.tw.cooldowns[cardId]} 季` };

  let s = deepClone(state);
  s.tw.ap -= card.cost;
  s = applyEffects(s, card.effects);
  if (card.sideEffects) s = applyEffects(s, card.sideEffects);
  if (card.cooldown) s.tw.cooldowns[cardId] = card.cooldown;
  if (card.special === 'counter_infiltration') s = doCounterIntel(s);
  if (!s.tw.usedCards.includes(cardId)) s.tw.usedCards.push(cardId);

  // 對方揭露：台灣出牌後對方知道這張牌
  if (!s.ccp.revealedCards.includes(cardId)) s.ccp.revealedCards.push(cardId);

  const entry = {
    faction: 'tw',
    text: `▶ ${card.name}：${card.desc}`,
    quarter: `${s.year}Q${s.quarter}`
  };
  s.thisQuarterLog.push(entry);
  s.log.unshift(entry);

  if (card.category === '軍事') s.mapEvents.push({ type: 'tw_military', label: card.name, life: 3 });
  if (card.category === '外交') s.mapEvents.push({ type: 'tw_diplo', label: card.name, life: 2 });

  return { state: s, triggersCCP: card.triggersCCP };
}

// ── 出牌：中共 ───────────────────────────────────────────
function playCCPCard(state, cardId) {
  const card = getAllCCPCards().find(c => c.id === cardId);
  if (!card) return { state, error: '找不到卡牌' };
  if (state.ccp.ap < card.cost) return { state, error: '行動點不足' };
  if ((state.ccp.cooldowns[cardId] || 0) > 0)
    return { state, error: `冷卻中，還需 ${state.ccp.cooldowns[cardId]} 季` };

  let s = deepClone(state);
  s.ccp.ap -= card.cost;
  s = applyEffects(s, card.effects);
  if (card.sideEffects) s = applyEffects(s, card.sideEffects);
  if (card.cooldown) s.ccp.cooldowns[cardId] = card.cooldown;

  if (card.special && card.special.startsWith('infiltrate_')) {
    s.ccp.infiltrated[card.special.replace('infiltrate_', '')] = true;
  }
  if (!s.ccp.usedCards.includes(cardId)) s.ccp.usedCards.push(cardId);

  // 對方揭露
  if (!s.tw.revealedCards.includes(cardId)) s.tw.revealedCards.push(cardId);

  const entry = {
    faction: 'ccp',
    text: `▶ ${card.name}：${card.desc}`,
    quarter: `${s.year}Q${s.quarter}`
  };
  s.thisQuarterLog.push(entry);
  s.log.unshift(entry);

  if (card.category === '軍事') s.mapEvents.push({ type: 'ccp_military', label: card.name, life: 3 });
  if (card.category === '滲透') s.mapEvents.push({ type: 'ccp_infiltrate', label: card.name, life: 2 });
  if (card.category === '網路') s.mapEvents.push({ type: 'ccp_cyber', label: card.name, life: 2 });

  return { state: s, triggersTW: card.triggersTW };
}

// ── 反情報 ───────────────────────────────────────────────
function doCounterIntel(state) {
  let s = deepClone(state);
  let cleared = 0;
  for (const key of Object.keys(s.ccp.infiltrated)) {
    if (s.ccp.infiltrated[key] && Math.random() > 0.45) {
      s.ccp.infiltrated[key] = false;
      cleared++;
    }
  }
  s.tw.infiltrationCleared += cleared;
  s.ccp.infiltration = clamp(s.ccp.infiltration - cleared * 10);
  const entry = {
    faction: 'tw',
    text: cleared > 0
      ? `✓ 反情報成功，清除 ${cleared} 條滲透線`
      : '✗ 反情報行動暫未奏效',
    quarter: `${s.year}Q${s.quarter}`
  };
  s.thisQuarterLog.push(entry);
  s.log.unshift(entry);
  return s;
}

// ── 對方數值可見度（情報決定）────────────────────────────
// 回傳：{ stat: 真實值 或 null(不可見) }
function getVisibleOpponentStats(state, myFaction) {
  const intel = myFaction === 'tw' ? state.tw.intel : state.ccp.intel;
  const opponent = myFaction === 'tw' ? state.ccp : state.tw;

  // 情報越高看越多
  // < 40: 全部???
  // 40-60: 顯示軍事、經濟（2項）
  // 60-75: 顯示4項
  // > 75: 顯示全部
  const allStats = myFaction === 'tw'
    ? ['military','economy','tech','diplomacy','loyalty','intel','stability','narrative']
    : ['military','economy','chip','diplomacy','morale','intel','resilience','softpower'];

  const visibleCount = intel < 40 ? 0
    : intel < 60 ? 2
    : intel < 75 ? 4
    : allStats.length;

  const result = {};
  allStats.forEach((stat, i) => {
    result[stat] = i < visibleCount ? opponent[stat] : null;
  });
  return result;
}

// ── AI：台灣自動出牌 ─────────────────────────────────────
function autoTWTurn(state) {
  let s = deepClone(state);
  let iterations = 0;
  while (s.tw.ap > 0 && iterations < 8) {
    iterations++;
    const available = getAllTaiwanCards().filter(c => isTWCardAvailable(s, c.id));
    if (available.length === 0) break;
    // AI策略：優先防禦性牌
    let pool = available.filter(c =>
      ['社會','情報','軍事'].includes(c.category)
    );
    if (pool.length === 0) pool = available;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const result = playTaiwanCard(s, pick.id);
    if (!result.error) s = result.state;
    else break;
  }
  return s;
}

// ── AI：中共自動出牌 ─────────────────────────────────────
function autoCCPTurn(state) {
  let s = deepClone(state);
  let iterations = 0;
  while (s.ccp.ap > 0 && iterations < 8) {
    iterations++;
    const available = getAllCCPCards().filter(c => isCCPCardAvailable(s, c.id));
    if (available.length === 0) break;
    let pool;
    if (s.tension < 50) {
      pool = available.filter(c => ['滲透','認知','經濟'].includes(c.category));
    } else {
      pool = available.filter(c => ['軍事','網路','灰色地帶'].includes(c.category));
    }
    if (pool.length === 0) pool = available;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const result = playCCPCard(s, pick.id);
    if (!result.error) s = result.state;
    else break;
  }
  return s;
}

// ── 季末結算 ─────────────────────────────────────────────
function resolveEndOfQuarter(state, event) {
  let s = deepClone(state);

  if (event) {
    s = applyEffects(s, event.effects);
    s.eventHistory.push({
      id: event.id, title: event.title,
      quarter: `${s.year}Q${s.quarter}`
    });
    s.log.unshift({
      faction: 'event',
      text: `⚡ ${event.title}`,
      quarter: `${s.year}Q${s.quarter}`
    });
  }

  // 滲透持續傷害
  const activeInfil = Object.values(s.ccp.infiltrated).filter(Boolean).length;
  if (activeInfil > 0) {
    s.tw.military   = clamp(s.tw.military   - activeInfil * 2);
    s.tw.intel      = clamp(s.tw.intel      - activeInfil * 2);
    s.tw.morale     = clamp(s.tw.morale     - activeInfil * 1);
    s.ccp.infiltration = clamp(s.ccp.infiltration + activeInfil * 3);
  }

  // 宣傳傷害
  if (s.ccp.narrative > 70) {
    s.tw.morale     = clamp(s.tw.morale     - 3);
    s.tw.resilience = clamp(s.tw.resilience - 2);
  }

  // 晶片紅利
  if (s.tw.chip > 85) {
    s.tw.diplomacy = clamp(s.tw.diplomacy + 1);
    s.tw.economy   = clamp(s.tw.economy   + 1);
  }

  // 緊張衰減
  const dipBonus = s.tw.diplomacy > 75 ? 3 : 1;
  s.tension = clamp(s.tension - dipBonus + (s.ccp.military > 88 ? 2 : 0));

  // 地圖事件老化
  s.mapEvents = s.mapEvents
    .map(e => ({ ...e, life: e.life - 1 }))
    .filter(e => e.life > 0);

  // 冷卻遞減
  for (const k of Object.keys(s.tw.cooldowns))
    s.tw.cooldowns[k] = Math.max(0, s.tw.cooldowns[k] - 1);
  for (const k of Object.keys(s.ccp.cooldowns))
    s.ccp.cooldowns[k] = Math.max(0, s.ccp.cooldowns[k] - 1);

  // 重置AP
  s.tw.ap  = s.tw.maxAp;
  s.ccp.ap = s.ccp.maxAp;

  // 中共動態升降
  s = applyCCPEscalation(s);

  // 分數
  s.tw.score  = computeTWScore(s);
  s.ccp.score = computeCCPScore(s);

  // 推進時間
  s.turnsPlayed++;
  s.quarter++;
  if (s.quarter > 4) { s.quarter = 1; s.year++; }
  s.thisQuarterLog = [];

  // 結局判定
  const ending = checkEnding(s);
  if (ending) {
    s.gameOver     = true;
    s.gameOverId   = ending.id;
    s.winner       = ending.winner;
  }
  return s;
}

// ── 分數計算 ─────────────────────────────────────────────
function computeTWScore(s) {
  return Math.round(
    s.tw.military   * 0.18 +
    s.tw.economy    * 0.13 +
    s.tw.chip       * 0.18 +
    s.tw.diplomacy  * 0.16 +
    s.tw.morale     * 0.12 +
    s.tw.intel      * 0.11 +
    s.tw.resilience * 0.07 +
    s.tw.softpower  * 0.05
  );
}

function computeCCPScore(s) {
  return Math.round(
    s.ccp.military   * 0.20 +
    s.ccp.economy    * 0.12 +
    s.ccp.tech       * 0.15 +
    s.ccp.diplomacy  * 0.12 +
    s.ccp.loyalty    * 0.12 +
    s.ccp.intel      * 0.10 +
    s.ccp.stability  * 0.10 +
    s.ccp.narrative  * 0.09
  );
}

// ── 中共動態消長 ─────────────────────────────────────────
function applyCCPEscalation(state) {
  const s = deepClone(state);
  const msgs = [];

  s.ccp.military  = clamp(s.ccp.military  + 1,   0, 95);
  s.ccp.intel     = clamp(s.ccp.intel     + 0.5, 0, 90);
  s.ccp.diplomacy = clamp(s.ccp.diplomacy + 0.5, 0, 90);

  // 台灣反制
  if (s.tw.chip > 85) {
    const hit = (s.tw.chip - 85) * 0.06;
    s.ccp.economy = clamp(s.ccp.economy - hit);
    s.ccp.tech    = clamp(s.ccp.tech    - hit * 0.5);
  }
  if (s.tw.diplomacy > 78)
    s.ccp.diplomacy = clamp(s.ccp.diplomacy - (s.tw.diplomacy - 78) * 0.1);
  if (s.tw.infiltrationCleared > 0)
    s.ccp.narrative = clamp(s.ccp.narrative - s.tw.infiltrationCleared * 0.4);
  if (s.tw.resilience > 72)
    s.ccp.narrative = clamp(s.ccp.narrative - (s.tw.resilience - 72) * 0.08);
  if (s.tw.softpower > 65) {
    s.ccp.narrative  = clamp(s.ccp.narrative  - 0.5);
    s.ccp.diplomacy  = clamp(s.ccp.diplomacy  - 0.3);
  }

  // 中共內部壓力
  if (s.ccp.economy < 55)
    s.ccp.military = clamp(s.ccp.military - (55 - s.ccp.economy) * 0.08);
  if (s.ccp.economy < 40) {
    s.ccp.infiltration = clamp(s.ccp.infiltration - 2);
    msgs.push('中共經濟惡化，滲透資金縮減');
  }
  if (s.ccp.loyalty < 45)
    s.ccp.military = clamp(s.ccp.military - 2);

  // 每8季升級
  if (s.turnsPlayed > 0 && s.turnsPlayed % 8 === 0) {
    const rich = s.ccp.economy > 65;
    s.ccp.military     = clamp(s.ccp.military     + (rich ? 3 : 1));
    s.ccp.narrative    = clamp(s.ccp.narrative    + (rich ? 3 : 1));
    s.ccp.infiltration = clamp(s.ccp.infiltration + (rich ? 4 : 2));
    msgs.push(`中共完成軍事升級${rich ? '' : '（經濟吃緊，幅度縮水）'}`);
  }

  // 每12季危機
  if (s.turnsPlayed > 0 && s.turnsPlayed % 12 === 0) {
    s.tension = clamp(s.tension + 5);
    msgs.push('新一輪兩岸危機週期，緊張度上升');
  }

  for (const m of msgs)
    s.log.unshift({ faction: 'event', text: `⚠️ ${m}`, quarter: `${s.year}Q${s.quarter}` });

  return s;
}

// ── 8種結局判定 ──────────────────────────────────────────
function checkEnding(s) {
  if (s.tension >= 95)
    return { id: 'war', winner: 'crisis' };
  if (s.ccp.infiltration >= 92 && s.tw.intel <= 15 && s.tw.morale <= 25)
    return { id: 'collapse', winner: 'ccp' };
  if (s.tw.morale <= 8 && s.tw.military <= 18)
    return { id: 'morale_collapse', winner: 'ccp' };
  if (s.tw.economy <= 12 && s.tw.diplomacy <= 30)
    return { id: 'economic_siege', winner: 'ccp' };
  if (s.ccp.narrative >= 92 && s.tw.resilience <= 15 && s.tw.morale <= 35)
    return { id: 'cognitive_victory', winner: 'ccp' };
  if (s.tw.chip >= 94 && s.tw.diplomacy >= 90 && s.tw.economy >= 85)
    return { id: 'silicon_peace', winner: 'tw' };
  if (s.tw.diplomacy >= 92 && s.tw.softpower >= 85 && s.tw.morale >= 80)
    return { id: 'diplomatic_victory', winner: 'tw' };
  if (s.tw.military >= 92 && computeTWScore(s) >= 88 && computeCCPScore(s) <= 48)
    return { id: 'deterrence', winner: 'tw' };
  if (s.tension <= 10 && s.tw.resilience >= 80 && s.tw.morale >= 75)
    return { id: 'stable_status_quo', winner: 'tw' };
  // 中共視角特殊結局
  if (s.ccp.loyalty <= 20 && s.ccp.economy <= 25)
    return { id: 'ccp_internal_collapse', winner: 'tw' };
  return null;
}

// ── 結局資料庫 ───────────────────────────────────────────
const ENDINGS = {
  war:                 { title:'戰爭爆發',    icon:'💥', winner:'crisis', headline:'砲聲響起——台海戰爭爆發',      desc:'兩岸緊張升至無可挽回的臨界點。解放軍開始封鎖，美日介入，沒有贏家。',                           flavor:'沒有贏家的戰爭，卻已無法阻止。',     color:'#3a0800' },
  collapse:            { title:'內部瓦解',    icon:'🕳️', winner:'ccp',    headline:'台灣從內部崩潰',              desc:'中共滲透深入台灣政治、軍事與媒體核心。不發一槍，台灣的意志已被悄悄掏空。',                     flavor:'最深的傷，永遠來自最近的人。',       color:'#1a0820' },
  morale_collapse:     { title:'士氣崩潰',    icon:'🏳️', winner:'ccp',    headline:'民心動搖，抵抗意志瓦解',      desc:'長期的認知作戰與軍事壓力讓台灣民心渙散，不戰而屈人之兵。',                                       flavor:'「他們甚至不需要開槍。」',           color:'#1e1000' },
  economic_siege:      { title:'經濟封鎖',    icon:'⛓️', winner:'ccp',    headline:'台灣經濟在封鎖中窒息',        desc:'中共以經濟手段持續擠壓，台灣在沒有子彈的戰爭中敗下陣來。',                                       flavor:'餓死不流血，但一樣死。',             color:'#1a1400' },
  cognitive_victory:   { title:'認知戰勝利',  icon:'🧠', winner:'ccp',    headline:'現實被重新定義',              desc:'長達數年的假訊息攻勢讓台灣社會對自身存在的意義感到懷疑。中共不費一兵一卒。',                     flavor:'當你開始懷疑自己，敵人已經贏了。',   color:'#150a1a' },
  silicon_peace:       { title:'矽盾和平',    icon:'💎', winner:'tw',     headline:'晶片外交確立台灣永久地位',    desc:'台灣的半導體優勢成為全球無可替代的戰略資產。任何侵台行動都意味著全球科技崩潰。',                 flavor:'最強的武器，是讓全世界都需要你。',   color:'#001430' },
  diplomatic_victory:  { title:'外交勝利',    icon:'🌐', winner:'tw',     headline:'民主世界與台灣站在一起',      desc:'多年的外交努力讓台灣在國際社會建立了難以動搖的道德高地。中共孤立，台灣被世界擁抱。',             flavor:'不是因為我們強，而是因為我們對。',   color:'#001a20' },
  deterrence:          { title:'軍事嚇阻',    icon:'🛡️', winner:'tw',     headline:'刺蝟讓獵食者三思',            desc:'台灣的不對稱戰力讓解放軍評估代價過高。台海暫時回歸平靜。',                                       flavor:'嚇阻不是勝利，但勝於一戰。',         color:'#001a10' },
  stable_status_quo:   { title:'現狀穩定',    icon:'⚖️', winner:'tw',     headline:'不確定的和平，卻是和平',      desc:'兩岸緊張緩慢降溫，台灣民主愈加鞏固。沒有統一，也沒有戰爭。',                                     flavor:'在歷史的縫隙中，台灣找到了自己的位置。', color:'#0a1400' },
  ccp_internal_collapse:{ title:'中共瓦解',   icon:'🏚️', winner:'tw',     headline:'中共從內部崩潰',              desc:'黨心渙散、經濟崩潰，中共政權陷入前所未有的危機。台灣得到了意想不到的喘息空間。',                 flavor:'歷史上每個看似永恆的政權，都有終結的一天。', color:'#0a0a00' },
};

// ── 工具函式 ─────────────────────────────────────────────
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function getAllTaiwanCards() {
  return [...TAIWAN_CARDS,
    ...(typeof CUSTOM_TAIWAN_CARDS !== 'undefined' ? CUSTOM_TAIWAN_CARDS : [])];
}
function getAllCCPCards() {
  return [...CCP_CARDS,
    ...(typeof CUSTOM_CCP_CARDS !== 'undefined' ? CUSTOM_CCP_CARDS : [])];
}

function isTWCardAvailable(state, cardId) {
  const card = getAllTaiwanCards().find(c => c.id === cardId);
  if (!card) return false;
  return state.tw.ap >= card.cost && (state.tw.cooldowns[cardId] || 0) === 0;
}
function isCCPCardAvailable(state, cardId) {
  const card = getAllCCPCards().find(c => c.id === cardId);
  if (!card) return false;
  return state.ccp.ap >= card.cost && (state.ccp.cooldowns[cardId] || 0) === 0;
}

// 卡牌對對方是否已揭露
function isCardRevealedToPlayer(state, cardId, cardFaction) {
  if (cardFaction === 'tw') {
    return state.ccp.revealedCards.includes(cardId);
  } else {
    return state.tw.revealedCards.includes(cardId);
  }
}

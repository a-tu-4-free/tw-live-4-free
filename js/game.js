// ============================================================
// game.js — 遊戲狀態、核心邏輯、結局系統
// ============================================================

function createInitialState(mode) {
  return {
    year: 2026, quarter: 1,
    tension: 40,
    gameOver: false, gameOverId: null, winner: null,
    phase: 'action',
    mode: mode || 'vs_ai', // 'vs_ai' | 'two_player'
    activeFaction: 'tw',   // two_player 模式用
    thisQuarterLog: [],
    mapEvents: [],         // 地圖動態事件佇列
    tw: {
      ap: 3, maxAp: 3,
      military: 75, economy: 88, chip: 90, diplomacy: 62,
      morale: 78, intel: 68, resilience: 60, softpower: 55,
      score: 0, cooldowns: {}, infiltrationCleared: 0,
      usedCards: [],
    },
    ccp: {
      ap: 3, maxAp: 3,
      military: 85, economy: 72, cyber: 70, propaganda: 62,
      diplomacy: 68, infiltration: 35, intel: 55,
      score: 0, cooldowns: {},
      infiltrated: { retired_officers: false, legislators: false, journalists: false, students: false },
      usedCards: [],
    },
    log: [], eventHistory: [], turnsPlayed: 0,
  };
}

// ── 數值邊界 ─────────────────────────────────────────────
function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

// ── 套用效果 ─────────────────────────────────────────────
function applyEffects(state, effects) {
  if (!effects) return state;
  const s = deepClone(state);
  for (const [key, delta] of Object.entries(effects)) {
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
  if ((state.tw.cooldowns[cardId] || 0) > 0) return { state, error: `冷卻中，還需 ${state.tw.cooldowns[cardId]} 季` };
  let s = deepClone(state);
  s.tw.ap -= card.cost;
  s = applyEffects(s, card.effects);
  if (card.sideEffects) s = applyEffects(s, card.sideEffects);
  if (card.cooldown) s.tw.cooldowns[cardId] = card.cooldown;
  if (card.special === 'counter_infiltration') s = doCounterIntel(s);
  if (!s.tw.usedCards.includes(cardId)) s.tw.usedCards.push(cardId);
  const entry = { faction: 'tw', text: `▶ ${card.name}：${card.desc}`, quarter: `${s.year}Q${s.quarter}` };
  s.thisQuarterLog.push(entry); s.log.unshift(entry);
  // 地圖事件
  if (card.category === '軍事') s.mapEvents.push({ type: 'tw_military', label: card.name, life: 3 });
  if (card.category === '外交') s.mapEvents.push({ type: 'tw_diplo', label: card.name, life: 2 });
  return { state: s, triggersCCP: card.triggersCCP };
}

// ── 出牌：中共 ───────────────────────────────────────────
function playCCPCard(state, cardId) {
  const card = getAllCCPCards().find(c => c.id === cardId);
  if (!card) return { state, error: '找不到卡牌' };
  if (state.ccp.ap < card.cost) return { state, error: '行動點不足' };
  if ((state.ccp.cooldowns[cardId] || 0) > 0) return { state, error: `冷卻中，還需 ${state.ccp.cooldowns[cardId]} 季` };
  let s = deepClone(state);
  s.ccp.ap -= card.cost;
  s = applyEffects(s, card.effects);
  if (card.sideEffects) s = applyEffects(s, card.sideEffects);
  if (card.cooldown) s.ccp.cooldowns[cardId] = card.cooldown;
  if (card.special && card.special.startsWith('infiltrate_')) {
    s.ccp.infiltrated[card.special.replace('infiltrate_', '')] = true;
  }
  if (!s.ccp.usedCards.includes(cardId)) s.ccp.usedCards.push(cardId);
  const entry = { faction: 'ccp', text: `▶ ${card.name}：${card.desc}`, quarter: `${s.year}Q${s.quarter}` };
  s.thisQuarterLog.push(entry); s.log.unshift(entry);
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
      s.ccp.infiltrated[key] = false; cleared++;
    }
  }
  s.tw.infiltrationCleared += cleared;
  s.ccp.infiltration = clamp(s.ccp.infiltration - cleared * 10);
  const entry = { faction: 'tw',
    text: cleared > 0 ? `✓ 反情報成功，清除 ${cleared} 條滲透線` : '✗ 反情報行動暫未奏效',
    quarter: `${s.year}Q${s.quarter}` };
  s.thisQuarterLog.push(entry); s.log.unshift(entry);
  return s;
}

// ── 中共AI出牌 ───────────────────────────────────────────
function autoCCPTurn(state) {
  let s = deepClone(state);
  let iterations = 0;
  while (s.ccp.ap > 0 && iterations < 8) {
    iterations++;
    const available = getAllCCPCards().filter(c => isCCPCardAvailable(s, c.id));
    if (available.length === 0) break;
    // 策略：緊張低時優先滲透，緊張高時優先軍事
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
    s.eventHistory.push({ id: event.id, title: event.title, quarter: `${s.year}Q${s.quarter}` });
    s.log.unshift({ faction: 'event', text: `⚡ ${event.title}`, quarter: `${s.year}Q${s.quarter}` });
  }
  // 滲透持續傷害
  const activeInfil = Object.values(s.ccp.infiltrated).filter(Boolean).length;
  if (activeInfil > 0) {
    s.tw.military  = clamp(s.tw.military  - activeInfil * 2);
    s.tw.intel     = clamp(s.tw.intel     - activeInfil * 2);
    s.tw.morale    = clamp(s.tw.morale    - activeInfil * 1);
    s.ccp.infiltration = clamp(s.ccp.infiltration + activeInfil * 3);
  }
  // 宣傳持續傷害
  if (s.ccp.propaganda > 70) {
    s.tw.morale     = clamp(s.tw.morale     - 3);
    s.tw.resilience = clamp(s.tw.resilience - 2);
  }
  // 晶片優勢自然紅利
  if (s.tw.chip > 85) {
    s.tw.diplomacy = clamp(s.tw.diplomacy + 1);
    s.tw.economy   = clamp(s.tw.economy   + 1);
  }
  // 緊張衰減
  const dipBonus = s.tw.diplomacy > 75 ? 3 : 1;
  s.tension = clamp(s.tension - dipBonus + (s.ccp.military > 88 ? 2 : 0));
  // 地圖事件生命值遞減
  s.mapEvents = s.mapEvents.map(e => ({ ...e, life: e.life - 1 })).filter(e => e.life > 0);
  // 冷卻 -1
  for (const k of Object.keys(s.tw.cooldowns)) s.tw.cooldowns[k] = Math.max(0, s.tw.cooldowns[k] - 1);
  for (const k of Object.keys(s.ccp.cooldowns)) s.ccp.cooldowns[k] = Math.max(0, s.ccp.cooldowns[k] - 1);
  // 重置AP
  s.tw.ap = s.tw.maxAp; s.ccp.ap = s.ccp.maxAp;
  // two_player：重置到台灣回合
  s.activeFaction = 'tw';
  // 分數
  s.tw.score  = computeTWScore(s);
  s.ccp.score = computeCCPScore(s);
  // 推進時間
  s.turnsPlayed++;
  s.quarter++; if (s.quarter > 4) { s.quarter = 1; s.year++; }
  s.thisQuarterLog = [];
  // 結局判定
  const ending = checkEnding(s);
  if (ending) { s.gameOver = true; s.gameOverId = ending.id; s.winner = ending.winner; }
  return s;
}

// ── 分數計算 ─────────────────────────────────────────────
function computeTWScore(s) {
  return Math.round(
    s.tw.military * 0.18 + s.tw.economy * 0.13 + s.tw.chip * 0.18 +
    s.tw.diplomacy * 0.16 + s.tw.morale * 0.12 + s.tw.intel * 0.11 +
    s.tw.resilience * 0.07 + s.tw.softpower * 0.05
  );
}
function computeCCPScore(s) {
  return Math.round(
    s.ccp.military * 0.25 + s.ccp.cyber * 0.18 + s.ccp.propaganda * 0.15 +
    s.ccp.diplomacy * 0.14 + s.ccp.economy * 0.14 + s.ccp.infiltration * 0.14
  );
}

// ── 8種結局判定 ──────────────────────────────────────────
function checkEnding(s) {
  const t = s.turnsPlayed;
  // 戰爭爆發
  if (s.tension >= 95)
    return { id: 'war', winner: 'crisis' };
  // 台灣從內部瓦解
  if (s.ccp.infiltration >= 88 && s.tw.intel <= 20 && s.tw.morale <= 30)
    return { id: 'collapse', winner: 'ccp' };
  // 士氣崩潰
  if (s.tw.morale <= 12 && s.tw.military <= 20)
    return { id: 'morale_collapse', winner: 'ccp' };
  // 經濟封鎖勝利
  if (s.tw.economy <= 15 && t >= 6)
    return { id: 'economic_siege', winner: 'ccp' };
  // 認知戰勝利
  if (s.ccp.propaganda >= 90 && s.tw.resilience <= 20 && t >= 8)
    return { id: 'cognitive_victory', winner: 'ccp' };
  // 矽盾和平
  if (s.tw.chip >= 92 && s.tw.diplomacy >= 88 && t >= 10)
    return { id: 'silicon_peace', winner: 'tw' };
  // 外交勝利
  if (s.tw.diplomacy >= 90 && s.tw.softpower >= 80 && t >= 10)
    return { id: 'diplomatic_victory', winner: 'tw' };
  // 軍事嚇阻
  if (s.tw.military >= 90 && s.tw.score >= 85 && s.ccp.score <= 52 && t >= 8)
    return { id: 'deterrence', winner: 'tw' };
  // 長期穩定
  if (s.tension <= 12 && t >= 14)
    return { id: 'stable_status_quo', winner: 'tw' };
  return null;
}

// ── 結局資料庫 ───────────────────────────────────────────
const ENDINGS = {
  war: {
    title: '戰爭爆發', icon: '💥', winner: 'crisis',
    headline: '砲聲響起——台海戰爭爆發',
    desc: '兩岸緊張升至無可挽回的臨界點。解放軍開始封鎖，美日介入，第三次世界大戰陰影籠罩全球。',
    flavor: '沒有贏家的戰爭，卻已無法阻止。',
    color: '#3a0800',
  },
  collapse: {
    title: '內部瓦解', icon: '🕳️', winner: 'ccp',
    headline: '台灣從內部崩潰',
    desc: '中共滲透已深入台灣政治、軍事與媒體核心。沒有一槍一炮，台灣的意志已被悄悄掏空。',
    flavor: '最深的傷，永遠來自最近的人。',
    color: '#1a0820',
  },
  morale_collapse: {
    title: '士氣崩潰', icon: '🏳️', winner: 'ccp',
    headline: '民心動搖，抵抗意志瓦解',
    desc: '長期的認知作戰與軍事壓力讓台灣民心渙散，軍隊無力，人民無心。不戰而屈人之兵。',
    flavor: '「他們甚至不需要開槍。」',
    color: '#1e1000',
  },
  economic_siege: {
    title: '經濟封鎖', icon: '⛓️', winner: 'ccp',
    headline: '台灣經濟在封鎖中窒息',
    desc: '中共以經濟手段持續擠壓，供應鏈切斷、金融攻擊接連發動。台灣在沒有子彈的戰爭中敗下陣來。',
    flavor: '餓死不流血，但一樣死。',
    color: '#1a1400',
  },
  cognitive_victory: {
    title: '認知戰勝利', icon: '🧠', winner: 'ccp',
    headline: '現實被重新定義',
    desc: '長達數年的假訊息攻勢、深偽影片、社群操弄，讓台灣社會對自身存在的意義感到懷疑。中共不費一兵一卒。',
    flavor: '當你開始懷疑自己，敵人已經贏了。',
    color: '#150a1a',
  },
  silicon_peace: {
    title: '矽盾和平', icon: '💎', winner: 'tw',
    headline: '晶片外交確立台灣永久地位',
    desc: '台灣的半導體優勢成為全球無可替代的戰略資產。任何侵台行動都意味著全球科技崩潰。中共選擇等待，和平在不確定中延續。',
    flavor: '最強的武器，是讓全世界都需要你。',
    color: '#001430',
  },
  diplomatic_victory: {
    title: '外交勝利', icon: '🌐', winner: 'tw',
    headline: '民主世界與台灣站在一起',
    desc: '多年的外交努力、軟實力輸出與民主典範讓台灣在國際社會建立了難以動搖的道德高地。中共孤立，台灣雖小卻被世界擁抱。',
    flavor: '不是因為我們強，而是因為我們對。',
    color: '#001a20',
  },
  deterrence: {
    title: '軍事嚇阻', icon: '🛡️', winner: 'tw',
    headline: '刺蝟讓獵食者三思',
    desc: '台灣的不對稱戰力、潛艦、無人機與完整的後備體系讓解放軍評估代價過高。台海暫時回歸平靜，但沒有人敢放鬆。',
    flavor: '嚇阻不是勝利，但勝於一戰。',
    color: '#001a10',
  },
  stable_status_quo: {
    title: '現狀穩定', icon: '⚖️', winner: 'tw',
    headline: '不確定的和平，卻是和平',
    desc: '經過漫長的角力，兩岸緊張緩慢降溫。台灣民主愈加鞏固，國際認可雖非正式卻日漸深厚。沒有統一，也沒有戰爭。',
    flavor: '在歷史的縫隙中，台灣找到了自己的位置。',
    color: '#0a1400',
  },
};

// ── 工具 ─────────────────────────────────────────────────
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function getAllTaiwanCards() { return [...TAIWAN_CARDS, ...(typeof CUSTOM_TAIWAN_CARDS !== 'undefined' ? CUSTOM_TAIWAN_CARDS : [])]; }
function getAllCCPCards()    { return [...CCP_CARDS,    ...(typeof CUSTOM_CCP_CARDS    !== 'undefined' ? CUSTOM_CCP_CARDS    : [])]; }
function getCCPCardName(id) { const c = getAllCCPCards().find(c => c.id === id); return c ? c.name : id; }
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

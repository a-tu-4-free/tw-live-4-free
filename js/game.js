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
  // 中共隨時間升級（無限局核心）
  s = applyCCPEscalation(s);

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

// ── 8種結局判定（無限模式：純靠數值，無季數下限）────────
// 結局分三層：
//   即時危機：任何時候都可能觸發（崩潰類）
//   中期結局：需要數值長期積累才夠
//   長線結局：需要多項條件同時達到高峰
function checkEnding(s) {

  // ── 即時危機（隨時都可觸發）────────────────────────────
  // 戰爭爆發：緊張臨界
  if (s.tension >= 95)
    return { id: 'war', winner: 'crisis' };

  // 內部瓦解：滲透全面得手 + 情報與士氣雙雙崩潰
  if (s.ccp.infiltration >= 92 && s.tw.intel <= 15 && s.tw.morale <= 25)
    return { id: 'collapse', winner: 'ccp' };

  // 士氣崩潰：軍心渙散到無法組織抵抗
  if (s.tw.morale <= 8 && s.tw.military <= 18)
    return { id: 'morale_collapse', winner: 'ccp' };

  // ── 中期結局（需要數值長期惡化/積累）───────────────────
  // 經濟窒息：封鎖把台灣餓死，且外交也被孤立
  if (s.tw.economy <= 12 && s.tw.diplomacy <= 30)
    return { id: 'economic_siege', winner: 'ccp' };

  // 認知戰勝利：宣傳機器全開 + 韌性被磨光 + 士氣低迷
  if (s.ccp.propaganda >= 92 && s.tw.resilience <= 15 && s.tw.morale <= 35)
    return { id: 'cognitive_victory', winner: 'ccp' };

  // ── 長線勝利（需要多項指標同時達到高峰）────────────────
  // 矽盾和平：晶片 + 外交 + 經濟三項全部高點
  if (s.tw.chip >= 94 && s.tw.diplomacy >= 90 && s.tw.economy >= 85)
    return { id: 'silicon_peace', winner: 'tw' };

  // 外交勝利：外交 + 軟實力 + 士氣三項全部高點
  if (s.tw.diplomacy >= 92 && s.tw.softpower >= 85 && s.tw.morale >= 80)
    return { id: 'diplomatic_victory', winner: 'tw' };

  // 軍事嚇阻：軍力壓倒 + 整體防禦指數大幅領先
  if (s.tw.military >= 92 && s.tw.score >= 88 && s.ccp.score <= 48)
    return { id: 'deterrence', winner: 'tw' };

  // 長期穩定：緊張極低 + 韌性高 + 社會凝聚
  if (s.tension <= 10 && s.tw.resilience >= 80 && s.tw.morale >= 75)
    return { id: 'stable_status_quo', winner: 'tw' };

  return null;
}

// ── 中共動態消長（無限局核心：會變強也會變弱）──────────
function applyCCPEscalation(state) {
  const s = deepClone(state);
  const yearsIn = Math.floor(s.turnsPlayed / 4);
  const msgs = [];

  // ── 自然成長（軍事現代化持續推進）──────────────────────
  s.ccp.military  = clamp(s.ccp.military  + 1,   0, 95);
  s.ccp.cyber     = clamp(s.ccp.cyber     + 1,   0, 92);
  s.ccp.diplomacy = clamp(s.ccp.diplomacy + 0.5, 0, 90);

  // ── 台灣反制造成的中共衰退 ──────────────────────────────

  // 晶片封鎖：台灣晶片優勢高 → 技術脫鉤傷害中共經濟與研發
  // 係數從 0.12 調降至 0.06，避免晶片路線過於壓制性（勝率從79%降至~65%）
  if (s.tw.chip > 85) {
    const hit = (s.tw.chip - 85) * 0.06;
    s.ccp.economy = clamp(s.ccp.economy - hit);
    s.ccp.cyber   = clamp(s.ccp.cyber   - hit * 0.5);
  }

  // 外交孤立：台灣外交強 → 中共在國際被圍堵，影響力下滑
  if (s.tw.diplomacy > 78) {
    const hit = (s.tw.diplomacy - 78) * 0.1;
    s.ccp.diplomacy = clamp(s.ccp.diplomacy - hit);
  }

  // 反情報成果：有清除滲透記錄 → 宣傳機器效率下降
  if (s.tw.infiltrationCleared > 0) {
    s.ccp.propaganda = clamp(s.ccp.propaganda - s.tw.infiltrationCleared * 0.4);
  }

  // 社會韌性：台灣韌性高 → 認知作戰邊際效益遞減
  if (s.tw.resilience > 72) {
    const hit = (s.tw.resilience - 72) * 0.08;
    s.ccp.propaganda = clamp(s.ccp.propaganda - hit);
  }

  // 軟實力輸出：台灣軟實力高 → 中共敘事被稀釋
  if (s.tw.softpower > 65) {
    s.ccp.propaganda = clamp(s.ccp.propaganda - 0.5);
    s.ccp.diplomacy  = clamp(s.ccp.diplomacy  - 0.3);
  }

  // ── 中共內部壓力 ────────────────────────────────────────

  // 經濟差 → 軍費難以為繼，軍事成長停滯甚至倒退
  if (s.ccp.economy < 55) {
    const drag = (55 - s.ccp.economy) * 0.08;
    s.ccp.military = clamp(s.ccp.military - drag);
  }

  // 經濟崩潰 → 滲透網絡資金斷鏈
  if (s.ccp.economy < 40) {
    s.ccp.infiltration = clamp(s.ccp.infiltration - 2);
    msgs.push('中共經濟惡化，滲透資金縮減');
  }

  // 外交孤立嚴重 → 國際影響力加速萎縮
  if (s.ccp.diplomacy < 45) {
    s.ccp.economy = clamp(s.ccp.economy - 1);
  }

  // ── 每8季大升級（但幅度受經濟狀況影響）────────────────
  if (s.turnsPlayed > 0 && s.turnsPlayed % 8 === 0) {
    const rich  = s.ccp.economy > 65;
    const milUp = rich ? 3 : 1;
    const proUp = rich ? 3 : 1;
    const infUp = rich ? 4 : 2;
    s.ccp.military     = clamp(s.ccp.military     + milUp);
    s.ccp.propaganda   = clamp(s.ccp.propaganda   + proUp);
    s.ccp.infiltration = clamp(s.ccp.infiltration + infUp);
    msgs.push(`中共完成第${yearsIn}年軍事升級${rich ? '' : '（經濟吃緊，幅度縮水）'}`);
  }

  // ── 每12季危機週期 ───────────────────────────────────────
  if (s.turnsPlayed > 0 && s.turnsPlayed % 12 === 0) {
    s.tension = clamp(s.tension + 5);
    msgs.push('新一輪兩岸危機週期，緊張度上升');
  }

  // 寫入日誌
  for (const m of msgs) {
    s.log.unshift({ faction: 'event', text: `⚠️ ${m}`, quarter: `${s.year}Q${s.quarter}` });
  }

  return s;
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

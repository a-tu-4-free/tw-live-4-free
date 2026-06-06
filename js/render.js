// ============================================================
// render.js — 所有DOM渲染函式
// ============================================================

// ── stat bar ─────────────────────────────────────────────
function renderStatBar(label, value, colorClass, hidden) {
  if (hidden || value === null || value === undefined) {
    return `<div class="stat-row">
      <div class="stat-label"><span>${label}</span><span class="stat-hidden">???</span></div>
      <div class="bar-bg"><div class="bar-fill bar-hidden" style="width:30%"></div></div>
    </div>`;
  }
  const v = Math.round(value);
  const lvl = v >= 75 ? 'high' : v >= 45 ? 'mid' : 'low';
  return `<div class="stat-row">
    <div class="stat-label"><span>${label}</span><span class="stat-val sv-${lvl}">${v}</span></div>
    <div class="bar-bg"><div class="bar-fill ${colorClass}" style="width:${v}%"></div></div>
  </div>`;
}

// ── 台灣統計 ─────────────────────────────────────────────
function renderTWStats(state, isOpponent) {
  const t = state.tw;
  const vis = isOpponent ? getVisibleOpponentStats(state, 'ccp') : null;
  const h = (stat) => isOpponent ? vis[stat] === null : false;
  const v = (stat) => isOpponent ? vis[stat] : t[stat];
  return [
    renderStatBar('軍事', v('military'),   'bar-tw',   h('military')),
    renderStatBar('經濟', v('economy'),    'bar-tw',   h('economy')),
    renderStatBar('晶片', v('chip'),       'bar-chip', h('chip')),
    renderStatBar('外交', v('diplomacy'),  'bar-tw',   h('diplomacy')),
    renderStatBar('士氣', v('morale'),     'bar-tw',   h('morale')),
    renderStatBar('情報', v('intel'),      'bar-tw',   h('intel')),
    renderStatBar('韌性', v('resilience'), 'bar-tw',   h('resilience')),
    renderStatBar('軟實力',v('softpower'), 'bar-tw',   h('softpower')),
  ].join('');
}

// ── 中共統計 ─────────────────────────────────────────────
function renderCCPStats(state, isOpponent) {
  const c = state.ccp;
  const vis = isOpponent ? getVisibleOpponentStats(state, 'tw') : null;
  const h = (stat) => isOpponent ? vis[stat] === null : false;
  const v = (stat) => isOpponent ? vis[stat] : c[stat];
  return [
    renderStatBar('軍事',   v('military'),  'bar-ccp', h('military')),
    renderStatBar('經濟',   v('economy'),   'bar-ccp', h('economy')),
    renderStatBar('科技',   v('tech'),      'bar-ccp', h('tech')),
    renderStatBar('外交',   v('diplomacy'), 'bar-ccp', h('diplomacy')),
    renderStatBar('黨心',   v('loyalty'),   'bar-ccp', h('loyalty')),
    renderStatBar('情報',   v('intel'),     'bar-ccp', h('intel')),
    renderStatBar('維穩',   v('stability'), 'bar-ccp', h('stability')),
    renderStatBar('話語權', v('narrative'), 'bar-red', h('narrative')),
  ].join('');
}

// ── 滲透追蹤 ─────────────────────────────────────────────
function renderInfiltrationTracker(state, isOpponent) {
  if (isOpponent) {
    return `<div class="infil-item" style="color:var(--txt2);font-style:italic;">
      🔒 情報不足，滲透狀況未知
    </div>`;
  }
  const lbls = {
    retired_officers: '退役將領',
    legislators:      '立法院',
    journalists:      '媒體線人',
    students:         '校園情報'
  };
  return Object.entries(state.ccp.infiltrated).map(([k, v]) => `
    <div class="infil-item ${v ? 'infil-on' : ''}">
      <span class="infil-dot ${v ? 'dot-on' : 'dot-off'}"></span>
      <span>${lbls[k] || k}</span>
      ${v ? '<span class="infil-tag">已滲透</span>' : ''}
    </div>`).join('');
}

// ── 單張卡牌（小卡）────────────────────────────────────
function renderCard(card, available, faction, cooldown, revealed) {
  // revealed: 對方陣營玩家能否看到這張牌
  // 若 revealed === false → 問號卡
  if (revealed === false) {
    return `<div class="card card-unknown" title="尚未揭露">
      <div class="card-unknown-inner">
        <div style="font-size:28px;">?</div>
        <div style="font-size:10px;color:var(--txt2);margin-top:4px;">未知</div>
      </div>
    </div>`;
  }

  const fc = faction === 'tw' ? 'card-tw' : 'card-ccp';
  const ua = available ? '' : 'card-ua';
  const cd = cooldown > 0 ? `<span class="card-cd">冷卻${cooldown}季</span>` : '';
  const eff = Object.entries(card.effects || {}).map(([k,v]) =>
    `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)}${v>0?'+':''}${v}</span>`).join('');

  return `<div class="card ${fc} ${ua}"
    onclick="window.openCardDetail('${faction}','${card.id}')"
    data-card-id="${card.id}" data-faction="${faction}">
    <div class="card-hd">
      <span class="card-nm">${card.name}</span>
      <span class="card-ap">${card.cost}AP</span>
    </div>
    <div class="card-ct">${card.category}</div>
    <div class="card-ds">${card.desc}</div>
    <div class="card-ef">${eff}</div>
    ${cd}
  </div>`;
}

// ── 大卡（爐石風格彈出）─────────────────────────────────
function renderCardDetail(card, faction, canPlay, cooldown) {
  const fc = faction === 'tw' ? 'detail-tw' : 'detail-ccp';
  const eff = Object.entries(card.effects || {}).map(([k,v]) =>
    `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)} ${v>0?'+':''}${v}</span>`).join('');
  const side = Object.entries(card.sideEffects || {}).map(([k,v]) =>
    `<div class="detail-side"><span class="eff es">${fmtKey(k)} ${v>0?'+':''}${v}</span> <span style="font-size:11px;color:var(--txt2);">副作用</span></div>`).join('');
  const cdWarn = cooldown > 0
    ? `<div class="detail-cd">⏳ 冷卻中，還需 ${cooldown} 季</div>` : '';
  const trigger = card.triggersCCP
    ? `<div class="detail-trigger">⚡ 可能觸發中共反應：${card.triggersCCP}</div>` : '';

  return `
    <div class="card-detail ${fc}">
      <div class="detail-header">
        <span class="detail-name">${card.name}</span>
        <span class="detail-cost">${card.cost} AP</span>
      </div>
      <div class="detail-cat">${card.category}</div>
      <div class="detail-desc">${card.desc}</div>
      <div class="detail-flavor">${card.flavor}</div>
      <div class="detail-effects">${eff}</div>
      ${side}
      ${cdWarn}
      ${trigger}
      <div class="detail-btns">
        ${canPlay
          ? `<button class="detail-play" onclick="window.playFromDetail('${faction}','${card.id}')">出牌</button>`
          : `<button class="detail-play detail-play-disabled" disabled>${cooldown > 0 ? '冷卻中' : 'AP不足'}</button>`}
        <button class="detail-back" onclick="window.closeCardDetail()">收回 ✕</button>
      </div>
    </div>`;
}

// ── 日誌 ─────────────────────────────────────────────────
function renderLog(state) {
  return state.log.slice(0, 35).map(e => {
    const cls = e.faction === 'tw' ? 'lt' : e.faction === 'ccp' ? 'lc' : 'le';
    const ico = e.faction === 'tw' ? '🇹🇼' : e.faction === 'ccp' ? '🇨🇳' : '⚡';
    return `<div class="log-entry ${cls}">[${e.quarter}] ${ico} ${e.text}</div>`;
  }).join('');
}

// ── key formatter ─────────────────────────────────────────
function fmtKey(key) {
  const m = {
    // 台灣欄位
    military:'軍事', economy:'經濟', chip:'晶片', diplomacy:'外交',
    morale:'士氣', intel:'情報', resilience:'韌性', softpower:'軟實力',
    tension:'緊張',
    // 中共欄位（新）
    tech:'科技', loyalty:'黨心', stability:'維穩', narrative:'話語權',
    infiltration:'滲透度',
    // 中共舊欄位（直接顯示中文）
    propaganda:'宣傳', cyber:'網軍',
    // tw_ 前綴
    tw_military:'台灣軍事', tw_economy:'台灣經濟', tw_chip:'台灣晶片',
    tw_diplomacy:'台灣外交', tw_morale:'台灣士氣', tw_intel:'台灣情報',
    tw_resilience:'台灣韌性', tw_softpower:'台灣軟實力',
    // ccp_ 前綴
    ccp_military:'中共軍事', ccp_economy:'中共經濟', ccp_tech:'中共科技',
    ccp_diplomacy:'中共外交', ccp_loyalty:'中共黨心', ccp_intel:'中共情報',
    ccp_stability:'中共維穩', ccp_narrative:'中共話語', ccp_infiltration:'中共滲透',
    ccp_propaganda:'中共宣傳', ccp_cyber:'中共網軍',
  };
  return m[key] || key;
}

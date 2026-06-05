// ============================================================
// render.js — 所有DOM渲染函式
// ============================================================

function renderStatBar(label, value, colorClass) {
  const v = Math.round(value);
  const lvl = v >= 75 ? 'high' : v >= 45 ? 'mid' : 'low';
  return `<div class="stat-row">
    <div class="stat-label"><span>${label}</span><span class="stat-val sv-${lvl}">${v}</span></div>
    <div class="bar-bg"><div class="bar-fill ${colorClass}" style="width:${v}%"></div></div>
  </div>`;
}

function renderTWStats(state) {
  const t = state.tw;
  return [
    renderStatBar('軍事', t.military,   'bar-tw'),
    renderStatBar('經濟', t.economy,    'bar-tw'),
    renderStatBar('晶片', t.chip,       'bar-chip'),
    renderStatBar('外交', t.diplomacy,  'bar-tw'),
    renderStatBar('士氣', t.morale,     'bar-tw'),
    renderStatBar('情報', t.intel,      'bar-tw'),
    renderStatBar('韌性', t.resilience, 'bar-tw'),
    renderStatBar('軟實力', t.softpower,'bar-tw'),
  ].join('');
}

function renderCCPStats(state) {
  const c = state.ccp;
  return [
    renderStatBar('軍事', c.military,   'bar-ccp'),
    renderStatBar('網軍', c.cyber,      'bar-ccp'),
    renderStatBar('宣傳', c.propaganda, 'bar-ccp'),
    renderStatBar('外交', c.diplomacy,  'bar-ccp'),
    renderStatBar('經濟', c.economy,    'bar-ccp'),
    renderStatBar('滲透度', c.infiltration, 'bar-red'),
  ].join('');
}

function renderInfiltrationTracker(state) {
  const lbls = { retired_officers:'退役將領', legislators:'立法院', journalists:'媒體線人', students:'校園情報' };
  return Object.entries(state.ccp.infiltrated).map(([k,v]) => `
    <div class="infil-item ${v ? 'infil-on' : ''}">
      <span class="infil-dot ${v ? 'dot-on' : 'dot-off'}"></span>
      <span>${lbls[k]}</span>
      ${v ? '<span class="infil-tag">已滲透</span>' : ''}
    </div>`).join('');
}

function renderCard(card, available, faction, cooldown) {
  const fc = faction === 'tw' ? 'card-tw' : 'card-ccp';
  const ua = available ? '' : 'card-ua';
  const cd = cooldown > 0 ? `<span class="card-cd">冷卻${cooldown}季</span>` : '';
  const eff = Object.entries(card.effects || {}).map(([k,v]) =>
    `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)}${v>0?'+':''}${v}</span>`).join('');
  const side = Object.entries(card.sideEffects || {}).map(([k,v]) =>
    `<span class="eff es">${fmtKey(k)}${v>0?'+':''}${v}</span>`).join('');
  return `<div class="card ${fc} ${ua}" onclick="${available?`window.onCardClick('${faction}','${card.id}')`:''}">
    <div class="card-hd">
      <span class="card-nm">${card.name}</span>
      <span class="card-ap">${card.cost}AP</span>
    </div>
    <div class="card-ct">${card.category}</div>
    <div class="card-ds">${card.desc}</div>
    <div class="card-ef">${eff}${side}</div>
    ${cd}
    <div class="card-fl">${card.flavor}</div>
  </div>`;
}

function renderLog(state) {
  return state.log.slice(0, 35).map(e => {
    const cls = e.faction === 'tw' ? 'lt' : e.faction === 'ccp' ? 'lc' : 'le';
    const ico = e.faction === 'tw' ? '🇹🇼' : e.faction === 'ccp' ? '🇨🇳' : '⚡';
    return `<div class="log-entry ${cls}">[${e.quarter}] ${ico} ${e.text}</div>`;
  }).join('');
}

function fmtKey(key) {
  const m = {
    military:'軍',economy:'經',chip:'晶',diplomacy:'外',morale:'士氣',intel:'情',
    resilience:'韌',softpower:'軟',tension:'緊張',cyber:'網軍',propaganda:'宣傳',
    infiltration:'滲透',tw_military:'台軍',tw_economy:'台經',tw_chip:'台晶',
    tw_diplomacy:'台外',tw_morale:'台士',tw_intel:'台情',tw_resilience:'台韌',
    tw_softpower:'台軟',ccp_military:'共軍',ccp_economy:'共經',ccp_cyber:'共網',
    ccp_propaganda:'共宣',ccp_diplomacy:'共外',ccp_infiltration:'共滲',
  };
  return m[key] || key;
}

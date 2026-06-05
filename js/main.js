// ============================================================
// main.js — 初始化、事件綁定、UI流程
// ============================================================

let G = null;
let activeTab = { tw: '軍事', ccp: '軍事' };
let pendingCCPTrigger = null;

// ── 初始化 ───────────────────────────────────────────────
function init(mode) {
  G = createInitialState(mode || 'vs_ai');
  G.tw.score  = computeTWScore(G);
  G.ccp.score = computeCCPScore(G);
  renderAll();
  addLog({ faction:'event', text:'遊戲開始。臺灣 vs 中共，守住現狀或被蠶食鯨吞？', quarter:'2026Q1' });
  renderAll();
}

// ── 全域渲染 ─────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderMap();
  renderTWPanel();
  renderCCPPanel();
  renderLogPanel();
  renderModeBar();
  updateScoreLead();
  renderDesktopMap();
}

function updateScoreLead() {
  if (!G) return;
  const tw = Math.round(G.tw.score), ccp = Math.round(G.ccp.score);
  const lead = tw - ccp;
  const el = document.getElementById('score-lead');
  if (el) {
    el.textContent = lead > 0 ? `+${lead}` : `${lead}`;
    el.style.color = lead > 0 ? '#3a9eff' : lead < 0 ? '#e84040' : '#667788';
  }
}

function renderDesktopMap() {
  if (!G) return;
  const dm = document.getElementById('map-container-desktop');
  if (dm && typeof buildMapSVG === 'function') dm.innerHTML = buildMapSVG(G);
}

function renderMap() {
  if (!G) return;
  const m = document.getElementById('map-container');
  if (m && typeof buildMapSVG === 'function') m.innerHTML = buildMapSVG(G);
}

function renderHeader() {
  const t = Math.round(G.tension);
  const color = t < 35 ? '#44bb77' : t < 55 ? '#ffaa33' : t < 75 ? '#ff7733' : '#ff2211';
  const label = t < 35 ? '穩定' : t < 55 ? '緊張' : t < 75 ? '高度緊張' : '戰爭邊緣';
  document.getElementById('tension-fill').style.width = t + '%';
  document.getElementById('tension-fill').style.background = color;
  document.getElementById('tension-lbl').textContent = label;
  document.getElementById('tension-num').textContent = t;
  document.getElementById('hdr-year').textContent = `${G.year} Q${G.quarter}`;
}


function renderTWPanel() {
  const locked = G.mode === 'two_player' && G.activeFaction !== 'tw';
  document.getElementById('tw-ap').textContent = G.tw.ap;
  document.getElementById('tw-score').textContent = Math.round(G.tw.score);
  document.getElementById('tw-stats').innerHTML = renderTWStats(G);
  renderTWCards(locked);
  document.getElementById('tw-panel').classList.toggle('panel-locked', locked);
  document.getElementById('tw-lock-msg').style.display = locked ? 'flex' : 'none';
}

function renderTWCards(locked) {
  const cards = getAllTaiwanCards();
  const cats = [...new Set(cards.map(c => c.category))];
  document.getElementById('tw-tabs').innerHTML = cats.map(cat =>
    `<button class="tb ${activeTab.tw === cat ? 'tb-act tb-tw' : ''}" onclick="setTab('tw','${cat}')">${cat}</button>`
  ).join('');
  const shown = cards.filter(c => c.category === activeTab.tw);
  document.getElementById('tw-cards').innerHTML = shown.map(c => {
    const avail = !locked && isTWCardAvailable(G, c.id);
    const cd = G.tw.cooldowns[c.id] || 0;
    return renderCard(c, avail, 'tw', cd);
  }).join('');
}

function renderCCPPanel() {
  const locked = G.mode === 'two_player' && G.activeFaction !== 'ccp';
  document.getElementById('ccp-ap').textContent = G.ccp.ap;
  document.getElementById('ccp-score').textContent = Math.round(G.ccp.score);
  document.getElementById('ccp-stats').innerHTML = renderCCPStats(G);
  document.getElementById('infil-track').innerHTML = renderInfiltrationTracker(G);
  renderCCPCards(locked);
  document.getElementById('ccp-panel').classList.toggle('panel-locked', locked);
  document.getElementById('ccp-lock-msg').style.display = locked ? 'flex' : 'none';
}

function renderCCPCards(locked) {
  const cards = getAllCCPCards();
  const cats = [...new Set(cards.map(c => c.category))];
  document.getElementById('ccp-tabs').innerHTML = cats.map(cat =>
    `<button class="tb ${activeTab.ccp === cat ? 'tb-act tb-ccp' : ''}" onclick="setTab('ccp','${cat}')">${cat}</button>`
  ).join('');
  const shown = cards.filter(c => c.category === activeTab.ccp);
  document.getElementById('ccp-cards').innerHTML = shown.map(c => {
    const avail = !locked && isCCPCardAvailable(G, c.id);
    const cd = G.ccp.cooldowns[c.id] || 0;
    return renderCard(c, avail, 'ccp', cd);
  }).join('');
}

function renderLogPanel() {
  document.getElementById('log-entries').innerHTML = renderLog(G);
}

function renderModeBar() {
  const el = document.getElementById('mode-bar');
  if (G.mode === 'two_player') {
    const who = G.activeFaction === 'tw' ? '🇹🇼 臺灣行動中' : '🇨🇳 中共行動中';
    const col = G.activeFaction === 'tw' ? '#3a9eff' : '#e84040';
    el.innerHTML = `<span style="color:${col};font-weight:700;">${who}</span>
      <button class="end-turn-btn" onclick="endTurn()">結束回合 →</button>`;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

// ── Tab切換 ──────────────────────────────────────────────
window.setTab = function(faction, cat) {
  activeTab[faction] = cat;
  if (faction === 'tw') renderTWCards(G.mode === 'two_player' && G.activeFaction !== 'tw');
  else renderCCPCards(G.mode === 'two_player' && G.activeFaction !== 'ccp');
};

// ── 出牌 ─────────────────────────────────────────────────
window.onCardClick = function(faction, cardId) {
  if (G.gameOver) return;
  if (G.mode === 'two_player' && G.activeFaction !== faction) {
    showToast('現在不是你的回合！', 'warn'); return;
  }
  if (faction === 'tw') {
    const res = playTaiwanCard(G, cardId);
    if (res.error) { showToast(res.error, 'warn'); return; }
    G = res.state;
    const card = getAllTaiwanCards().find(c => c.id === cardId);
    showToast(`✓ ${card.name}`, 'tw');
    if (res.triggersCCP && G.mode === 'vs_ai') {
      setTimeout(() => {
        const cres = playCCPCard(G, res.triggersCCP);
        if (!cres.error) {
          G = cres.state;
          const cc = getAllCCPCards().find(c => c.id === res.triggersCCP);
          showToast(`⚡ 中共反應：${cc.name}`, 'ccp');
          renderAll(); checkGameOverUI();
        }
      }, 900);
    }
  } else {
    const res = playCCPCard(G, cardId);
    if (res.error) { showToast(res.error, 'warn'); return; }
    G = res.state;
    const card = getAllCCPCards().find(c => c.id === cardId);
    showToast(`✓ ${card.name}`, 'ccp');
  }
  renderAll(); checkGameOverUI();
};

// ── Two-player 結束回合 ───────────────────────────────────
window.endTurn = function() {
  if (G.activeFaction === 'tw') {
    G.activeFaction = 'ccp';
    showToast('中共玩家，輪到你了', 'ccp');
  } else {
    G.activeFaction = 'tw';
    doNextQuarter();
    return;
  }
  renderAll();
};

// ── 推進下一季 ───────────────────────────────────────────
window.nextQuarter = function() {
  if (G.gameOver) return;
  if (G.mode === 'vs_ai') {
    G = autoCCPTurn(G);
    doNextQuarter();
  } else {
    showToast('請先結束雙方回合', 'warn');
  }
};

function doNextQuarter() {
  const event = drawRandomEvent(G);
  showEventModal(event, () => {
    G = resolveEndOfQuarter(G, event);
    renderAll();
    checkGameOverUI();
    showToast(`${G.year - (G.quarter===1?0:0)}年 Q${G.quarter===1?4:G.quarter-1} 結算完成`, 'event');
  });
}

// ── 事件彈窗 ─────────────────────────────────────────────
function showEventModal(event, onConfirm) {
  const m = document.getElementById('ev-modal');
  document.getElementById('ev-title').textContent = event.title;
  document.getElementById('ev-body').textContent = event.body;
  document.getElementById('ev-efx').innerHTML = Object.entries(event.effects || {}).map(([k,v]) =>
    `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)} ${v>0?'+':''}${v}</span>`).join('');
  m.classList.add('mopen');
  document.getElementById('ev-ok').onclick = () => { m.classList.remove('mopen'); onConfirm(); };
}

// ── 遊戲結束UI ───────────────────────────────────────────
function checkGameOverUI() {
  if (!G.gameOver) return;
  const e = ENDINGS[G.gameOverId] || ENDINGS['war'];
  const m = document.getElementById('go-modal');
  document.getElementById('go-icon').textContent = e.icon;
  document.getElementById('go-title').textContent = e.title;
  document.getElementById('go-headline').textContent = e.headline;
  document.getElementById('go-desc').textContent = e.desc;
  document.getElementById('go-flavor').textContent = e.flavor;
  document.getElementById('go-stats').innerHTML =
    `臺灣 <strong style="color:#3a9eff">${Math.round(G.tw.score)}</strong> 　
     中共 <strong style="color:#e84040">${Math.round(G.ccp.score)}</strong> 　
     ${G.turnsPlayed} 季 · ${G.year}年`;
  m.style.setProperty('--go-bg', e.color);
  m.classList.add('mopen');
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast t-${type||'info'} tshow`;
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('tshow'), 2600);
}

// ── Log追加 ───────────────────────────────────────────────
function addLog(e) {
  G.log.unshift(e); if (G.log.length > 40) G.log.pop();
  renderLogPanel();
}

// ── 重新開始 / 模式選擇 ──────────────────────────────────
window.restartGame  = () => { document.getElementById('go-modal').classList.remove('mopen'); showModeSelect(); };
window.showModeSelect = () => { document.getElementById('mode-modal').classList.add('mopen'); };
window.startMode = (mode) => { document.getElementById('mode-modal').classList.remove('mopen'); init(mode); };

// ── 啟動 ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => showModeSelect());


// ============================================================
// main.js — 初始化、事件綁定、UI流程
// ============================================================

let G = null;
let activeTab = { tw: '軍事', ccp: '軍事' };

// ── 初始化 ───────────────────────────────────────────────
function init(playerFaction) {
  G = createInitialState(playerFaction || 'tw');
  G.tw.score  = computeTWScore(G);
  G.ccp.score = computeCCPScore(G);
  const factionName = playerFaction === 'ccp' ? '中共' : '臺灣';
  renderAll();
  addLog({
    faction: 'event',
    text: `遊戲開始，你扮演【${factionName}】。對方行動一開始全部隱藏。`,
    quarter: '2026Q1'
  });
  renderAll();
}

// ── 全域渲染 ─────────────────────────────────────────────
function renderAll() {
  if (!G) return;
  renderHeader();
  renderMap();
  renderLeftPanel();
  renderRightPanel();
  renderCenterPanel();
  renderLogPanel();
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

function renderMap() {
  if (!G) return;
  const m = document.getElementById('map-container');
  if (m) m.innerHTML = buildMapSVG(G);
  const dm = document.getElementById('map-container-desktop');
  if (dm) dm.innerHTML = buildMapSVG(G);
}

// ── 左欄：玩家陣營 ───────────────────────────────────────
function renderLeftPanel() {
  const isTW = G.playerFaction === 'tw';
  const panel = document.getElementById('left-panel');
  const apEl  = document.getElementById('left-ap');
  const scoreEl = document.getElementById('left-score');

  if (isTW) {
    panel.className = 'panel panel-tw-active';
    document.getElementById('left-title').innerHTML =
      `🇹🇼 臺灣 <span style="font-size:11px;color:var(--txt2);">（你）</span>`;
    apEl.className = 'ap-badge ap-tw';
    apEl.innerHTML = `AP <span id="left-ap-num">${G.tw.ap}</span>`;
    scoreEl.className = 'big-score bs-tw';
    scoreEl.textContent = Math.round(G.tw.score);
    document.getElementById('left-stats').innerHTML = renderTWStats(G, false);
    renderPlayerCards('tw');
  } else {
    panel.className = 'panel panel-ccp-active';
    document.getElementById('left-title').innerHTML =
      `🇨🇳 中共 <span style="font-size:11px;color:var(--txt2);">（你）</span>`;
    apEl.className = 'ap-badge ap-ccp';
    apEl.innerHTML = `AP <span id="left-ap-num">${G.ccp.ap}</span>`;
    scoreEl.className = 'big-score bs-ccp';
    scoreEl.textContent = Math.round(G.ccp.score);
    document.getElementById('left-stats').innerHTML = renderCCPStats(G, false);
    document.getElementById('left-infil').style.display = 'block';
    document.getElementById('left-infil-track').innerHTML = renderInfiltrationTracker(G, false);
    renderPlayerCards('ccp');
  }
}

// ── 右欄：對手陣營 ───────────────────────────────────────
function renderRightPanel() {
  const isTW = G.playerFaction === 'tw';
  const opponentFaction = isTW ? 'ccp' : 'tw';
  const panel = document.getElementById('right-panel');
  const scoreEl = document.getElementById('right-score');

  if (isTW) {
    panel.className = 'panel panel-ccp-side';
    document.getElementById('right-title').innerHTML =
      `🇨🇳 中共 <span style="font-size:11px;color:var(--txt2);">（AI）</span>`;
    document.getElementById('right-ap').innerHTML = `AP <span>?</span>`;
    document.getElementById('right-ap').className = 'ap-badge ap-ccp';
    scoreEl.className = 'big-score bs-ccp';
    scoreEl.textContent = G.tw.intel >= 60 ? Math.round(G.ccp.score) : '???';
    document.getElementById('right-stats').innerHTML = renderCCPStats(G, true);
    document.getElementById('right-infil').style.display = 'block';
    document.getElementById('right-infil-track').innerHTML = renderInfiltrationTracker(G, true);
  } else {
    panel.className = 'panel panel-tw-side';
    document.getElementById('right-title').innerHTML =
      `🇹🇼 臺灣 <span style="font-size:11px;color:var(--txt2);">（AI）</span>`;
    document.getElementById('right-ap').innerHTML = `AP <span>?</span>`;
    document.getElementById('right-ap').className = 'ap-badge ap-tw';
    scoreEl.className = 'big-score bs-tw';
    scoreEl.textContent = G.ccp.intel >= 60 ? Math.round(G.tw.score) : '???';
    document.getElementById('right-stats').innerHTML = renderTWStats(G, true);
    document.getElementById('right-infil').style.display = 'none';
  }

  renderOpponentCards(opponentFaction);
}

// ── 玩家卡牌（可出牌）────────────────────────────────────
function renderPlayerCards(faction) {
  const cards = faction === 'tw' ? getAllTaiwanCards() : getAllCCPCards();
  const cats  = [...new Set(cards.map(c => c.category))];
  const tab   = activeTab[faction];

  document.getElementById('left-tabs').innerHTML = cats.map(cat =>
    `<button class="tb ${tab === cat ? (faction==='tw'?'tb-act tb-tw':'tb-act tb-ccp') : ''}"
      onclick="setTab('${faction}','${cat}')">${cat}</button>`
  ).join('');

  const shown = cards.filter(c => c.category === tab);
  document.getElementById('left-cards').innerHTML = shown.map(c => {
    const avail = faction === 'tw'
      ? isTWCardAvailable(G, c.id)
      : isCCPCardAvailable(G, c.id);
    const cd = faction === 'tw'
      ? (G.tw.cooldowns[c.id] || 0)
      : (G.ccp.cooldowns[c.id] || 0);
    return renderCard(c, avail, faction, cd, true);
  }).join('');
}

// ── 對手卡牌（問號/揭露）────────────────────────────────
function renderOpponentCards(faction) {
  const cards = faction === 'tw' ? getAllTaiwanCards() : getAllCCPCards();
  const cats  = [...new Set(cards.map(c => c.category))];
  const tab   = activeTab[faction];
  const revealedList = faction === 'tw'
    ? G.ccp.revealedCards   // 中共已看到哪些台灣牌
    : G.tw.revealedCards;   // 台灣已看到哪些中共牌

  document.getElementById('right-tabs').innerHTML = cats.map(cat =>
    `<button class="tb ${tab === cat ? (faction==='ccp'?'tb-act tb-ccp':'tb-act tb-tw') : ''}"
      onclick="setTab('${faction}','${cat}')">${cat}</button>`
  ).join('');

  const shown = cards.filter(c => c.category === tab);
  document.getElementById('right-cards').innerHTML = shown.map(c => {
    const revealed = revealedList.includes(c.id);
    return renderCard(c, false, faction, 0, revealed);
  }).join('');
}

// ── 中央面板 ─────────────────────────────────────────────
function renderCenterPanel() {
  const tw  = Math.round(G.tw.score);
  const ccp = Math.round(G.ccp.score);
  const lead = G.playerFaction === 'tw' ? tw - ccp : ccp - tw;
  document.getElementById('score-tw').textContent  = tw;
  document.getElementById('score-ccp').textContent = ccp;
  const el = document.getElementById('score-lead');
  el.textContent = lead > 0 ? `+${lead}` : `${lead}`;
  el.style.color = lead > 0 ? '#44cc88' : lead < 0 ? '#ff4433' : '#667788';
}

function renderLogPanel() {
  document.getElementById('log-entries').innerHTML = renderLog(G);
}

function addLog(e) {
  G.log.unshift(e);
  if (G.log.length > 40) G.log.pop();
  renderLogPanel();
}

// ── Tab切換 ──────────────────────────────────────────────
window.setTab = function(faction, cat) {
  activeTab[faction] = cat;
  if (faction === G.playerFaction) renderPlayerCards(faction);
  else renderOpponentCards(faction);
};

// ── 大卡彈出（爐石風格）─────────────────────────────────
window.openCardDetail = function(faction, cardId) {
  const card = faction === 'tw'
    ? getAllTaiwanCards().find(c => c.id === cardId)
    : getAllCCPCards().find(c => c.id === cardId);
  if (!card) return;

  // 只有玩家自己的牌可以互動
  if (faction !== G.playerFaction) return;

  const canPlay = faction === 'tw'
    ? isTWCardAvailable(G, cardId)
    : isCCPCardAvailable(G, cardId);
  const cd = faction === 'tw'
    ? (G.tw.cooldowns[cardId] || 0)
    : (G.ccp.cooldowns[cardId] || 0);

  const overlay = document.getElementById('card-detail-overlay');
  document.getElementById('card-detail-content').innerHTML =
    renderCardDetail(card, faction, canPlay, cd);
  overlay.classList.add('mopen');
};

window.closeCardDetail = function() {
  document.getElementById('card-detail-overlay').classList.remove('mopen');
};

window.playFromDetail = function(faction, cardId) {
  window.closeCardDetail();
  window.onCardClick(faction, cardId);
};

// ── 出牌 ─────────────────────────────────────────────────
window.onCardClick = function(faction, cardId) {
  if (G.gameOver) return;
  if (faction !== G.playerFaction) return;

  if (faction === 'tw') {
    const res = playTaiwanCard(G, cardId);
    if (res.error) { showToast(res.error, 'warn'); return; }
    G = res.state;
    const card = getAllTaiwanCards().find(c => c.id === cardId);
    showToast(`✓ ${card.name}`, 'tw');
    if (res.triggersCCP) {
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

// ── 推進下一季 ───────────────────────────────────────────
window.nextQuarter = function() {
  if (G.gameOver) return;
  // AI出剩餘AP
  if (G.playerFaction === 'tw') {
    G = autoCCPTurn(G);
  } else {
    G = autoTWTurn(G);
  }
  const event = drawRandomEvent(G);
  showEventModal(event, () => {
    G = resolveEndOfQuarter(G, event);
    renderAll();
    checkGameOverUI();
    showToast('季末結算完成', 'event');
    setTimeout(() => maybeShowAdvisor(), 600);
  });
};

// ── 事件彈窗 ─────────────────────────────────────────────
function showEventModal(event, onConfirm) {
  const m = document.getElementById('ev-modal');
  document.getElementById('ev-title').textContent = event.title;
  document.getElementById('ev-body').textContent  = event.body;
  document.getElementById('ev-efx').innerHTML = Object.entries(event.effects || {}).map(([k,v]) =>
    `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)} ${v>0?'+':''}${v}</span>`).join('');
  m.classList.add('mopen');
  document.getElementById('ev-ok').onclick = () => {
    m.classList.remove('mopen');
    onConfirm();
  };
}

// ── 遊戲結束UI ───────────────────────────────────────────
function checkGameOverUI() {
  if (!G.gameOver) return;
  const e = ENDINGS[G.gameOverId] || ENDINGS['war'];
  const m = document.getElementById('go-modal');
  document.getElementById('go-icon').textContent     = e.icon;
  document.getElementById('go-title').textContent    = e.title;
  document.getElementById('go-headline').textContent = e.headline;
  document.getElementById('go-desc').textContent     = e.desc;
  document.getElementById('go-flavor').textContent   = e.flavor;
  document.getElementById('go-stats').innerHTML =
    `臺灣 <strong style="color:#3a9eff">${Math.round(G.tw.score)}</strong>
     中共 <strong style="color:#e84040">${Math.round(G.ccp.score)}</strong>
     ${G.turnsPlayed} 季 · ${G.year}年`;
  m.style.setProperty('--go-bg', e.color || '#001430');
  m.classList.add('mopen');
}

// ── 軍師系統 ─────────────────────────────────────────────
function maybeShowAdvisor() {
  if (!G || G.gameOver) return;
  const result = drawAdvisor(G.turnsPlayed);
  if (!result) return;
  showAdvisorModal(result);
}

function showAdvisorModal({ advisor, choices, isProCCP }) {
  const m = document.getElementById('advisor-modal');
  document.getElementById('adv-avatar').textContent   = advisor.avatar;
  document.getElementById('adv-name').textContent     = advisor.name;
  document.getElementById('adv-fullname').textContent = advisor.fullName;
  document.getElementById('adv-type').textContent     = isProCCP ? '⚠️ 來路可疑的軍師' : '✅ 可信任的軍師';
  document.getElementById('adv-type').style.color     = isProCCP ? '#ffaa33' : '#44cc88';
  document.getElementById('adv-intro').textContent    = advisor.intro;

  document.getElementById('adv-choices').innerHTML = choices.map((card, i) => {
    const effStr = Object.entries(card.effects || {}).map(([k,v]) =>
      `<span class="eff ${v>0?'ep':'en'}">${fmtKey(k)} ${v>0?'+':''}${v}</span>`).join('');
    return `<div class="adv-card ${card.realEffect ? 'adv-real' : 'adv-fake'}"
      onclick="window.pickAdvisorCard(${i})">
      <div class="adv-card-name">${card.name}</div>
      <div class="adv-card-desc">${card.desc}</div>
      <div class="card-ef" style="margin-top:4px">${effStr}</div>
    </div>`;
  }).join('');

  window._advisorChoices = choices;
  m.classList.add('mopen');
}

window.pickAdvisorCard = function(idx) {
  const card = window._advisorChoices[idx];
  if (!card) return;
  if (!card.realEffect) {
    showToast(card.warning || '⚠️ 這是陷阱！', 'warn');
    setTimeout(() => {
      G = applyAdvisorCard(G, card);
      G.log.unshift({ faction:'ccp', text:`☠️ 中共偽裝建議：${card.name} 造成傷害`, quarter:`${G.year}Q${G.quarter}` });
      renderAll(); checkGameOverUI();
    }, 800);
  } else {
    G = applyAdvisorCard(G, card);
    G.log.unshift({ faction:'tw', text:`💡 軍師建議：${card.name}`, quarter:`${G.year}Q${G.quarter}` });
    showToast(`✓ 採納建議：${card.name}`, 'tw');
    renderAll(); checkGameOverUI();
  }
  document.getElementById('advisor-modal').classList.remove('mopen');
};

window.skipAdvisor = function() {
  document.getElementById('advisor-modal').classList.remove('mopen');
  showToast('忽略軍師建議', 'event');
};

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast t-${type||'info'} tshow`;
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('tshow'), 2600);
}

// ── 重啟 ─────────────────────────────────────────────────
window.restartGame = () => {
  document.getElementById('go-modal').classList.remove('mopen');
  document.getElementById('mode-modal').classList.add('mopen');
};
window.startMode = (faction) => {
  document.getElementById('mode-modal').classList.remove('mopen');
  init(faction);
};

// ── 啟動 ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mode-modal').classList.add('mopen');
});

// ============================================================
// map.js — 台海地圖（Leaflet.js + ESRI衛星圖）
// 真實衛星底圖，疊加遊戲動態標示
// ============================================================

let _leafletMap = null;
let _gameLayer = null;
let _mapInitialized = false;

// ── 初始化 Leaflet 地圖 ──────────────────────────────────
function initLeafletMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 避免重複初始化
  if (container._leaflet_id) {
    if (_leafletMap) {
      updateGameLayer();
    }
    return;
  }

  // 台海中心座標，縮放等級提高到7讓圖磚更清晰
  _leafletMap = L.map(containerId, {
    center: [23.8, 120.5],
    zoom: 7,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
  });

  // ESRI 世界衛星圖
  L.tileLayer(
    'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    {
      maxZoom: 10,
      minZoom: 5,
      attribution: 'Tiles © Esri',
    }
  ).addTo(_leafletMap);

  // 遊戲標示層
  _gameLayer = L.layerGroup().addTo(_leafletMap);

  _mapInitialized = true;
  updateGameLayer();
}

// ── 更新遊戲標示（依遊戲狀態）────────────────────────────
function updateGameLayer() {
  if (!_leafletMap || !_gameLayer) return;
  _gameLayer.clearLayers();

  if (!window.G) return;
  const state = window.G;
  const t = state.tension;
  const inf = state.ccp.infiltrated;

  // ── 台灣本島標示 ─────────────────────────────────────
  const twScore = Math.round(state.tw.score);
  const twColor = twScore >= 70 ? '#44cc88' : twScore >= 50 ? '#ffaa33' : '#ff4433';

  const twMarker = L.circleMarker([25.04, 121.51], {
    radius: 14,
    fillColor: '#3a9eff',
    fillOpacity: 0.25,
    color: '#3a9eff',
    weight: 2,
    opacity: 0.8,
  }).addTo(_gameLayer);
  twMarker.bindTooltip('🇹🇼 臺灣', { permanent: true, direction: 'right', className: 'map-tooltip-tw' });

  // 台北
  L.circleMarker([25.04, 121.51], {
    radius: 5, fillColor: '#3a9eff', fillOpacity: 0.9,
    color: '#fff', weight: 1.5, opacity: 1,
  }).addTo(_gameLayer);

  // 高雄
  L.circleMarker([22.62, 120.30], {
    radius: 4, fillColor: '#3a9eff', fillOpacity: 0.8,
    color: '#fff', weight: 1, opacity: 0.9,
  }).addTo(_gameLayer).bindTooltip('高雄', { className: 'map-tooltip-sm' });

  // 台中
  L.circleMarker([24.15, 120.68], {
    radius: 3.5, fillColor: '#3a9eff', fillOpacity: 0.7,
    color: '#fff', weight: 1,
  }).addTo(_gameLayer).bindTooltip('台中', { className: 'map-tooltip-sm' });

  // ── 金門 ─────────────────────────────────────────────
  L.circleMarker([24.44, 118.32], {
    radius: 5, fillColor: '#44cc88', fillOpacity: 0.85,
    color: '#fff', weight: 1.5,
  }).addTo(_gameLayer).bindTooltip('金門', { permanent: true, direction: 'bottom', className: 'map-tooltip-island' });

  // ── 馬祖 ─────────────────────────────────────────────
  L.circleMarker([26.17, 119.93], {
    radius: 4, fillColor: '#44cc88', fillOpacity: 0.85,
    color: '#fff', weight: 1.5,
  }).addTo(_gameLayer).bindTooltip('馬祖', { permanent: true, direction: 'right', className: 'map-tooltip-island' });

  // ── 澎湖 ─────────────────────────────────────────────
  L.circleMarker([23.57, 119.58], {
    radius: 4.5, fillColor: '#44cc88', fillOpacity: 0.85,
    color: '#fff', weight: 1.5,
  }).addTo(_gameLayer).bindTooltip('澎湖', { permanent: true, direction: 'left', className: 'map-tooltip-island' });

  // ── 台灣防禦圈（依軍事值）────────────────────────────
  const defenseRadius = 80000 + state.tw.military * 1500;
  L.circle([23.8, 120.9], {
    radius: defenseRadius,
    fillColor: '#3a9eff',
    fillOpacity: 0.05,
    color: '#3a9eff',
    weight: 1,
    opacity: 0.3,
    dashArray: '6, 6',
  }).addTo(_gameLayer);

  // ── 中共軍事威脅（依緊張度）──────────────────────────

  // 廈門（對金門的威脅點）
  if (t >= 45) {
    const ccpAlpha = Math.min(0.85, (t - 45) / 60 + 0.2);
    L.circleMarker([24.48, 118.08], {
      radius: 6 + t / 20,
      fillColor: '#e84040',
      fillOpacity: ccpAlpha * 0.6,
      color: '#e84040',
      weight: 2,
      opacity: ccpAlpha,
    }).addTo(_gameLayer).bindTooltip('🇨🇳 廈門軍區', { className: 'map-tooltip-ccp' });
  }

  // 福州（台北對面）
  if (t >= 50) {
    L.circleMarker([26.07, 119.30], {
      radius: 5 + t / 25,
      fillColor: '#e84040',
      fillOpacity: 0.5,
      color: '#e84040',
      weight: 1.5,
      opacity: 0.7,
    }).addTo(_gameLayer).bindTooltip('福州', { className: 'map-tooltip-sm' });
  }

  // 解放軍威脅圈（緊張高時擴大）
  if (t >= 40) {
    const threatRadius = 150000 + t * 3000;
    L.circle([24.48, 118.50], {
      radius: threatRadius,
      fillColor: '#e84040',
      fillOpacity: Math.min(0.12, t * 0.0015),
      color: '#e84040',
      weight: 1,
      opacity: Math.min(0.5, t * 0.006),
      dashArray: '4, 8',
    }).addTo(_gameLayer);
  }

  // ── 飛彈軌跡線（緊張≥70）────────────────────────────
  if (t >= 70) {
    const missileLine = L.polyline(
      [[24.48, 118.08], [25.04, 121.51]],
      { color: '#ff5500', weight: 2, opacity: 0.7, dashArray: '8, 6' }
    ).addTo(_gameLayer);

    // 第二條（南部）
    L.polyline(
      [[24.00, 118.20], [22.62, 120.30]],
      { color: '#ff5500', weight: 1.5, opacity: 0.5, dashArray: '6, 6' }
    ).addTo(_gameLayer);
  }

  // ── 美軍存在（外交高時）──────────────────────────────
  if (state.tw.diplomacy >= 68) {
    // 沖繩美軍
    L.circleMarker([26.33, 127.80], {
      radius: 6,
      fillColor: '#2244aa',
      fillOpacity: 0.7,
      color: '#4488ff',
      weight: 2,
      opacity: 0.9,
    }).addTo(_gameLayer).bindTooltip('🇺🇸 沖繩美軍', { className: 'map-tooltip-us' });

    // 美軍連線
    L.polyline(
      [[26.33, 127.80], [25.04, 121.51]],
      { color: '#4488ff', weight: 1, opacity: 0.3, dashArray: '5, 8' }
    ).addTo(_gameLayer);
  }

  // ── 滲透標示（紅色閃爍點疊加）───────────────────────
  // 在 Leaflet 裡用 DivIcon 做閃爍效果
  const infiltrateLocations = {
    retired_officers: { latlng: [25.04, 121.51], label: '退將滲透' },
    legislators:      { latlng: [25.04, 121.55], label: '立法院' },
    journalists:      { latlng: [25.00, 121.53], label: '媒體滲透' },
    students:         { latlng: [25.02, 121.48], label: '校園' },
  };

  Object.entries(inf).forEach(([key, active]) => {
    if (!active) return;
    const loc = infiltrateLocations[key];
    if (!loc) return;
    const icon = L.divIcon({
      className: '',
      html: `<div class="infil-pulse-dot" title="${loc.label}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker(loc.latlng, { icon }).addTo(_gameLayer);
  });

  // ── 中共滲透圈（滲透度高時）──────────────────────────
  if (state.ccp.infiltration >= 50) {
    const infAlpha = (state.ccp.infiltration - 50) / 60;
    L.circle([25.04, 121.51], {
      radius: 40000,
      fillColor: '#e84040',
      fillOpacity: infAlpha * 0.1,
      color: '#e84040',
      weight: 1,
      opacity: infAlpha * 0.4,
      dashArray: '3, 6',
    }).addTo(_gameLayer);
  }

  // ── 緊張度指示條（地圖右下角）────────────────────────
  // 用 Leaflet Control
  if (!_leafletMap._tensionControl) {
    const TensionControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'map-tension-hud');
        div.id = 'map-tension-hud';
        return div;
      }
    });
    _leafletMap._tensionControl = new TensionControl({ position: 'bottomleft' });
    _leafletMap._tensionControl.addTo(_leafletMap);
  }
  const hudEl = document.getElementById('map-tension-hud');
  if (hudEl) {
    const tColor = t < 35 ? '#44bb77' : t < 55 ? '#ffaa33' : t < 75 ? '#ff7733' : '#ff2211';
    const tLabel = t < 35 ? '和緩 😴' : t < 55 ? '緊張 😰' : t < 75 ? '高度緊張 😱' : '戰爭邊緣 💥';
    hudEl.innerHTML = `
      <div class="hud-row"><span class="hud-label">兩岸緊張</span><span class="hud-val" style="color:${tColor}">${Math.round(t)}</span></div>
      <div class="hud-bar-bg"><div class="hud-bar-fill" style="width:${t}%;background:${tColor}"></div></div>
      <div class="hud-status" style="color:${tColor}">${tLabel}</div>
    `;
  }
}

// ── 主入口：buildMapSVG 相容舊介面 ──────────────────────
// 但現在改成初始化 Leaflet，不再回傳 SVG
function buildMapSVG(state) {
  // 存全域讓 updateGameLayer 用
  window.G = state;

  // 找到可用的容器
  const ids = ['map-container', 'map-container-desktop'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.offsetParent === null) return; // 不可見就跳過
    if (!el._leafletInited) {
      el._leafletInited = true;
      // 動態載入 Leaflet（如果還沒載入）
      ensureLeaflet(() => initLeafletMap(id));
    } else {
      // 已初始化，只更新標示
      if (_leafletMap) updateGameLayer();
    }
  });

  // 回傳空字串（不再用 SVG innerHTML）
  return '';
}

// ── 確保 Leaflet 已載入 ──────────────────────────────────
function ensureLeaflet(callback) {
  if (window.L) { callback(); return; }

  // 載入 CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
  }

  // 載入 JS
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

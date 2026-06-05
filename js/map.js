// ============================================================
// map.js — 台海地圖 SVG 視覺化
// ============================================================

function buildMapSVG(state) {
  const tension = state.tension;
  const infiltrated = state.ccp.infiltrated;
  const mapEvents  = state.mapEvents || [];

  // 緊張度顏色
  const seaColor = tension < 40 ? '#0a2a4a'
                 : tension < 65 ? '#1a2a0a'
                 : tension < 80 ? '#2a1a0a'
                 : '#2a0808';
  const seaGlow  = tension < 40 ? '#1a5aaa'
                 : tension < 65 ? '#4a6a1a'
                 : tension < 80 ? '#aa5a1a'
                 : '#cc2211';

  // 地圖事件指示器
  const twMilActive  = mapEvents.some(e => e.type === 'tw_military');
  const ccpMilActive = mapEvents.some(e => e.type === 'ccp_military');
  const ccpInfActive = mapEvents.some(e => e.type === 'ccp_infiltrate');
  const ccpCyberActive = mapEvents.some(e => e.type === 'ccp_cyber');
  const twDiploActive  = mapEvents.some(e => e.type === 'tw_diplo');

  // 飛彈線條（緊張高時顯示）
  const missileLines = tension > 65 ? `
    <line x1="105" y1="185" x2="188" y2="145" stroke="#ff4400" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7">
      <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.8s" repeatCount="indefinite"/>
    </line>
    <line x1="110" y1="200" x2="190" y2="165" stroke="#ff4400" stroke-width="1" stroke-dasharray="3,3" opacity="0.5">
      <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.1s" repeatCount="indefinite"/>
    </line>` : '';

  // 軍艦圖標（緊張高時）
  const warships = tension > 55 ? `
    <g opacity="0.85">
      <rect x="130" y="188" width="18" height="7" rx="3" fill="#cc3311"/>
      <rect x="132" y="183" width="4" height="5" rx="1" fill="#cc3311"/>
      <text x="139" y="194" font-size="5" fill="#ffaa88" text-anchor="middle">艦</text>
    </g>
    <g opacity="0.7">
      <rect x="155" y="200" width="16" height="6" rx="2" fill="#cc3311"/>
      <text x="163" y="205" font-size="4" fill="#ffaa88" text-anchor="middle">艦</text>
    </g>` : '';

  // 美艦（台灣分數高時）
  const usWarship = state.tw.diplomacy > 70 ? `
    <g opacity="0.8">
      <rect x="238" y="155" width="16" height="6" rx="2" fill="#1155cc"/>
      <text x="246" y="160" font-size="4" fill="#aaccff" text-anchor="middle">US</text>
    </g>` : '';

  // 滲透指示（閃爍紅點）
  const infiltrationDots = [
    infiltrated.retired_officers ? `<circle cx="208" cy="132" r="4" fill="#ff3300" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite"/></circle><text x="214" y="135" font-size="6" fill="#ff8866">退將</text>` : '',
    infiltrated.legislators      ? `<circle cx="200" cy="142" r="4" fill="#ff3300" opacity="0.85"><animate attributeName="opacity" values="0.85;0.3;0.85" dur="1.8s" repeatCount="indefinite"/></circle><text x="206" y="145" font-size="6" fill="#ff8866">議員</text>` : '',
    infiltrated.journalists      ? `<circle cx="212" cy="148" r="3.5" fill="#ff5500" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/></circle><text x="218" y="151" font-size="6" fill="#ff8866">媒體</text>` : '',
    infiltrated.students         ? `<circle cx="204" cy="155" r="3" fill="#ff7700" opacity="0.75"><animate attributeName="opacity" values="0.75;0.2;0.75" dur="2.3s" repeatCount="indefinite"/></circle><text x="210" y="158" font-size="6" fill="#ff8866">學生</text>` : '',
  ].join('');

  // 行動脈衝圈
  const twMilPulse = twMilActive ? `<circle cx="205" cy="145" r="18" fill="none" stroke="#3a9eff" stroke-width="2" opacity="0.6"><animate attributeName="r" values="12;24;12" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite"/></circle>` : '';
  const ccpMilPulse = ccpMilActive ? `<circle cx="90" cy="165" r="22" fill="none" stroke="#ff3300" stroke-width="2" opacity="0.6"><animate attributeName="r" values="14;26;14" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite"/></circle>` : '';
  const cyberPulse = ccpCyberActive ? `<circle cx="130" cy="170" r="16" fill="none" stroke="#aa22ff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.7"><animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite"/></circle>` : '';

  // 事件標籤
  const eventLabels = mapEvents.slice(0, 3).map((e, i) => {
    const col = e.type.startsWith('tw') ? '#44aaff' : '#ff6644';
    const x = e.type.startsWith('tw') ? 220 : 70;
    const y = 110 + i * 18;
    return `<rect x="${x-2}" y="${y-9}" width="${e.label.length * 6 + 8}" height="12" rx="3" fill="rgba(0,0,0,0.6)"/>
            <text x="${x}" y="${y}" font-size="8" fill="${col}">${e.label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
  <defs>
    <radialGradient id="seaGrad" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${seaColor}"/>
      <stop offset="100%" stop-color="#050d18"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- 海洋背景 -->
  <rect width="320" height="260" fill="url(#seaGrad)"/>

  <!-- 緊張度海洋光暈 -->
  <ellipse cx="160" cy="175" rx="120" ry="60" fill="${seaGlow}" opacity="${0.04 + tension * 0.003}"/>

  <!-- 網格線（象徵監控） -->
  ${Array.from({length: 8}, (_,i) => `<line x1="${i*45}" y1="0" x2="${i*45}" y2="260" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`).join('')}
  ${Array.from({length: 6}, (_,i) => `<line x1="0" y1="${i*45}" x2="320" y2="${i*45}" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`).join('')}

  <!-- 中國大陸 -->
  <path d="M0,0 L0,260 L80,260 L82,240 L78,220 L75,200 L72,185 L70,170
           L68,155 L72,140 L78,125 L85,110 L90,95 L95,80
           L100,65 L105,50 L108,35 L110,20 L112,5 L100,0 Z"
        fill="#1a2a18" stroke="#2a4a25" stroke-width="1"/>
  <text x="35" y="160" font-size="11" fill="#4a7a44" font-weight="bold" text-anchor="middle">中國</text>
  <text x="35" y="173" font-size="8" fill="#3a6a34" text-anchor="middle">大陸</text>

  <!-- 福建沿海高亮 -->
  <path d="M75,140 L80,180 L75,200 L72,185 L70,170 L68,155 Z"
        fill="#2a3a22" stroke="#3a5a30" stroke-width="0.5" opacity="0.8"/>

  <!-- 台灣海峽 -->
  <path d="M88,120 Q140,175 88,235" fill="none" stroke="rgba(100,180,255,0.12)" stroke-width="12"/>
  <text x="128" y="200" font-size="7" fill="rgba(100,180,255,0.35)" text-anchor="middle" transform="rotate(-75,128,200)">台灣海峽</text>

  <!-- 日本九州 -->
  <ellipse cx="278" cy="65" rx="18" ry="12" fill="#1e2235" stroke="#2a2f4a" stroke-width="0.8" opacity="0.9"/>
  <text x="278" y="68" font-size="7" fill="#4a5580" text-anchor="middle">九州</text>

  <!-- 沖繩 -->
  <ellipse cx="262" cy="98" rx="10" ry="6" fill="#1a2030" stroke="#252a44" stroke-width="0.5"/>
  <text x="262" y="101" font-size="6" fill="#3a4570" text-anchor="middle">沖繩</text>

  <!-- 菲律賓 -->
  <ellipse cx="248" cy="220" rx="14" ry="10" fill="#1c2218" stroke="#252a20" stroke-width="0.5" opacity="0.7"/>
  <text x="248" y="223" font-size="6" fill="#3a5535" text-anchor="middle">菲律賓</text>

  <!-- 臺灣本島 -->
  <path d="M190,112 L196,118 L200,125 L202,133 L203,142
           L202,151 L200,159 L197,166 L193,171 L188,174
           L184,172 L181,167 L180,158 L181,148 L183,138
           L185,128 L187,119 Z"
        fill="#2a4a3a" stroke="#44aa77" stroke-width="1.5" filter="url(#glow)"/>

  <!-- 台灣高山 -->
  <path d="M192,128 L194,132 L196,128Z" fill="#3a6a50" opacity="0.7"/>
  <path d="M190,138 L193,143 L196,138Z" fill="#3a6a50" opacity="0.6"/>

  <!-- 台北 -->
  <circle cx="191" cy="121" r="3.5" fill="#3a9eff" filter="url(#glow)"/>
  <text x="197" y="120" font-size="7" fill="#88ccff">台北</text>

  <!-- 高雄 -->
  <circle cx="185" cy="168" r="2.5" fill="#3a9eff" opacity="0.8"/>
  <text x="175" y="172" font-size="6" fill="#6aaadd">高雄</text>

  <!-- 台中 -->
  <circle cx="187" cy="145" r="2" fill="#3a9eff" opacity="0.6"/>

  <!-- 金門 -->
  <ellipse cx="155" cy="162" rx="5" ry="3" fill="#2a4a3a" stroke="#44aa66" stroke-width="0.8"/>
  <text x="156" y="161" font-size="5" fill="#66cc99">金門</text>

  <!-- 澎湖 -->
  <circle cx="170" cy="175" r="4" fill="#2a4a3a" stroke="#44aa66" stroke-width="0.8"/>
  <text x="170" y="174" font-size="5" fill="#66cc99" text-anchor="middle">澎湖</text>

  <!-- 軍事動態 -->
  ${missileLines}
  ${warships}
  ${usWarship}
  ${twMilPulse}
  ${ccpMilPulse}
  ${cyberPulse}

  <!-- 滲透指示點 -->
  ${infiltrationDots}

  <!-- 外交連線（外交高時） -->
  ${state.tw.diplomacy > 72 ? `
  <line x1="205" y1="140" x2="278" y2="68" stroke="#3a9eff" stroke-width="0.8" stroke-dasharray="4,4" opacity="0.4"/>
  <line x1="205" y1="140" x2="262" y2="100" stroke="#3a9eff" stroke-width="0.6" stroke-dasharray="3,4" opacity="0.3"/>
  ` : ''}
  ${state.tw.diplomacy > 82 ? `
  <line x1="205" y1="140" x2="310" y2="120" stroke="#44aaff" stroke-width="0.8" stroke-dasharray="5,4" opacity="0.35"/>
  ` : ''}

  <!-- 事件標籤 -->
  ${eventLabels}

  <!-- 緊張度指示框 -->
  <rect x="4" y="4" width="72" height="20" rx="4" fill="rgba(0,0,0,0.55)"/>
  <text x="8" y="16" font-size="8" fill="#8899aa">緊張度</text>
  <rect x="38" y="8" width="34" height="10" rx="2" fill="rgba(255,255,255,0.06)"/>
  <rect x="38" y="8" width="${tension * 0.34}" height="10" rx="2" fill="${seaGlow}" opacity="0.9"/>
  <text x="55" y="16" font-size="7" fill="#eee" text-anchor="middle">${Math.round(tension)}</text>

  <!-- 年份 -->
  <rect x="240" y="4" width="76" height="18" rx="4" fill="rgba(0,0,0,0.55)"/>
  <text x="278" y="16" font-size="9" fill="#aabbcc" text-anchor="middle" font-family="monospace">${state.year} Q${state.quarter}</text>

  <!-- 圖例 -->
  <g opacity="0.7">
    <circle cx="8" cy="245" r="3" fill="#3a9eff"/>
    <text x="14" y="248" font-size="6" fill="#6699bb">台灣行動</text>
    <circle cx="68" cy="245" r="3" fill="#ff3300"/>
    <text x="74" y="248" font-size="6" fill="#bb6644">中共行動</text>
    <circle cx="128" cy="245" r="3" fill="#ff3300" opacity="0.5">
      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <text x="134" y="248" font-size="6" fill="#bb6644">滲透</text>
  </g>
</svg>`;
}

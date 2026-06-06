// ============================================================
// map.js — 台海地圖 SVG 視覺化（升級版）
// 和緩：共機自己墜落搞笑動畫
// 緊張：飛彈、軍艦、動態效果
// ============================================================

function buildMapSVG(state) {
  const t = state.tension;
  const inf = state.ccp.infiltrated;
  const mapEvents = state.mapEvents || [];

  // 海洋顏色依緊張度
  const seaColor = t < 35 ? '#0a2a4a' : t < 55 ? '#0f2a18' : t < 75 ? '#2a1a08' : '#2a0808';
  const glowColor = t < 35 ? '#1a5aaa' : t < 55 ? '#2a6a1a' : t < 75 ? '#aa5a1a' : '#cc2211';

  // ── 動畫元素依緊張度決定 ──────────────────────────────

  // 和緩（<35）：共機飛出來沒到中線自己墜落
  const funnyPlane = t < 35 ? `
    <g id="funny-plane">
      <!-- 共機出發 -->
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="70,168; 130,155; 118,175; 100,200"
          keyTimes="0;0.4;0.7;1"
          dur="4s" repeatCount="indefinite"/>
        <!-- 機身 -->
        <rect x="-10" y="-3" width="18" height="5" rx="2" fill="#cc3311"/>
        <polygon points="-2,-3 4,-9 8,-3" fill="#cc3311"/>
        <polygon points="-10,0 -14,5 -6,2" fill="#aa2200"/>
        <!-- 紅星 -->
        <text x="-2" y="2" font-size="5" fill="#ffdd00" text-anchor="middle">★</text>
        <!-- 墜落冒煙 -->
        <g opacity="0">
          <animate attributeName="opacity" values="0;0;0;0.8;0.8" keyTimes="0;0.35;0.5;0.7;1" dur="4s" repeatCount="indefinite"/>
          <circle cx="0" cy="-5" r="4" fill="#888" opacity="0.6"/>
          <circle cx="-3" cy="-9" r="3" fill="#666" opacity="0.4"/>
        </g>
        <!-- 墜落驚嘆號 -->
        <text x="5" y="-10" font-size="8" fill="#ffdd00" opacity="0">
          <animate attributeName="opacity" values="0;0;0;0;1;1" keyTimes="0;0.3;0.5;0.6;0.8;1" dur="4s" repeatCount="indefinite"/>
          😱
        </text>
      </g>
    </g>
    <!-- 說明文字 -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;0.9;0" keyTimes="0;0.5;0.6;0.7;0.85;1" dur="4s" repeatCount="indefinite"/>
      <rect x="60" y="205" width="110" height="18" rx="4" fill="rgba(0,0,0,0.7)"/>
      <text x="115" y="217" font-size="9" fill="#ffdd88" text-anchor="middle">共機還沒到中線就墜了 😂</text>
    </g>` : '';

  // 緊張（35-65）：共機正常飛越中線
  const normalPlane = t >= 35 && t < 65 ? `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="72,170; 160,148; 250,130"
        dur="5s" repeatCount="indefinite"/>
      <rect x="-10" y="-3" width="18" height="5" rx="2" fill="#cc3311"/>
      <polygon points="-2,-3 4,-9 8,-3" fill="#cc3311"/>
      <text x="-2" y="2" font-size="5" fill="#ffdd00" text-anchor="middle">★</text>
    </g>` : '';

  // 高度緊張（≥65）：多機編隊
  const warPlanes = t >= 65 ? `
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="translate"
        values="72,165; 220,138" dur="3.5s" repeatCount="indefinite"/>
      <rect x="-10" y="-3" width="18" height="5" rx="2" fill="#cc3311"/>
      <polygon points="-2,-3 4,-9 8,-3" fill="#cc3311"/>
      <text x="-2" y="2" font-size="4" fill="#ffdd00" text-anchor="middle">★</text>
    </g>
    <g opacity="0.75">
      <animateTransform attributeName="transform" type="translate"
        values="68,178; 216,151" dur="3.5s" begin="0.4s" repeatCount="indefinite"/>
      <rect x="-10" y="-3" width="18" height="5" rx="2" fill="#cc3311"/>
      <polygon points="-2,-3 4,-9 8,-3" fill="#cc3311"/>
    </g>
    <g opacity="0.6">
      <animateTransform attributeName="transform" type="translate"
        values="74,158; 222,131" dur="3.5s" begin="0.8s" repeatCount="indefinite"/>
      <rect x="-10" y="-3" width="18" height="5" rx="2" fill="#cc3311"/>
      <polygon points="-2,-3 4,-9 8,-3" fill="#cc3311"/>
    </g>` : '';

  // 飛彈（緊張≥70）
  const missiles = t >= 70 ? `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="95,188; 192,145" dur="1.8s" begin="1s" repeatCount="indefinite"/>
      <line x1="-8" y1="0" x2="8" y2="0" stroke="#ff4400" stroke-width="2"/>
      <polygon points="8,0 4,-3 4,3" fill="#ff4400"/>
      <ellipse cx="-8" cy="0" rx="4" ry="2" fill="#ff8800" opacity="0.6"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="100,195; 188,162" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
      <line x1="-8" y1="0" x2="8" y2="0" stroke="#ff4400" stroke-width="1.5"/>
      <polygon points="8,0 4,-2 4,2" fill="#ff4400"/>
      <ellipse cx="-8" cy="0" rx="3" ry="1.5" fill="#ff8800" opacity="0.5"/>
    </g>` : '';

  // 軍艦（緊張≥55）
  const warships = t >= 55 ? `
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="translate"
        values="0,0; 5,0; 0,0; -5,0; 0,0" dur="3s" repeatCount="indefinite"/>
      <rect x="128" y="188" width="20" height="8" rx="3" fill="#cc3311"/>
      <rect x="132" y="182" width="5" height="6" rx="1" fill="#cc3311"/>
      <text x="138" y="195" font-size="5" fill="#ffaa88" text-anchor="middle">解放軍艦</text>
    </g>
    <g opacity="0.7">
      <animateTransform attributeName="transform" type="translate"
        values="0,0; -4,0; 0,0; 4,0; 0,0" dur="4s" repeatCount="indefinite"/>
      <rect x="152" y="200" width="18" height="7" rx="2" fill="#cc3311"/>
    </g>` : '';

  // 美艦（外交≥70）
  const usWarship = state.tw.diplomacy >= 70 ? `
    <g opacity="0.85">
      <animateTransform attributeName="transform" type="translate"
        values="0,0; 3,0; 0,0; -3,0; 0,0" dur="5s" repeatCount="indefinite"/>
      <rect x="236" y="150" width="18" height="7" rx="2" fill="#224488"/>
      <rect x="240" y="145" width="4" height="5" rx="1" fill="#224488"/>
      <text x="245" y="156" font-size="5" fill="#aaccff" text-anchor="middle">USS</text>
    </g>` : '';

  // 滲透閃爍紅點
  const infDots = [
    inf.retired_officers ? `<circle cx="208" cy="130" r="4.5" fill="#ff2200"><animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite"/></circle><rect x="214" y="124" width="28" height="10" rx="3" fill="rgba(0,0,0,0.6)"/><text x="228" y="132" font-size="7" fill="#ff8866" text-anchor="middle">退將滲透</text>` : '',
    inf.legislators ? `<circle cx="200" cy="142" r="4" fill="#ff3300"><animate attributeName="opacity" values="1;0.2;1" dur="1.7s" repeatCount="indefinite"/></circle><rect x="206" y="136" width="28" height="10" rx="3" fill="rgba(0,0,0,0.6)"/><text x="220" y="144" font-size="7" fill="#ff8866" text-anchor="middle">議員滲透</text>` : '',
    inf.journalists ? `<circle cx="210" cy="152" r="3.5" fill="#ff5500"><animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></circle><rect x="216" y="147" width="28" height="10" rx="3" fill="rgba(0,0,0,0.6)"/><text x="230" y="155" font-size="7" fill="#ff8866" text-anchor="middle">媒體滲透</text>` : '',
    inf.students ? `<circle cx="204" cy="162" r="3" fill="#ff7700"><animate attributeName="opacity" values="1;0.2;1" dur="2.3s" repeatCount="indefinite"/></circle><rect x="210" y="157" width="28" height="10" rx="3" fill="rgba(0,0,0,0.6)"/><text x="224" y="165" font-size="7" fill="#ff8866" text-anchor="middle">校園滲透</text>` : '',
  ].join('');

  // 出牌脈衝
  const twPulse = (mapEvents || []).some(e => e.type === 'tw_military') ? `
    <circle cx="200" cy="145" r="20" fill="none" stroke="#3a9eff" stroke-width="2">
      <animate attributeName="r" values="10;28;10" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
    </circle>` : '';
  const ccpPulse = (mapEvents || []).some(e => e.type === 'ccp_military') ? `
    <circle cx="85" cy="168" r="22" fill="none" stroke="#ff3300" stroke-width="2">
      <animate attributeName="r" values="12;28;12" dur="1.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite"/>
    </circle>` : '';

  // 外交連線
  const diploLines = state.tw.diplomacy > 72 ? `
    <line x1="200" y1="140" x2="278" y2="68" stroke="#3a9eff" stroke-width="0.8" stroke-dasharray="4,4" opacity="0.4">
      <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite"/>
    </line>
    <line x1="200" y1="140" x2="262" y2="100" stroke="#3a9eff" stroke-width="0.6" stroke-dasharray="3,4" opacity="0.3">
      <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2.5s" repeatCount="indefinite"/>
    </line>` : '';

  // 緊張度顏色漸層文字
  const tensionDesc = t < 35 ? '和緩 😴' : t < 55 ? '緊張 😰' : t < 75 ? '高度緊張 😱' : '戰爭邊緣 💥';
  const tensionColor = t < 35 ? '#44bb77' : t < 55 ? '#ffaa33' : t < 75 ? '#ff7733' : '#ff2211';

  return `<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
  <defs>
    <radialGradient id="seaGrad" cx="50%" cy="60%">
      <stop offset="0%" stop-color="${seaColor}"/>
      <stop offset="100%" stop-color="#040810"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="softglow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- 海洋 -->
  <rect width="320" height="260" fill="url(#seaGrad)"/>
  <ellipse cx="155" cy="180" rx="130" ry="65" fill="${glowColor}" opacity="${0.03 + t * 0.003}"/>

  <!-- 網格 -->
  ${Array.from({length:8},(_,i)=>`<line x1="${i*46}" y1="0" x2="${i*46}" y2="260" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>`).join('')}
  ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*44}" x2="320" y2="${i*44}" stroke="rgba(255,255,255,0.025)" stroke-width="0.5"/>`).join('')}

  <!-- 中國大陸 -->
  <path d="M0,0 L0,260 L82,260 L84,240 L80,220 L76,200 L73,182 L70,165 L68,150 L72,135 L78,120 L84,105 L90,90 L95,75 L100,58 L105,42 L108,28 L110,14 L112,2 L100,0 Z"
        fill="#182818" stroke="#2a4a28" stroke-width="1"/>
  <!-- 福建省標示 -->
  <rect x="5" y="148" width="62" height="22" rx="4" fill="rgba(0,0,0,0.4)"/>
  <text x="36" y="157" font-size="9" fill="#4a7a44" text-anchor="middle" font-weight="600">中國大陸</text>
  <text x="36" y="167" font-size="7" fill="#3a5a34" text-anchor="middle">福建省</text>

  <!-- 台灣海峽標示 -->
  <text x="136" y="200" font-size="7" fill="rgba(100,180,255,0.3)" text-anchor="middle" transform="rotate(-75,136,200)">台灣海峽</text>

  <!-- 中線（虛線） -->
  <line x1="145" y1="110" x2="145" y2="240" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="141" y="108" font-size="6" fill="rgba(255,255,255,0.25)" text-anchor="middle">中線</text>

  <!-- 日本九州 -->
  <ellipse cx="280" cy="60" rx="20" ry="13" fill="#1a1e35" stroke="#252a4a" stroke-width="0.8"/>
  <text x="280" y="63" font-size="7" fill="#4a5580" text-anchor="middle">九州</text>

  <!-- 沖繩 -->
  <ellipse cx="263" cy="96" rx="11" ry="7" fill="#181c30" stroke="#222845" stroke-width="0.5"/>
  <text x="263" y="99" font-size="6" fill="#3a4570" text-anchor="middle">沖繩</text>

  <!-- 菲律賓 -->
  <ellipse cx="250" cy="222" rx="15" ry="11" fill="#1a2018" stroke="#222820" stroke-width="0.5" opacity="0.7"/>
  <text x="250" y="225" font-size="6" fill="#3a5535" text-anchor="middle">菲律賓</text>

  <!-- 台灣本島（更精細） -->
  <path d="M194,110 L200,116 L204,124 L206,133 L207,143 L206,153 L204,162 L200,170 L196,175 L191,178 L186,175 L183,169 L182,160 L183,150 L185,140 L187,130 L189,120 Z"
        fill="#284838" stroke="#44aa77" stroke-width="1.5" filter="url(#glow)"/>
  <!-- 山脈 -->
  <path d="M194,122 L197,128 L200,122Z" fill="#3a6a50" opacity="0.8"/>
  <path d="M192,134 L195,140 L198,134Z" fill="#3a6a50" opacity="0.7"/>
  <path d="M191,146 L194,152 L197,146Z" fill="#3a6a50" opacity="0.6"/>

  <!-- 台北 -->
  <circle cx="196" cy="118" r="4" fill="#3a9eff" filter="url(#glow)"/>
  <text x="203" y="117" font-size="7.5" fill="#88ccff" font-weight="600">台北</text>
  <!-- 高雄 -->
  <circle cx="186" cy="170" r="3" fill="#3a9eff" opacity="0.8"/>
  <text x="176" y="174" font-size="6.5" fill="#6aaadd">高雄</text>
  <!-- 台中 -->
  <circle cx="188" cy="146" r="2.5" fill="#3a9eff" opacity="0.65"/>
  <!-- 台南 -->
  <circle cx="185" cy="160" r="2" fill="#3a9eff" opacity="0.55"/>

  <!-- 金門 -->
  <ellipse cx="153" cy="163" rx="6" ry="4" fill="#284838" stroke="#44aa66" stroke-width="1"/>
  <text x="153" y="163" font-size="6" fill="#66cc99" text-anchor="middle">金門</text>
  <!-- 澎湖 -->
  <circle cx="170" cy="177" r="5" fill="#284838" stroke="#44aa66" stroke-width="1"/>
  <text x="170" y="177" font-size="5.5" fill="#66cc99" text-anchor="middle">澎湖</text>
  <!-- 馬祖 -->
  <ellipse cx="158" cy="138" rx="4" ry="3" fill="#284838" stroke="#44aa66" stroke-width="0.8"/>
  <text x="158" y="138" font-size="5" fill="#66cc99" text-anchor="middle">馬祖</text>

  <!-- 動畫元素 -->
  ${funnyPlane}
  ${normalPlane}
  ${warPlanes}
  ${missiles}
  ${warships}
  ${usWarship}
  ${twPulse}
  ${ccpPulse}
  ${infDots}
  ${diploLines}

  <!-- 緊張度指示框 -->
  <rect x="4" y="4" width="88" height="22" rx="5" fill="rgba(0,0,0,0.6)"/>
  <text x="8" y="13" font-size="7.5" fill="#8899aa">緊張度</text>
  <rect x="40" y="7" width="48" height="12" rx="3" fill="rgba(255,255,255,0.06)"/>
  <rect x="40" y="7" width="${Math.round(t * 0.48)}" height="12" rx="3" fill="${tensionColor}" opacity="0.85"/>
  <text x="64" y="17" font-size="7" fill="#eee" text-anchor="middle">${Math.round(t)}</text>
  <text x="8" y="22" font-size="6.5" fill="${tensionColor}">${tensionDesc}</text>

  <!-- 年份 -->
  <rect x="234" y="4" width="82" height="18" rx="4" fill="rgba(0,0,0,0.55)"/>
  <text x="275" y="16" font-size="9" fill="#aabbcc" text-anchor="middle" font-family="monospace">${state.year} Q${state.quarter}</text>

  <!-- 圖例 -->
  <rect x="0" y="244" width="320" height="16" fill="rgba(0,0,0,0.4)"/>
  <circle cx="8" cy="252" r="3" fill="#3a9eff"/>
  <text x="14" y="255" font-size="6" fill="#6699bb">台灣行動</text>
  <circle cx="68" cy="252" r="3" fill="#ff3300"/>
  <text x="74" y="255" font-size="6" fill="#bb6644">中共行動</text>
  <circle cx="130" cy="252" r="3" fill="#ff3300"><animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/></circle>
  <text x="136" y="255" font-size="6" fill="#bb6644">滲透中</text>
  <text x="200" y="255" font-size="6" fill="#6699bb">${state.tw.diplomacy > 72 ? '外交連線中' : ''}</text>
</svg>`;
}

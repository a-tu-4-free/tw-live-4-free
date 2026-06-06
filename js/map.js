// ============================================================
// map.js — 台海地圖（精緻版）
// 更真實的地理輪廓、衛星感配色、動態軍事標示
// ============================================================

function buildMapSVG(state) {
  const t  = state.tension;
  const inf = state.ccp.infiltrated;
  const ev  = state.mapEvents || [];

  // 海域配色（提亮版，全螢幕底圖需要可見）
  const sea1 = t < 35 ? '#1a4a7a' : t < 55 ? '#1a4a28' : t < 75 ? '#4a2808' : '#4a0e0e';
  const sea2 = t < 35 ? '#0d2a4a' : t < 55 ? '#0d2a18' : t < 75 ? '#2a1808' : '#2a0808';
  const glow = t < 35 ? 'rgba(60,160,255,0.40)' : t < 55 ? 'rgba(60,180,60,0.35)' : t < 75 ? 'rgba(220,120,20,0.38)' : 'rgba(240,40,20,0.42)';
  const tensionColor = t < 35 ? '#44bb77' : t < 55 ? '#ffaa33' : t < 75 ? '#ff7733' : '#ff2211';
  const tensionLabel = t < 35 ? '和緩 😴' : t < 55 ? '緊張 😰' : t < 75 ? '高度緊張 😱' : '戰爭邊緣 💥';

  // ── 動畫：依緊張度 ────────────────────────────────────
  // 和緩：共機飛出沒到中線自己墜落
  const funnyPlane = t < 35 ? `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="80,172; 138,157; 124,180; 104,210"
        keyTimes="0;0.38;0.65;1" dur="4.5s" repeatCount="indefinite"/>
      <rect x="-9" y="-3" width="16" height="4" rx="2" fill="#bb2200"/>
      <polygon points="-1,-3 5,-8 8,-3" fill="#bb2200"/>
      <polygon points="-9,0 -13,4 -6,2" fill="#991800"/>
      <text x="-1" y="2" font-size="4.5" fill="#ffdd00" text-anchor="middle">★</text>
      <g>
        <animate attributeName="opacity" values="0;0;0;0.9;0.9" keyTimes="0;0.3;0.5;0.7;1" dur="4.5s" repeatCount="indefinite"/>
        <circle cx="0" cy="-6" r="4" fill="#777" opacity="0.55"/>
        <circle cx="-3" cy="-10" r="3" fill="#555" opacity="0.4"/>
      </g>
      <text x="6" y="-12" font-size="9">
        <animate attributeName="opacity" values="0;0;0;0;1;1" keyTimes="0;0.3;0.5;0.62;0.8;1" dur="4.5s" repeatCount="indefinite"/>
        😱
      </text>
    </g>
    <g>
      <animate attributeName="opacity" values="0;0;0;0;0.95;0" keyTimes="0;0.5;0.6;0.68;0.85;1" dur="4.5s" repeatCount="indefinite"/>
      <rect x="54" y="210" width="122" height="16" rx="5" fill="rgba(0,0,0,0.72)"/>
      <text x="115" y="221" font-size="8.5" fill="#ffdd88" text-anchor="middle">共機還沒到中線就墜了 😂</text>
    </g>` : '';

  // 中度緊張：共機飛越中線
  const normalPlane = t >= 35 && t < 65 ? `
    <g opacity="0.88">
      <animateTransform attributeName="transform" type="translate"
        values="78,170; 172,150; 255,132" dur="5s" repeatCount="indefinite"/>
      <rect x="-9" y="-3" width="16" height="4" rx="2" fill="#bb2200"/>
      <polygon points="-1,-3 5,-8 8,-3" fill="#bb2200"/>
      <text x="-1" y="2" font-size="4" fill="#ffdd00" text-anchor="middle">★</text>
    </g>` : '';

  // 高度緊張：多機編隊
  const warPlanes = t >= 65 ? `
    <g opacity="0.92">
      <animateTransform attributeName="transform" type="translate"
        values="78,163; 228,140" dur="3.2s" repeatCount="indefinite"/>
      <rect x="-9" y="-3" width="16" height="4" rx="2" fill="#cc2200"/>
      <polygon points="-1,-3 5,-8 8,-3" fill="#cc2200"/>
      <text x="-1" y="2" font-size="4" fill="#ffdd00" text-anchor="middle">★</text>
    </g>
    <g opacity="0.72">
      <animateTransform attributeName="transform" type="translate"
        values="74,176; 224,153" dur="3.2s" begin="0.45s" repeatCount="indefinite"/>
      <rect x="-9" y="-3" width="16" height="4" rx="2" fill="#cc2200"/>
      <polygon points="-1,-3 5,-8 8,-3" fill="#cc2200"/>
    </g>
    <g opacity="0.55">
      <animateTransform attributeName="transform" type="translate"
        values="82,155; 232,132" dur="3.2s" begin="0.9s" repeatCount="indefinite"/>
      <rect x="-9" y="-3" width="16" height="4" rx="2" fill="#cc2200"/>
      <polygon points="-1,-3 5,-8 8,-3" fill="#cc2200"/>
    </g>` : '';

  // 飛彈
  const missiles = t >= 70 ? `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="100,190; 195,148" dur="1.7s" begin="0.8s" repeatCount="indefinite"/>
      <line x1="-8" y1="0" x2="8" y2="0" stroke="#ff5500" stroke-width="2"/>
      <polygon points="8,0 4,-2.5 4,2.5" fill="#ff5500"/>
      <ellipse cx="-9" cy="0" rx="4" ry="1.8" fill="#ff8800" opacity="0.55"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="96,198; 190,163" dur="2.1s" begin="0.2s" repeatCount="indefinite"/>
      <line x1="-7" y1="0" x2="7" y2="0" stroke="#ff5500" stroke-width="1.5"/>
      <polygon points="7,0 3.5,-2 3.5,2" fill="#ff5500"/>
      <ellipse cx="-8" cy="0" rx="3" ry="1.5" fill="#ff8800" opacity="0.45"/>
    </g>` : '';

  // 中共軍艦
  const warships = t >= 58 ? `
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="0,0;4,0;0,0;-4,0;0,0" dur="3.2s" repeatCount="indefinite"/>
      <rect x="124" y="188" width="22" height="8" rx="3" fill="#9a2211"/>
      <rect x="128" y="182" width="5" height="6" rx="1" fill="#9a2211"/>
      <rect x="135" y="184" width="3" height="4" fill="#9a2211"/>
      <text x="135" y="194" font-size="5" fill="#ffaa88" text-anchor="middle">解放軍</text>
    </g>
    <g opacity="0.7">
      <animateTransform attributeName="transform" type="translate"
        values="0,0;-3,0;0,0;3,0;0,0" dur="4s" repeatCount="indefinite"/>
      <rect x="148" y="200" width="18" height="7" rx="2" fill="#9a2211"/>
    </g>` : '';

  // 美艦（外交高）
  const usWarship = state.tw.diplomacy >= 68 ? `
    <g opacity="0.82">
      <animateTransform attributeName="transform" type="translate"
        values="0,0;3,0;0,0;-3,0;0,0" dur="5s" repeatCount="indefinite"/>
      <rect x="238" y="148" width="18" height="7" rx="2" fill="#1a3a7a"/>
      <rect x="242" y="143" width="4" height="5" rx="1" fill="#1a3a7a"/>
      <text x="247" y="153" font-size="4.5" fill="#88aaff" text-anchor="middle">USS</text>
    </g>` : '';

  // 滲透點
  const infDots = [
    inf.retired_officers ? `<g><circle cx="210" cy="128" r="4.5" fill="#ff2200"><animate attributeName="opacity" values="1;0.2;1" dur="1.3s" repeatCount="indefinite"/></circle><rect x="216" y="122" width="34" height="11" rx="3" fill="rgba(0,0,0,0.72)"/><text x="233" y="130" font-size="7" fill="#ff8866" text-anchor="middle">退將滲透</text></g>` : '',
    inf.legislators      ? `<g><circle cx="202" cy="141" r="4" fill="#ff3300"><animate attributeName="opacity" values="1;0.2;1" dur="1.7s" repeatCount="indefinite"/></circle><rect x="208" y="135" width="32" height="11" rx="3" fill="rgba(0,0,0,0.72)"/><text x="224" y="143" font-size="7" fill="#ff8866" text-anchor="middle">議員滲透</text></g>` : '',
    inf.journalists      ? `<g><circle cx="212" cy="152" r="3.5" fill="#ff5500"><animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></circle><rect x="218" y="146" width="32" height="11" rx="3" fill="rgba(0,0,0,0.72)"/><text x="234" y="154" font-size="7" fill="#ff8866" text-anchor="middle">媒體滲透</text></g>` : '',
    inf.students         ? `<g><circle cx="205" cy="163" r="3" fill="#ff7700"><animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite"/></circle><rect x="211" y="157" width="32" height="11" rx="3" fill="rgba(0,0,0,0.72)"/><text x="227" y="165" font-size="7" fill="#ff8866" text-anchor="middle">校園滲透</text></g>` : '',
  ].join('');

  // 行動脈衝
  const twPulse = ev.some(e => e.type==='tw_military') ? `<circle cx="200" cy="145" r="10" fill="none" stroke="#3a9eff" stroke-width="2"><animate attributeName="r" values="10;28;10" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/></circle>` : '';
  const ccpPulse = ev.some(e => e.type==='ccp_military') ? `<circle cx="85" cy="170" r="12" fill="none" stroke="#ff3300" stroke-width="2"><animate attributeName="r" values="12;28;12" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite"/></circle>` : '';
  const cyberPulse = ev.some(e => e.type==='ccp_cyber') ? `<circle cx="200" cy="145" r="8" fill="none" stroke="#aa22ff" stroke-width="1.5" stroke-dasharray="4,3"><animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/></circle>` : '';

  // 外交線
  const diploLines = state.tw.diplomacy > 70 ? `
    <line x1="200" y1="142" x2="280" y2="63" stroke="#3a9eff" stroke-width="0.8" stroke-dasharray="5,4" opacity="0.38">
      <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2.2s" repeatCount="indefinite"/>
    </line>
    <line x1="200" y1="142" x2="264" y2="98" stroke="#3a9eff" stroke-width="0.6" stroke-dasharray="4,4" opacity="0.28">
      <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.8s" repeatCount="indefinite"/>
    </line>` : '';

  return `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;object-fit:cover;">
<defs>
  <linearGradient id="seaV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${sea1}"/>
    <stop offset="100%" stop-color="${sea2}"/>
  </linearGradient>
  <radialGradient id="seaGlow" cx="48%" cy="62%">
    <stop offset="0%" stop-color="${glow.replace('rgba','rgba').replace(')',',1)').replace(/,[\d.]+\)$/,',0.28)')}"/>
    <stop offset="70%" stop-color="transparent"/>
  </radialGradient>
  <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glow1"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>

<!-- 海洋底色 -->
<rect width="480" height="300" fill="url(#seaV)"/>
<ellipse cx="230" cy="200" rx="220" ry="95" fill="${glow}" filter="url(#blur2)"/>

<!-- 細格線（衛星感） -->
${Array.from({length:13},(_,i)=>`<line x1="${i*40}" y1="0" x2="${i*40}" y2="300" stroke="rgba(255,255,255,0.018)" stroke-width="0.5"/>`).join('')}
${Array.from({length:8},(_,i)=>`<line x1="0" y1="${i*44}" x2="480" y2="${i*44}" stroke="rgba(255,255,255,0.018)" stroke-width="0.5"/>`).join('')}

<!-- ── 地理層整體右移80px讓台灣更居中 ──────────────── -->
<g transform="translate(80,10)">
<!-- ── 中國大陸（更細緻海岸線）────────────────────────── -->
<path d="M0,0 L0,265 L4,265 L6,258 L8,248 L10,235
  L11,225 L12,218 L14,212 L16,206 L18,200
  L20,195 L21,190 L22,183 L22,176 L21,169
  L22,163 L24,157 L26,151 L29,145 L32,139
  L36,133 L40,127 L44,121 L48,115 L52,109
  L56,104 L60,99 L64,94 L68,89 L72,84
  L76,80 L80,75 L83,70 L86,65 L88,60
  L90,55 L92,50 L94,45 L96,40 L97,35
  L98,30 L99,25 L100,20 L101,15 L102,10
  L103,5 L104,0 Z"
  fill="#2e5528" stroke="#4a8844" stroke-width="1"/>

<!-- 大陸燈光（都市群效果） -->
<circle cx="28" cy="168" r="3" fill="#ffe8aa" opacity="0.55"/>
<circle cx="42" cy="152" r="2.5" fill="#ffe8aa" opacity="0.45"/>
<circle cx="55" cy="138" r="2" fill="#ffe8aa" opacity="0.38"/>

<!-- 福建標示 -->
<rect x="4" y="148" width="60" height="24" rx="4" fill="rgba(0,0,0,0.50)"/>
<text x="34" y="158" font-size="9" fill="#88cc80" text-anchor="middle" font-weight="600">中國大陸</text>
<text x="34" y="168" font-size="7.5" fill="#66aa60" text-anchor="middle">福建省 ▸</text>

<!-- ── 台灣海峽 ──────────────────────────────────────── -->
<!-- 中線 -->
<line x1="144" y1="105" x2="144" y2="250"
  stroke="rgba(200,200,255,0.14)" stroke-width="0.8" stroke-dasharray="7,5"/>
<text x="140" y="103" font-size="5.5" fill="rgba(180,180,255,0.3)" text-anchor="end">中線</text>

<!-- 海峽標示 -->
<text x="128" y="215" font-size="6.5" fill="rgba(100,180,255,0.25)"
  text-anchor="middle" transform="rotate(-78,128,215)">台灣海峽</text>

<!-- ── 日本九州（更精確形狀）──────────────────────── -->
<path d="M268,44 L278,46 L286,52 L290,60 L288,68
  L282,72 L274,70 L268,64 L265,56 Z"
  fill="#2a3260" stroke="#4444aa" stroke-width="0.9"/>
<text x="278" y="60" font-size="7.5" fill="#7788cc" text-anchor="middle">九州</text>

<!-- 鹿兒島 -->
<ellipse cx="278" cy="76" rx="6" ry="4" fill="#222858" stroke="#3838a0" stroke-width="0.6" opacity="0.9"/>

<!-- ── 沖繩群島 ──────────────────────────────────────── -->
<ellipse cx="262" cy="98" rx="10" ry="6" fill="#222858" stroke="#3838a0" stroke-width="0.8"/>
<text x="262" y="101" font-size="6.5" fill="#6677bb" text-anchor="middle">沖繩</text>
<!-- 宮古島 -->
<ellipse cx="248" cy="116" rx="5" ry="3" fill="#222858" stroke="#3838a0" stroke-width="0.5" opacity="0.85"/>
<text x="248" y="118" font-size="5.5" fill="#5566aa" text-anchor="middle">宮古</text>

<!-- ── 菲律賓呂宋島 ──────────────────────────────── -->
<path d="M244,208 L252,212 L258,222 L256,234
  L250,240 L242,236 L238,228 L240,218 Z"
  fill="#284030" stroke="#3a6040" stroke-width="0.6" opacity="0.9"/>
<text x="248" y="226" font-size="7" fill="#60aa70" text-anchor="middle">菲律賓</text>

<!-- ── 台灣本島（精確輪廓）──────────────────────── -->
<path d="
  M196,110
  L198,113 L201,117 L203,121 L205,126
  L206,131 L207,137 L207,143 L207,149
  L206,155 L205,161 L203,167 L200,172
  L197,177 L193,181 L189,183 L185,182
  L182,178 L180,173 L179,167 L179,160
  L180,153 L181,146 L182,139 L184,132
  L186,126 L188,120 L191,115 L194,111 Z"
  fill="#3a6848" stroke="#77ee99" stroke-width="2" filter="url(#glow1)"/>

<!-- 中央山脈（山脊線）-->
<path d="M196,116 L197,122 L198,128 L199,135 L199,142 L199,149 L198,156 L197,162 L195,168 L193,174 L190,179"
  stroke="#4a9966" stroke-width="1" fill="none" opacity="0.4" stroke-dasharray="3,2"/>

<!-- 山峰標示 -->
<circle cx="199" cy="132" r="2" fill="#5aaa77" opacity="0.6"/>
<text x="204" y="131" font-size="5.5" fill="#5aaa77" opacity="0.7">玉山</text>

<!-- 北部平原（台北盆地）-->
<ellipse cx="195" cy="118" rx="5" ry="3" fill="#2a4030" opacity="0.5"/>

<!-- 台北 -->
<circle cx="195" cy="116" r="4" fill="#3a9eff" filter="url(#glow3)"/>
<rect x="200" y="111" width="22" height="10" rx="3" fill="rgba(0,0,0,0.6)"/>
<text x="211" y="118" font-size="7.5" fill="#88ccff" text-anchor="middle" font-weight="600">台北</text>

<!-- 桃園 -->
<circle cx="191" cy="122" r="2.5" fill="#3a9eff" opacity="0.75"/>
<text x="196" y="125" font-size="6" fill="#6ab0ee">桃園</text>

<!-- 台中 -->
<circle cx="188" cy="146" r="3" fill="#3a9eff" opacity="0.7"/>
<rect x="173" y="141" width="22" height="10" rx="3" fill="rgba(0,0,0,0.55)"/>
<text x="184" y="148" font-size="6.5" fill="#88ccff" text-anchor="middle">台中</text>

<!-- 台南 -->
<circle cx="184" cy="163" r="2.5" fill="#3a9eff" opacity="0.65"/>
<text x="175" y="167" font-size="6" fill="#6ab0ee">台南</text>

<!-- 高雄 -->
<circle cx="184" cy="172" r="3" fill="#3a9eff" opacity="0.75"/>
<rect x="169" y="167" width="22" height="10" rx="3" fill="rgba(0,0,0,0.55)"/>
<text x="180" y="174" font-size="6.5" fill="#88ccff" text-anchor="middle">高雄</text>

<!-- 花蓮（東部） -->
<circle cx="203" cy="148" r="2" fill="#3a9eff" opacity="0.55"/>
<text x="206" y="151" font-size="5.5" fill="#5599cc">花蓮</text>

<!-- ── 離島 ──────────────────────────────────────────── -->
<!-- 金門（精確位置） -->
<path d="M152,162 L158,163 L160,167 L158,170 L152,170 L149,167 Z"
  fill="#2e4a38" stroke="#55cc88" stroke-width="1.1"/>
<text x="154" y="166" font-size="5.5" fill="#88eebb" text-anchor="middle">金門</text>

<!-- 澎湖群島 -->
<ellipse cx="168" cy="178" rx="6" ry="4" fill="#2e4a38" stroke="#55cc88" stroke-width="1"/>
<circle cx="164" cy="174" r="2" fill="#2e4a38" stroke="#55cc88" stroke-width="0.7"/>
<circle cx="172" cy="175" r="1.5" fill="#2e4a38" stroke="#55cc88" stroke-width="0.6"/>
<text x="168" y="178" font-size="5.5" fill="#88eebb" text-anchor="middle">澎湖</text>

<!-- 馬祖 -->
<path d="M156,136 L160,137 L162,140 L160,143 L156,142 L154,139 Z"
  fill="#2e4a38" stroke="#55cc88" stroke-width="0.9"/>
<text x="158" y="140" font-size="5" fill="#77ddaa" text-anchor="middle">馬祖</text>

<!-- 東引 -->
<ellipse cx="155" cy="126" rx="3" ry="2" fill="#2e4a38" stroke="#55cc88" stroke-width="0.6" opacity="0.9"/>

<!-- 蘭嶼 -->
<ellipse cx="208" cy="183" rx="3.5" ry="2.5" fill="#2e4a38" stroke="#55cc88" stroke-width="0.6" opacity="0.85"/>
<text x="208" y="184" font-size="5" fill="#77ddaa" text-anchor="middle">蘭嶼</text>

<!-- ── 動畫層 ──────────────────────────────────────── -->
${funnyPlane}
${normalPlane}
${warPlanes}
${missiles}
${warships}
${usWarship}
${twPulse}
${ccpPulse}
${cyberPulse}
${infDots}
${diploLines}

<!-- ── HUD：左上緊張度 ──────────────────────────── -->
<rect x="4" y="4" width="100" height="24" rx="5" fill="rgba(0,0,0,0.65)"/>
<text x="8" y="13" font-size="7.5" fill="#8899aa">兩岸緊張</text>
<rect x="42" y="6" width="58" height="11" rx="3" fill="rgba(255,255,255,0.06)"/>
<rect x="42" y="6" width="${Math.round(t * 0.58)}" height="11" rx="3" fill="${tensionColor}" opacity="0.82"/>
<text x="71" y="15" font-size="7" fill="#eee" text-anchor="middle">${Math.round(t)}</text>
<text x="8" y="23" font-size="6.5" fill="${tensionColor}">${tensionLabel}</text>

<!-- ── HUD：右上年份 ──────────────────────────── -->
<rect x="376" y="4" width="100" height="18" rx="4" fill="rgba(0,0,0,0.62)"/>
<text x="426" y="16" font-size="9.5" fill="#aabbcc" text-anchor="middle"
  font-family="'Courier New',monospace">${state.year} Q${state.quarter}</text>

<!-- ── 圖例底部 ──────────────────────────────── -->
<rect x="0" y="249" width="320" height="16" fill="rgba(0,0,0,0.45)"/>
<circle cx="8" cy="292" r="3" fill="#3a9eff"/>
<text x="14" y="295" font-size="6" fill="#6699bb">台灣行動</text>
<circle cx="80" cy="292" r="3" fill="#cc3300"/>
<text x="86" y="295" font-size="6" fill="#bb6644">中共行動</text>
<circle cx="152" cy="292" r="3" fill="#cc3300"><animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/></circle>
<text x="158" y="295" font-size="6" fill="#bb5533">滲透中</text>
<text x="240" y="295" font-size="6" fill="#5577aa">${state.tw.diplomacy > 70 ? '外交連線' : ''}</text>
</svg>`;
}

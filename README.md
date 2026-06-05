# 🗺 臺灣不沉 — 兩岸戰略對決

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-GitHub_Pages-3a9eff?style=for-the-badge)](https://a-tu-4-free.github.io/tw-live-4-free/)
[![License](https://img.shields.io/badge/license-MIT-44cc88?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/built_with-Vanilla_JS-f5c842?style=for-the-badge)](#)

> 純靜態台海戰略卡牌遊戲。你是臺灣的決策者，中共每季自動出招。以晶片外交、軍事嚇阻、反滲透對抗認知作戰與灰色地帶威脅。8種結局，無限局——玩到觸發結局為止。

**🔗 [立即遊玩 →](https://a-tu-4-free.github.io/tw-live-4-free/)**

---

## 遊戲特色

### ⚔️ 雙陣營完整卡牌系統
- **臺灣 69 張牌**：軍事、科技、外交、社會、軟實力、經濟、情報 七大類
- **中共 63 張牌**：軍事、滲透、認知、經濟、外交、網路、灰色地帶 七大類
- 中共由 AI 自動出牌，玩家專注操控臺灣

### 📰 47 個事件，五種類型
| 類型 | 說明 | 例子 |
|------|------|------|
| 🌐 全球事件 | 隨機好壞 | G7涉台聲明、俄烏戰事分散注意力 |
| 😅 台灣自爆 | 台灣人太安逸系列 | 黃爸爸狗園發動、舔共藝人讚嘆祖國、中配六年改四秒 |
| 💥 中共內傷 | 習維尼自爆系列 | 恆大崩潰、爛尾樓、火箭軍集體貪污、習維尼暴斃 |
| ✨ 台灣觸發 | 數值高時出現好事 | 台積電突破1奈米、情報大捷 |
| ⚠️ 中共觸發 | 敵方強大時出現壞事 | 飛彈落入EEZ、共諜案曝光 |

### 🗾 台海即時地圖
- 緊張度影響海洋顏色（藍→橘→紅）
- 飛彈動態軌跡、軍艦位置、美艦介入視覺化
- 滲透閃爍紅點（退將 / 議員 / 媒體 / 學生）
- 出牌後有脈衝動畫

### 🏁 8 種結局（無限局，純靠數值觸發）
| 結局 | 陣營 | 觸發條件 |
|------|------|---------|
| 💎 矽盾和平 | 臺灣 | 晶片≥94 + 外交≥90 + 經濟≥85 |
| 🌐 外交勝利 | 臺灣 | 外交≥92 + 軟實力≥85 + 士氣≥80 |
| 🛡️ 軍事嚇阻 | 臺灣 | 軍事≥92 + 防禦指數≥88 + 中共≤48 |
| ⚖️ 現狀穩定 | 臺灣 | 緊張≤10 + 韌性≥80 + 士氣≥75 |
| 🕳️ 內部瓦解 | 中共 | 滲透≥92 + 情報≤15 + 士氣≤25 |
| 🏳️ 士氣崩潰 | 中共 | 士氣≤8 + 軍事≤18 |
| ⛓️ 經濟封鎖 | 中共 | 經濟≤12 + 外交≤30 |
| 🧠 認知戰勝利 | 中共 | 宣傳≥92 + 韌性≤15 + 士氣≤35 |
| 💥 戰爭爆發 | 危機 | 緊張達 95 |

### 📈 中共動態消長
中共不只會變強，也會因台灣反制而衰退：
- 台灣晶片 > 85 → 中共經濟、網軍每季被侵蝕
- 台灣外交 > 78 → 中共外交影響力下滑
- 台灣韌性 > 72 → 宣傳邊際效益遞減
- 中共經濟 < 55 → 軍事成長停滯
- 每8季大升級（但經濟差時幅度縮水）

### 📱 響應式介面
- 手機：上下堆疊佈局
- 桌機：三欄左右佈局，地圖嵌入中欄

---

## 部署

純靜態網頁，無需後端。

```bash
git clone https://github.com/a-tu-4-free/tw-live-4-free
cd tw-live-4-free
python3 -m http.server 8080
# 開啟 http://localhost:8080
```

GitHub Pages 已自動部署：**https://a-tu-4-free.github.io/tw-live-4-free/**

---

## 新增卡牌

編輯 `data/custom_cards.js`，照格式加入，無需修改其他檔案：

```js
const CUSTOM_TAIWAN_CARDS = [
  {
    id: 'tw_my_card',
    name: '我的牌名',
    category: '軍事',  // 軍事/科技/外交/社會/軟實力/經濟/情報
    cost: 1,
    desc: '效果說明',
    flavor: '引言文字',
    effects: { military: 10, morale: 5 },
    sideEffects: { diplomacy: -3 },  // 可選
    cooldown: 2,                      // 可選
  }
];

const CUSTOM_CCP_CARDS = [
  {
    id: 'ccp_my_card',
    name: '我的牌名',
    category: '軍事',  // 軍事/滲透/認知/經濟/外交/網路/灰色地帶
    cost: 2,
    desc: '效果說明',
    flavor: '引言文字',
    effects: { military: 8, tension: 6 },
    sideEffects: { tw_morale: -8 },
  }
];
```

---

## 檔案結構

```
tw-live-4-free/
├── index.html              # 主頁面
├── css/
│   └── style.css           # 全站樣式（RWD）
├── js/
│   ├── cards_taiwan.js     # 臺灣卡牌（69張）
│   ├── cards_ccp.js        # 中共卡牌（63張）
│   ├── events.js           # 事件腳本（47個）
│   ├── game.js             # 核心邏輯、8種結局、中共動態消長
│   ├── map.js              # 台海地圖 SVG 渲染
│   ├── render.js           # DOM 渲染函式
│   └── main.js             # 初始化、AI出牌、流程控制
└── data/
    └── custom_cards.js     # 自訂擴充卡牌
```

---

## 模擬勝率（4000場 Monte Carlo）

| 策略 | 臺灣勝率 | 備註 |
|------|---------|------|
| 💎 晶片路線 | ~65% | 平衡後的最優路線 |
| ⚖️ 均衡路線 | ~63% | 穩健 |
| 🌐 外交路線 | ~61% | 長線見效 |
| 🛡️ 軍事路線 | ~32% | 戰爭爆發風險最高 |

中共最常用的致勝手段是「內部瓦解」，不是打仗。別忽視反情報。

---

## License

MIT © 2026 — 自由使用、修改、分享

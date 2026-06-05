# 🗺 臺灣不沉 — 兩岸戰略對決

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-GitHub_Pages-3a9eff?style=for-the-badge)](https://a-tu-4-free.github.io/tw-live-4-free/)
[![License](https://img.shields.io/badge/license-MIT-44cc88?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/built_with-Vanilla_JS-f5c842?style=for-the-badge)](#)

> 純靜態台海戰略卡牌遊戲。操控臺灣或中共，以晶片外交、軍事嚇阻、反滲透對抗認知作戰與灰色地帶威脅。8種結局，支援單人 vs AI 與雙人對戰。無需後端，開啟即玩。

**🔗 [立即遊玩 →](https://a-tu-4-free.github.io/tw-live-4-free/)**

---

## 遊戲截圖

```
🇹🇼 臺灣                    台海地圖                    🇨🇳 中共
─────────────────      ┌─────────────────┐      ─────────────────
防禦指數: 72           │  兩岸緊張: 45   │      威脅指數: 58
                       │  ～～⛵～～     │
軍事  ████████░░ 75    │   🗾 台灣       │      軍事  █████████░ 85
晶片  █████████░ 90    │      ●台北      │      網軍  ███████░░░ 70
外交  ██████░░░░ 62    │                 │      滲透  ████░░░░░░ 35
                       └─────────────────┘
[晶片外交 2AP] [對美軍購 2AP]       ▶ 推進下一季       [圍島演習 2AP] [網軍滲透 1AP]
```

---

## 遊戲特色

### ⚔️ 雙陣營完整卡牌系統
- **臺灣 50 張牌**：軍事、科技、外交、社會韌性、軟實力、經濟、情報 七大類
- **中共 45 張牌**：軍事恫嚇、政治滲透、認知作戰、經濟施壓、外交絞殺、網路攻擊、灰色地帶 七大類

### 🗾 台海即時地圖
- 緊張度影響海洋顏色（藍→橘→紅）
- 飛彈動態軌跡、軍艦位置、美艦介入
- 滲透閃爍紅點（退將 / 議員 / 媒體 / 學生）
- 外交連線視覺化

### 🏁 8 種結局
| 結局 | 陣營 | 觸發條件 |
|------|------|---------|
| 💎 矽盾和平 | 臺灣 | 晶片≥92 + 外交≥88 |
| 🌐 外交勝利 | 臺灣 | 外交≥90 + 軟實力≥80 |
| 🛡️ 軍事嚇阻 | 臺灣 | 軍事≥90 + 壓倒性優勢 |
| ⚖️ 現狀穩定 | 臺灣 | 緊張≤12，14季後 |
| 🕳️ 內部瓦解 | 中共 | 滲透≥88 + 情報崩潰 |
| 🏳️ 士氣崩潰 | 中共 | 士氣≤12 + 軍事≤20 |
| ⛓️ 經濟封鎖 | 中共 | 經濟≤15，6季後 |
| 🧠 認知戰勝利 | 中共 | 宣傳≥90 + 韌性≤20 |
| 💥 戰爭爆發 | 危機 | 緊張達 95 |

### 🎮 雙遊戲模式
- **單人 vs AI**：你操控臺灣，中共由 AI 自動決策（優先選擇高壓策略）
- **雙人對戰**：同一裝置兩人輪流，互相鎖定對方面板

### 📱 響應式介面
- 手機：上下堆疊佈局
- 桌機：三欄左右佈局，地圖嵌入中欄

---

## 部署

此專案為純靜態網頁，無需任何後端或安裝。

```bash
# 本地預覽
git clone https://github.com/a-tu-4-free/tw-live-4-free
cd tw-live-4-free
# 用任意 HTTP server 開啟，例如：
python3 -m http.server 8080
# 開啟 http://localhost:8080
```

GitHub Pages 已自動部署：**https://a-tu-4-free.github.io/tw-live-4-free/**

---

## 擴充卡牌

編輯 `data/custom_cards.js`，照格式新增即可，無需修改其他檔案：

```js
const CUSTOM_TAIWAN_CARDS = [
  {
    id: 'tw_my_card',
    name: '我的牌名',
    category: '軍事',  // 軍事/科技/外交/社會/軟實力/經濟/情報
    cost: 1,           // AP費用 1~3
    desc: '效果說明',
    flavor: '引言文字',
    effects: { military: 10, morale: 5 },
    sideEffects: { diplomacy: -3 },  // 可選
    cooldown: 2,                      // 可選，冷卻季數
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
│   ├── cards_taiwan.js     # 臺灣卡牌資料庫（50張）
│   ├── cards_ccp.js        # 中共卡牌資料庫（45張）
│   ├── events.js           # 事件腳本（30個，加權隨機）
│   ├── game.js             # 核心邏輯、8種結局
│   ├── map.js              # 台海地圖 SVG 渲染
│   ├── render.js           # DOM 渲染函式
│   └── main.js             # 初始化、流程控制
└── data/
    └── custom_cards.js     # 自訂擴充卡牌（在此新增）
```

---

## License

MIT © 2026 — 自由使用、修改、分享

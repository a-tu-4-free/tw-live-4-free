# 🗺 臺灣不沉 — 兩岸戰略對決

純靜態策略遊戲，可直接部署到 GitHub Pages，無需後端。

## 快速部署

1. Fork 或上傳此資料夾到 GitHub repo
2. 進入 repo Settings → Pages → Branch: main / root
3. 儲存後幾分鐘即可在 `https://你的名字.github.io/repo名稱` 遊玩

## 檔案結構

```
taiwan-defense/
├── index.html          # 主頁面（HTML結構）
├── css/
│   └── style.css       # 所有樣式（RWD：手機上下 / 桌機三欄）
├── js/
│   ├── cards_taiwan.js # 臺灣卡牌資料庫（50張+）
│   ├── cards_ccp.js    # 中共卡牌資料庫（45張+）
│   ├── events.js       # 事件腳本庫（30個+）
│   ├── game.js         # 遊戲狀態與核心邏輯
│   ├── render.js       # UI渲染函式
│   └── main.js         # 初始化與事件綁定
└── data/
    └── custom_cards.js # 自訂擴充卡牌（在此新增）
```

## 新增卡牌

編輯 `data/custom_cards.js`，照格式加入：

```js
// 台灣牌
const CUSTOM_TAIWAN_CARDS = [
  {
    id: 'tw_my_card',
    name: '我的牌',
    category: '軍事',   // 軍事/科技/外交/社會/軟實力/經濟/情報
    cost: 1,
    desc: '效果描述',
    flavor: '引言',
    effects: { military: 10 },
    sideEffects: { diplomacy: -3 },  // 可選
    cooldown: 2,                      // 可選
  }
];

// 中共牌
const CUSTOM_CCP_CARDS = [
  {
    id: 'ccp_my_card',
    name: '我的牌',
    category: '軍事',   // 軍事/滲透/認知/經濟/外交/網路/灰色地帶
    cost: 1,
    desc: '效果描述',
    flavor: '引言',
    effects: { military: 8, tension: 5 },
    sideEffects: { tw_morale: -8 },
  }
];
```

## 可用 stat key 參照

| Key | 說明 |
|-----|------|
| `tw_military` | 臺灣軍事 |
| `tw_economy` | 臺灣經濟 |
| `tw_chip` | 晶片優勢 |
| `tw_diplomacy` | 外交 |
| `tw_morale` | 士氣 |
| `tw_intel` | 情報 |
| `tw_resilience` | 社會韌性 |
| `tw_softpower` | 軟實力 |
| `ccp_military` | 中共軍事 |
| `ccp_cyber` | 網軍 |
| `ccp_propaganda` | 宣傳機器 |
| `ccp_diplomacy` | 外交 |
| `ccp_economy` | 經濟 |
| `ccp_infiltration` | 滲透度 |
| `tension` | 兩岸緊張（直接影響） |

## 勝負條件

**台灣勝利**
- 台灣防禦指數 ≥ 85，中共威脅 ≤ 50（8季後）
- 外交 ≥ 90 且晶片 ≥ 90（10季後）
- 緊張度持續降至 ≤ 15（12季後）

**中共勝利**
- 台灣士氣 ≤ 15 且軍事 ≤ 20
- 滲透度 ≥ 90 且台灣情報 ≤ 20

**危機結局**
- 兩岸緊張達 95+

## 授權

MIT License — 自由使用、修改、分享

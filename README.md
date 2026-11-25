# 神狗勾 3D 耗材商城

顧客可以搜尋 3D 列印耗材、選擇顏色與數量、建立訂單，或閱讀有互動模擬的材料教學。React 與 Vite 提供前台和管理介面，Express 負責付款及其他 API，Firebase 提供登入與資料儲存。

[正式商城](https://goddog.space/) · [更新紀錄](CHANGELOG.md) · [GitHub Actions](https://github.com/goddog8787/Goddog/actions)

## 網站功能與程式入口

| 區域 | 功能 | 程式入口 |
| --- | --- | --- |
| 商城與商品頁 | 搜尋、材質與庫存篩選、排序、商品分享、收藏和規格選購 | [App.tsx](src/App.tsx)、[商品詳情](src/components/Storefront/ProductDetailModal.tsx) |
| 購物車與結帳 | 數量與顏色檢查、運費與折扣試算、藍新付款 | [購物車](src/components/Storefront/CartDrawer.tsx)、[結帳](src/components/Storefront/CheckoutModal.tsx)、[運費規則](src/utils/checkoutDetails.ts) |
| 個人檔案 | Firebase 登入、訂單、收藏、收件與會員設定 | [個人檔案](src/pages/Profile) |
| 創客專欄 | 18 篇材料教學與互動實驗 | [文章頁](src/pages/Blog)、[動畫共用邏輯](src/data/blogLabRuntime.ts) |
| 搜尋引擎 | 商品頁價格、庫存、運費與退貨的 JSON-LD | [SEO.tsx](src/components/SEO.tsx) |

正式商城可透過 `/?product=商品ID` 直接開啟商品。網站健康狀態包含當前 Render 版本，可從 [正式站健康檢查](https://goddog.space/api/health) 查詢。

## 本機開發

專案使用 Node.js 22 與 npm。在專案根目錄執行以下指令，預設開發網址為 `http://localhost:3000`。

```sh
npm ci
cp .env.example .env
npm run dev
```

瀏覽商品和執行自動測試都不需要藍新商店憑證。AI 對話使用 Express API。前後端分開部署時，請設定公開 API 網址。

## 驗證與啟動

```sh
npm run lint
npm test
npm run build
NODE_ENV=production npm start
```

型別檢查涵蓋前後端。自動測試驗證商品搜尋、18 篇文章的互動模擬、靜態頁快取，以及使用臨時測試值建立付款表單。正式模式由 Express 從 `dist/` 提供前端檔案。

## 金流與部署

| 設定位置 | 環境變數 | 用途 |
| --- | --- | --- |
| Express 伺服器 | `NEWEBPAY_ENV` | 測試使用 `sandbox`。正式環境請明確設為 `production`，並使用同一環境的商店憑證。 |
| Express 伺服器 | `NEWEBPAY_MERCHANT_ID`、`NEWEBPAY_HASH_KEY`、`NEWEBPAY_HASH_IV` | 由伺服器建立付款單、驗證藍新回傳的交易資料。 |
| Express 伺服器 | `PAYMENT_API_ORIGIN`、`STOREFRONT_ORIGIN` | 分別填寫藍新可連入的公開後端網址，以及付款後顧客返回的商城網址。 |
| Vite 建置環境 | `VITE_API_BASE_URL` | 前後端分開部署時填入公開後端網址，並重新建置前端。 |
| Express 伺服器 | `VITE_FIREBASE_PROJECT_ID` | 前後端應使用相同 Firebase 專案，讓伺服器可以驗證會員身分。 |

從舊版升級時，請先至藍新商店後台換發曾公開的 Hash Key 與 Hash IV。Cloud Run 可把兩個新值存到 Secret Manager，再將指定版本注入 Express 的 `NEWEBPAY_HASH_KEY` 與 `NEWEBPAY_HASH_IV`。若選擇掛載秘密檔案，則以 `NEWEBPAY_HASH_KEY_FILE` 與 `NEWEBPAY_HASH_IV_FILE` 指向後端掛載路徑。後端執行身分只需要讀取這兩項秘密。若 Firestore 的 `settings/logistics_config` 文件仍有舊金鑰欄位，請在 Firebase 控制台只移除那兩個欄位，以保留物流設定。

Render 從 `improve/storefront-reliability` 分支更新正式服務。[GitHub Actions](.github/workflows/firebase-hosting.yml) 會執行型別檢查、自動測試與建置。合併至 `main` 後，工作流程會先比對 Render 版本並確認後端狀態，再發布 Firebase Hosting 與 Firestore 規則。每批發布的用途、驗證與 PR 連結請記入 [更新紀錄](CHANGELOG.md)。

金流改動請先在藍新測試環境驗證付款、通知、登入後查單及訂閱返回流程。

一般付款由 Express 記錄購物車，確認藍新付款後在同一筆 Firestore 交易中扣除商品和顏色庫存。通知重送時只會扣一次。付款開始前會檢查庫存。若最後一件同時被多人付款，系統會把不足的商品記入 `paymentInventory` 的 `unavailable`，需要人工處理。

Render 必須能以服務帳戶身分讀寫 `goddog-shop` 使用的 Firestore 資料庫。可在 Render 使用秘密檔案，再把 `GOOGLE_APPLICATION_CREDENTIALS` 指向該檔案。發布前驗證 `/api/payment/config-status` 的正式模式與憑證設定，以及 `/api/payment/inventory-status` 的資料庫連線。藍新回呼網址會優先用 `PAYMENT_API_ORIGIN`，其次用 Render 服務網址。

會員暫停或恢復續扣時，只有在藍新確認變更後才會更新介面。若伺服器因重啟而無法辨認原委託單，會員需向客服確認實際續扣狀態。

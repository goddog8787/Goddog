# 神狗勾 3D 耗材商城

顧客可以搜尋 3D 列印耗材、選擇顏色與數量、建立訂單，或閱讀有互動模擬的材料教學。React 與 Vite 提供前台和管理介面，Express 負責付款及其他 API，Firebase 提供登入與資料儲存。

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

目前 GitHub Actions 發布的是 Firebase Hosting 前端。上線時請一併更新 Express 後端及商店實際使用的 Firestore 資料庫規則。先用藍新測試商店走完付款、通知、會員登入後查單及訂閱導回。程式目前以伺服器記憶體保存金流回呼紀錄，服務重新啟動或多實例運作時，需要持久化的交易紀錄才能可靠對帳。

商品目錄寫入限已驗證的管理員。結帳端的庫存調整目前只保留在瀏覽器。正式上線前，應由後端在確認付款後扣減共享庫存。

會員暫停或恢復續扣時，只有在藍新確認變更後才會更新介面。若伺服器因重啟而無法辨認原委託單，會員需向客服確認實際續扣狀態。

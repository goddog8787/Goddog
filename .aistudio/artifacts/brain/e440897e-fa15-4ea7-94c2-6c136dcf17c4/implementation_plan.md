# 實作計畫：更新 Firebase 專案配置

根據您提供的 Firebase 專案截圖（`unique-sunspot-28chg`），我將更新應用程式的設定，讓您的商城直接連接到您自己的 Firebase 專案。

## 1. 提取資訊
從您的截圖中提取以下關鍵配置：
- **API Key**: `AIzaSyB9vcnUadmxN9wUSxPig6ARZr7ou2Etjrk`
- **專案 ID**: `unique-sunspot-28chg`
- **Auth Domain**: `unique-sunspot-28chg.firebaseapp.com`
- **App ID**: `1:165635987551:web:650480925ce4a3cfe163ea`
- **Storage Bucket**: `unique-sunspot-28chg.firebasestorage.app`
- **Messaging Sender ID**: `165635987551`

## 2. 更新設定檔
我將修改項目根目錄下的 `firebase-applet-config.json`，將預設的配置替換為您的專案資訊。

## 3. 預期效果
- 應用程式將使用您的 Firebase Auth 進行登入。
- 會員資料與訂單紀錄將儲存到您截圖中的這個 Firebase 專案中。
- 您可以配合先前的說明，在 Firebase 控制台設定 `goddog.space` 授權網域，即可實現完全自訂網域的登入體驗。

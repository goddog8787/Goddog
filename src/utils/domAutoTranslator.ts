import { LanguageCode } from '../types';
type Language = LanguageCode;

interface TransEntry {
  en: string;
  ja: string;
}

const PHRASE_MAP: Record<string, TransEntry> = {
  // Brand & Header
  '神狗勾耗材': { en: 'GodDog 3D', ja: '神狗勾 3D' },
  '旗艦館': { en: 'Official', ja: '公式' },
  '3D列印線材旗艦館': { en: '3D Filament Flagship Store', ja: '3Dフィラメント公式ストア' },
  '官方耗材旗艦商城': { en: 'Official 3D Filament Store', ja: '公式3Dフィラメントストア' },
  '搜尋 PLA, PETG, TPU, ABS...': { en: 'Search PLA, PETG, TPU, ABS...', ja: 'PLA, PETG, TPU, ABS を検索...' },
  '搜尋耗材、配件...': { en: 'Search filaments & accessories...', ja: 'フィラメント・パーツを検索...' },
  '找不到符合的耗材，試試其他關鍵字': { en: 'No matching filaments found. Try another keyword.', ja: '該当する商品が見つかりません。別のキーワードをお試しください。' },
  '全部商品': { en: 'All Products', ja: 'すべての商品' },
  '全部耗材': { en: 'All Filaments', ja: '全フィラメント' },
  '熱門分類': { en: 'Categories', ja: 'カテゴリー' },
  '探索與服務': { en: 'Explore & Services', ja: 'サービス＆ガイド' },
  '智慧選材工具': { en: 'Smart Filament Tools', ja: 'スマート素材ツール' },
  '機型配對': { en: 'Printer Match', ja: '機種別マッチング' },
  '依 3D 印表機型號推薦最佳線材與切片參數': { en: 'Find optimal filaments & slicer profiles for your 3D printer', ja: 'お使いの3Dプリンターに最適なフィラメントとスライサー設定を提案' },
  '語系 / 幣別': { en: 'Language / Currency', ja: '言語 / 通貨' },
  '切換深色模式': { en: 'Dark Mode', ja: 'ダークモード切替' },
  '切換淺色模式': { en: 'Light Mode', ja: 'ライトモード切替' },
  '深色模式': { en: 'Dark Mode', ja: 'ダークモード' },
  '淺色模式': { en: 'Light Mode', ja: 'ライトモード' },
  '購物車': { en: 'Cart', ja: 'カート' },
  '願望清單': { en: 'Wishlist', ja: 'お気に入り' },
  '我的收藏清單': { en: 'My Wishlist', ja: 'お気に入りリスト' },
  '收藏清單是空的': { en: 'Your wishlist is empty', ja: 'お気に入りリストは空です' },
  '逛逛商品時點擊愛心圖示，即可將喜愛的耗材加入收藏清單，方便隨時比價與快速選購！': { en: 'Tap the heart icon on any product to save your favorite filaments for quick comparison and checkout!', ja: '商品のハートアイコンをタップすると、お気に入りのフィラメントを保存していつでも比較・購入できます！' },
  '去逛逛熱門耗材': { en: 'Explore Popular Filaments', ja: '人気フィラメントを見る' },
  '一鍵全部加入購物車': { en: 'Add All to Cart', ja: 'すべてカートに追加' },
  '移入購物車': { en: 'Move to Cart', ja: 'カートへ移動' },
  '移除收藏': { en: 'Remove', ja: '削除' },
  '清空全部': { en: 'Clear All', ja: 'すべてクリア' },
  '清除全部': { en: 'Clear All', ja: 'すべてクリア' },

  // Announcements & Marquee
  '🚀 全館狂歡！全家/7-11 超商滿 NT$999 免運，工作日 15:00 前下單當日急速出貨！加入會員即贈 100 點紅利。': {
    en: '🚀 Free Shipping over NT$999! Order before 15:00 on weekdays for same-day dispatch! Join now for 100 bonus points.',
    ja: '🚀 NT$999以上で送料無料！平日15:00までのご注文で即日発送！新規会員登録で100ポイント進呈。',
  },
  '15:00 前下單當日急速出貨！加入會員即贈 100 點紅利。': {
    en: 'Order before 15:00 for same-day dispatch! Join now for 100 bonus points.',
    ja: '15:00までのご注文で即日発送！会員登録で100ポイント進呈。',
  },
  '🔥 全館特惠': { en: '🔥 Promo', ja: '🔥 特価セール' },
  '✨ 新品上市': { en: '✨ New Arrival', ja: '✨ 新着アイテム' },
  '⚠️ 系統公告': { en: '⚠️ Notice', ja: '⚠️ お知らせ' },
  '📢 最新消息': { en: '📢 News', ja: '📢 ニュース' },
  '前往查看': { en: 'View', ja: '詳細' },
  '關閉公告': { en: 'Dismiss', ja: '閉じる' },

  // Hero & Quick Actions
  '2026 Bambu Lab AMS・Creality K1 高速列印專用': {
    en: '2026 600mm/s Bambu AMS & Creality K1 Verified',
    ja: '2026 Bambu Lab AMS・Creality K1 高速造形対応',
  },
  '極速流暢': { en: 'Ultra-Smooth', ja: '超なめらか高速造形' },
  ' 3D 列印耗材與智能選材': {
    en: ' 3D Filaments & Slicing Solutions',
    ja: ' 3Dフィラメント＆AI素材選定',
  },
  '全館通過 ±0.02mm 光學線徑檢驗與密封袋防潮包裝。支援藍新安全金流與超商取貨，滿 NT$999 享免運優惠。': {
    en: 'All spools pass ±0.02mm laser inspection with moisture-sealed bag packaging. Supports NewebPay checkout and Free Shipping over NT$999.',
    ja: '全製品±0.02mm光学線径検査クリア＆防湿密封袋パック採用。安全決済対応・NT$999以上で送料無料。',
  },
  'AI 耗材智能配對': { en: 'AI Filament Advisor', ja: 'AI フィラメント診断' },
  '選購全部耗材 ↓': { en: 'Browse Catalog ↓', ja: '全商品を見る ↓' },
  'AI 客服': { en: 'AI Support', ja: 'AI サポート' },
  '創客工具': { en: 'Maker Tools', ja: 'ツール箱' },
  '空盤換幣': { en: 'Spool Return', ja: '空スプール回収' },
  '規格對比': { en: 'Compare', ja: 'スペック比較' },
  '智能工具箱與服務': { en: 'Smart Maker Tools & Services', ja: 'スマートツール＆サービス' },
  '點擊下方快捷卡片，開啟專屬計算工具與回收優惠': {
    en: 'Tap any shortcut below to launch filament calculators, comparisons, and recycling rewards',
    ja: '下のカードをタップして、計算ツールや空スプール回収特典をご利用ください',
  },

  // Navigation & Tabs
  '耗材商城': { en: 'Store', ja: 'ストア' },
  '選材指南': { en: 'Material Guide', ja: '素材ガイド' },
  '3D 選材指南': { en: '3D Material Guide', ja: '3D素材ガイド' },
  '創客專欄': { en: 'Maker Blog', ja: 'メイカーコラム' },
  '18篇': { en: '18 Posts', ja: '18記事' },
  '常見問題': { en: 'FAQ', ja: 'よくある質問' },
  '關於神狗勾': { en: 'About Us', ja: '神狗勾について' },
  '關於我們': { en: 'About Us', ja: '私たちについて' },
  '會員中心': { en: 'My Account', ja: 'マイページ' },
  '會員中心 →': { en: 'Account →', ja: 'マイページ →' },
  '登入 / 註冊': { en: 'Sign In / Join', ja: 'ログイン / 登録' },
  '登入 / 註冊會員': { en: 'Sign In / Register', ja: 'ログイン / 新規登録' },
  '會員登入': { en: 'Sign In', ja: 'ログイン' },
  '註冊帳號': { en: 'Create Account', ja: '新規アカウント作成' },
  '登出': { en: 'Sign Out', ja: 'ログアウト' },
  '登出帳號': { en: 'Sign Out', ja: 'ログアウト' },
  '管理後台': { en: 'Admin Console', ja: '管理コンソール' },
  '管理員': { en: 'Admin', ja: '管理者' },
  '創客 VIP 會員': { en: 'Maker VIP Club', ja: 'メイカーVIP会員' },
  '95折': { en: '5% OFF', ja: '5%OFF' },
  '即時物流追蹤': { en: 'Order Tracking', ja: '配送状況追跡' },
  '訂單查詢': { en: 'Order Tracking', ja: '注文履歴・追跡' },
  '最近瀏覽': { en: 'Recently Viewed', ja: '最近チェックした商品' },
  '您最近看過的 3D 耗材與周邊': { en: '3D Filaments & Accessories You Recently Viewed', ja: '最近チェックした3Dフィラメント＆周辺機器' },
  '清除紀錄': { en: 'Clear History', ja: '履歴をクリア' },
  '耗材實驗室': { en: 'Maker Lab', ja: 'フィラメントラボ' },
  '空盤回收': { en: 'Spool Recycling', ja: '空スプール回収' },
  '空盤回收計畫': { en: 'Spool Recycling Program', ja: '空スプール回収プログラム' },
  'AI 耗材顧問': { en: 'AI Filament Advisor', ja: 'AI フィラメント診断' },

  // Storefront Filters & Sorting
  '篩選條件': { en: 'Filters', ja: '絞り込み' },
  '依印表機型號快篩': { en: 'Filter by 3D Printer Model', ja: '3Dプリンター機種で絞り込む' },
  '全部機型適用': { en: 'All 3D Printers', ja: '全機種対応' },
  '價格區間': { en: 'Price Range', ja: '価格帯' },
  '最低價': { en: 'Min Price', ja: '最低価格' },
  '最高價': { en: 'Max Price', ja: '最高価格' },
  '套用篩選': { en: 'Apply Filter', ja: '適用する' },
  '重設條件': { en: 'Reset Filters', ja: 'リセット' },
  '排序方式': { en: 'Sort By', ja: '並び替え' },
  '預設推薦': { en: 'Featured', ja: 'おすすめ順' },
  '最新上架': { en: 'Newest Arrivals', ja: '新着順' },
  '價格：由低到高': { en: 'Price: Low to High', ja: '価格が安い順' },
  '價格：由高到低': { en: 'Price: High to Low', ja: '価格が高い順' },
  '最高評價': { en: 'Top Rated', ja: '高評価順' },
  '熱銷排行': { en: 'Best Selling', ja: '売れ筋順' },
  '僅顯示有現貨商品': { en: 'In-Stock Only', ja: '在庫ありのみ表示' },
  '僅顯示特價商品': { en: 'On Sale Only', ja: 'セール品のみ表示' },

  // Product Card & Details
  '加入購物車': { en: 'Add to Cart', ja: 'カートに追加' },
  '立即購買': { en: 'Buy Now', ja: '今すぐ購入' },
  '選擇顏色': { en: 'Select Color', ja: 'カラーを選択' },
  '已選顏色': { en: 'Selected Color', ja: '選択中のカラー' },
  '購買數量': { en: 'Quantity', ja: '数量' },
  '確認加入購物車': { en: 'Confirm & Add to Cart', ja: '確定してカートに追加' },
  '查看詳情': { en: 'View Details', ja: '詳細を見る' },
  '加入對比': { en: 'Compare', ja: '比較に追加' },
  '已加入對比': { en: 'In Comparison', ja: '比較中' },
  '現貨供應': { en: 'In Stock', ja: '在庫あり' },
  '現貨充足': { en: 'In Stock', ja: '在庫充実' },
  '庫存緊張': { en: 'Low Stock', ja: '残りわずか' },
  '暫時缺貨': { en: 'Out of Stock', ja: '在庫切れ' },
  '補貨中': { en: 'Restocking', ja: '入荷待ち' },
  '熱銷冠軍': { en: 'Best Seller', ja: '人気No.1' },
  '店長推薦': { en: "Staff Pick", ja: '店長おすすめ' },
  '新品上市': { en: 'New Arrival', ja: '新商品' },
  '限時特惠': { en: 'Limited Offer', ja: '期間限定セール' },
  '規格參數': { en: 'Specifications', ja: '製品仕様' },
  '建議列印參數': { en: 'Recommended Print Settings', ja: '推奨プリント設定' },
  '噴頭溫度': { en: 'Nozzle Temp', ja: 'ノズル温度' },
  '熱床溫度': { en: 'Bed Temp', ja: 'ベッド温度' },
  '列印速度': { en: 'Print Speed', ja: 'プリント速度' },
  '冷卻風扇': { en: 'Cooling Fan', ja: '冷却ファン' },
  '線材直徑': { en: 'Filament Diameter', ja: 'フィラメント径' },
  '線徑公差': { en: 'Diameter Tolerance', ja: '線径公差' },
  '淨重': { en: 'Net Weight', ja: '正味重量' },
  '乾燥建議': { en: 'Drying Settings', ja: '乾燥推奨設定' },
  '是否需封箱': { en: 'Enclosure Required', ja: 'エンクロージャー' },
  '不需封箱': { en: 'Open Frame OK', ja: '不要（オープン可）' },
  '建議封箱': { en: 'Enclosure Recommended', ja: '推奨（密閉推奨）' },
  '必須封箱': { en: 'Enclosure Required', ja: '必須（要エンクロージャー）' },
  '下載切片設定檔': { en: 'Download Slicer Profile', ja: 'スライサー設定をダウンロード' },
  '顧客真實評價': { en: 'Verified Customer Reviews', ja: 'カスタマーレビュー' },
  '撰寫評價': { en: 'Write a Review', ja: 'レビューを書く' },
  '提交評價': { en: 'Submit Review', ja: 'レビューを投稿' },
  '觀看實測影片': { en: 'Watch Print Test Video', ja: '造形テスト動画を見る' },

  // Cart & Checkout
  '您的購物車是空的': { en: 'Your cart is empty', ja: 'カートに商品がありません' },
  '快去挑選喜愛的 3D 列印線材吧！': { en: 'Explore our high-precision 3D printing filaments!', ja: '高品質な3Dプリント用フィラメントを見つけましょう！' },
  '滿額免運進度': { en: 'Free Shipping Progress', ja: '送料無料まであと少し' },
  '恭喜！您已享有免運費優惠': { en: 'Unlocked! You qualify for Free Shipping!', ja: 'おめでとうございます！送料無料が適用されます' },
  '智能加購推薦（湊免運神器）': { en: 'Smart Add-Ons (Great for Free Shipping)', ja: 'おすすめ追加アイテム（送料無料対策に）' },
  '加購': { en: '+ Add', ja: '+ 追加' },
  '商品小計': { en: 'Subtotal', ja: '商品小計' },
  '預估運費': { en: 'Estimated Shipping', ja: '送料見積もり' },
  '貨物運費': { en: 'Shipping Fee', ja: '配送料' },
  '免運': { en: 'Free', ja: '無料' },
  '免運費': { en: 'Free Shipping', ja: '送料無料' },
  '優惠折扣': { en: 'Discount', ja: '割引額' },
  '優惠折扣代碼': { en: 'Promo Code', ja: 'クーポンコード' },
  '輸入優惠碼 如：GODDOG': { en: 'Enter promo code (e.g. GODDOG)', ja: 'コードを入力 (例: GODDOG)' },
  '套用': { en: 'Apply', ja: '適用' },
  '移除': { en: 'Remove', ja: '解除' },
  '總計': { en: 'Total', ja: '合計金額' },
  '應付總額': { en: 'Grand Total', ja: 'お支払い合計' },
  '前往結帳': { en: 'Proceed to Checkout', ja: 'レジへ進む' },
  '返回購物車': { en: 'Back to Cart', ja: 'カートに戻る' },
  '返回修改資料': { en: 'Edit Shipping Info', ja: '配送情報を修正' },
  '收件人資訊': { en: 'Recipient Information', ja: 'お届け先情報' },
  '收件人姓名': { en: 'Recipient Name', ja: 'お名前' },
  '聯絡電話': { en: 'Mobile Phone', ja: '電話番号' },
  '電子信箱': { en: 'Email Address', ja: 'メールアドレス' },
  '配送方式': { en: 'Delivery Method', ja: '配送方法' },
  '超商取貨 (7-ELEVEN)': { en: '7-ELEVEN Pickup', ja: 'セブン-イレブン受取' },
  '超商取貨 (全家 FamilyMart)': { en: 'FamilyMart Pickup', ja: 'ファミリーマート受取' },
  '黑貓宅急便 (宅配到府)': { en: 'Home Delivery (T-Cat)', ja: 'ヤマト宅急便（自宅配送）' },
  '選擇取貨門市': { en: 'Select Pickup Store', ja: '受取店舗を選択' },
  '收件地址 / 門市資訊': { en: 'Delivery Address / Store Info', ja: 'お届け先住所 / 店舗情報' },
  '付款方式': { en: 'Payment Method', ja: 'お支払い方法' },
  '信用卡 (一次付清)': { en: 'Credit Card', ja: 'クレジットカード（一括）' },
  'LINE Pay 行動支付': { en: 'LINE Pay', ja: 'LINE Pay' },
  'Apple Pay / Google Pay': { en: 'Apple Pay / Google Pay', ja: 'Apple Pay / Google Pay' },
  'ATM 虛擬帳號轉帳': { en: 'ATM Bank Transfer', ja: 'ATM銀行振込' },
  '超商取貨付款': { en: 'Pay at Store Pickup', ja: 'コンビニ受取時払い' },
  '發票開立方式': { en: 'Invoice Type', ja: '領収書・インボイス' },
  '雲端發票 (手機條碼載具)': { en: 'Cloud Invoice (Mobile Barcode)', ja: 'クラウドインボイス（携帯バーコード）' },
  '會員載具 (中獎自動通知)': { en: 'Member Carrier (Auto Notify)', ja: '会員キャリア（自動通知）' },
  '公司戶三聯式發票 (統編)': { en: 'Company Tax ID Invoice', ja: '法人向け領収書（統一番号）' },
  '捐贈發票 (創世基金會)': { en: 'Donate Invoice (Charity)', ja: 'インボイス寄付' },
  '訂單備註 (選填)': { en: 'Order Notes (Optional)', ja: '備考欄（任意）' },
  '訂單結帳與金流支付': { en: 'Secure Order Checkout & Payment', ja: 'ご注文手続き＆安全決済' },
  '藍新金流 NewebPay 安全連線': { en: 'NewebPay 256-bit SSL Secure Connection', ja: 'NewebPay 256-bit SSL 暗号化通信' },
  '支援信用卡・LINE Pay・Apple Pay・ATM・銀行轉帳・超商條碼': {
    en: 'Supports Credit Card, LINE Pay, Apple Pay, ATM Transfer & Store Barcode',
    ja: 'クレジットカード・LINE Pay・Apple Pay・ATM振込・コンビニ決済対応',
  },
  '本次結帳回饋會員點數：': { en: 'Reward Points Earned:', ja: '今回獲得ポイント：' },
  '點擊將導向藍新金流 (NewebPay) 256-bit SSL 安全收銀台完成付款': {
    en: 'Redirects to NewebPay 256-bit SSL encrypted checkout gateway',
    ja: 'NewebPay 256-bit SSL セキュア決済ページへ移動します',
  },

  // Spool Recycle Modal
  '環保永續・創客同行': { en: 'Eco Sustainability · Maker Rewards', ja: 'エコ循環・メイカー還元' },
  '回收您的空線盤，為地球減碳，更可兌換無門檻購物金與免運券！': {
    en: 'Recycle your empty spools to reduce carbon emissions and earn store credits & free shipping vouchers!',
    ja: '空スプールをリサイクルしてCO2を削減し、お買い物ポイントや送料無料クーポンをゲット！',
  },
  '申請回收登記': { en: 'Register Spool Return', ja: '回収を申し込む' },
  '我的回收紀錄': { en: 'My Return History', ja: '回収履歴' },
  '回收點數兌換說明': { en: 'Spool Recycling Reward Tiers', ja: '空スプール回収ポイント交換案内' },
  '不限品牌空盤皆可回收！神狗勾原廠空盤享雙倍回饋': {
    en: 'All filament brands accepted! GodDog original spools earn 2X points!',
    ja: '他社製スプールも回収OK！神狗勾純正スプールならポイント2倍！',
  },
  '神狗勾原廠塑膠空盤': { en: 'GodDog Original Plastic Spool', ja: '神狗勾 純正プラスチックスプール' },
  '神狗勾原廠環保紙盤': { en: 'GodDog Original Cardboard Spool', ja: '神狗勾 純正エコ紙スプール' },
  '他牌 1kg 標準空線盤': { en: 'Other Brand 1kg Standard Spool', ja: '他社製 1kg 標準空スプール' },
  '選擇寄回方式': { en: 'Select Return Method', ja: '返送方法を選択' },
  '7-ELEVEN 交貨便 (滿 5 個免運寄回)': { en: '7-ELEVEN Drop-off (Free for 5+ spools)', ja: 'セブン-イレブン発送（5個以上で送料無料）' },
  '全家店到店 (滿 5 個免運寄回)': { en: 'FamilyMart Drop-off (Free for 5+ spools)', ja: 'ファミリーマート発送（5個以上で送料無料）' },
  '台北/台中創客門市親送 (不限數量現領點數)': { en: 'In-Store Drop-off (Instant Points)', ja: '台北/台中ストア直接持込（即時ポイント付与）' },
  '預計寄回空盤總數': { en: 'Total Empty Spools to Return', ja: '返送予定の空スプール合計数' },
  '預估可獲得回饋': { en: 'Estimated Reward Points', ja: '獲得予定ポイント' },
  '提交回收申請並取得寄件代碼': { en: 'Submit & Get Free Return Code', ja: '申請して返送コードを取得する' },

  // VIP Subscription & Loyalty
  '升級神狗勾創客 VIP 俱樂部': { en: 'Join GodDog Maker VIP Club', ja: '神狗勾メイカーVIPクラブに参加' },
  '專為高用量 3D 列印玩家、工作室與代印農場打造的極致省錢方案': {
    en: 'Designed for high-volume 3D printing studios, print farms, and avid makers',
    ja: '3Dプリントスタジオ、プリントファーム、ヘビーユーザー向けの特別優待プラン',
  },
  '月繳方案': { en: 'Monthly Plan', ja: '月額プラン' },
  '年繳方案 (省 20%)': { en: 'Annual Plan (Save 20%)', ja: '年額プラン (20%お得)' },
  '立即開通 VIP 會員': { en: 'Activate VIP Membership', ja: 'VIPメンバーシップを有効化' },
  '會員紅利與等級中心': { en: 'Rewards & VIP Tier Center', ja: 'ポイント＆会員ランクセンター' },
  '可用紅利點數': { en: 'Available Points', ja: '利用可能ポイント' },
  '點數兌換專區': { en: 'Redeem Rewards', ja: 'ポイント交換コーナー' },
  '立即兌換': { en: 'Redeem Now', ja: '今すぐ交換' },
  '點數不足': { en: 'Insufficient Points', ja: 'ポイント不足' },

  // Auth Modal & Profile
  '歡迎回到神狗勾 3D': { en: 'Welcome Back to GodDog 3D', ja: '神狗勾 3D へようこそ' },
  '加入神狗勾創客會員': { en: 'Join GodDog Maker Community', ja: '神狗勾メイカー会員登録' },
  '登入以同步您的購物車、累積紅利點數並追蹤訂單狀態': {
    en: 'Sign in to sync your cart, earn reward points, and track your orders',
    ja: 'ログインしてカート同期、ポイント獲得、注文追跡をご利用ください',
  },
  '註冊即贈 100 點紅利購物金（可立即折抵）': {
    en: 'Get 100 bonus reward points immediately upon registration!',
    ja: '新規登録ですぐに使える100ポイントをプレゼント！',
  },
  '使用 Google 帳號快速登入': { en: 'Continue with Google', ja: 'Googleアカウントで続行' },
  '或使用電子信箱': { en: 'Or continue with Email', ja: 'またはメールアドレスで続行' },
  '忘記密碼？': { en: 'Forgot password?', ja: 'パスワードをお忘れですか？' },
  '還沒有帳號嗎？': { en: "Don't have an account?", ja: 'アカウントをお持ちでないですか？' },
  '已經有帳號了？': { en: 'Already have an account?', ja: 'すでにアカウントをお持ちですか？' },
  '立即註冊': { en: 'Sign Up Now', ja: '新規登録はこちら' },
  '立即登入': { en: 'Sign In Now', ja: 'ログインはこちら' },

  // Footer
  '台灣高精密 3D 列印耗材領導品牌。全系列線材採用進口純料，通過雙軸雷射 ±0.02mm 嚴格公差檢驗，完美相容 Bambu Lab AMS、Creality、Prusa 等主流高速機型。': {
    en: 'Leading high-precision 3D printing filament brand. Crafted from virgin resins with dual-axis ±0.02mm laser tolerance inspection, engineered for Bambu Lab AMS, Creality & Prusa.',
    ja: '高精度3Dプリントフィラメントのリーディングブランド。純度100%バージン原料と2軸レーザー±0.02mm公差検査により、Bambu Lab AMS・Creality・Prusa等の高速機に完全対応。',
  },
  '耗材選購與工具': { en: 'Shop & Maker Tools', ja: 'ショップ＆ツール' },
  '全系列 3D 耗材': { en: 'All 3D Filaments', ja: '全3Dフィラメント' },
  '3D 耗材選材指南': { en: '3D Material Guide', ja: '3D素材選びガイド' },
  '常見問題與排錯 (FAQ)': { en: 'Troubleshooting & FAQ', ja: 'よくある質問・トラブル解決' },
  'AI 智能耗材顧問': { en: 'AI Filament Advisor', ja: 'AIフィラメント診断' },
  '環保空盤回收計畫': { en: 'Empty Spool Recycling', ja: '空スプール回収プログラム' },
  '顧客服務與保障': { en: 'Customer Care & Guarantee', ja: 'サポート＆品質保証' },
  '全館滿 NT$999 免運（支援 7-11 / 全家超商取貨）': {
    en: 'Free shipping over NT$999 (7-ELEVEN / FamilyMart / Home Delivery)',
    ja: 'NT$999以上で送料無料（コンビニ受取・宅配便対応）',
  },
  '工作日 15:00 前下單，當日台灣本地倉庫急速出貨': {
    en: 'Order before 15:00 on weekdays for same-day local warehouse dispatch',
    ja: '平日15:00までのご注文で当日スピード発送',
  },
  '密封袋防潮包裝，拆封前受潮無條件免費換新': {
    en: 'Moisture-sealed bag packaging — free replacement if moisture-compromised',
    ja: '防湿密封袋包装・未開封時の吸湿は無償交換保証',
  },
  '藍新金流 NewebPay 256-bit SSL 安全加密結帳': {
    en: 'NewebPay 256-bit SSL encrypted secure payment gateway',
    ja: 'NewebPay 256-bit SSL暗号化セキュア決済',
  },
  '隱私權政策': { en: 'Privacy Policy', ja: 'プライバシーポリシー' },
  '服務條款': { en: 'Terms of Service', ja: '利用規約' },
  '退換貨政策': { en: 'Return & Refund Policy', ja: '返品・交換ポリシー' },
};

// Safe whole-label or distinct compound tokens (NO 2-char generic words that break sentences)
const TOKEN_MAP: Array<[string, TransEntry]> = [
  ['前往藍新金流結帳', { en: 'Pay Securely via NewebPay', ja: 'NewebPayで安全に決済する' }],
  ['信用卡(一次付清)', { en: 'Credit Card', ja: 'クレジットカード' }],
  ['信用卡 (一次付清)', { en: 'Credit Card', ja: 'クレジットカード' }],
  ['超商取貨 7-ELEVEN', { en: '7-ELEVEN Pickup', ja: 'セブン-イレブン受取' }],
  ['超商取貨 全家', { en: 'FamilyMart Pickup', ja: 'ファミリーマート受取' }],
  ['黑貓宅急便', { en: 'Home Delivery', ja: 'ヤマト宅急便' }],
  ['超商取貨付款', { en: 'Pay at Pickup', ja: 'コンビニ受取払い' }],
  ['加入購物車', { en: 'Add to Cart', ja: 'カートに追加' }],
  ['立即購買', { en: 'Buy Now', ja: '今すぐ購入' }],
  ['現貨供應', { en: 'In Stock', ja: '在庫あり' }],
  ['暫時缺貨', { en: 'Out of Stock', ja: '在庫切れ' }],
  ['免費運送', { en: 'Free Shipping', ja: '送料無料' }],
  ['免運費', { en: 'Free Shipping', ja: '送料無料' }],
];

export function translateDomString(text: string, lang: Language): string {
  if (lang === 'zh-TW' || !text) return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Only translate if the string actually contains Chinese characters
  if (!/[\u4e00-\u9fff]/.test(trimmed)) {
    return text;
  }

  // If target language is Japanese and string already contains Japanese Hiragana/Katakana,
  // it was already rendered in Japanese by React — do NOT touch it!
  if (lang === 'ja' && /[\u3040-\u30ff]/.test(trimmed)) {
    return text;
  }

  // 1. Exact match in PHRASE_MAP
  const exact = PHRASE_MAP[trimmed];
  if (exact) {
    const replacement = lang === 'en' ? exact.en : exact.ja;
    return text.replace(trimmed, replacement);
  }

  // 2. Check compound tokens
  let result = text;
  let changed = false;
  for (const [zhToken, entry] of TOKEN_MAP) {
    if (result.includes(zhToken)) {
      const target = lang === 'en' ? entry.en : entry.ja;
      result = result.split(zhToken).join(target);
      changed = true;
    }
  }

  // Avoid partial word-by-word replacement if it would leave mixed Chinese in English mode
  if (lang === 'en' && changed && /[\u4e00-\u9fff]/.test(result)) {
    // Only keep compound replacement if it's a structured label like "貨物運費 (超商取貨 7-ELEVEN)"
    result = result
      .replace('貨物運費', 'Shipping')
      .replace('（免運）', '(Free)')
      .replace('(免運)', '(Free)');
    if (/[\u4e00-\u9fff]/.test(result)) {
      return text;
    }
  }

  return result;
}

interface TrackedTextNode extends Text {
  __origZh?: string;
  __lastTranslated?: string;
}

interface TrackedElement extends HTMLElement {
  __origPlaceholderZh?: string;
  __lastPlaceholderTranslated?: string;
  __origTitleZh?: string;
  __lastTitleTranslated?: string;
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG']);

export function processDomSubtree(root: Node, lang: Language): void {
  if (!root) return;

  // Handle element attributes (placeholder, title)
  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as TrackedElement;
    if (SKIP_TAGS.has(el.tagName) || el.closest?.('[data-no-auto-translate="true"]')) {
      return;
    }

    const placeholder = el.getAttribute('placeholder');
    if (placeholder !== null) {
      if (lang === 'zh-TW') {
        if (
          el.__lastPlaceholderTranslated !== undefined &&
          placeholder === el.__lastPlaceholderTranslated &&
          el.__origPlaceholderZh !== undefined
        ) {
          el.setAttribute('placeholder', el.__origPlaceholderZh);
        }
        el.__origPlaceholderZh = undefined;
        el.__lastPlaceholderTranslated = undefined;
      } else {
        if (placeholder !== el.__lastPlaceholderTranslated) {
          // React updated placeholder directly
          if (
            !/[\u4e00-\u9fff]/.test(placeholder) ||
            (lang === 'ja' && /[\u3040-\u30ff]/.test(placeholder))
          ) {
            el.__origPlaceholderZh = undefined;
            el.__lastPlaceholderTranslated = undefined;
          } else {
            el.__origPlaceholderZh = placeholder;
          }
        }
        if (el.__origPlaceholderZh) {
          const translated = translateDomString(el.__origPlaceholderZh, lang);
          if (translated !== placeholder) {
            el.__lastPlaceholderTranslated = translated;
            el.setAttribute('placeholder', translated);
          }
        }
      }
    }

    const titleAttr = el.getAttribute('title');
    if (titleAttr !== null) {
      if (lang === 'zh-TW') {
        if (
          el.__lastTitleTranslated !== undefined &&
          titleAttr === el.__lastTitleTranslated &&
          el.__origTitleZh !== undefined
        ) {
          el.setAttribute('title', el.__origTitleZh);
        }
        el.__origTitleZh = undefined;
        el.__lastTitleTranslated = undefined;
      } else {
        if (titleAttr !== el.__lastTitleTranslated) {
          if (
            !/[\u4e00-\u9fff]/.test(titleAttr) ||
            (lang === 'ja' && /[\u3040-\u30ff]/.test(titleAttr))
          ) {
            el.__origTitleZh = undefined;
            el.__lastTitleTranslated = undefined;
          } else {
            el.__origTitleZh = titleAttr;
          }
        }
        if (el.__origTitleZh) {
          const translated = translateDomString(el.__origTitleZh, lang);
          if (translated !== titleAttr) {
            el.__lastTitleTranslated = translated;
            el.setAttribute('title', translated);
          }
        }
      }
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-auto-translate="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode() as TrackedTextNode | null;
  while (current) {
    const val = current.nodeValue || '';
    if (val.trim()) {
      if (lang === 'zh-TW') {
        // Only restore if this text node is still holding our auto-translated string
        if (
          current.__lastTranslated !== undefined &&
          val === current.__lastTranslated &&
          current.__origZh !== undefined
        ) {
          current.nodeValue = current.__origZh;
        }
        // Clear tracking in zh-TW so we NEVER poison future React renders
        current.__origZh = undefined;
        current.__lastTranslated = undefined;
      } else {
        // If current nodeValue differs from what we last wrote, React itself updated the text node!
        if (val !== current.__lastTranslated) {
          const hasChinese = /[\u4e00-\u9fff]/.test(val);
          const hasJapaneseKana = /[\u3040-\u30ff]/.test(val);

          if (!hasChinese || (lang === 'ja' && hasJapaneseKana)) {
            // React already localized this node for the active language! Leave it untouched.
            current.__origZh = undefined;
            current.__lastTranslated = undefined;
            current = walker.nextNode() as TrackedTextNode | null;
            continue;
          }
          // Otherwise it's a hardcoded Chinese string rendered while in en/ja mode
          current.__origZh = val;
        }

        if (current.__origZh) {
          const translated = translateDomString(current.__origZh, lang);
          if (translated !== val) {
            current.__lastTranslated = translated;
            current.nodeValue = translated;
          }
        }
      }
    }
    current = walker.nextNode() as TrackedTextNode | null;
  }
}

import { LanguageCode, CurrencyCode, FilamentProduct, ColorOption } from '../types';

export const currencyRates: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  TWD: { symbol: 'NT$', rate: 1, label: '新台幣 (TWD)' },
  USD: { symbol: '$', rate: 0.031, label: 'USD ($)' },
  JPY: { symbol: '¥', rate: 4.65, label: '日本円 (JPY)' },
};

export function formatPrice(amountInTwd: number, currency: CurrencyCode): string {
  const { symbol, rate } = currencyRates[currency];
  const converted = amountInTwd * rate;
  if (currency === 'TWD' || currency === 'JPY') {
    return `${symbol} ${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol} ${converted.toFixed(2)}`;
}

export const translations = {
  'zh-TW': {
    // Brand & Header Navigation
    brandName: '神狗勾耗材',
    brandTagline: '專業級 3D 列印工程耗材與智能解決方案',
    brandSub: '高速 3D 列印線材專營',
    flagshipStore: '旗艦館',
    storefront: '耗材商城',
    navCatalog: '耗材商城',
    navSubscription: '我的訂閱',
    subscriptionClub: '我的訂閱 (創客 VIP 俱樂部)',
    navAiAdvisor: 'AI 智慧切片顧問',
    aiAdvisorBtn: 'AI 耗材顧問',
    aiAdvisorSubtitle: '依您的 3D 列印機型與需求，智能推薦最佳耗材與切片參數',
    navLogistics: '即時物流追蹤',
    navMemberClub: '創客會員俱樂部',
    navAdmin: '管理後台',
    adminDashboard: '管理後台',
    navTechGuide: '金流與多語指南',
    navAndroidAds: '安卓 SDK 廣告盈利',
    navCart: '購物車',
    cart: '購物車',
    points: '創客積分',
    memberTier: '會員等級',
    memberLabel: '會員',
    viewPerks: '查看積分與特權 →',
    loginWithGoogle: '登入會員 / 連結 Google 帳號',
    login: '登入',
    logout: '安全登出',
    guestUser: '訪客創客',
    langCurrency: '語系 / 幣別',
    aiSupport: 'AI客服',
    makerTools: '創客工具',
    specCompare: '規格對比',
    wishlist: '願望清單',
    spoolRecycle: '空盤回收',
    spoolRecycleBtn: '空盤換幣',
    sslEncrypted: '藍新 SSL 安全加密',
    searchPlaceholderNav: '搜尋線材 (PLA, PETG, TPU)...',
    searchPlaceholderInput: '搜尋耗材材質 (PLA+, 碳纖維, PETG, TPU) 或品牌 (神狗勾, Bambu)...',
    searchPlaceholder: '搜尋 3D 列印耗材 (PLA, PETG, ABS, 碳纖維, 光固化樹脂, 線徑 1.75mm...)',

    // Marquee Promo Bar
    promoBadge: '限時優惠',
    promoText1: '⚡ 慶祝高速耗材登陸！全館滿 NT$999 享超商免運 ＋ 支援多元安全支付與超商取貨付款！',
    promoText2: '🚀 新款神狗勾 PLA-CF 航太級碳纖維耗材熱烈預購中！',
    promoText3: '🎁 凡於當月壽星專區結帳，輸入序號即享獨家神秘 3D 列印配件包！',
    promoText4: '♻️ 空盤回收換積分活動進行中，環保地球你我有責！',

    // Bottom Navigation Bar
    bottomStore: '商城',
    bottomGuide: '選材指南',
    bottomAiAdvisor: 'AI 顧問',
    bottomAiBot: 'AI 機器人',
    aiAdvisor: 'AI 顧問',
    bottomBlog: '創客專欄',
    bottomProfile: '我的',

    // Hero Banner & Quick Actions
    heroBadge: '2026 新世代 High-Speed 600mm/s 拓竹 AMS 與 K1 專用線材',
    heroTitlePrefix: '極速流暢，',
    heroTitleHighlight: '分毫不差',
    heroTitleSuffix: ' 的 3D 列印耗材專家',
    heroDesc: '全館耗材通過 0.02mm 高精度光學線徑檢驗與真空鋁箔防潮包裝。支援藍新金流 (信用卡/ATM/超商代碼/Apple Pay)，全台 7-11 與全家超商取貨滿 NT$999 免運！',
    heroCtaAi: 'AI 耗材顧問：依機型精準配對',
    heroCtaSub: '訂閱俱樂部 (每月 85 折直送)',
    heroTestCheckout: '⚡ 快速結帳',
    heroSpeedBadge: '極限高速出膠不碳化、層間結合力強',
    heroPrecisionBadge: '光學校準同心度，連續列印不卡噴嘴',
    heroAmsBadge: '標準 200mm 卷軸，拓竹多色完美進退料',
    heroFastBadge: '台灣現貨新竹/7-11/全家快速發貨',

    // App Services Matrix ("金剛區")
    matrixAiAdvisor: 'AI 顧問',
    matrixAiAdvisorSub: '機型配對',
    matrixMakerTools: '創客工具',
    matrixMakerToolsSub: '報價/餘量',
    matrixSpoolRecycle: '空盤換幣',
    matrixSpoolRecycleSub: '折抵現金',
    matrixSpecCompare: '規格對比',
    matrixSpecCompareSub: '多款橫向PK',

    // Feature Ticker & Guarantees
    tickerFreeShipping: '滿 $999 免運',
    tickerPayment: '藍新/Apple Pay',
    tickerAms: 'AMS 相容',
    tickerWarranty: '原廠防潮保固',
    featureTrackingTitle: '即時物流追蹤',
    featureTrackingDesc: '超商交貨便 24H 快速出貨',
    featurePaymentTitle: '藍新安全金流',
    featurePaymentDesc: '官方特店 256-bit SSL 安全付款',
    featureBambuTitle: 'Bambu AMS 完美相容',
    featureBambuDesc: '防卡料環保卷軸設計',
    featureWarrantyTitle: '原廠防潮保固',
    featureWarrantyDesc: '未拆封破損 100% 免費換新',

    // Storefront Filters & Sorters
    materialsFilter: '耗材材質分類',
    allMaterials: '全部材質',
    allCategories: '全部耗材',
    inStockOnly: '僅顯示現貨',
    productCountLabel: '共 {count} 款耗材',
    filterCountLabel: '篩選：',
    filterCountSuffix: ' 款',
    sortBy: '排序方式：',
    sortPopular: '熱門銷售排行',
    sortPriceLow: '價格由低至高',
    sortPriceHigh: '價格由高至低',
    sortRating: '顧客評價最高',

    // Product Card & Catalog
    quickCheckout: '立即結帳',
    addToCart: '加入購物車',
    addedToCart: '已加入購物車！',
    viewDetail: '查看切片參數與規格',
    speedMax: '最高列印速度',
    nozzleTemp: '建議噴嘴溫度',
    bedTemp: '建議熱床溫度',
    stockLeft: '卷現貨',
    inStock: '現貨庫存充足',
    lowStock: '僅剩少量現貨',
    outOfStock: '已售完補貨中',
    savePercent: '現省 {percent}%',
    selectColor: '選擇顏色',
    colorSwatches: '顏色',
    pricePerSpool: '卷',
    spoolSpecs: '專業線材規格參數',
    nozzleTempLabel: '建議噴嘴溫度',
    bedTempLabel: '建議熱床溫度',
    maxSpeedLabel: '適配列印速度',
    spoolType: '線盤規格',
    noReviewsYet: '尚無評價',
    viewReviews: '點擊查看真實顧客評價',
    printSpeed: '列印速度',
    tempSpecs: '溫度規格',

    // Cart Drawer
    emptyCart: '購物車目前是空的，快去挑選專業 3D 列印耗材吧！',
    freeShippingNotice: '全館滿 NT$999 享 7-11 / 全家 超商免運送到家！',
    needMoreForFreeShipping: '還差 {amount} 即可享超商取貨免運費',
    freeShippingUnlocked: '恭喜！已享有 7-11 / 全家 超商免運費優惠！',
    checkout: '前往結帳',
    subtotal: '商品小計',
    shippingFee: '運費',
    freeShipping: '免運費 (已達滿額門檻)',
    discount: '優惠折扣',
    pointsDiscount: '創客積分折抵',
    totalAmount: '應付總金額',
    placeOrder: '確認下單並送出金流授權',
    pointsEarnNotice: '本次下單完成預計獲得 {pts} 點創客積分',

    // Checkout & Payment
    checkoutTitle: '訂單結帳與金流支付',
    shippingMethod: '配送方式選擇',
    convenienceStore: '7-ELEVEN / 全家超商取件 (支援取貨付款與先付後取)',
    homeDelivery: '黑貓宅急便 (低溫/常溫專車速配到府)',
    paymentGateway: '選擇在地支付金流',
    ecpayCredit: '藍新金流 NewebPay 信用卡 (支援 Visa/Master/JCB 3D 驗證)',
    ecpayAtm: '藍新金流 NewebPay ATM 虛擬轉帳帳號 (24H 自動秒級銷帳)',
    ecpayCvs: '藍新金流 NewebPay 超商代碼 / 條碼繳費 (7-11 ibon / 全家 FamiPort)',
    linePayTitle: 'LINE Pay 行動支付 (即將推出)',
    googlePayTitle: 'Google Pay 快速付款',
    orderSummary: '訂單摘要',
    shipping: '物流運費',
    pointsRedeem: '積分折抵',
    totalPay: '實付總額',
    confirmPayment: '前往藍新金流安全付款',

    // Tracking & Support
    liveTracking: '即時物流追蹤',
    enterTrackingCode: '輸入包裹託運單號',
    searchTracking: '查詢物流進度',
    supportTitle: '24H 線上技術客服與 3D 列印故障排查',

    // Android SDK Ad Monetization
    androidAdTitle: '安卓 SDK 廣告盈利中心 (Android AdMob Monetization)',
    androidAdSubtitle: '整合 Google Mobile Ads (AdMob) 原生 SDK，支援激勵影片廣告、智慧橫幅廣告與插頁式廣告',
    watchAdRewardBtn: '看廣告領取 50 創客積分',
    watchingAdModalTitle: 'Google AdMob 獎勵影片廣告播放中',
    watchingAdNotice: '請完整觀看廣告即可獲得 50 點創客積分，結帳時可折抵 NT$50 現金！',
    rewardEarnedTitle: '🎉 獎勵發放成功！',
    rewardEarnedDesc: '已成功入帳 50 點創客積分至您的會員帳戶！',
    testBannerText: '【AdMob 智慧橫幅廣告】2026 高速 3D 列印機專用硬化鋼噴嘴特惠中！現折 NT$100',
    adMobRevenueTitle: '廣告收益與成效統計',
    currency: '幣別',
    language: '語言',

    // Extended Navigation & Matrix & Contact
    navArticlesCount: '創客專欄 (18篇)',
    navFaq: '常見問題百科',
    navGuideShort: '3D選材指南',
    navAbout: '關於神狗勾',
    navHistory: '最近瀏覽記錄',
    navLoginPrompt: '登入會員 / 連結 Google 帳號',
    navPointsSuffix: '積分',
    aiAdvisorHeroTitle: 'AI 耗材顧問',
    aiAdvisorHeroTag: '機型配對',
    aiAdvisorHeroDesc: '輸入 3D 印表機型號，自動精準適配最佳線材與切片參數',
    matrixAiBot: 'AI 機器人',
    matrixAiBotSub: '智能客服/排查',
    matrixRecycle: '空盤換幣',
    matrixRecycleSub: '折抵現金',
    matrixCompare: '規格對比',
    matrixCompareSub: '多款橫向PK',
    heroCtaCatalog: '選購全部耗材型錄 ↓',
    heroSpeedSub: '極限高速出膠不碳化、層間結合力強',
    heroPrecisionSub: '光學校準同心度，連續列印不卡噴嘴',
    heroAmsSub: '標準 200mm 卷軸，拓竹多色完美進退料',
    heroFastSub: '台灣現貨新竹/7-11/全家快速發貨',
    filterMaterialLabel: '材質：',
    filterSortLabel: '排序：',
    filterSortPopular: '熱銷排行 (預設)',
    filterSortPriceLow: '價格：由低至高',
    filterSortPriceHigh: '價格：由高至低',
    filterSortRating: '創客評分最高',
    filterCountItems: '款',
    filterResetAll: '重設所有篩選 ✕',
    noProductsTitle: '找不到符合條件的 3D 列印耗材',
    noProductsDesc: '建議嘗試切換不同材質標籤或清除關鍵字搜尋！',
    noProductsResetBtn: '重設搜尋條件',
    compareFloatingBar: '已選 {count} / 4 款',
    compareFloatingAction: '橫向規格對比',
    compareFloatingClear: '清空選取',

    // Contact Us Full Page
    contactTitle: '聯絡我們',
    contactSubtitle: '無論是 3D 列印線材選購問題、訂單查詢，或是大宗採購與技術支援，神狗勾耗材商城的客服團隊都隨時準備好為您服務。',
    contactHotline: '客服專線',
    contactHotlineVal: '+886 911331772',
    contactEmail: '電子郵件',
    contactEmailVal: 'babe0615@gmail.com',
    contactHours: '服務時間',
    contactHoursVal: '週一至週五 09:00 - 18:00 (國定假日休息)',
    contactAddress: '公司地址',
    contactAddressVal: '621 嘉義縣民雄鄉福樂村埤角1-50號',
    contactFormHeading: '發送訊息給我們',
    contactFormDesc: '訊息將直接傳送至我們的客服信箱。我們會在 24 小時內回覆您的郵件！',
    contactNameLabel: '您的姓名',
    contactNamePlaceholder: '王大明',
    contactEmailLabel: '聯絡信箱',
    contactEmailPlaceholder: 'your@email.com',
    contactMsgLabel: '訊息內容',
    contactMsgPlaceholder: '請描述您的問題...',
    contactSubmitBtn: '送出訊息',
    contactSubmitting: '發送中...',
    contactSuccessTitle: '感謝您的來信！',
    contactSuccessDesc: '我們已經收到您的訊息，神狗勾客服團隊會盡量在 24 小時內回覆您，謝謝您的支持！',
    contactBackBtn: '返回',
    contactFormError: '發送失敗，請確認填寫內容或稍後再試。',
    contactNetworkError: '網路連線異常，請稍後再試。',

    // Footer
    footerBrand: '神狗勾耗材旗艦館',
    footerDesc: '專營高品質 3D 列印線材，提供卓越的列印體驗與技術支援。',
    footerAboutServices: '關於與服務',
    footerLegalPolicies: '法律與政策',
    footerContactInfo: '聯絡資訊',
    footerFilamentStore: '耗材商城',
    footerMaterialGuide: '3D 耗材材質全指南',
    footerFaq: '常見問題 FAQ',
    footerBlog: '創客知識庫 (Blog)',
    footerAboutUs: '關於我們',
    footerContactUs: '聯絡我們',
    footerPrivacy: '隱私權保護政策',
    footerTerms: '服務條款',
    footerRefund: '退換貨政策',
    footerSupportPaymentNote: '支援 藍新安全金流 / Apple Pay / 超商取貨付款',
    footerSslSecure: 'SSL 安全加密',
    footerCopyright: '© 2026 神狗勾 3D 耗材商城. All rights reserved.',
  },

  'en': {
    // Brand & Header Navigation
    brandName: 'GodDog Filaments',
    brandTagline: 'Professional 3D Printing Engineering Filaments & Smart Platform',
    brandSub: 'High-Speed 3D Filaments',
    flagshipStore: 'Official Store',
    storefront: 'Filament Store',
    navCatalog: 'Filament Store',
    navSubscription: 'Maker Box Club',
    subscriptionClub: 'Maker Box (15% Off Monthly)',
    navAiAdvisor: 'AI Slicer Advisor',
    aiAdvisorBtn: 'AI Filament Advisor',
    aiAdvisorSubtitle: 'Smart filament & slicer recommendations tailored to your 3D printer',
    navLogistics: 'Live Logistics Tracking',
    navMemberClub: 'Maker Rewards Club',
    navAdmin: 'Admin Portal',
    adminDashboard: 'Admin Portal',
    navTechGuide: 'Payment & i18n Spec',
    navAndroidAds: 'Android AdMob SDK',
    navCart: 'Cart',
    cart: 'Cart',
    points: 'Maker Points',
    memberTier: 'Member Tier',
    memberLabel: 'Member',
    viewPerks: 'View Perks & Points →',
    loginWithGoogle: 'Sign In / Connect Google Account',
    login: 'Sign In',
    logout: 'Sign Out',
    guestUser: 'Guest Maker',
    langCurrency: 'Lang / Currency',
    aiSupport: 'AI Support',
    makerTools: 'Maker Tools',
    specCompare: 'Compare',
    wishlist: 'Wishlist',
    spoolRecycle: 'Spool Recycle',
    spoolRecycleBtn: 'Spool Return',
    sslEncrypted: '256-bit SSL Secure',
    searchPlaceholderNav: 'Search filaments (PLA, PETG, TPU)...',
    searchPlaceholderInput: 'Search materials (PLA+, Carbon Fiber, PETG, TPU) or brands...',
    searchPlaceholder: 'Search 3D filaments (PLA, PETG, ABS, Carbon Fiber, Resin, 1.75mm...)',

    // Marquee Promo Bar
    promoBadge: 'Special Promo',
    promoText1: '⚡ High-Speed 3D Filaments live! Free shipping over NT$999 | Instant checkout with Credit Card & Apple Pay!',
    promoText2: '🚀 New GodDog Aerospace PLA-CF Carbon Fiber Filament available for pre-order!',
    promoText3: '🎁 Birthday special: Enter your member code at checkout for an exclusive 3D printing tool pack!',
    promoText4: '♻️ Recycle empty spools for Maker Points — print green and save cash!',

    // Bottom Navigation Bar
    bottomStore: 'Store',
    bottomGuide: 'Guide',
    bottomAiAdvisor: 'AI Advisor',
    bottomAiBot: 'AI Chat',
    aiAdvisor: 'AI Advisor',
    bottomBlog: 'Maker Blog',
    bottomProfile: 'Account',

    // Hero Banner & Quick Actions
    heroBadge: '2026 Next-Gen High-Speed 600mm/s Filaments for Bambu AMS & Creality K1',
    heroTitlePrefix: 'Ultra-Smooth, ',
    heroTitleHighlight: 'Zero-Clog',
    heroTitleSuffix: ' Engineered 3D Filaments',
    heroDesc: 'All spools laser-measured to ±0.02mm precision with moisture-proof vacuum sealing. Instant NewebPay & Apple Pay checkout with free shipping over NT$999!',
    heroCtaAi: 'AI Slicer Advisor: Match Your 3D Printer',
    heroCtaSub: 'Maker Box Club (15% Off Monthly)',
    heroTestCheckout: '⚡ Fast Checkout',
    heroSpeedBadge: 'Smooth high flow at 600mm/s, zero carbonization & strong layer bond',
    heroPrecisionBadge: 'Optical concentricity calibration, continuous jam-free printing',
    heroAmsBadge: 'Standard 200mm spool, smooth Bambu AMS multi-color retracts',
    heroFastBadge: 'Local stock, 24H fast dispatch to 7-11 & FamilyMart stores',

    // App Services Matrix ("金剛區")
    matrixAiAdvisor: 'AI Advisor',
    matrixAiAdvisorSub: 'Printer Match',
    matrixMakerTools: 'Maker Tools',
    matrixMakerToolsSub: 'Cost & Spool',
    matrixSpoolRecycle: 'Spool Return',
    matrixSpoolRecycleSub: 'Store Credit',
    matrixSpecCompare: 'Compare',
    matrixSpecCompareSub: 'Side-by-side',

    // Feature Ticker & Guarantees
    tickerFreeShipping: 'Free Ship $999+',
    tickerPayment: 'NewebPay / Apple Pay',
    tickerAms: 'AMS Ready',
    tickerWarranty: 'Moisture Sealed',
    featureTrackingTitle: 'Live Logistics Tracking',
    featureTrackingDesc: '24H fast dispatch to convenience stores',
    featurePaymentTitle: 'NewebPay & Apple Pay',
    featurePaymentDesc: 'Official merchant 256-bit SSL secure payments',
    featureBambuTitle: 'Bambu AMS Compatible',
    featureBambuDesc: 'Anti-tangle eco-friendly spool design',
    featureWarrantyTitle: 'Moisture Protection Warranty',
    featureWarrantyDesc: '100% free replacement for packaging seal defects',

    // Storefront Filters & Sorters
    materialsFilter: 'Material Filter',
    allMaterials: 'All Materials',
    allCategories: 'All Filaments',
    inStockOnly: 'In Stock Only',
    productCountLabel: '{count} Filaments',
    filterCountLabel: 'Showing: ',
    filterCountSuffix: ' items',
    sortBy: 'Sort by:',
    sortPopular: 'Most Popular',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortRating: 'Highest Customer Rating',

    // Product Card & Catalog
    quickCheckout: 'Buy Now',
    addToCart: 'Add to Cart',
    addedToCart: 'Added!',
    viewDetail: 'View Slicer Specs & Settings',
    speedMax: 'Max Speed',
    nozzleTemp: 'Nozzle Temp',
    bedTemp: 'Bed Temp',
    stockLeft: 'spools in stock',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    savePercent: 'Save {percent}%',
    selectColor: 'Select Color',
    colorSwatches: 'Colors',
    pricePerSpool: 'spool',
    spoolSpecs: 'Technical Specifications',
    nozzleTempLabel: 'Recommended Nozzle Temp',
    bedTempLabel: 'Recommended Bed Temp',
    maxSpeedLabel: 'Recommended Printing Speed',
    spoolType: 'Spool Type',
    noReviewsYet: 'No reviews yet',
    viewReviews: 'Click to read verified buyer reviews',
    printSpeed: 'Print Speed',
    tempSpecs: 'Temperature Specs',

    // Cart Drawer
    emptyCart: 'Your cart is empty. Explore our top engineering 3D filaments!',
    freeShippingNotice: 'Free shipping on orders over NT$999 (7-11 / FamilyMart)!',
    needMoreForFreeShipping: 'Add {amount} more for free shipping',
    freeShippingUnlocked: 'Congratulations! Free shipping unlocked for this order!',
    checkout: 'Proceed to Checkout',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping',
    freeShipping: 'Free Shipping (Threshold Met)',
    discount: 'Discount',
    pointsDiscount: 'Maker Points Used',
    totalAmount: 'Total Amount',
    placeOrder: 'Confirm Order & Pay',
    pointsEarnNotice: 'Earn {pts} Maker Points with this order',

    // Checkout & Payment
    checkoutTitle: 'Checkout & Payment Gateways',
    shippingMethod: 'Select Shipping Method',
    convenienceStore: '7-ELEVEN / FamilyMart Pickup (Cash on delivery or prepaid)',
    homeDelivery: 'Express Home Delivery (Black Cat Courier)',
    paymentGateway: 'Select Payment Gateway',
    ecpayCredit: 'ECPay Credit Card (Visa, Master, JCB with 3D Secure OTP)',
    ecpayAtm: 'ECPay Virtual ATM Account (24/7 instant reconciliation)',
    ecpayCvs: 'ECPay Convenience Store Barcode / Code Payment (7-11 ibon)',
    linePayTitle: 'LINE Pay (Coming Soon)',
    googlePayTitle: 'Google Pay Fast Checkout',
    orderSummary: 'Order Summary',
    shipping: 'Shipping',
    pointsRedeem: 'Points Used',
    totalPay: 'Grand Total',
    confirmPayment: 'Proceed to Secure NewebPay Gateway',

    // Tracking & Support
    liveTracking: 'Live Logistics Tracking',
    enterTrackingCode: 'Enter parcel tracking code',
    searchTracking: 'Track Package',
    supportTitle: '24/7 Technical Support & 3D Print Troubleshooting',

    // Android SDK Ad Monetization
    androidAdTitle: 'Android SDK Ad Monetization (AdMob)',
    androidAdSubtitle: 'Integrated Google Mobile Ads SDK with Rewarded Videos, Adaptive Banners & Interstitials',
    watchAdRewardBtn: 'Watch Ad for +50 Maker Points',
    watchingAdModalTitle: 'Google AdMob Rewarded Video Ad Playing',
    watchingAdNotice: 'Watch the full 15s sponsored ad to earn 50 Maker Points (worth NT$50 off your order)!',
    rewardEarnedTitle: '🎉 Reward Granted!',
    rewardEarnedDesc: '50 Maker Points have been credited to your member account!',
    testBannerText: '【AdMob Smart Banner】2026 Hardened Steel Nozzles for High-Speed 3D Printers on Sale!',
    adMobRevenueTitle: 'AdMob Revenue & Performance Metrics',
    currency: 'Currency',
    language: 'Language',

    // Extended Navigation & Matrix & Contact
    navArticlesCount: 'Maker Blog (18)',
    navFaq: 'FAQ & Troubleshooting',
    navGuideShort: '3D Material Guide',
    navAbout: 'About GodDog 3D',
    navHistory: 'Recently Viewed',
    navLoginPrompt: 'Sign In / Connect Google Account',
    navPointsSuffix: 'pts',
    aiAdvisorHeroTitle: 'AI Filament Advisor',
    aiAdvisorHeroTag: 'Printer Match',
    aiAdvisorHeroDesc: 'Enter your 3D printer model for auto-matched filaments and slicer settings',
    matrixAiBot: 'AI Bot',
    matrixAiBotSub: 'Smart Support',
    matrixRecycle: 'Spool Return',
    matrixRecycleSub: 'Store Credit',
    matrixCompare: 'Compare',
    matrixCompareSub: 'Side-by-Side',
    heroCtaCatalog: 'Browse All Filaments ↓',
    heroSpeedSub: 'Smooth high flow at 600mm/s, zero carbonization & strong layer bond',
    heroPrecisionSub: 'Optical concentricity calibration, continuous jam-free printing',
    heroAmsSub: 'Standard 200mm spool, smooth Bambu AMS multi-color retracts',
    heroFastSub: 'Local stock, 24H fast dispatch to 7-11 & FamilyMart stores',
    filterMaterialLabel: 'Material:',
    filterSortLabel: 'Sort by:',
    filterSortPopular: 'Most Popular (Default)',
    filterSortPriceLow: 'Price: Low to High',
    filterSortPriceHigh: 'Price: High to Low',
    filterSortRating: 'Highest Customer Rating',
    filterCountItems: 'items',
    filterResetAll: 'Reset All Filters ✕',
    noProductsTitle: 'No matching 3D filaments found',
    noProductsDesc: 'Try switching material tags or clearing search keywords!',
    noProductsResetBtn: 'Reset Search',
    compareFloatingBar: 'Selected {count} / 4 items',
    compareFloatingAction: 'Compare Selected',
    compareFloatingClear: 'Clear Selection',

    // Contact Us Full Page
    contactTitle: 'Contact Us',
    contactSubtitle: 'Whether you have questions about filament selection, order tracking, bulk procurement, or technical troubleshooting, the GodDog 3D customer service team is always here to assist you.',
    contactHotline: 'Customer Support Hotline',
    contactHotlineVal: '+886 911331772',
    contactEmail: 'Email Address',
    contactEmailVal: 'babe0615@gmail.com',
    contactHours: 'Business Hours',
    contactHoursVal: 'Mon - Fri 09:00 - 18:00 (Closed on Public Holidays)',
    contactAddress: 'Office Address',
    contactAddressVal: 'No. 1-50, Pijiao, Fule Vil., Minxiong Township, Chiayi County 621, Taiwan',
    contactFormHeading: 'Send Us a Message',
    contactFormDesc: 'Your message will be sent directly to our support inbox. We will reply within 24 hours!',
    contactNameLabel: 'Your Name',
    contactNamePlaceholder: 'John Doe',
    contactEmailLabel: 'Email Address',
    contactEmailPlaceholder: 'your@email.com',
    contactMsgLabel: 'Message Content',
    contactMsgPlaceholder: 'Please describe your inquiry or issue...',
    contactSubmitBtn: 'Send Message',
    contactSubmitting: 'Sending...',
    contactSuccessTitle: 'Thank You for Reaching Out!',
    contactSuccessDesc: 'We have received your message. The GodDog 3D support team will reply within 24 hours. Thank you for your support!',
    contactBackBtn: 'Back to Home',
    contactFormError: 'Failed to send. Please check your form or try again later.',
    contactNetworkError: 'Network error. Please try again later.',

    // Footer
    footerBrand: 'GodDog 3D Filaments Flagship',
    footerDesc: 'Specializing in high-performance 3D printing filaments with superior printing reliability and technical support.',
    footerAboutServices: 'About & Services',
    footerLegalPolicies: 'Legal & Policies',
    footerContactInfo: 'Contact Information',
    footerFilamentStore: 'Filament Store',
    footerMaterialGuide: '3D Material Guide',
    footerFaq: 'FAQ & Troubleshooting',
    footerBlog: 'Maker Knowledge Base',
    footerAboutUs: 'About Us',
    footerContactUs: 'Contact Us',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerRefund: 'Refund & Return Policy',
    footerSupportPaymentNote: 'Supports NewebPay / Apple Pay / Convenience Store COD',
    footerSslSecure: '256-bit SSL Secure',
    footerCopyright: '© 2026 GodDog 3D Filaments Store. All rights reserved.',
  },

  'ja': {
    // Brand & Header Navigation
    brandName: '神狗勾 3D',
    brandTagline: 'プロ仕様 3Dプリンター用高性能フィラメント＆スマートモール',
    brandSub: '高速3Dプリント線材専門店',
    flagshipStore: '公式ストア',
    storefront: 'フィラメント一覧',
    navCatalog: 'フィラメント一覧',
    navSubscription: 'メーカー定期便',
    subscriptionClub: 'メーカー定期便 (毎月15%OFF)',
    navAiAdvisor: 'AI スライスアドバイザー',
    aiAdvisorBtn: 'AI 材料アドバイザー',
    aiAdvisorSubtitle: 'お使いの3Dプリンターに最適なフィラメントとスライサー設定をAIが提案',
    navLogistics: 'リアルタイム配送追跡',
    navMemberClub: 'メーカー会員プログラム',
    navAdmin: '管理パネル',
    adminDashboard: '管理パネル',
    navTechGuide: '決済・多言語仕様書',
    navAndroidAds: 'Android 広告収益化 SDK',
    navCart: 'カート',
    cart: 'カート',
    points: '会員ポイント',
    memberTier: '会員ランク',
    memberLabel: '会員',
    viewPerks: '特典とポイントを確認 →',
    loginWithGoogle: 'ログイン / Google連携',
    login: 'ログイン',
    logout: 'ログアウト',
    guestUser: 'ゲスト創客',
    langCurrency: '言語 / 通貨',
    aiSupport: 'AIサポート',
    makerTools: '創客ツール',
    specCompare: 'スペック比較',
    wishlist: 'お気に入り',
    spoolRecycle: 'スプール回収',
    spoolRecycleBtn: 'スプール換金',
    sslEncrypted: 'SSL暗号化安全決済',
    searchPlaceholderNav: 'フィラメントを検索 (PLA, PETG, TPU)...',
    searchPlaceholderInput: '素材名 (PLA+, カーボン, PETG, TPU) やブランドで検索...',
    searchPlaceholder: '3Dフィラメントを検索 (PLA, PETG, ABS, カーボン, レジン, 1.75mm...)',

    // Marquee Promo Bar
    promoBadge: '限定特典',
    promoText1: '⚡ 次世代高速フィラメント登場！NT$999以上でコンビニ送料無料＆クレジットカード・Apple Pay即時決済対応！',
    promoText2: '🚀 新製品！神狗勾 PLA-CF 航空グレードカーボンファイバー好評予約受付中！',
    promoText3: '🎁 お誕生月限定：ご注文時にクーポン入力で特製3Dプリントツールセット進呈！',
    promoText4: '♻️ 使用済み空スプール回収でポイント還元中！環境に優しい3Dプリントライフを！',

    // Bottom Navigation Bar
    bottomStore: 'ショップ',
    bottomGuide: '選材ガイド',
    bottomAiAdvisor: 'AI相談',
    bottomAiBot: 'AIロボット',
    aiAdvisor: 'AI相談',
    bottomBlog: '創客コラム',
    bottomProfile: 'マイページ',

    // Hero Banner & Quick Actions
    heroBadge: '2026 次世代 High-Speed 600mm/s Bambu AMS & Creality K1 対応高速フィラメント',
    heroTitlePrefix: '超高速・ノズル',
    heroTitleHighlight: '詰まりゼロ',
    heroTitleSuffix: ' の高精度 3D フィラメント',
    heroDesc: '全製品公差 ±0.02mm 高精度レーザー検査済み＆防湿アルミ真空パック包装。藍新金流・Apple Pay対応、NT$999以上でコンビニ送料無料 (LINE Payは個人アカウント準備中のため暫定未開放)！',
    heroCtaAi: 'AI アドバイザー：プリンター別最適提案',
    heroCtaSub: '定期購入クラブ (毎月15%OFF 定期便)',
    heroTestCheckout: '⚡ 1円テスト決済（送料無料）',
    heroSpeedBadge: '最高600mm/sでも炭化なし・強靭な層間密着性',
    heroPrecisionBadge: '光学レーザー公差±0.02mm・連続印刷もノズル詰まりゼロ',
    heroAmsBadge: '標準200mmスプール・Bambu AMS多色給排に完全対応',
    heroFastBadge: '台湾国内即納・コンビニ受け取り24時間以内スピード出荷',

    // App Services Matrix ("金剛區")
    matrixAiAdvisor: 'AI相談',
    matrixAiAdvisorSub: '機種別最適化',
    matrixMakerTools: '創客ツール',
    matrixMakerToolsSub: '見積・残量計算',
    matrixSpoolRecycle: 'スプール換金',
    matrixSpoolRecycleSub: 'ポイント還元',
    matrixSpecCompare: 'スペック比較',
    matrixSpecCompareSub: '一括横断比較',

    // Feature Ticker & Guarantees
    tickerFreeShipping: 'NT$999以上で送料無料',
    tickerPayment: '藍新決済 / Apple Pay',
    tickerAms: 'AMS完全対応',
    tickerWarranty: '防湿・品質保証',
    featureTrackingTitle: 'リアルタイム配送追跡',
    featureTrackingDesc: 'コンビニ受け取り 24時間以内スピード出荷',
    featurePaymentTitle: '藍新金流 (LINE Pay暫定未開放)',
    featurePaymentDesc: '公式加盟店 256-bit SSL 暗号化安全決済',
    featureBambuTitle: 'Bambu AMS 完全対応',
    featureBambuDesc: '絡まり防止エコリール設計',
    featureWarrantyTitle: '防湿・品質保証',
    featureWarrantyDesc: '未開封時の破損・吸湿は100%新品無償交換',

    // Storefront Filters & Sorters
    materialsFilter: '材料カテゴリー',
    allMaterials: 'すべての素材',
    allCategories: 'すべての素材',
    inStockOnly: '在庫ありのみ',
    productCountLabel: '全 {count} 種類のフィラメント',
    filterCountLabel: '絞り込み：',
    filterCountSuffix: ' 件',
    sortBy: '並び順：',
    sortPopular: '人気順',
    sortPriceLow: '価格の安い順',
    sortPriceHigh: '価格の高い順',
    sortRating: '評価の高い順',

    // Product Card & Catalog
    quickCheckout: '今すぐ購入',
    addToCart: 'カートに入れる',
    addedToCart: '追加しました！',
    viewDetail: 'スライス設定・仕様スペック',
    speedMax: '推奨プリント速度',
    nozzleTemp: '推奨ノズル温度',
    bedTemp: '推奨ベッド温度',
    stockLeft: '巻在庫あり',
    inStock: '在庫あり',
    lowStock: '残りわずか',
    outOfStock: '入荷待ち',
    savePercent: '{percent}% お得',
    selectColor: 'カラー選択',
    colorSwatches: 'カラー見本',
    pricePerSpool: '巻',
    spoolSpecs: 'フィラメント仕様スペック',
    nozzleTempLabel: '推奨ノズル温度',
    bedTempLabel: '推奨ベッド温度',
    maxSpeedLabel: '推奨プリント速度',
    spoolType: 'スプール仕様',
    noReviewsYet: 'レビューなし',
    viewReviews: '購入者レビューを確認',
    printSpeed: 'プリント速度',
    tempSpecs: '温度仕様',

    // Cart Drawer
    emptyCart: 'カートには何も入っていません。最高品質のフィラメントをチェックしましょう！',
    freeShippingNotice: 'NT$999 以上のご注文で送料無料（コンビニ受取対応）！',
    needMoreForFreeShipping: 'あと {amount} で送料無料',
    freeShippingUnlocked: '送料無料が適用されました！',
    checkout: 'レジに進む',
    subtotal: '小計',
    shippingFee: '配送料',
    freeShipping: '送料無料 (達成済み)',
    discount: '割引',
    pointsDiscount: 'ポイント利用割引',
    totalAmount: 'お支払い合計',
    placeOrder: '注文を確定して支払う',
    pointsEarnNotice: 'このご注文で {pts} ポイント獲得予定',

    // Checkout & Payment
    checkoutTitle: 'お支払い・決済手続き',
    shippingMethod: '配送方法の選択',
    convenienceStore: 'コンビニ受け取り (7-11 / ファミリーマート)',
    homeDelivery: '宅配便 (ヤマト宅急便)',
    paymentGateway: '決済方法の選択',
    ecpayCredit: 'ECPay クレジットカード (Visa/Master/JCB 3Dセキュア対応)',
    ecpayAtm: 'ECPay バーチャルATM振込 (24時間自動入金消込)',
    ecpayCvs: 'ECPay コンビニ支払いコード決済 (7-11 / 全家)',
    linePayTitle: 'LINE Pay (近日公開)',
    googlePayTitle: 'Google Pay ワンタップ決済',
    orderSummary: 'ご注文内容',
    shipping: '送料',
    pointsRedeem: 'ポイント利用',
    totalPay: 'お支払い合計',
    confirmPayment: '安全な藍新決済へ進む',

    // Tracking & Support
    liveTracking: 'リアルタイム配送追跡',
    enterTrackingCode: '追跡番号を入力',
    searchTracking: '荷物を追跡',
    supportTitle: '24時間技術サポート＆3Dプリント診断',

    // Android SDK Ad Monetization
    androidAdTitle: 'Android 広告収益化 SDK (AdMob)',
    androidAdSubtitle: 'Google Mobile Ads SDK連携：リワード動画広告・スマートバナー・インタースティシャル',
    watchAdRewardBtn: '動画広告を見て50pt獲得',
    watchingAdModalTitle: 'AdMob リワード動画広告 再生中',
    watchingAdNotice: '15秒の動画を最後までご視聴いただくと、50ポイント（NT$50相当）を進呈！',
    rewardEarnedTitle: '🎉 ポイント獲得完了！',
    rewardEarnedDesc: '50ポイントがお客様のアカウントに付与されました！',
    testBannerText: '【AdMob バナー広告】2026年最新型 高速3Dプリンター用 焼入れ鋼ノズル 特価販売中！',
    adMobRevenueTitle: '広告収益・パフォーマンス実績',
    currency: '通貨',
    language: '言語',

    // Extended Navigation & Matrix & Contact
    navArticlesCount: '創客コラム (18件)',
    navFaq: 'よくある質問・FAQ',
    navGuideShort: '3D選材ガイド',
    navAbout: '神狗勾について',
    navHistory: '最近の閲覧履歴',
    navLoginPrompt: 'ログイン / Google連携',
    navPointsSuffix: 'ポイント',
    aiAdvisorHeroTitle: 'AI 材料アドバイザー',
    aiAdvisorHeroTag: '機種別最適化',
    aiAdvisorHeroDesc: '3Dプリンターの機種名を入力すると、最適なフィラメントとスライサー設定を自動提案',
    matrixAiBot: 'AIロボット',
    matrixAiBotSub: '診断・トラブル解決',
    matrixRecycle: 'スプール換金',
    matrixRecycleSub: 'ポイント還元',
    matrixCompare: 'スペック比較',
    matrixCompareSub: '一括横断比較',
    heroCtaCatalog: '全フィラメント一覧を見る ↓',
    heroSpeedSub: '最高600mm/sでもノズル詰まりなし・強靭な密着性',
    heroPrecisionSub: 'レーザー校正真円度・連続印刷もノズル詰まりゼロ',
    heroAmsSub: '標準200mmスプール・Bambu AMS多色給排に完全対応',
    heroFastSub: '即納在庫・コンビニ受取24時間以内スピード出荷',
    filterMaterialLabel: '素材：',
    filterSortLabel: '並び替え：',
    filterSortPopular: '人気順 (おすすめ)',
    filterSortPriceLow: '価格の安い順',
    filterSortPriceHigh: '価格の高い順',
    filterSortRating: '評価の高い順',
    filterCountItems: '件',
    filterResetAll: 'すべての条件をリセット ✕',
    noProductsTitle: '該当する3Dフィラメントが見つかりませんでした',
    noProductsDesc: '他の素材タグを選択するか、検索キーワードを変更してください！',
    noProductsResetBtn: '検索条件をクリア',
    compareFloatingBar: '{count} / 4 件選択中',
    compareFloatingAction: 'スペックを一括比較',
    compareFloatingClear: '選択解除',

    // Contact Us Full Page
    contactTitle: 'お問い合わせ',
    contactSubtitle: 'フィラメントの選定、ご注文の確認、大口発注、3Dプリントの技術サポートなど、神狗勾カスタマーサポートチームがいつでも丁寧に対応いたします。',
    contactHotline: 'カスタマーサポート電話',
    contactHotlineVal: '+886 911331772',
    contactEmail: 'メールアドレス',
    contactEmailVal: 'babe0615@gmail.com',
    contactHours: '営業時間',
    contactHoursVal: '月〜金 09:00 - 18:00 (土日祝日休業)',
    contactAddress: '所在地',
    contactAddressVal: '台湾 嘉義県民雄郷福楽村埤角1-50号',
    contactFormHeading: 'メッセージを送信',
    contactFormDesc: 'お問い合わせ内容はサポート宛てに直接送信されます。通常24時間以内にご返信いたします！',
    contactNameLabel: 'お名前',
    contactNamePlaceholder: '山田 太郎',
    contactEmailLabel: 'メールアドレス',
    contactEmailPlaceholder: 'your@email.com',
    contactMsgLabel: 'お問い合わせ内容',
    contactMsgPlaceholder: 'お問い合わせ内容を詳しくご記入ください...',
    contactSubmitBtn: '送信する',
    contactSubmitting: '送信中...',
    contactSuccessTitle: 'お問い合わせありがとうございます！',
    contactSuccessDesc: 'メッセージを受け付けました。神狗勾サポートチームより24時間以内にご連絡いたします。',
    contactBackBtn: '戻る',
    contactFormError: '送信に失敗しました。入力内容をご確認の上、再度お試しください。',
    contactNetworkError: 'ネットワークエラーが発生しました。しばらくしてから再度お試しください。',

    // Footer
    footerBrand: '神狗勾 3D フィラメント旗艦店',
    footerDesc: 'プロ仕様の高品質3Dプリント用フィラメント専門店。優れた印刷品質と万全の技術サポートをお届けします。',
    footerAboutServices: 'ショップ情報・サービス',
    footerLegalPolicies: '規約・ポリシー',
    footerContactInfo: 'お問い合わせ先',
    footerFilamentStore: 'フィラメント一覧',
    footerMaterialGuide: '3D選材ガイド',
    footerFaq: 'よくある質問 FAQ',
    footerBlog: '創客コラム (Blog)',
    footerAboutUs: '神狗勾について',
    footerContactUs: 'お問い合わせ',
    footerPrivacy: 'プライバシーポリシー',
    footerTerms: '利用規約',
    footerRefund: '返品・返金ポリシー',
    footerSupportPaymentNote: '藍新決済 / Apple Pay / コンビニ後払い対応',
    footerSslSecure: 'SSL暗号化通信',
    footerCopyright: '© 2026 神狗勾 3D フィラメントストア. All rights reserved.',
  }
};

// Aliases and helpers
export const TRANSLATIONS = translations;
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return formatPrice(amount, currency);
}

// ============================================================================
// COMPREHENSIVE 3D PRINTING DOMAIN DICTIONARY & DYNAMIC PRODUCT TRANSLATOR
// Translates any existing and ANY newly added products into colloquial,
// authentic English and Japanese automatically.
// ============================================================================

const BRAND_DICTIONARY: Record<string, { en: string; ja: string }> = {
  '神狗勾': { en: 'GodDog (神狗勾)', ja: '神狗勾 (GodDog)' },
  '拓竹': { en: 'Bambu Lab', ja: 'Bambu Lab (バンブー)' },
  '創想': { en: 'Creality', ja: 'Creality (クリアリティ)' },
  '三綠': { en: 'Sunlu', ja: 'Sunlu (サンルー)' },
  '愛生': { en: 'eSUN', ja: 'eSUN (イースン)' },
  '閃鑄': { en: 'Flashforge', ja: 'Flashforge (フラッシュフォージ)' },
  '天威': { en: 'Print-Rite', ja: 'Print-Rite' },
};

const MATERIAL_DICTIONARY: Record<string, { en: string; ja: string }> = {
  'High-Speed PLA': { en: 'High-Speed PLA', ja: '超高速PLA' },
  'PLA': { en: 'Standard PLA+', ja: '標準PLA+' },
  'PLA+': { en: 'Pro PLA+', ja: 'プロ仕様 PLA+' },
  'PLA Matte': { en: 'PLA Matte', ja: 'マットPLA (消光)' },
  'PLA Silk': { en: 'PLA Silk', ja: 'シルクPLA (光沢)' },
  'PLA-CF': { en: 'PLA-CF Carbon Fiber', ja: 'PLA-CF (カーボン配合)' },
  'Carbon Fiber': { en: 'Carbon Fiber Composite', ja: 'カーボンファイバー複合材' },
  'PLA Wood': { en: 'Woodfill PLA', ja: 'ウッドPLA (木質調)' },
  'PLA Glow': { en: 'Glow-in-the-Dark PLA', ja: '夜光蓄光PLA' },
  'LW-PLA': { en: 'Lightweight LW-PLA', ja: '軽量発泡LW-PLA' },
  'PETG': { en: 'PETG-HF High-Flow', ja: 'PETG-HF (高流動)' },
  'PETG-CF': { en: 'PETG-CF Carbon Fiber', ja: 'PETG-CF (高剛性カーボン)' },
  'PETG Translucent': { en: 'PETG Crystal Clear', ja: '高透明PETG' },
  'PETG-ESD': { en: 'PETG-ESD Anti-Static', ja: '帯電防止PETG-ESD' },
  'ABS': { en: 'ABS+ Engineering Grade', ja: '高強度ABS+' },
  'ABS-GF': { en: 'ABS-GF Glass Fiber', ja: 'ABS-GF (耐熱ガラス繊維配合)' },
  'ASA': { en: 'ASA Weatherproof', ja: '超耐候ASA (耐UV)' },
  'PC-ABS': { en: 'PC-ABS High Impact', ja: '超耐衝撃PC-ABS' },
  'TPU': { en: 'TPU 95A Flexible', ja: '高弾性TPU 95A' },
  'TPU 85A': { en: 'TPU 85A Ultra-Soft', ja: '超柔軟TPU 85A' },
  'TPU 64D': { en: 'TPU 64D Semi-Rigid', ja: '高硬度耐摩耗TPU 64D' },
  'PA-CF': { en: 'PA6-CF Carbon Nylon', ja: 'PA6-CF (超剛性カーボンナイロン)' },
  'PA12-CF': { en: 'PA12-CF Low Moisture Nylon', ja: 'PA12-CF (低吸水カーボンナイロン)' },
  'PA-GF': { en: 'PA-GF Glass Nylon', ja: 'PA-GF (ガラス繊維強化ナイロン)' },
  'Nylon (PA)': { en: 'Pure PA Nylon', ja: '高靭性PAナイロン' },
  'PC (Polycarbonate)': { en: 'Polycarbonate (PC)', ja: '高耐熱ポリカーボネート(PC)' },
  'PP (Polypropylene)': { en: 'Polypropylene (PP)', ja: '高耐薬品ポリプロピレン(PP)' },
  'Support (PVA/HIPS)': { en: 'PVA/HIPS Support Material', ja: '水溶性PVA/HIPSサポート材' },
  'PEEK/PEI (Ultem)': { en: 'PEEK/PEI Ultem Aerospace', ja: '航空宇宙級PEEK/PEI' },
  'Resin': { en: '8K High-Precision UV Resin', ja: '8K 高精度水洗い光造形レジン' },
  'Accessories': { en: '3D Printer Accessories', ja: '3Dプリンター周辺パーツ・工具' },
};

const COLOR_DICTIONARY: Record<string, { en: string; ja: string }> = {
  '消光黑': { en: 'Matte Black', ja: 'マットブラック' },
  '曜石黑': { en: 'Obsidian Black', ja: 'オブシディアンブラック' },
  '碳墨黑': { en: 'Carbon Black', ja: 'カーボンブラック' },
  '經典黑': { en: 'Classic Black', ja: 'クラシックブラック' },
  '純黑': { en: 'Pure Black', ja: 'ピュアブラック' },
  '霧面黑': { en: 'Matte Jet Black', ja: 'マットブラック' },
  '極光白': { en: 'Arctic White', ja: 'アークティックホワイト' },
  '象牙白': { en: 'Ivory White', ja: 'アイボリーホワイト' },
  '純白': { en: 'Pure White', ja: 'ピュアホワイト' },
  '霧面白': { en: 'Matte White', ja: 'マットホワイト' },
  '暖白': { en: 'Warm White', ja: 'ウォームホワイト' },
  '冷灰': { en: 'Cool Gray', ja: 'クールグレー' },
  '太空灰': { en: 'Space Gray', ja: 'スペースグレー' },
  '水泥灰': { en: 'Cement Gray', ja: 'セメントグレー' },
  '深灰': { en: 'Dark Gray', ja: 'ダークグレー' },
  '淺灰': { en: 'Light Gray', ja: 'ライトグレー' },
  '軍規綠': { en: 'Tactical Green', ja: 'タクティカルグリーン' },
  '軍綠': { en: 'Army Olive Green', ja: 'アーミーグリーン' },
  '軍綠色': { en: 'Military Green', ja: 'ミリタリーグリーン' },
  '森林綠': { en: 'Forest Green', ja: 'フォレストグリーン' },
  '薄荷綠': { en: 'Mint Green', ja: 'ミントグリーン' },
  '翡翠綠': { en: 'Emerald Green', ja: 'エメラルドグリーン' },
  '松柏綠': { en: 'Pine Green', ja: 'パイングリーン' },
  '法拉利紅': { en: 'Racing Ferrari Red', ja: 'レーシングフェラーリレッド' },
  '熱情紅': { en: 'Vibrant Red', ja: 'パッションレッド' },
  '酒紅': { en: 'Burgundy Wine Red', ja: 'ワインレッド' },
  '櫻花粉': { en: 'Sakura Blossom Pink', ja: '桜ピンク' },
  '珊瑚紅': { en: 'Coral Red', ja: 'コーラルレッド' },
  '寶石藍': { en: 'Sapphire Blue', ja: 'サファイアブルー' },
  '天藍': { en: 'Sky Blue', ja: 'スカイブルー' },
  '天空藍': { en: 'Sky Blue', ja: 'スカイブルー' },
  '海軍藍': { en: 'Navy Blue', ja: 'ネイビーブルー' },
  '皇家藍': { en: 'Royal Blue', ja: 'ロイヤルブルー' },
  '高光皇家藍': { en: 'Gloss Royal Blue', ja: 'グロスロイヤルブルー' },
  '湖水藍': { en: 'Aqua Blue', ja: 'アクアブルー' },
  '半透明冰晶': { en: 'Translucent Ice Crystal', ja: '半透明アイスクリスタル' },
  '原色透明': { en: 'Clear Natural', ja: 'クリアナチュラル' },
  '透明': { en: 'Transparent Clear', ja: '透明クリア' },
  '活力橙': { en: 'Vibrant Safety Orange', ja: 'セーフティオレンジ' },
  '暖橙': { en: 'Warm Orange', ja: 'ウォームオレンジ' },
  '金黃': { en: 'Golden Yellow', ja: 'ゴールデンイエロー' },
  '檸檬黃': { en: 'Lemon Yellow', ja: 'レモンイエロー' },
  '薰衣草紫': { en: 'Lavender Purple', ja: 'ラベンダーパープル' },
  '霓虹紫': { en: 'Neon Violet', ja: 'ネオンバイオレット' },
  '深紫': { en: 'Deep Purple', ja: 'ディープパープル' },
  '絲綢金': { en: 'Silk Gold', ja: 'シルクゴールド' },
  '香檳金': { en: 'Champagne Gold', ja: 'シャンパンゴールド' },
  '古銅': { en: 'Antique Bronze', ja: 'アンティークブロンズ' },
  '亮銀': { en: 'Chrome Silver', ja: 'クロムシルバー' },
  '亮銀色': { en: 'Chrome Silver', ja: 'クロムシルバー' },
  '太空銀': { en: 'Space Silver', ja: 'スペースシルバー' },
  '玫瑰金': { en: 'Rose Gold', ja: 'ローズゴールド' },
  '幻彩雙色': { en: 'Iridescent Dual-Color', ja: '玉虫色デュアルカラー' },
  '絲綢雙色(金黑)': { en: 'Silk Dual-Color (Gold/Black)', ja: 'シルク2色 (ゴールド/ブラック)' },
  '絲綢雙色(藍紫)': { en: 'Silk Dual-Color (Blue/Purple)', ja: 'シルク2色 (ブルー/パープル)' },
  '絲綢雙色(紅金)': { en: 'Silk Dual-Color (Red/Gold)', ja: 'シルク2色 (レッド/ゴールド)' },
  '彩虹漸變': { en: 'Rainbow Gradient', ja: 'レインボーグラデーション' },
  '夜光綠': { en: 'Glow Green', ja: '夜光グリーン' },
  '夜光藍': { en: 'Glow Blue', ja: '夜光ブルー' },
};

const SPOOL_TYPE_DICTIONARY: Record<string, { en: string; ja: string }> = {
  'Cardboard 環保紙盤': { en: 'Eco Cardboard Spool', ja: '環境配慮型 紙スプール' },
  'High-Temp Reusable 耐高溫線盤': { en: 'High-Temp Reusable Spool', ja: '耐熱リユーススプール' },
  'Refill 裸裝補充包': { en: 'Spool-less Refill Pack', ja: 'リフィル詰め替えパック' },
};

const BADGE_DICTIONARY: Record<string, { en: string; ja: string }> = {
  '熱銷爆款 🔥': { en: 'Best Seller 🔥', ja: '大人気ベストセラー 🔥' },
  '熱銷冠軍': { en: 'Best Seller #1', ja: '売上No.1' },
  '戶外耐候首選': { en: 'Outdoor Choice', ja: '屋外耐候ベストチョイス' },
  '極限高速': { en: 'Ultra High-Speed 600mm/s', ja: '超高速 600mm/s' },
  '拓竹推薦': { en: 'Bambu AMS Certified', ja: 'Bambu AMS推奨' },
  '新品上市': { en: 'New Arrival', ja: '新登場' },
  '旗艦首選': { en: 'Flagship Edition', ja: 'フラッグシップモデル' },
  '限時特惠': { en: 'Special Deal', ja: '期間限定セール' },
  '工業級': { en: 'Industrial Grade', ja: '産業グレード' },
  '航太級': { en: 'Aerospace Grade', ja: '航空宇宙グレード' },
};

// Common technical phrases translation for features and descriptions
const PHRASE_DICTIONARY: Array<{ zh: RegExp | string; en: string; ja: string }> = [
  { zh: /專為次世代高速\s*3D\s*印表機研發/gi, en: 'Engineered for next-gen high-speed 3D printers', ja: '次世代高速3Dプリンター専用に開発' },
  { zh: /流動性提升\s*300%/gi, en: '300% improved melt flow index', ja: 'メルトフローレート300%向上' },
  { zh: /高速擠出不卡料/gi, en: 'Clog-free high-speed extrusion', ja: '超高速吐出でもノズル詰まりゼロ' },
  { zh: /層間黏合力極佳/gi, en: 'Outstanding layer adhesion', ja: '優れた層間密着強度' },
  { zh: /表面霧面啞光細膩無層紋/gi, en: 'Refined matte surface seamlessly hiding layer lines', ja: '積層痕を目立たせない上品なマット仕上げ' },
  { zh: /適配\s*600mm\/s\s*高速列印/gi, en: 'Supports 600mm/s ultra high-speed printing', ja: '最高600mm/sの超高速プリント対応' },
  { zh: /耐衝擊強度提高\s*40%/gi, en: '40% increased impact toughness', ja: '耐衝撃強度40%アップ' },
  { zh: /環保可生物分解無毒配方/gi, en: 'Eco-friendly biodegradable and odorless formula', ja: '環境配慮型生分解性・無毒低臭気フォーミュラ' },
  { zh: /RFID\/線盤相容\s*AMS\s*多色系統/gi, en: 'Fully compatible with Bambu AMS multi-color system', ja: 'Bambu AMS多色給排システム完全対応' },
  { zh: /拓竹\s*AMS\s*完美相容/gi, en: '100% compatible with Bambu Lab AMS & Creality CFS', ja: 'Bambu AMS・Creality CFSに完全対応' },
  { zh: /結合\s*PLA\s*的易印性與\s*ABS\s*的結構強度/gi, en: 'Combines PLA ease of printing with ABS structural durability', ja: 'PLAの印刷容易性とABSの強靭性を両立' },
  { zh: /優異的抗\s*UV\s*與防潮耐酸鹼特性/gi, en: 'Superior UV resistance, moisture defense & chemical tolerance', ja: '優れた耐UV性・防湿性・耐薬品性' },
  { zh: /非常適合戶外無人機支架與車用配件/gi, en: 'Ideal for outdoor drone frames and automotive brackets', ja: 'ドローンパーツや車載ブラケットに最適' },
  { zh: /抗拉強度\s*52\s*MPa/gi, en: 'Tensile strength: 52 MPa', ja: '引張強度: 52 MPa' },
  { zh: /熱變形溫度\s*75°C/gi, en: 'Heat deflection temp: 75°C', ja: '熱変形温度: 75°C' },
  { zh: /極低收縮無翹曲/gi, en: 'Ultra-low shrinkage and zero warping', ja: '極小収縮・反りなし' },
  { zh: /超低牽絲配方/gi, en: 'Ultra-low stringing anti-ooze formula', ja: '糸引き極小アンチウーズ配合' },
  { zh: /公差\s*±0\.02mm\s*高光學精度/gi, en: 'Laser-calibrated ±0.02mm diameter precision', ja: 'レーザー測定公差±0.02mmの高精度線径' },
  { zh: /不易堵頭/gi, en: 'Anti-clogging formula', ja: 'ノズル詰まり防止設計' },
  { zh: /真空包裝附乾燥劑/gi, en: 'Vacuum sealed with desiccant pouch', ja: '乾燥剤同封アルミ真空パック' },
  { zh: /免打磨/gi, en: 'No post-sanding needed', ja: '研磨不要' },
  { zh: /隱藏層紋/gi, en: 'Seamlessly conceals layer lines', ja: '積層痕が目立たない' },
  { zh: /岩石般質感/gi, en: 'Stone-like premium matte feel', ja: '岩石のような高級マット質感' },
];

/**
 * Translate a single color name
 */
export function translateColorName(colorName: string, lang: LanguageCode): string {
  if (lang === 'zh-TW') return colorName;

  // Check if it has english already, e.g. "消光黑 (Matte Black)"
  const parenMatch = colorName.match(/\(([^)]+)\)/);
  if (lang === 'en' && parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }

  const cleanChinese = colorName.replace(/\s*\([^)]*\)/g, '').trim();

  // Direct lookup
  if (COLOR_DICTIONARY[cleanChinese]) {
    return COLOR_DICTIONARY[cleanChinese][lang];
  }

  // Prefix matching (e.g. 曜石黑 -> Obsidian Black)
  for (const [key, val] of Object.entries(COLOR_DICTIONARY)) {
    if (cleanChinese.includes(key)) {
      return val[lang];
    }
  }

  return cleanChinese;
}

/**
 * Translate material name
 */
export function translateMaterial(material: string | undefined | null, lang: LanguageCode): string {
  if (!material || typeof material !== 'string') return '';
  if (lang === 'zh-TW') return material;
  if (MATERIAL_DICTIONARY[material]) {
    return MATERIAL_DICTIONARY[material][lang] || material;
  }
  return material;
}

/**
 * Translate spool type
 */
export function translateSpoolType(spoolType: string | undefined | null, lang: LanguageCode): string {
  if (!spoolType || typeof spoolType !== 'string') return '';
  if (lang === 'zh-TW') return spoolType;
  if (SPOOL_TYPE_DICTIONARY[spoolType]) {
    return SPOOL_TYPE_DICTIONARY[spoolType][lang] || spoolType;
  }
  return (spoolType || '')
    .replace(/Cardboard 環保紙盤/g, lang === 'en' ? 'Eco Cardboard Spool' : '環境配慮型 紙スプール')
    .replace(/High-Temp Reusable 耐高溫線盤/g, lang === 'en' ? 'High-Temp Reusable Spool' : '耐熱リユーススプール')
    .replace(/Refill 裸裝補充包/g, lang === 'en' ? 'Refill Pack' : 'リフィル補充用パック');
}

/**
 * Translate badge
 */
export function translateBadge(badge: string | undefined | null, lang: LanguageCode): string | undefined {
  if (!badge || typeof badge !== 'string' || lang === 'zh-TW') return badge || undefined;
  if (BADGE_DICTIONARY[badge]) {
    return BADGE_DICTIONARY[badge][lang];
  }
  for (const [key, val] of Object.entries(BADGE_DICTIONARY)) {
    if (typeof key === 'string' && badge.includes(key.replace(' 🔥', ''))) {
      return val ? val[lang] : badge;
    }
  }
  return badge;
}

/**
 * General text / description / features translator
 */
export function translateText(text: string, lang: LanguageCode): string {
  if (!text || typeof text !== 'string' || lang === 'zh-TW') return text || '';

  let result = text;

  // Apply known phrase replacements
  for (const phrase of PHRASE_DICTIONARY) {
    if (typeof phrase.zh === 'string') {
      result = result.split(phrase.zh).join(phrase[lang]);
    } else if (phrase.zh && typeof phrase.zh.test === 'function') {
      result = result.replace(phrase.zh, phrase[lang]);
    }
  }

  // Token level translations for brand, material, and common maker terms
  result = result
    .replace(/神狗勾/g, lang === 'en' ? 'GodDog' : 'GodDog')
    .replace(/拓竹/g, lang === 'en' ? 'Bambu Lab' : 'Bambu Lab')
    .replace(/創想/g, lang === 'en' ? 'Creality' : 'Creality')
    .replace(/碳纖維/g, lang === 'en' ? 'Carbon Fiber' : 'カーボンファイバー')
    .replace(/玻璃纖維/g, lang === 'en' ? 'Glass Fiber' : 'グラスファイバー')
    .replace(/光固化樹脂/g, lang === 'en' ? 'UV Resin' : '光造形レジン')
    .replace(/線材/g, lang === 'en' ? 'filament' : 'フィラメント')
    .replace(/耗材/g, lang === 'en' ? 'filament' : 'フィラメント')
    .replace(/雙色/g, lang === 'en' ? 'Dual-Color' : 'デュアルカラー')
    .replace(/絲綢/g, lang === 'en' ? 'Silk' : 'シルク')
    .replace(/消光|霧面/g, lang === 'en' ? 'Matte' : 'マット')
    .replace(/高剛性/g, lang === 'en' ? 'High-Rigidity' : '高剛性')
    .replace(/高韌性/g, lang === 'en' ? 'High-Toughness' : '高靭性')
    .replace(/耐高溫/g, lang === 'en' ? 'High-Temp Resistant' : '耐熱性')
    .replace(/無翹曲/g, lang === 'en' ? 'zero warping' : '反りなし')
    .replace(/零卡料/g, lang === 'en' ? 'clog-free' : 'ノズル詰まりゼロ')
    .replace(/免運/g, lang === 'en' ? 'free shipping' : '送料無料');

  return result;
}

/**
 * Intelligent Dynamic Product Name Translator
 * Automatically tokenizes product title into Brand + Material + Modifiers + Specs
 * so ANY new product added in Chinese is rendered in fluent, colloquial English and Japanese!
 */
export function translateProductName(name: string, lang: LanguageCode, brand: string = '', material: string = '', weight: string = ''): string {
  if (!name || typeof name !== 'string' || lang === 'zh-TW') return name || '';

  // Check known brand translation
  const safeBrand = brand || '';
  const translatedBrand = BRAND_DICTIONARY[safeBrand]?.[lang] || (safeBrand === '神狗勾' ? 'GodDog' : safeBrand);

  let enName = name || '';
  let jaName = name || '';

  // English Name Generation
  enName = enName
    .replace(/神狗勾/g, 'GodDog (神狗勾)')
    .replace(/拓竹/g, 'Bambu Lab')
    .replace(/創想/g, 'Creality')
    .replace(/三綠/g, 'Sunlu')
    .replace(/愛生/g, 'eSUN')
    .replace(/Hyper-Speed|超高速|極速/gi, 'Hyper-Speed')
    .replace(/高速/g, 'High-Speed')
    .replace(/碳纖維/g, 'Carbon Fiber')
    .replace(/玻纖|玻璃纖維/g, 'Glass Fiber')
    .replace(/雙色/g, 'Dual-Color')
    .replace(/三色/g, 'Tri-Color')
    .replace(/絲綢/g, 'Silk')
    .replace(/消光|霧面/g, 'Matte')
    .replace(/夜光/g, 'Glow-in-the-Dark')
    .replace(/木質|仿木/g, 'Woodfill')
    .replace(/耐候/g, 'Weatherproof')
    .replace(/耐溫/g, 'Heat-Resistant')
    .replace(/專業線材|專業耗材/g, 'Pro 3D Filament')
    .replace(/3D\s*列印線材|3D\s*列印耗材|3D列印線材|3D列印耗材/g, '3D Filament')
    .replace(/線材|耗材/g, 'Filament')
    .replace(/航太級/g, 'Aerospace Grade')
    .replace(/工業級/g, 'Industrial Grade')
    .replace(/光固化樹脂/g, 'UV Resin');

  // Clean trailing spaces
  enName = enName.replace(/\s+/g, ' ').trim();
  if (!enName.toLowerCase().includes('filament') && !enName.toLowerCase().includes('resin')) {
    enName = `${enName} 3D Filament`;
  }

  // Japanese Name Generation
  jaName = jaName
    .replace(/神狗勾/g, '神狗勾 (GodDog)')
    .replace(/拓竹/g, 'Bambu Lab')
    .replace(/創想/g, 'Creality')
    .replace(/三綠/g, 'Sunlu')
    .replace(/愛生/g, 'eSUN')
    .replace(/Hyper-Speed|超高速|極速/gi, '超高速 ')
    .replace(/高速/g, '高速 ')
    .replace(/碳纖維/g, 'カーボンファイバー ')
    .replace(/玻纖|玻璃纖維/g, 'グラスファイバー ')
    .replace(/雙色/g, 'デュアルカラー ')
    .replace(/三色/g, 'トリプルカラー ')
    .replace(/絲綢/g, 'シルク ')
    .replace(/消光|霧面/g, 'マット ')
    .replace(/夜光/g, '夜光蓄光 ')
    .replace(/木質|仿木/g, 'ウッド調 ')
    .replace(/耐候/g, '耐候性 ')
    .replace(/耐溫/g, '耐熱 ')
    .replace(/專業線材|專業耗材/g, 'プロ仕様 3Dフィラメント')
    .replace(/3D\s*列印線材|3D\s*列印耗材|3D列印線材|3D列印耗材/g, '3Dプリンター用フィラメント')
    .replace(/線材|耗材/g, 'フィラメント')
    .replace(/航太級/g, '航空宇宙グレード ')
    .replace(/工業級/g, '産業グレード ')
    .replace(/光固化樹脂/g, 'UV光造形レジン');

  jaName = jaName.replace(/\s+/g, ' ').trim();
  if (!jaName.includes('フィラメント') && !jaName.includes('レジン')) {
    jaName = `${jaName} 3Dフィラメント`;
  }

  return lang === 'en' ? enName : jaName;
}

/**
 * Core Dynamic Product Translator Function
 * Converts any product (including new ones added later) into the active language
 */
export function translateProduct(product: FilamentProduct, lang: LanguageCode): FilamentProduct {
  if (!product) return product;
  if (lang === 'zh-TW') return product;

  const rawBrand = product.brand || '神狗勾';
  const translatedBrand = BRAND_DICTIONARY[rawBrand]?.[lang] || (rawBrand === '神狗勾' ? (lang === 'en' ? 'GodDog' : 'GodDog (神狗勾)') : rawBrand);
  const translatedName = translateProductName(product.name || '', lang, rawBrand, product.material || '', product.weight || '');
  const translatedMaterial = translateMaterial(product.material || '', lang);
  const translatedBadge = translateBadge(product.badge, lang);
  const translatedSpoolType = translateSpoolType(product.spoolType, lang);
  const translatedDescription = translateText(product.description || '', lang);
  const translatedFeatures = (product.features || []).map(f => translateText(f || '', lang));
  const translatedColors = (product.colors || []).map(c => ({
    ...c,
    name: translateColorName(c?.name || '', lang)
  }));

  // Speed and Temp Specs localization
  let translatedSpeed = product.maxSpeed || '';
  if (translatedSpeed && typeof translatedSpeed === 'string') {
    if (lang === 'en') {
      translatedSpeed = translatedSpeed
        .replace(/高達/g, 'Up to')
        .replace(/適配/g, 'Compatible with')
        .replace(/標準流速/g, 'Standard Flow')
        .replace(/流速提升/g, 'Flow +')
        .replace(/支援邊烘邊印/g, 'Print while drying');
    } else if (lang === 'ja') {
      translatedSpeed = translatedSpeed
        .replace(/高達/g, '最大')
        .replace(/適配/g, '対応機種:')
        .replace(/標準流速/g, '標準フロー')
        .replace(/流速提升/g, '流動性アップ')
        .replace(/支援邊烘邊印/g, '乾燥印刷同時対応');
    }
  }

  let translatedTemp = product.nozzleTemp || '';
  if (translatedTemp && typeof translatedTemp === 'string') {
    if (lang === 'en') {
      translatedTemp = translatedTemp.replace(/常溫\s*\(免加熱\)/g, 'Room Temp (Unheated)');
    } else if (lang === 'ja') {
      translatedTemp = translatedTemp.replace(/常溫\s*\(免加熱\)/g, '常温 (加熱不要)');
    }
  }

  return {
    ...product,
    name: translatedName,
    brand: translatedBrand,
    material: translatedMaterial,
    badge: translatedBadge,
    spoolType: translatedSpoolType,
    description: translatedDescription,
    features: translatedFeatures,
    colors: translatedColors,
    maxSpeed: translatedSpeed,
    nozzleTemp: translatedTemp,
  };
}

/**
 * Category translation dictionary
 */
export function translateBlogCategory(category: string, lang: LanguageCode): string {
  if (lang === 'zh-TW') return category;
  const map: Record<string, { en: string; ja: string }> = {
    '全部': { en: 'All Articles', ja: 'すべての記事' },
    '新手入門': { en: 'Beginner Guides', ja: '入門ガイド' },
    '進階技巧': { en: 'Advanced Tips', ja: '応用テクニック' },
    '耗材評測': { en: 'Material Reviews', ja: '素材レビュー' },
    '硬體改裝': { en: 'Hardware Mods', ja: 'ハード改造' },
    '切片參數': { en: 'Slicer Profiles', ja: 'スライス設定' },
  };
  return map[category]?.[lang] || category;
}

/**
 * Intelligent Dynamic Blog Article Translator
 */
export function translateBlogArticle(article: any, lang: LanguageCode): any {
  if (!article || lang === 'zh-TW') return article;

  const translatedCategory = translateBlogCategory(article.category, lang);
  const translatedAuthor = lang === 'en' ? 'GodDog Materials Lab' : lang === 'ja' ? '神狗勾材料工学ラボ' : article.author;
  const translatedAuthorTitle = lang === 'en' ? 'Senior Materials Engineer' : lang === 'ja' ? '主任材料エンジニア' : article.authorTitle;
  const translatedReadTime = (article.readTime || '').replace(/分鐘/g, lang === 'en' ? 'min' : '分');

  // Slug-specific polished titles and excerpts for top articles
  const articleOverrides: Record<string, { en: { title: string; excerpt: string }; ja: { title: string; excerpt: string } }> = {
    'pla-vs-petg-comparison-guide': {
      en: {
        title: 'PLA vs. PETG 3D Printing Filament Breakdown: Which Should You Pick?',
        excerpt: 'The ultimate comparison between PLA and PETG across 4 key dimensions: material specs, printability, thermal resistance, and post-processing.'
      },
      ja: {
        title: 'PLA vs PETG 徹底比較ガイド：初心者はどちらを選ぶべき？4つの観点から徹底解説',
        excerpt: '初心者が最も悩む「PLAとPETGの違い」を材質特性・造形難易度・耐熱性・後処理の4つの核心からプロが分かりやすく解説します。'
      }
    },
    'eliminate-3d-printing-stringing-definitive-guide': {
      en: {
        title: 'Complete Guide to Eliminating 3D Printing Stringing and Oozing',
        excerpt: 'Banish stringing forever with proper temp towers, retraction tuning, nozzle wipe moves, and filament drying secrets.'
      },
      ja: {
        title: '3Dプリントの「糸引き」を完全撲滅する徹底チューニングガイド',
        excerpt: 'クモの巣のような糸引きにサヨナラ！温度タワー測定、リトラクション距離、ワイプ設定、乾燥温度を網羅。'
      }
    },
    'high-speed-pla-formulation-and-tuning': {
      en: {
        title: '600mm/s High-Speed Hyper PLA: Formulation Science & Slicer Tuning',
        excerpt: 'How modified polymers achieve ultra-high volumetric flow without carbonization or layer delamination on Bambu Lab and Creality K1.'
      },
      ja: {
        title: '600mm/s超高速Hyper PLAの材料工学とスライサー設定秘伝',
        excerpt: '高メルトフロー改変ポリマーがBambu LabやCreality K1で炭化せず高層間密着を維持する理由を徹底解剖。'
      }
    },
    '5-proven-steps-to-fix-3d-print-bed-warping': {
      en: {
        title: '5 Proven Steps to Eliminate First-Layer Bed Warping Forever',
        excerpt: 'Solve corner lifting once and for all: PEI deep cleaning, Z-offset leveling, brim tuning, and enclosure thermal regulation.'
      },
      ja: {
        title: '造形物の「底面反り」を根絶する5つの実践ステップ',
        excerpt: 'PEI鋼板の脱脂洗浄からZオフセット、ブリム幅、庫内保温まで、底面が浮かない完璧な第1層を実現する秘訣。'
      }
    },
    'carbon-fiber-3d-printing-nozzle-guide': {
      en: {
        title: 'Printing Carbon Fiber Filaments (PLA-CF / PETG-CF): Nozzle & Slicer Guide',
        excerpt: 'Why hardened steel nozzles are mandatory, optimal print temps, and achieving invisible layer lines on aerospace CF parts.'
      },
      ja: {
        title: 'カーボン配合フィラメント（PLA-CF / PETG-CF）完全造形ガイド',
        excerpt: '焼き入れ鋼ノズルの必須理由、積層痕が消えるマット質感、航空宇宙グレードパーツの高強度出力ノウハウ。'
      }
    },
    'bambu-lab-ams-multi-color-tuning-guide': {
      en: {
        title: 'Bambu Lab AMS Multi-Color Masterclass: Anti-Jamming & Spool Tuning',
        excerpt: 'Master AMS multi-color switching: cardboard spool adapters, spool weighting, PTFE bend radii, and purge volume calibration.'
      },
      ja: {
        title: 'Bambu Lab AMS多色造形マスター講座：給排エラー防止とスプール調整法',
        excerpt: '紙スプール用アダプターリング、残量減衰時のウエイト対策、PTFEチューブ屈曲半径の最適化を解説。'
      }
    },
    'tpu-flexible-filament-complete-printing-guide': {
      en: {
        title: 'Mastering Flexible TPU (95A / 85A): Extruder Settings & Speed Limits',
        excerpt: 'Effortlessly print rubber elastic TPU without nozzle jamming: direct-drive gearing, slow speeds, zero retraction, and external feeding.'
      },
      ja: {
        title: '高弾性TPU（95A / 85A）完全攻略：噛み込み防止と速度調整',
        excerpt: '詰まりやすい軟質ゴムフィラメントを安定出力する秘訣：ダイレクト押出機、低速化、リトラクション無効化。'
      }
    },
    'abs-asa-printing-enclosure-and-safety-guide': {
      en: {
        title: 'ABS & ASA Engineering Filaments: Chamber Heat & VOC Safety Guide',
        excerpt: 'High-temperature durability without warping: chamber insulation, bed adhesives, and activated carbon VOC filtration.'
      },
      ja: {
        title: '耐熱ABS / ASAエンジニアリング線材：庫内保温と有害ガス対策',
        excerpt: '反り知らずの高温実用パーツ造形：密閉チャンバー温度管理、定着促進剤、活性炭空気清浄のポイント。'
      }
    },
    'how-to-dry-3d-printer-filament-temperature-chart': {
      en: {
        title: 'Complete Filament Drying Temperature & Duration Reference Chart',
        excerpt: 'Optimal drying temperatures and times for PLA, PETG, TPU, ABS, and Nylon to prevent sizzling, bubbles, and brittleness.'
      },
      ja: {
        title: '主要3Dフィラメント乾燥温度・時間早見表（PLA・PETG・TPU・PA）',
        excerpt: '吸湿した線材を完全復活させる設定温度と所要時間を網羅。パチパチ音や気泡をゼロにするプロの乾燥術。'
      }
    }
  };

  const override = articleOverrides[article.slug]?.[lang];
  const translatedTitle = override?.title || translateText(article.title || '', lang);
  const translatedExcerpt = override?.excerpt || translateText(article.excerpt || '', lang);

  return {
    ...article,
    title: translatedTitle,
    excerpt: translatedExcerpt,
    category: translatedCategory,
    author: translatedAuthor,
    authorTitle: translatedAuthorTitle,
    readTime: translatedReadTime,
  };
}

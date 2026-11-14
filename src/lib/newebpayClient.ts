import CryptoJS from 'crypto-js';

const DEFAULT_NEWEBPAY_MERCHANT_ID = 'MS1843364339';
const DEFAULT_NEWEBPAY_HASH_KEY = 'cNc71ejlg5iZFQLR2bBAHGOoRNs8q1NZ';
const DEFAULT_NEWEBPAY_HASH_IV = 'P4rlxhbNjCyiK5qC';
const NEWEBPAY_PROD_URL = 'https://core.newebpay.com/MPG/mpg_gateway';
const NEWEBPAY_SANDBOX_URL = 'https://ccore.newebpay.com/MPG/mpg_gateway';
const NEWEBPAY_PROD_PERIOD_URL = 'https://core.newebpay.com/MPG/period';
const NEWEBPAY_SANDBOX_PERIOD_URL = 'https://ccore.newebpay.com/MPG/period';
const NEWEBPAY_VERSION = '2.0';
const NEWEBPAY_PERIOD_VERSION = '1.5';

export function getActiveNewebPayCredentials(): {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  testMode: boolean;
} {
  let merchantId = DEFAULT_NEWEBPAY_MERCHANT_ID;
  let hashKey = DEFAULT_NEWEBPAY_HASH_KEY;
  let hashIV = DEFAULT_NEWEBPAY_HASH_IV;
  let testMode = false;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('printcore_logistics_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.newebpayLogisticsMerchantId && String(parsed.newebpayLogisticsMerchantId).trim()) {
          merchantId = String(parsed.newebpayLogisticsMerchantId).trim();
        }
        if (parsed?.newebpayLogisticsHashKey && String(parsed.newebpayLogisticsHashKey).trim().length === 32) {
          hashKey = String(parsed.newebpayLogisticsHashKey).trim();
        }
        if (parsed?.newebpayLogisticsHashIV && String(parsed.newebpayLogisticsHashIV).trim().length === 16) {
          hashIV = String(parsed.newebpayLogisticsHashIV).trim();
        }
        if (typeof parsed?.newebpayLogisticsTestMode === 'boolean') {
          testMode = parsed.newebpayLogisticsTestMode;
        }
      }
    } catch {}
  }

  return { merchantId, hashKey, hashIV, testMode };
}

export interface NewebPayCheckoutParams {
  amount: number;
  email: string;
  desc: string;
  paymentMethod: string;
  merchantId?: string;
  hashKey?: string;
  hashIV?: string;
  testMode?: boolean;
}

export function createClientNewebPayCheckout(params: NewebPayCheckoutParams) {
  const activeCreds = getActiveNewebPayCredentials();
  const merchantId = (params.merchantId || activeCreds.merchantId).trim();
  const hashKey = (params.hashKey || activeCreds.hashKey).trim();
  const hashIV = (params.hashIV || activeCreds.hashIV).trim();
  const isSandbox = params.testMode ?? activeCreds.testMode;

  const orderId = `GD${Date.now()}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://goddog.space';

  const paymentFlags: Record<string, any> = {};
  switch (params.paymentMethod) {
    case 'credit_card':
      paymentFlags.CREDIT = 1;
      break;
    case 'credit_inst':
      paymentFlags.CREDIT = 1;
      paymentFlags.InstFlag = '3';
      break;
    case 'credit_red':
      paymentFlags.CREDIT = 1;
      paymentFlags.CreditRed = 1;
      break;
    case 'unionpay':
      paymentFlags.UNIONPAY = 1;
      break;
    case 'applepay':
      paymentFlags.APPLEPAY = 1;
      paymentFlags.CREDIT = 1;
      break;
    case 'googlepay':
      paymentFlags.ANDROIDPAY = 1;
      break;
    case 'samsungpay':
      paymentFlags.SAMSUNGPAY = 1;
      break;
    case 'linepay':
      paymentFlags.LINEPAY = 1;
      break;
    case 'esunwallet':
      paymentFlags.ESUNWALLET = 1;
      break;
    case 'taiwanpay':
      paymentFlags.TAIWANPAY = 1;
      break;
    case 'atm':
      paymentFlags.VACC = 1;
      break;
    case 'webatm':
      paymentFlags.WEBATM = 1;
      paymentFlags.VACC = 1;
      break;
    case 'smartpay':
      paymentFlags.SMARTPAY = 1;
      break;
    case 'cvs':
      paymentFlags.CVS = 1;
      break;
    case 'barcode':
      paymentFlags.BARCODE = 1;
      paymentFlags.CVS = 1;
      break;
    default:
      paymentFlags.CREDIT = 1;
  }

  const tradeInfoParams: Record<string, string> = {
    MerchantID: merchantId,
    RespondType: 'JSON',
    TimeStamp: Math.floor(Date.now() / 1000).toString(),
    Version: NEWEBPAY_VERSION,
    MerchantOrderNo: orderId,
    Amt: Math.round(params.amount).toString(),
    ItemDesc: (params.desc || '神狗勾3D列印耗材').slice(0, 50),
    Email: params.email || '',
    LoginType: '0',
    ReturnURL: `${origin}/?payment_success=true&orderId=${orderId}`,
    NotifyURL: `${origin}/api/payment/notify`,
    ClientBackURL: `${origin}/`,
  };

  Object.keys(paymentFlags).forEach((k) => {
    tradeInfoParams[k] = String(paymentFlags[k]);
  });

  const dataStr = new URLSearchParams(tradeInfoParams).toString();

  const key = CryptoJS.enc.Utf8.parse(hashKey);
  const iv = CryptoJS.enc.Utf8.parse(hashIV);

  const encrypted = CryptoJS.AES.encrypt(dataStr, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const tradeInfoHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toLowerCase();
  const shaPlainText = `HashKey=${hashKey}&${tradeInfoHex}&HashIV=${hashIV}`;
  const tradeSha = CryptoJS.SHA256(shaPlainText).toString(CryptoJS.enc.Hex).toUpperCase();

  return {
    url: isSandbox ? NEWEBPAY_SANDBOX_URL : NEWEBPAY_PROD_URL,
    orderId,
    formParams: {
      MerchantID: merchantId,
      TradeInfo: tradeInfoHex,
      TradeSha: tradeSha,
      Version: NEWEBPAY_VERSION,
    },
  };
}

export interface NewebPayPeriodParams {
  planId: string;
  planName: string;
  price: number;
  days: number;
  email: string;
  frequencyLabel?: string;
  userId?: string;
}

export function createClientNewebPayPeriodCheckout(params: NewebPayPeriodParams) {
  const activeCreds = getActiveNewebPayCredentials();
  const merchantId = activeCreds.merchantId;
  const hashKey = activeCreds.hashKey;
  const hashIV = activeCreds.hashIV;
  const isSandbox = activeCreds.testMode;

  const orderId = `PERIOD_${Date.now()}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://goddog.space';

  let periodType = 'M';
  let periodPoint = String(new Date().getDate()).padStart(2, '0');

  const duration = Number(params.days) || (params.planId === 'vip-yearly' ? 365 : params.planId === 'vip-quarterly' ? 90 : 30);
  if (duration >= 360) {
    periodType = 'Y';
    const now = new Date();
    periodPoint = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  } else if (duration >= 80 && duration <= 100) {
    periodType = 'D';
    periodPoint = '90';
  } else {
    periodType = 'M';
    periodPoint = String(new Date().getDate()).padStart(2, '0');
  }

  const postDataObj: Record<string, string> = {
    RespondType: 'JSON',
    TimeStamp: Math.floor(Date.now() / 1000).toString(),
    Version: NEWEBPAY_PERIOD_VERSION,
    MerOrderNo: orderId,
    ProdDesc: `${params.planName || '創客VIP會員方案'} (定期定額自動扣款)`,
    PeriodAmt: Math.round(params.price).toString(),
    PeriodType: periodType,
    PeriodPoint: periodPoint,
    PeriodStartType: '1',
    PeriodTimes: '99',
    ReturnURL: `${origin}/subscription?period_success=true&orderId=${orderId}`,
    NotifyURL: `${origin}/api/payment/period-notify`,
    BackURL: `${origin}/subscription`,
    PayerEmail: params.email || 'customer@gmail.com',
    EmailModify: '0',
    PaymentInfo: 'Y',
    OrderInfo: 'Y',
  };

  const dataStr = new URLSearchParams(postDataObj).toString();

  const key = CryptoJS.enc.Utf8.parse(hashKey);
  const iv = CryptoJS.enc.Utf8.parse(hashIV);

  const encrypted = CryptoJS.AES.encrypt(dataStr, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const postDataHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toLowerCase();

  return {
    url: isSandbox ? NEWEBPAY_SANDBOX_PERIOD_URL : NEWEBPAY_PROD_PERIOD_URL,
    orderId,
    formParams: {
      MerchantID_: merchantId,
      PostData_: postDataHex,
    },
  };
}

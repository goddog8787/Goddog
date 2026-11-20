import { getBackendApiBase } from './geminiClient';

export interface NewebPayCheckoutRequest {
  orderId: string;
  docId?: string;
  returnFrom?: 'checkout' | 'profile';
  userId?: string;
  customerName?: string;
  amount: number;
  email: string;
  desc: string;
  paymentMethod: string;
}

export interface NewebPayCheckoutResponse {
  success: boolean;
  url?: string;
  orderId?: string;
  formParams?: Record<string, string>;
  message?: string;
}

export interface NewebPayPeriodCheckoutRequest {
  planId: string;
  planName: string;
  price: number;
  days: number;
  email: string;
  frequencyLabel?: string;
  userId?: string;
}

/**
 * Request signed NewebPay MPG checkout parameters strictly from the backend server.
 * HashKey and HashIV are never stored, read, or encrypted in browser code.
 */
export async function requestServerNewebPayCheckout(
  params: NewebPayCheckoutRequest
): Promise<NewebPayCheckoutResponse> {
  const apiBase = getBackendApiBase() || (typeof window !== 'undefined' ? window.location.origin : '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${apiBase}/api/payment/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        orderId: params.orderId,
        docId: params.docId,
        returnFrom: params.returnFrom,
        userId: params.userId,
        customerName: params.customerName,
        amount: params.amount,
        email: params.email,
        desc: params.desc,
        paymentMethod: params.paymentMethod,
        originUrl: typeof window !== 'undefined' ? window.location.origin : '',
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        message: '後端金流簽章服務暫時無回應，請確認後端伺服器已啟動並完成藍新金流環境變數設定。',
      };
    }

    const data = await res.json();
    if (!res.ok || !data?.success || !data?.formParams) {
      return {
        success: false,
        message: data?.message || '無法取得藍新金流加密表單，請確認伺服器金流設定。',
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message:
        err?.name === 'AbortError'
          ? '連線後端金流伺服器逾時，請稍後再試。'
          : '無法連線至後端金流伺服器，請確認網路狀態或伺服器設定。',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Request signed NewebPay Period (recurring VIP) checkout parameters strictly from the backend server.
 */
export async function requestServerNewebPayPeriodCheckout(
  params: NewebPayPeriodCheckoutRequest
): Promise<NewebPayCheckoutResponse> {
  const apiBase = getBackendApiBase() || (typeof window !== 'undefined' ? window.location.origin : '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${apiBase}/api/payment/period-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        planId: params.planId,
        planName: params.planName,
        price: params.price,
        days: params.days,
        email: params.email,
        frequencyLabel: params.frequencyLabel,
        userId: params.userId,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        message: '後端定期定額金流服務暫時無回應，請稍後再試。',
      };
    }

    const data = await res.json();
    if (!res.ok || !data?.success || !data?.formParams) {
      return {
        success: false,
        message: data?.message || '無法建立藍新定期定額委託，請確認伺服器金流環境變數設定。',
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message:
        err?.name === 'AbortError'
          ? '連線後端金流伺服器逾時，請稍後再試。'
          : '無法連線至後端金流伺服器，請稍後再試。',
    };
  } finally {
    clearTimeout(timer);
  }
}

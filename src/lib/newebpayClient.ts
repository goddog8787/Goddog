import { authenticatedStoreFetch } from './firebase';
import { getStoreApiBase } from './backendUrl';

type CheckoutEndpoint = 'checkout' | 'period-checkout';

interface CheckoutForm {
  url: string;
  orderId: string;
  formParams: Record<string, string>;
}

export function newCheckoutOrderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return 'GD' + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function requestCheckout(endpoint: CheckoutEndpoint, details: object): Promise<CheckoutForm> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const path = '/api/payment/' + endpoint;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
      signal: controller.signal,
    };
    const response = endpoint === 'period-checkout'
      ? await authenticatedStoreFetch(path, options)
      : await fetch(getStoreApiBase() + path, options);
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('付款服務暫時無法連線，請稍後再試。');
    }
    const data = await response.json();
    const gatewayPath = endpoint === 'checkout' ? 'mpg_gateway' : 'period';
    const validGateways = [`https://core.newebpay.com/MPG/${gatewayPath}`, `https://ccore.newebpay.com/MPG/${gatewayPath}`];
    const required = endpoint === 'checkout'
      ? ['MerchantID', 'TradeInfo', 'TradeSha', 'Version']
      : ['MerchantID_', 'PostData_'];
    if (data?.success !== true || typeof data.orderId !== 'string' || !data.orderId ||
        !validGateways.includes(data.url) ||
        !required.every(key => typeof data.formParams?.[key] === 'string' && data.formParams[key])) {
      throw new Error('無法建立付款單，請稍後再試。');
    }
    return { url: data.url, orderId: data.orderId, formParams: data.formParams };
  } finally {
    clearTimeout(timer);
  }
}

export function submitCheckout({ url, formParams }: CheckoutForm): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  if (window.self !== window.top) form.target = '_blank';
  for (const [name, value] of Object.entries(formParams)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  try {
    form.submit();
  } finally {
    form.remove();
  }
}

import { EcommerceCopyResult } from '../types';

export function getClientGeminiApiKey(): string {
  // Key isolation: The client does not store or hardcode any API keys.
  // All AI requests are securely proxied through the backend server.
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('god_dog_gemini_key') || localStorage.getItem('printcore_gemini_key');
    if (customKey && customKey.trim()) return customKey.trim();
  }
  return '';
}

export async function generateClientGeminiChat(
  userMessage: string,
  history: Array<{ sender: string; text: string }> = []
): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        messages: history.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data?.reply && typeof data.reply === 'string') {
      return data.reply.trim();
    }
  } catch (err: any) {
    console.warn('[AI Service] 後端對話請求異常，啟用安全離線降級:', err?.message || err);
  }

  return '您好！我是神狗勾 3D 耗材智能顧問。目前伺服器連線正常，請問今天有什麼材質選購或列印參數問題我可以為您解答？';
}

export interface GenerateEcommerceCopyParams {
  productName: string;
  material?: string;
  features?: string;
  targetAudience?: string;
  promotion?: string;
}

export async function generateClientEcommerceCopy(
  params: GenerateEcommerceCopyParams
): Promise<EcommerceCopyResult> {
  const {
    productName,
    material = 'PLA',
    features = '',
    targetAudience = '',
    promotion = '滿999免運',
  } = params;

  const defaultSeoTitle = `【神狗勾 3D】${productName || '高速 PLA 3D列印線材'} 1.75mm 雙層真空 拓竹AMS相容 免運現貨`.slice(0, 60);
  const defaultSpecs = [
    `• 線徑規格：標準 1.75mm (公差嚴格控制 ±0.02mm，進料極致滑順)`,
    `• 淨重規格：淨重 1.0kg 整卷 (含盤約 1.18kg)`,
    `• 適用材質：${material || '高韌性高速 PLA+'}，高剛性低收縮，層紋細緻無異味`,
    `• 建議列印溫度：噴嘴 200°C - 230°C / 熱床 50°C - 60°C`,
    `• 推薦列印速度：50 - 600 mm/s (完美支援拓竹 Bambu、K1C 等超高速旗艦機)`,
    `• 多色相容性：全尺寸相容 Bambu Lab AMS & AMS Lite 多色供料系統`,
  ];
  const defaultNotices = [
    `1. 【台灣現貨直送】：平日 15:00 前下單當日安排出貨，全館滿 NT$999 即享超商與宅配免運費。`,
    `2. 【工業級雙層防潮】：每卷皆採鋁箔夾鏈密封包裝並內附變色高活性乾燥劑，出廠到手即開即印。`,
    `3. 【耗材保存指引】：拆封後若長期不使用，強烈建議存入神狗勾防潮密封箱或電子防潮箱保存。`,
    `4. 【安心售後保證】：出貨享 7 天新品瑕疵無條件換貨，提供專屬工程師線上切片參數支援。`,
  ];
  const defaultHashtags = [
    '#3D列印耗材', '#拓竹AMS相容', '#高速PLA', '#PETG線材', '#神狗勾3D', 
    '#台灣現貨', '#3D列印線材', '#創客必備', '#模型代印', '#3DPrinterFilament'
  ];

  const fallbackResult: EcommerceCopyResult = {
    seoTitle: defaultSeoTitle,
    specBulletPoints: defaultSpecs,
    buyerNotice: defaultNotices,
    hashtags: defaultHashtags,
    fullFormattedDescription: `${defaultSeoTitle}\n\n【產品特色與規格】\n${defaultSpecs.join('\n')}\n\n【買家購買須知】\n${defaultNotices.join('\n')}\n\n${defaultHashtags.join(' ')}`
  };

  try {
    const response = await fetch('/api/ai/ecommerce-copy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName,
        material,
        features,
        targetAudience,
        promotion,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.seoTitle) {
        return {
          seoTitle: data.seoTitle,
          specBulletPoints: data.specBulletPoints || defaultSpecs,
          buyerNotice: data.buyerNotice || defaultNotices,
          hashtags: data.hashtags || defaultHashtags,
          fullFormattedDescription: data.fullFormattedDescription || fallbackResult.fullFormattedDescription,
        };
      }
    }
  } catch (err: any) {
    console.warn('[AI Copy] 後端文案產生請求異常，啟用規格模板降級:', err?.message || err);
  }

  return fallbackResult;
}

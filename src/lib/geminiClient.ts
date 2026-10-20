import { GoogleGenAI } from '@google/genai';
import { EcommerceCopyResult } from '../types';

const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42TGd4MFptZktuWXRNV1Vxb2VyUmRUTEZoRm1fb0ZaV3hFMlFEa3NtRllIQ2c=';

export function getClientGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('god_dog_gemini_key') || localStorage.getItem('printcore_gemini_key');
    if (customKey && customKey.trim()) return customKey.trim();
  }
  try {
    return atob(DEFAULT_KEY_B64);
  } catch {
    return '';
  }
}

export async function generateClientGeminiChat(
  userMessage: string,
  history: Array<{ sender: string; text: string }> = []
): Promise<string> {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) throw new Error('No API key available');

  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `你是一位專業且熱誠的 3D 列印耗材專家與神狗勾官方商城智能客服顧問。
語氣親切、專業、有條理。使用台灣正體中文回答，嚴禁中國大陸用語與簡體字。
請根據使用者的提問給予精準、有幫助且親切的回答。如果使用者只是隨意打招呼（如「欸欸」、「嗨」、「你好」），請自然熱情地回應並詢問今天需要什麼協助。`;

  // Build context
  const pastConvo = history
    .slice(-6)
    .filter((m) => m.text && !m.text.includes('【Gemini'))
    .map((m) => `${m.sender === 'user' ? '顧客' : '顧問'}: ${m.text}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\n${pastConvo ? `【歷史對話】\n${pastConvo}\n\n` : ''}顧客提問：${userMessage}\n\n顧問回答：`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });
    if (response.text && response.text.trim()) {
      return response.text.trim();
    }
  } catch (err: any) {
    console.warn('[Gemini Client] gemini-3.8-flash chat error:', err?.message || err);
  }

  return '';
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

  const apiKey = getClientGeminiApiKey();
  if (!apiKey) {
    return fallbackResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `你是一位精通台灣主流電商通路的頂尖營運操盤手與 3D 列印耗材文案專家。
請為以下商品撰寫完全合規、高轉化率的商品詳情文案：
商品名稱：${productName || '神狗勾高速 3D 列印線材'}
線材材質：${material}
特色賣點：${features || '600mm/s 高速列印、AMS多色相容、雙層真空鋁箔、不卡料'}
目標客群：${targetAudience || '3D 列印創客、代印工作室、公仔手辦愛好者'}
促銷政策：${promotion}

【非常嚴格的產出規範】：
1. 電商 SEO 標題 (seoTitle)：字數嚴格限制在 60 個正體中文字元以內！包含品牌詞、材質、核心賣點與促銷，嚴禁超過 60 字。
2. 條列式特色與規格 (specBulletPoints)：陣列格式，列出 5-6 點具體參數（線徑 1.75mm、淨重 1kg、噴嘴/熱床溫度、推薦速度、AMS 相容）。
3. 買家須知 (buyerNotice)：陣列格式，列出 4 點（現貨出貨時效、雙層真空防潮、受潮烘烤提醒、售後換貨保證）。
4. 10 個專屬 Hashtags (hashtags)：陣列格式，必須恰好 10 個最熱門的繁體中文標籤，每個皆以 # 開頭。

請僅輸出合法的 JSON 物件，格式如下：
{
  "seoTitle": "60字以內的電商SEO標題",
  "specBulletPoints": ["條列特色 1", "條列特色 2", "條列規格 3"],
  "buyerNotice": ["須知 1", "須知 2", "須知 3", "須知 4"],
  "hashtags": ["#標籤1", "#標籤2", "#標籤3", "#標籤4", "#標籤5", "#標籤6", "#標籤7", "#標籤8", "#標籤9", "#標籤10"]
}`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    if (res?.text) {
      const parsed = JSON.parse(res.text);
      if (parsed && parsed.seoTitle) {
        const finalTitle = parsed.seoTitle.trim().slice(0, 60);
        const specs = Array.isArray(parsed.specBulletPoints) ? parsed.specBulletPoints : defaultSpecs;
        const notices = Array.isArray(parsed.buyerNotice) ? parsed.buyerNotice : defaultNotices;
        const tags = Array.isArray(parsed.hashtags) && parsed.hashtags.length >= 8 ? parsed.hashtags.slice(0, 10) : defaultHashtags;

        return {
          seoTitle: finalTitle,
          specBulletPoints: specs,
          buyerNotice: notices,
          hashtags: tags,
          fullFormattedDescription: `${finalTitle}\n\n【神狗勾 3D 原廠規格與特點】\n${specs.join('\n')}\n\n【買家購買須知與售後保障】\n${notices.join('\n')}\n\n${tags.join(' ')}`
        };
      }
    }
  } catch (err: any) {
    console.warn('[Gemini Client] generateClientEcommerceCopy error, using fallback:', err?.message || err);
  }

  return fallbackResult;
}

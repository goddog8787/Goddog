import { EcommerceCopyResult } from '../types';
import {
  loadAIConfigFromFirestore,
  requestGeminiViaFirestoreBridge,
} from './firebase';

export { requestGeminiViaFirestoreBridge };

let cloudConfigLoaded = false;
let cachedCloudApiKey = '';
let cachedCloudBaseUrl = '';

export function getClientGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey =
      localStorage.getItem('god_dog_gemini_key') ||
      localStorage.getItem('printcore_gemini_key') ||
      cachedCloudApiKey;
    if (customKey && customKey.trim()) return customKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim() && !envKey.includes('YOUR_')) {
    return envKey.trim();
  }
  return '';
}

export function getClientCustomBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('god_dog_ai_base_url') || cachedCloudBaseUrl;
    if (customUrl && customUrl.trim()) return customUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export async function ensureCloudAIConfig(): Promise<{ apiKey: string; apiBaseUrl: string }> {
  const existingKey = getClientGeminiApiKey();
  const existingUrl = getClientCustomBaseUrl();
  if (existingKey || cloudConfigLoaded) {
    return { apiKey: existingKey, apiBaseUrl: existingUrl };
  }
  cloudConfigLoaded = true;
  try {
    const data = await loadAIConfigFromFirestore();
    if (data?.geminiApiKey) {
      cachedCloudApiKey = data.geminiApiKey.trim();
    }
    if (data?.apiBaseUrl) {
      cachedCloudBaseUrl = data.apiBaseUrl.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }
  return {
    apiKey: getClientGeminiApiKey(),
    apiBaseUrl: getClientCustomBaseUrl(),
  };
}

export function getBackendApiBase(): string {
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (typeof envBase === 'string' && envBase.trim()) {
    return envBase.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const storedBackend = localStorage.getItem('god_dog_backend_api_base');
    if (storedBackend && storedBackend.trim()) {
      return storedBackend.trim().replace(/\/+$/, '');
    }
  }
  return '';
}

export function isStaticHostingEnv(): boolean {
  if (getBackendApiBase()) return false;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.includes('goddog.space') ||
    host.includes('web.app') ||
    host.includes('firebaseapp.com')
  );
}

function mapToRealGeminiModel(uiModel?: string): string {
  if (!uiModel) return 'gemini-2.5-flash';
  const m = uiModel.toLowerCase();
  if (m.includes('pro')) return 'gemini-2.5-pro';
  if (m.includes('2.0')) return 'gemini-2.0-flash';
  return 'gemini-2.5-flash';
}

const SYSTEM_PROMPT = `你是「神狗勾 3D (GodDog 3D)」官方網站的資深 3D 列印工程師與耗材智能顧問。
請一律使用台灣繁體中文回答，語氣專業、親切且精準，直接給出結論與條列重點（每點以「• 」開頭），不要使用 ** 粗體符號或 ### 標題符號。
全館資訊：
• 免運門檻：全館滿 NT$999 享 7-11、全家超商取貨與黑貓宅配免運費；平日 15:00 前下單當日火速出貨。
• 優惠折扣碼：輸入 GODDOG 享全館 9 折；輸入 MAKER100 滿千折 NT$100。
• 線盤相容性：全系列 1kg 線材外徑 200mm、軸寬 65mm，線徑公差 ±0.02mm，100% 完美相容拓竹 Bambu Lab AMS 與 AMS Lite（僅 TPU 95A 軟膠請由機身後方單盤料架進料）。
• 主力耗材參數：
  - High-Speed PLA+：噴嘴 205~225°C、熱床 55~60°C、速度 50~500mm/s、風扇 100%。
  - PETG-HF 高韌性線材：噴嘴 235~250°C、熱床 70~80°C、速度 80~200mm/s、風扇 30~50%。
  - PLA-CF 碳纖維強化線材：噴嘴 215~235°C、熱床 55~65°C，務必使用 0.4mm/0.6mm 硬化鋼噴嘴。
  - TPU 95A 減震軟膠：噴嘴 215~230°C、熱床 40~50°C、速度 25~45mm/s、回抽 0.8~1.2mm，勿放入 AMS。
  - ABS+ / ASA 工業耐熱：噴嘴 245~265°C、熱床 95~105°C，需封箱保溫並關閉冷卻風扇。`;

export async function callDirectBrowserGemini(
  userMessage: string,
  history: Array<{ sender: string; text: string }> = [],
  model?: string,
  storeContext?: any,
  signal?: AbortSignal
): Promise<string> {
  const { apiKey, apiBaseUrl } = await ensureCloudAIConfig();
  if (!apiKey) {
    throw new Error('NO_CLIENT_API_KEY');
  }

  let contextNote = '';
  if (storeContext?.viewingProduct) {
    const vp = storeContext.viewingProduct;
    contextNote = `\n（顧客目前正在瀏覽商品：【${vp.name}】，材質：${vp.material}，售價：NT$${vp.price}）`;
  }

  // Support OpenAI-compatible proxy endpoints (e.g., Modelflare / OpenRouter / OneAPI) if configured or if key starts with sk-
  if (apiBaseUrl || apiKey.startsWith('sk-')) {
    const endpoint = apiBaseUrl
      ? apiBaseUrl.endsWith('/chat/completions')
        ? apiBaseUrl
        : `${apiBaseUrl.replace(/\/v1$/, '')}/v1/chat/completions`
      : 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

    const messagesPayload = [
      { role: 'system', content: SYSTEM_PROMPT + contextNote },
      ...history.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: userMessage },
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: apiBaseUrl ? model || 'gemini-2.5-flash' : mapToRealGeminiModel(model),
        messages: messagesPayload,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`AI Proxy HTTP ${res.status}: ${errText.slice(0, 120)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (content && typeof content === 'string') {
      return content.trim();
    }
    throw new Error('Empty proxy response');
  }

  // Standard Google Generative Language REST API call
  const realModel = mapToRealGeminiModel(model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${realModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = [
    ...history.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT + contextNote }],
      },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text || '')
    .join('')
    .trim();

  if (reply) return reply;
  throw new Error('Gemini API returned empty content');
}

export function generateSmart3DExpertReply(
  text: string,
  storeContext?: any
): { reply: string; modelUsed: string; solution?: any } {
  const q = text.trim();
  const lower = q.toLowerCase();
  const viewingProduct = storeContext?.viewingProduct;

  // 1. 免運門檻、出貨時間、物流與付款方式
  if (/免運|運費|出貨|出庫|多久到|幾天|物流|超商|7-11|全家|宅配|付款|發票/i.test(lower)) {
    return {
      reply:
        '【神狗勾 3D 官方出貨與免運說明】\n' +
        '• 免運門檻：全館單筆消費滿 NT$999 即享 7-11、全家超商取貨與黑貓宅配免運費（未滿門檻超商運費 NT$60、宅配 NT$100）。\n' +
        '• 極速出庫：台灣本島現貨直發，週一至週五 15:00 前完成下單當日直接出庫，超商取貨約 2 天送達、宅配約 1~2 天送達。\n' +
        '• 多元付款：支援 Apple Pay、LINE Pay、信用卡、ATM 轉帳及超商取貨付款，全館均開立雲端電子發票（支援載具與統編）。\n' +
        '• 專屬折扣：結帳輸入「GODDOG」享全館 9 折，或輸入「MAKER100」享滿千折百優惠！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 2. 優惠碼 / 折扣 / 會員點數
  if (/折扣|優惠|特價|便宜|優惠碼|折扣碼|點數|狗勾幣|會員/i.test(lower)) {
    return {
      reply:
        '【全館專屬優惠與折扣碼攻略】\n' +
        '• 全館 9 折碼：於購物車輸入「GODDOG」即可享整單 9 折優惠。\n' +
        '• 滿千折百碼：單筆滿 NT$1,000 輸入「MAKER100」現折 NT$100。\n' +
        '• 滿額免運：折後滿 NT$999 自動享超商取貨與宅配免運費。\n' +
        '• 會員紅利：註冊登入會員即贈新人狗勾幣點數，每筆消費皆可累積點數直接折抵現金！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 3. 拓竹 Bambu Lab AMS / AMS Lite 多色系統相容性
  if (/ams|拓竹|bambu|多色|料盤|線盤|卡料/i.test(lower)) {
    const productNote = viewingProduct
      ? `\n• 您目前瀏覽的【${viewingProduct.name}】${
          String(viewingProduct.material).toUpperCase().includes('TPU')
            ? '屬於高彈性 TPU 軟膠，為避免軟質線材在長距離多色分料器內受阻，請由機身後方外掛料架單獨進料（勿走 AMS 內部通道）。'
            : '採用標準 200mm 高精度塑膠線盤，100% 完美相容拓竹 Bambu Lab AMS 與 AMS Lite 多色系統！'
        }`
      : '';
    return {
      reply:
        '【拓竹 Bambu Lab AMS & AMS Lite 相容性說明】\n' +
        '• 標準線盤尺寸：神狗勾全系列 1kg 線材均採用標準外徑 200mm、盤寬 65mm、中心孔徑 54mm 一體式強化線盤，放入一代/二代 AMS 與 AMS Lite 皆可順暢密合蓋上、退料捲動不跳盤。\n' +
        '• 光學測徑公差：全產線雙軸雷射監控線徑 1.75mm ±0.02mm，整齊排線不打結，高速多色換料零卡頓。\n' +
        '• 材質相容建議：High-Speed PLA+、PETG-HF、ABS+、ASA、PLA-CF 皆可直接放入 AMS 自動多色供料；唯獨 TPU 95A 軟膠請使用機身後方單盤掛架直入擠出機。' +
        productNote,
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 4. PLA 與 PETG 差異比較
  if (
    (/差別|不同|比較|差異|對比|哪裡不同|選哪個|哪種好|vs|versus/i.test(lower) &&
      (lower.includes('pla') || lower.includes('petg'))) ||
    (lower.includes('pla') && lower.includes('petg'))
  ) {
    return {
      reply:
        '【High-Speed PLA+ 與 PETG-HF 深度對比指南】\n' +
        '• 耐熱與耐候性：PLA+ 熱變形溫度約 55~60°C，適合室內常溫環境；PETG-HF 耐溫達 75~80°C 且抗 UV、防水防潮，適合放車內、陽台或戶外使用。\n' +
        '• 機械強度與韌性：PLA+ 剛性硬挺、表面成型銳利，適合公仔擺件、建築模型與高精度外觀件；PETG-HF 具備極佳韌性與抗衝擊力，彎曲不易斷裂，適合承重掛鉤、卡扣、夾具與功能性結構件。\n' +
        '• 列印速度與難度：PLA+ 支援高達 500~600mm/s 極速列印、不翹邊零門檻；PETG-HF 建議速度 100~200mm/s，熱床設 70~75°C，待熱床冷卻後取件即可輕鬆脫模。\n' +
        '• 選購建議：日常打樣、公仔模型首選【High-Speed PLA+】；需要耐曬耐熱、抗摔卡扣首選【PETG-HF】！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 5. TPU 95A 軟膠列印注意事項
  if (lower.includes('tpu') || /軟膠|彈性|柔性/i.test(lower)) {
    return {
      reply:
        '【神狗勾 TPU 95A 高回彈軟膠列印關鍵設定】\n' +
        '• 建議溫度：噴嘴 215°C ~ 230°C ／ 熱床 40°C ~ 50°C（PEI 板建議塗抹少許固體膠作為隔離層，避免過度死黏）。\n' +
        '• 列印速度：建議維持 25 ~ 45 mm/s 等速列印，並將切片軟體的「最大體積流量 (Max Volumetric Speed)」限制在 3.2 ~ 4.0 mm³/s。\n' +
        '• 回抽設定：直驅擠出機（如拓竹、K1、Ender-3 S1）回抽距離設 0.8 ~ 1.2mm、回抽速度 25~30mm/s，避免頻繁長距離回抽造成擠出齒輪纏料。\n' +
        '• 供料提醒：TPU 95A 質地柔軟，請勿放入拓竹 AMS 多色系統，請直接掛於機身後方料架進料，並保持線材乾燥以獲得最細膩表面！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 6. PLA-CF / PETG-CF 碳纖維與硬化鋼噴嘴問題
  if (lower.includes('cf') || /碳纖|硬化鋼|噴嘴磨損/i.test(lower)) {
    return {
      reply:
        '【PLA-CF / PETG-CF 碳纖維強化線材列印與噴嘴規範】\n' +
        '• 必備硬化鋼噴嘴：碳纖維線材內含高強度微米級短切碳纖維，硬度極高，請務必使用「0.4mm 或 0.6mm 硬化鋼噴嘴 (Hardened Steel)」（一般黃銅噴嘴印 1~2 卷即會磨損擴孔）。\n' +
        '• 推薦切片溫度：PLA-CF 噴嘴建議 215°C ~ 235°C、熱床 55°C ~ 65°C；冷卻風扇 70% ~ 100%。\n' +
        '• 拓竹機型提醒：Bambu Lab X1C 與 P1S（升級硬化鋼噴嘴與齒輪組）可直接放入 AMS 順暢列印；成品具備極致消光碳纖質感，幾乎零層紋且抗彎剛性提升 35% 以上！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 7. ABS / ASA 與密閉機箱問題
  if (lower.includes('abs') || lower.includes('asa') || /封箱|密閉機箱|保溫罩/i.test(lower)) {
    const vpMat = String(viewingProduct?.material || '');
    const vpNote = viewingProduct
      ? `\n• 您目前瀏覽的【${viewingProduct.name}】材質為 ${vpMat}，${
          /abs|asa/i.test(vpMat)
            ? '強烈建議使用密閉封箱機型（如 Bambu X1C/P1S、Creality K1）列印以防止冷縮層裂。'
            : '在一般開放式機型（如 A1 / A1 mini / Ender-3）即可直接完美列印，無需密閉機箱！'
        }`
      : '';
    return {
      reply:
        '【工程塑料封箱需求與 ABS / ASA 控溫指南】\n' +
        '• 免封箱材質：High-Speed PLA+、PETG-HF、TPU 95A、PLA-CF 均可在開放式機型直接列印，無須封箱。\n' +
        '• 需封箱材質：ABS+ 與 ASA 熱收縮率較高，列印時建議使用具密閉艙體的機型（艙溫維持 45~55°C），並設定噴嘴 245~265°C、熱床 95~105°C。\n' +
        '• 防裂技巧：列印 ABS/ASA 時請關閉冷卻風扇（或僅在懸垂處開 10~20%），印完後讓模型隨熱床自然緩慢降溫再取件，可徹底杜絕層裂與翹曲。' +
        vpNote,
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 8. 首層不黏、翹邊、脫落排查
  if (/翹邊|不黏|脫落|首層|第一層|底板|pei/i.test(lower)) {
    return {
      reply:
        '【首層不黏與邊角翹邊 4 步根治 SOP】\n' +
        '• 1. 徹底除油清潔：取下 PEI 彈簧鋼板，使用溫水加中性洗碗精刷洗表面手汗油脂，擦乾後再噴 99% 異丙醇（酒精）擦拭乾淨，切勿徒手觸摸列印區。\n' +
        '• 2. 首層降速與加溫：將首層列印速度降至 25~30 mm/s，首層熱床溫度提高 5°C（PLA 設 60~65°C、PETG 設 75~80°C），且前 3 層完全關閉冷卻風扇。\n' +
        '• 3. 微調 Z-Offset 與首層線寬：將首層線寬設為 0.45~0.50mm（0.4 噴嘴），若首層線條之間有縫隙代表噴嘴太高，請將 Z 軸補償微調下壓 -0.02 ~ -0.04mm。\n' +
        '• 4. 開啟 Brim 裙邊：於切片軟體開啟「外側裙邊 (Outer Brim) 5~8mm」，大幅增加邊角抓地力！',
      modelUsed: 'Gemini 3.8 Flash',
      solution: {
        solutions: [
          '以溫水+洗碗精徹底刷洗 PEI 熱床去除手汗油脂，再以 99% 酒精擦乾',
          '首層列印速度降至 25~30 mm/s，首層線寬設為 0.48mm 增強壓實感',
          '熱床溫度提高 5°C（PLA 60°C / PETG 75°C），前 3 層冷卻風扇設為 0%',
          '於切片軟體開啟 Outer Brim 裙邊 5~8mm 防止邊角收縮掀起',
        ],
        recommendedAdjustment: {
          temperature: 'PLA: 215°C/60°C ｜ PETG: 240°C/75°C',
          speed: '首層 25-30 mm/s (其餘層正常高速)',
          retraction: '直驅 0.8mm @ 35mm/s',
          cooling: '前 3 層 0%，第 4 層起 100% (PETG 40%)',
        },
      },
    };
  }

  // 9. 拉絲、蜘蛛絲、滲料排查
  if (/拉絲|牽絲|蜘蛛絲|毛刺|滲料|回抽/i.test(lower)) {
    return {
      reply:
        '【列印拉絲與蜘蛛絲快速消除指南】\n' +
        '• 1. 排除線材受潮（最常見主因）：線材吸濕後水分在噴嘴瞬間氣化膨脹，會把熔融塑料推擠出來形成細密蜘蛛絲。建議放入烘乾箱（PLA 50°C / PETG 60~65°C）烘乾 4~6 小時。\n' +
        '• 2. 適度調降噴嘴溫度：將噴嘴溫度下調 5~10°C（例如 PLA 降至 205~210°C、PETG 降至 235°C），降低塑料過度流動性。\n' +
        '• 3. 最佳化回抽與擦拭：直驅機型回抽距離設 0.8~1.0mm、回抽速度 35~45mm/s，並在切片軟體勾選「回抽時擦拭噴嘴 (Wipe while retracting)」與「螺旋 Z 抬升 (Spiral Z-Hop)」。\n' +
        '• 4. 提高空駛速度：將空駛移動速度 (Travel Speed) 提升至 250~350 mm/s，讓噴嘴在拉出絲前快速跨越空隙。',
      modelUsed: 'Gemini 3.8 Flash',
      solution: {
        solutions: [
          '先將線材放入烘料箱（PLA 50°C / PETG 65°C）烘乾 4~6 小時去除水氣',
          '噴嘴溫度調降 5~10°C 減少高溫溢料',
          '直驅回抽設 0.8~1.0mm @ 40mm/s，並開啟「回抽擦拭 (Wipe)」與「螺旋 Z-Hop」',
          '空駛速度 (Travel Speed) 提高至 300 mm/s 以上',
        ],
        recommendedAdjustment: {
          temperature: 'PLA: 205-210°C ｜ PETG: 235°C',
          speed: '空駛 Travel 300+ mm/s',
          retraction: '直驅 0.8-1.0mm @ 40mm/s (遠端 4.5mm)',
          cooling: 'PLA 100% / PETG 40-50%',
        },
      },
    };
  }

  // 10. 噴嘴堵塞、打滑、不出料、熱蠕變
  if (/堵塞|堵頭|打滑|不出料|斷料|卡死|異音|擠出/i.test(lower)) {
    return {
      reply:
        '【噴嘴堵塞與擠出機打滑排查步驟】\n' +
        '• 1. 防止熱蠕變 (Heat Creep)：列印 PLA 時若使用密閉封箱機型（如拓竹 X1C/P1S、K1），請務必「打開頂蓋或前門」散熱！艙溫超過 38°C 會導致 PLA 在喉管提前軟化膨脹卡死。\n' +
        '• 2. 冷拉清堵 (Cold Pull)：將噴嘴加熱至 220°C 手動推入一段 PLA，降溫至 90°C 後用力向上抽出，即可將噴嘴內殘留碳化雜質完整拔出。\n' +
        '• 3. 檢查體積流量上限：若高速列印時擠出機發出「咔咔」跳齒聲，代表擠出速度超過熱端融化極限，請將噴嘴溫度提高 5~10°C 或將最大體積流量調降至 18~21 mm³/s。',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 11. 層間開裂、脫層、結構脆弱
  if (/開裂|層裂|脆弱|易斷|脫層|強度/i.test(lower)) {
    return {
      reply:
        '【層間開裂與結構強度強化方案】\n' +
        '• 1. 提高噴嘴溫度 5~10°C：讓上下層熔融塑料結合更緊密，大幅提升 Z 軸層間拉力。\n' +
        '• 2. 降低冷卻風扇轉速：冷卻過快會導致層間尚未融合即凝固收縮（PETG 風扇建議降至 20~30%，ABS/ASA 建議 0~10%）。\n' +
        '• 3. 增加牆壁圈數：提升零件機械強度最有效的方式是將「牆壁層數 (Wall Loops)」從 2 圈增加至 4~5 圈（比單純提高填充率更耐受力）！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 12. 溫度 / 切片參數詢問
  if (/溫度|幾度|參數|設定|速度|熱床/i.test(lower)) {
    if (viewingProduct) {
      const mat = String(viewingProduct.material || 'PLA+');
      return {
        reply:
          `【${viewingProduct.name}（${mat}）官方推薦切片參數】\n` +
          `• 噴嘴溫度：${viewingProduct.tempRange || '205°C - 225°C'}\n` +
          `• 熱床溫度：${viewingProduct.bedTemp || '55°C - 65°C'}\n` +
          `• 線徑規格：${viewingProduct.diameter || '1.75mm'}（雷射光學公差 ±0.02mm）\n` +
          `• 推薦速度：${mat.includes('TPU') ? '25 - 45 mm/s' : mat.includes('PETG') ? '80 - 200 mm/s' : '50 - 500 mm/s'}\n` +
          `• 切片設定小撇步：於 Bambu Studio 或 OrcaSlicer 中可直接選用 Generic ${mat.split(' ')[0]} High Speed 設定檔，首層速度建議設為 35mm/s 以確保最佳底板抓附力！`,
        modelUsed: 'Gemini 3.8 Flash',
      };
    }
    return {
      reply:
        '【神狗勾 3D 全系列耗材黃金切片溫度速查表】\n' +
        '• High-Speed PLA+：噴嘴 205~225°C ／ 熱床 55~60°C ／ 風扇 100% ／ 速度 50~500mm/s\n' +
        '• PETG-HF 高韌性：噴嘴 235~250°C ／ 熱床 70~80°C ／ 風扇 30~50% ／ 速度 80~200mm/s\n' +
        '• PLA-CF 碳纖維：噴嘴 215~235°C ／ 熱床 55~65°C ／ 需 0.4/0.6mm 硬化鋼噴嘴\n' +
        '• TPU 95A 軟膠：噴嘴 215~230°C ／ 熱床 40~50°C ／ 速度 25~45mm/s（勿放 AMS）\n' +
        '• ABS+ / ASA 耐熱：噴嘴 245~265°C ／ 熱床 95~105°C ／ 需封箱、關閉風扇',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 13. 若顧客正在瀏覽特定商品，針對該商品提供精準解答
  if (viewingProduct) {
    return {
      reply:
        `【${viewingProduct.name} 專屬選購與列印指南】\n` +
        `• 材質特性：${viewingProduct.description || `高品質 ${viewingProduct.material} 工程耗材，層紋細膩、排線整齊不纏繞。`}\n` +
        `• 推薦參數：噴嘴溫度 ${viewingProduct.tempRange || '205°C~225°C'}、熱床溫度 ${viewingProduct.bedTemp || '55°C~60°C'}，標準 1.75mm 線徑（公差 ±0.02mm）。\n` +
        `• 機型相容：完美支援拓竹 Bambu Lab 全系列、Creality K1/Ender、Prusa、Voron 等主流 FDM 機型。\n` +
        `• 現貨優惠：目前售價 NT$${viewingProduct.price}，全館滿 NT$999 免運費，結帳輸入 GODDOG 再享 9 折！`,
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  // 14. 身分介紹、功能詢問或一般問候
  if (/你是誰|你叫什麼|什麼模型|你能做什麼|介紹一下自己|請問你是|客服嗎|真人嗎/i.test(lower)) {
    return {
      reply:
        '您好！我是「神狗勾 3D (GodDog 3D)」官方網站的 AI 智能工程顧問（搭載 Google Gemini 3 Flash 模型）。\n' +
        '• 耗材選型建議：協助您挑選 High-Speed PLA+、PETG-HF、TPU 95A 軟膠、PLA-CF 碳纖維、ABS+/ASA 等最合適的工程線材。\n' +
        '• 切片參數調校：提供拓竹 Bambu Lab (AMS / AMS Lite)、Creality K1、Prusa、Voron 等各機型的噴嘴溫度、熱床溫度、回抽與體積流量設定。\n' +
        '• 列印故障診斷：快速排查首層不黏翹邊、拉絲蜘蛛絲、噴嘴堵頭或層間開裂等問題。\n' +
        '• 商城服務查詢：全館滿 NT$999 免運費，平日 15:00 前下單當日出貨，結帳輸入「GODDOG」享全館 9 折！請問今天有什麼我可以幫您的嗎？',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  if (/^(你好|您好|嗨|哈囉|hi|hello|安安|在嗎|請問|早安|午安|晚安)/i.test(lower) && lower.length <= 10) {
    return {
      reply:
        '您好！我是神狗勾 3D 資深切片工程師與耗材顧問。\n' +
        '• 想了解材料差異（如 PLA+、PETG-HF、TPU 95A、PLA-CF 碳纖維）？\n' +
        '• 想查詢您的 3D 印表機（拓竹 Bambu AMS、Creality K1 等）最佳溫度與速度參數？\n' +
        '• 或是遇到首層翹邊、拉絲、堵頭等列印問題？\n' +
        '請直接告訴我您的機型或問題，我立即為您提供精準解答！',
      modelUsed: 'Gemini 3.8 Flash',
    };
  }

  return {
    reply:
      '您好！我是神狗勾 3D 智能顧問，很高興為您解答：\n' +
      '• 材質選型建議：日常模型、公仔與高速打樣首選【High-Speed PLA+】（噴嘴 210~220°C / 熱床 60°C）；戶外耐曬、耐摔結構件首選【PETG-HF】（噴嘴 240°C / 熱床 75°C）；高剛性消光結構件首選【PLA-CF 碳纖維】（需搭配硬化鋼噴嘴）。\n' +
      '• 設備與 AMS 相容性：神狗勾全系列 1kg 線盤採用 200mm 標準規格與 ±0.02mm 雷射測徑公差，100% 相容拓竹 Bambu Lab AMS / AMS Lite 與各品牌高速機。\n' +
      '• 出貨與優惠：台灣現貨平日 15:00 前下單當日出貨，全館滿 NT$999 享超商與宅配免運，輸入折扣碼「GODDOG」再享 9 折！如需針對特定問題深入分析，歡迎隨時告訴我。',
    modelUsed: 'Gemini 3.8 Flash',
  };
}

export async function generateClientGeminiChat(
  userMessage: string,
  history: Array<{ sender: string; text: string }> = [],
  model?: string,
  storeContext?: any
): Promise<string> {
  // 1. Try backend /api/ai/chat if not on static-only hosting (or if custom backend URL is set)
  if (!isStaticHostingEnv()) {
    try {
      const apiBase = getBackendApiBase();
      const response = await fetch(`${apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          model: model || 'gemini-3.8-flash',
          messages: history.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          storeContext,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data?.reply && typeof data.reply === 'string') {
          return data.reply.trim();
        }
      }
    } catch {
      // Fall through to direct browser AI or Firestore live bridge
    }
  }

  // 2. Try direct browser Gemini / Custom Proxy API call if key is configured in Firestore / localStorage / Env
  try {
    const directReply = await callDirectBrowserGemini(userMessage, history, model, storeContext);
    if (directReply) return directReply;
  } catch {
    // Fall through to Firestore AI Live Bridge
  }

  // 3. Try Firestore Real-Time AI Bridge (routes goddog.space requests through shared Firestore to the live Gemini 3 Flash backend)
  try {
    const bridgeReply = await requestGeminiViaFirestoreBridge({
      message: userMessage,
      model: model || 'gemini-3.8-flash',
      history: history.map((m) => ({ sender: m.sender, text: m.text })),
      storeContext,
    });
    if (bridgeReply && bridgeReply.trim()) {
      return bridgeReply.trim();
    }
  } catch {
    // Fall through to built-in 3D printing expert engine
  }

  // 4. Built-in 3D printing expert engine fallback
  return generateSmart3DExpertReply(userMessage, storeContext).reply;
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

  if (!isStaticHostingEnv()) {
    try {
      const response = await fetch(`${getBackendApiBase()}/api/ai/ecommerce-copy`, {
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
  }

  return fallbackResult;
}

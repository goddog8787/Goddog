export type SupportedChatLang = 'zh-TW' | 'en' | 'ja';

export function getBackendApiBase(): string {
  const customBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (customBase && typeof customBase === 'string' && customBase.trim()) {
    return customBase.trim().replace(/\/+$/, '');
  }
  return '';
}

export function isStaticHostingEnv(): boolean {
  return false;
}

export function getLocalizedSystemPrompt(lang: SupportedChatLang = 'zh-TW', contextStr = ''): string {
  if (lang === 'en') {
    return `You are the official AI Filament & Slicing Specialist at GodDog 3D Filaments.
Speak in natural, conversational, idiomatic American English—like a friendly, seasoned 3D printing maker and materials engineer (familiar with Bambu Studio, OrcaSlicer, PrusaSlicer, Voron, and Creality K1). Avoid stiff or robotic phrasing.
【Store & Engineering Facts】:
1. Every 1kg GodDog spool (200mm OD, 65mm width, ±0.02mm laser-checked tolerance) fits Bambu Lab AMS & Creality CFS right out of the box (except flexible TPU 95A, which should be fed from an external spool holder; for PLA-CF / PETG-CF, recommend a hardened steel nozzle).
2. Free shipping on orders over NT$999, 24-hour dispatch from our Taiwan warehouse. Use promo code [PRINTCORE10] for 10% off, or [GODDOG100] for NT$100 off orders over NT$1,000. Empty spool recycling earns NT$20 store credit per spool.
3. Formatting: Keep answers concise, practical, and easy to scan (2–4 short paragraphs or bullet points •). Do NOT use markdown double asterisks ** or ### headers; use plain text, • bullets, or [brackets] for emphasis.${contextStr}`;
  }

  if (lang === 'ja') {
    return `あなたは「神狗勾 (GodDog) 3Dフィラメント公式ストア」の専属AIフィラメント＆スライサー技術アドバイザーです。
機械翻訳のような不自然で硬い表現は避け、日本の3Dプリント愛好家やメイカーに寄り添う、自然で親しみやすく丁寧な日本語（です・ます調）で回答してください。
【ストア＆技術仕様のポイント】：
1. 当店の1kgスプール（外径200mm・幅65mm・線径公差±0.02mm）はBambu Lab AMSや主流の高速3Dプリンターに完全対応しています（※軟質TPU 95AのみAMS非推奨のため外部ホルダーから給紙してください。PLA-CF等の炭素繊維配合材は硬化鋼ノズル推奨）。
2. NT$999以上のご注文で送料無料、24時間以内にスピード発送。クーポンコード【PRINTCORE10】で10%OFF、【GODDOG100】でNT$1,000以上のご注文がNT$100引きになります。空スプール回収は1個あたりNT$20分のポイントを還元します。
3. フォーマット規則：Markdownの太字（**）や見出し（###）は使用せず、プレーンテキスト、箇条書き（•）、または【】を使ってスッキリ見やすく（2〜4段落程度で）まとめてください。${contextStr}`;
  }

  return `你是一位專業且親切的 3D 列印耗材專家與神狗勾官方商城智能客服顧問。
請一律使用自然、道地的台灣正體中文回答（嚴禁使用中國大陸用語與簡體字，例如必須使用「列印、高畫質、記憶體、軟體、最佳化」，不可死板生硬）。
【排版與回答規範】：
1. 嚴禁使用雙星號 ** 或 ### 標題符號，請使用純文字、• 列點或【】標示重點。
2. 語氣像經驗豐富的台灣 3D 列印老手，開門見山直切重點，控制在 2 至 4 段清晰建議或列點，不說多餘官腔客套話。
3. 神狗勾全系列 1kg 線材（外徑 200mm、寬 65mm，公差 ±0.02mm）全面相容拓竹 Bambu Lab AMS 與主流高速機（TPU 軟膠除外，需外掛直供；PLA-CF/PETG-CF 建議搭配硬化鋼噴嘴）。
4. 全館滿 NT$999 免運、24H 出貨；優惠碼【PRINTCORE10】享 9 折、【GODDOG100】滿千折百；空線盤回收每盤回饋 NT$20 紅利。${contextStr}`;
}

/**
 * Calls the server-side Gemini API endpoint (/api/ai/chat).
 * All @google/genai SDK execution happens strictly on the server.
 */
export async function callDirectBrowserGemini(
  userMessage: string,
  history: Array<{ sender?: string; role?: string; text: string }> = [],
  preferredModel?: string,
  storeContext?: any,
  signal?: AbortSignal,
  lang: SupportedChatLang = 'zh-TW'
): Promise<string | null> {
  if (preferredModel === 'local-expert' || signal?.aborted) return null;

  const apiBase = getBackendApiBase();
  try {
    const res = await fetch(`${apiBase}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        message: userMessage,
        model: preferredModel || 'gemini-3.8-flash',
        messages: history,
        storeContext,
        lang,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.reply?.trim();
    if (text) {
      return text
        .replace(/\*\*/g, '')
        .replace(/^#{1,6}\s+/gm, '')
        .trim();
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
  }

  return null;
}

/**
 * Streams or fetches Gemini responses via the server-side SSE endpoint (/api/ai/chat/stream).
 */
export async function requestGeminiViaFirestoreBridge(params: {
  message: string;
  model?: string;
  history?: Array<{ sender?: string; role?: string; text: string }>;
  storeContext?: any;
  signal?: AbortSignal;
  onChunk?: (streamedSoFar: string) => void;
  lang?: SupportedChatLang;
}): Promise<string | null> {
  if (params.signal?.aborted) return null;
  const apiBase = getBackendApiBase();

  try {
    const streamRes = await fetch(`${apiBase}/api/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: params.signal,
      body: JSON.stringify({
        message: params.message,
        model: params.model || 'gemini-3.8-flash',
        messages: params.history || [],
        storeContext: params.storeContext,
        lang: params.lang || 'zh-TW',
      }),
    });

    const contentType = streamRes.headers.get('content-type') || '';
    if (streamRes.ok && streamRes.body && contentType.includes('text/event-stream')) {
      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let streamDone = false;

      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              accumulatedText += parsed.text;
              params.onChunk?.(accumulatedText);
            }
          } catch {}
        }
      }

      if (accumulatedText.trim()) {
        return accumulatedText.trim();
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
  }

  const direct = await callDirectBrowserGemini(
    params.message,
    params.history || [],
    params.model,
    params.storeContext,
    params.signal,
    params.lang || 'zh-TW'
  );
  if (direct && params.onChunk) {
    params.onChunk(direct);
  }
  return direct;
}

export async function generateClientGeminiChat(
  prompt: string,
  lang: SupportedChatLang = 'zh-TW'
): Promise<string> {
  const reply = await callDirectBrowserGemini(prompt, [], 'gemini-3.8-flash', undefined, undefined, lang);
  if (reply) return reply;
  return generateSmart3DExpertReply(prompt, undefined, lang).reply;
}

/**
 * Built-in 3D printing expert engine when cloud API is offline or user selects local-expert mode.
 * Responds naturally and idiomatically in the active language ('zh-TW' | 'en' | 'ja').
 */
export function generateSmart3DExpertReply(
  text: string,
  storeContext?: any,
  lang: SupportedChatLang = 'zh-TW'
): { reply: string; modelUsed: string; solution?: any } {
  const q = text.toLowerCase();
  const modelUsed =
    lang === 'en'
      ? 'GodDog 3D Expert Advisor'
      : lang === 'ja'
      ? '神狗勾 3D専門アドバイザー'
      : '神狗勾 3D 專家顧問';

  if (lang === 'en') {
    if (/ship|delivery|how long|free shipping|freight|dispatch/.test(q)) {
      return {
        modelUsed,
        reply: `【Shipping & Delivery Info】
• Free Shipping Threshold: Every order over NT$999 qualifies for free shipping (7-ELEVEN, FamilyMart pickup, or home delivery).
• Fast Dispatch: In-stock spools ship out within 24 hours—orders placed before 4:00 PM CST go out the same day and typically arrive in 1–2 business days.`,
      };
    }

    if (/discount|coupon|promo|code|cheaper|sale|voucher/.test(q)) {
      return {
        modelUsed,
        reply: `【Active Promo Codes & Maker Perks】
• [PRINTCORE10]: Take 10% off your entire cart right away.
• [GODDOG100]: Save NT$100 on any order of NT$1,000 or more.
• [VIP95]: Extra 5% off stackable member perk.
• Eco Spool Program: Send back your empty spools and get NT$20 in reward credit per spool!`,
      };
    }

    if (/ams|bambu|x1c|p1s|p1p|a1/.test(q)) {
      return {
        modelUsed,
        reply: `【Bambu Lab & AMS Compatibility】
• Direct Drop-In Fit: All GodDog 1kg spools use reinforced 200mm OD / 65mm width injection-molded rims—no cardboard dust and zero adapter rings needed in your AMS.
• High-Speed Ready: Our High-Speed PLA+ and PETG-HF are tuned for up to 22–28 mm³/s volumetric flow on X1C, P1S, and A1 series.
• Pro Tip: Flexible TPU 95A is too soft for the AMS drive gears—always feed TPU directly from the rear external spool holder!`,
      };
    }

    if ((/pla/.test(q) && /petg/.test(q)) || /difference|compare|vs|which one|choose/.test(q)) {
      return {
        modelUsed,
        reply: `【High-Speed PLA+ vs. PETG-HF: Quick Maker's Guide】
• High-Speed PLA+ (Nozzle 210–225°C / Bed 55–60°C): Crisp overhangs, matte or silky finishes, and super forgiving at 300–500 mm/s. Best for figurines, desk organizers, and architectural models. Softens around 58°C.
• PETG-HF (Nozzle 235–250°C / Bed 70–75°C): Tough, slightly flexible, water-resistant, and handles up to 78°C without deforming. Go with PETG-HF for car mounts, outdoor brackets, or functional snap-fit parts.`,
      };
    }

    if (/temp|degree|setting|slicer|nozzle|bed|parameter|speed|profile/.test(q)) {
      return {
        modelUsed,
        reply: `【Recommended Slicer Profiles & Temperatures】
• High-Speed PLA+ / Matte PLA: Nozzle 210–225°C | Bed 55–60°C | Cooling 100% | Speed 250–500 mm/s
• PETG-HF: Nozzle 235–250°C | Bed 70–75°C | Cooling 40–60% | Retraction 0.8mm @ 30mm/s
• TPU 95A Flexible: Nozzle 220–230°C | Bed 45–50°C | Speed 40–60 mm/s (Direct drive, external spool)
• ABS+ / ASA: Nozzle 250–265°C | Bed 95–105°C | Enclosed chamber recommended
• PLA-CF Carbon Fiber: Nozzle 220–235°C | Bed 60°C | Hardened steel nozzle 0.4mm or 0.6mm`,
      };
    }

    if (/string|ooz|hair|web|retract|wet|dry|拉絲/.test(q)) {
      return {
        modelUsed,
        reply: `【Fixing Stringing & Oozing】
1. Dry Your Filament: Even sealed spools can pick up humidity once opened. Pop PLA in a dryer at 50°C (or PETG at 60°C) for 4 hours—this fixes 80% of fine cobweb stringing.
2. Dial Down Nozzle Temp: Drop your nozzle temperature by 5–10°C so molten plastic doesn't drip during travel moves.
3. Retraction & Wipe: On direct-drive printers (Bambu/K1), set retraction to 0.8mm at 35mm/s and enable "Wipe while retracting" in your slicer.`,
        solution: {
          solutions: [
            'Dry filament at 50–60°C for 4 hours to eliminate moisture micro-bubbles',
            'Lower nozzle temperature by 5–10°C to reduce travel oozing',
            'Set direct-drive retraction to 0.8mm @ 35mm/s and enable Wipe on Retract',
            'Increase travel speed to 300+ mm/s to snap fine strings cleanly',
          ],
          recommendedAdjustment: {
            temperature: 'Nozzle -5°C to -10°C (PLA 205–215°C / PETG 235°C)',
            speed: 'Travel 300–400 mm/s',
            retraction: 'Direct 0.8mm @ 35mm/s (Bowden 4.5mm)',
            cooling: '100% for PLA / 50% for PETG',
          },
        },
      };
    }

    if (/warp|stick|adhes|peel|first layer|bed|翹邊|不黏/.test(q)) {
      return {
        modelUsed,
        reply: `【Solving First-Layer Adhesion & Warping】
1. Degrease the PEI Plate: Finger oils are the #1 cause of corners lifting. Wash your Textured PEI plate with warm water and dish soap—skip rubbing alcohol if residue builds up.
2. Slow Down Layer 1: Print the first layer at 35–45 mm/s with the part cooling fan off for the first 2 layers, and bump bed temp up by +5°C.
3. Add a Brim: For large flat boxes or sharp corners, enable a 5mm Outer Brim (0.1mm brim-object gap) to anchor the edges down.`,
        solution: {
          solutions: [
            'Wash Textured PEI plate with warm water and dish soap to remove skin oils',
            'Adjust Z-Offset down by 0.03mm for a slightly firmer first-layer squish',
            'Slow first layer speed to 30–40 mm/s with cooling fan at 0% for first 2 layers',
            'Enable 5–8mm Outer Brim in your slicer to anchor sharp corners',
          ],
          recommendedAdjustment: {
            temperature: 'Nozzle 215–225°C / Bed 60–65°C',
            speed: 'First Layer 30 mm/s (Other layers 200–300 mm/s)',
            retraction: 'Direct 0.8mm @ 35mm/s',
            cooling: 'Layer 1–2: 0% (100% from Layer 3)',
          },
        },
      };
    }

    const viewingNote = storeContext?.viewingProduct
      ? `\n\nI see you're looking at [${storeContext.viewingProduct.name}] (${storeContext.viewingProduct.material}, NT$${storeContext.viewingProduct.price}). Want my recommended slicer settings or printer compatibility tips for it?`
      : '';

    return {
      modelUsed,
      reply: `Hey there! Here is a quick rundown to help with your print setup:
• High-Speed PLA+ & Matte PLA: Best for crisp details and effortless 300–500mm/s printing (Nozzle 215°C / Bed 60°C).
• PETG-HF & ABS+: Ideal for tough mechanical brackets, car parts, and outdoor weather resistance (Nozzle 240°C / Bed 75°C).
• Every order over NT$999 ships free within 24 hours, and code [PRINTCORE10] gets you 10% off.${viewingNote}

Tell me which 3D printer model you're running or what part you're making, and I'll dial in the exact settings for you!`,
    };
  }

  if (lang === 'ja') {
    if (/送料|配送|発送|いつ届く|無料|ship/.test(q)) {
      return {
        modelUsed,
        reply: `【送料・スピード発送のご案内】
• 送料無料ライン：全商品 NT$999 以上のご注文で送料無料となります（コンビニ受取・宅配便対応）。
• 24時間以内発送：在庫商品はすべて台湾国内倉庫より24時間以内に発送いたします（16時までのご注文は当日出荷、通常1〜2営業日でお届け）。`,
      };
    }

    if (/割引|クーポン|コード|セール|お得|ポイント|discount|promo/.test(q)) {
      return {
        modelUsed,
        reply: `【現在使えるお得なクーポン＆特典】
• 【PRINTCORE10】：全商品対象・今すぐ使える 10% OFF クーポン！
• 【GODDOG100】：NT$1,000 以上のご注文で NT$100 引き。
• 【VIP95】：会員様向けの 5% OFF 優待コード。
• 空スプール回収特典：使い終わった空スプールを返送いただくと、1個につき NT$20 分のポイントを還元いたします！`,
      };
    }

    if (/ams|bambu|拓竹|x1c|p1s|a1/.test(q)) {
      return {
        modelUsed,
        reply: `【Bambu Lab AMS・高速プリンター対応について】
• アダプター不要で完全対応：当店の1kgスプール（外径200mm・幅65mm）は強化プラスチック製のため、紙粉が出ず Bambu Lab AMS にそのままセット可能です。
• 高速造形に最適化：High-Speed PLA+ や PETG-HF は最大体積流量 22〜28 mm³/s に対応し、X1C / P1S / A1 シリーズで美しい高速積層を実現します。
• ご注意点：軟質フィラメントの TPU 95A のみ、AMS内部での詰まり防止のため背面外部ホルダーから直接給紙してください。`,
      };
    }

    if ((/pla/.test(q) && /petg/.test(q)) || /違い|比較|どっち|おすすめ|選び方|vs/.test(q)) {
      return {
        modelUsed,
        reply: `【High-Speed PLA+ と PETG-HF の選び方・徹底比較】
• High-Speed PLA+（ノズル 210〜225°C / ベッド 55〜60°C）：オーバーハングや細かいディテールが綺麗に仕上がり、反りもほぼゼロで初心者から高速機ユーザーまで一番人気の素材です（耐熱は約58°C）。
• PETG-HF（ノズル 235〜250°C / ベッド 70〜75°C）：粘り強さと耐衝撃性に優れ、約78°Cまで耐えるため、夏場の車内パーツや屋外用ブラケット、スナップフィット部品に最適です。`,
      };
    }

    if (/温度|設定|スライサー|ノズル|ベッド|パラメータ|速度|temp/.test(q)) {
      return {
        modelUsed,
        reply: `【主要マテリアルの推奨スライサー設定】
• High-Speed PLA+ / マットPLA：ノズル 210〜225°C｜ベッド 55〜60°C｜冷却ファン 100%｜速度 250〜500 mm/s
• PETG-HF 高速耐候：ノズル 235〜250°C｜ベッド 70〜75°C｜ファン 40〜60%｜リトラクション 0.8mm @ 30mm/s
• TPU 95A 軟質エラストマー：ノズル 220〜230°C｜ベッド 45〜50°C｜速度 40〜60 mm/s（外部給紙）
• ABS+ / ASA：ノズル 250〜265°C｜ベッド 95〜105°C｜エンクロージャー（庫内保温）推奨
• PLA-CF 炭素繊維：ノズル 220〜235°C｜ベッド 60°C｜0.4mm以上の硬化鋼ノズル推奨`,
      };
    }

    if (/糸引き|リトラクション|湿気|乾燥|クモの巣|string|拉絲/.test(q)) {
      return {
        modelUsed,
        reply: `【糸引き（ストリンギング）をピタッと止める3つの対策】
1. フィラメントの乾燥：開封後の湿気は糸引きの最大の原因です。PLAは50°C、PETGは60°Cで4時間ほど乾燥させると驚くほど改善します。
2. ノズル温度を5〜10°C下げる：樹脂の垂れを抑えるため、推奨温度の下限寄りでテストしてみてください。
3. リトラクション設定：ダイレクト式（Bambu LabやK1等）では引き戻し距離 0.8mm・速度 35mm/s に設定し、「引き戻し時にワイプ」を有効にするのが効果的です。`,
        solution: {
          solutions: [
            'フィラメント乾燥機（PLA 50°C / PETG 60°C）で4時間乾燥させ湿気を除去する',
            'ノズル温度を5〜10°C下げて移動中の樹脂垂れを抑える',
            'リトラクション距離を 0.8mm（速度 35mm/s）に設定し「引き戻し時にワイプ」を有効化する',
            'トラベル（空走）速度を 300mm/s 以上に引き上げる',
          ],
          recommendedAdjustment: {
            temperature: 'ノズル 205〜215°C (PLA) / 235°C (PETG)',
            speed: 'トラベル速度 300〜400 mm/s',
            retraction: 'ダイレクト式 0.8mm @ 35mm/s',
            cooling: 'PLA 100% / PETG 50%',
          },
        },
      };
    }

    if (/反り|剥がれ|定着|1層目|ベッド|warp|stick|翹邊|不黏/.test(q)) {
      return {
        modelUsed,
        reply: `【1層目の定着不良・反り（ウォーピング）対策】
1. PEIプレートの脱脂洗浄：指紋や皮脂が残っていると角から剥がれやすくなります。ぬるま湯と中性洗剤（食器用洗剤）でプレートを洗うと定着力が復活します。
2. 1層目をゆっくり厚めに：初層速度を 35〜45 mm/s に落とし、最初の2層は冷却ファンをOFF、ベッド温度を +5°C 高めに設定してください。
3. ブリム（Brim）の追加：底面積が広いモデルや角があるパーツは、スライサーで 5〜8mm の外側ブリムを付けると反りをしっかり抑えられます。`,
        solution: {
          solutions: [
            'PEIビルドプレートをぬるま湯と中性洗剤で洗い、皮脂汚れを完全に落とす',
            'Zオフセットを 0.03mm 下げて1層目の密着度を高める',
            '初層スピードを 30〜35 mm/s に落とし、最初の2層は冷却ファンを0%にする',
            'スライサーで 5〜8mm の外側ブリム（Brim）を有効にする',
          ],
          recommendedAdjustment: {
            temperature: 'ノズル 215〜225°C / ベッド 60〜65°C',
            speed: '1層目 30 mm/s（2層目以降 200〜300 mm/s）',
            retraction: 'ダイレクト式 0.8mm @ 35mm/s',
            cooling: '1〜2層目 0%（3層目以降 100%）',
          },
        },
      };
    }

    const viewingNoteJa = storeContext?.viewingProduct
      ? `\n\n現在ご覧いただいている【${storeContext.viewingProduct.name}】(${storeContext.viewingProduct.material}, NT$${storeContext.viewingProduct.price}) に合わせた最適なスライサー設定もすぐにご案内できます！`
      : '';

    return {
      modelUsed,
      reply: `ご質問ありがとうございます！用途に合わせたポイントをまとめました：
• High-Speed PLA+ / マットPLA：高速300〜500mm/sでも積層痕が目立たず、フィギュアや雑貨に最適（ノズル 215°C / ベッド 60°C）。
• PETG-HF / ABS+：耐衝撃・耐熱性が求められる治具や屋外パーツにおすすめ（ノズル 240°C / ベッド 75°C）。
• 全品 NT$999 以上で送料無料・24時間以内発送、クーポン【PRINTCORE10】で 10% OFF になります。${viewingNoteJa}

お使いの3Dプリンターの機種名や、作りたいパーツを教えていただければ、ベストな設定をご提案します！`,
    };
  }

  if (/運費|免運|出貨|多久|物流|幾天|7-11|全家/.test(q)) {
    return {
      modelUsed,
      reply: `【物流出貨與免運說明】
• 免運門檻：全館單筆訂單滿 NT$999 即享免運優惠（支援 7-ELEVEN、全家超商取貨與黑貓宅配）。
• 出貨時效：台灣現貨供應，每日 16:00 前下單當日火速寄出，超商取貨約 2 天送達門市、宅配約 1 至 2 個工作天送達。`,
    };
  }

  if (/優惠|折扣|代碼|折價券|便宜|活動|紅利/.test(q)) {
    return {
      modelUsed,
      reply: `【最新專屬優惠碼與回饋方案】
• 優惠碼【PRINTCORE10】：全館耗材直接享 9 折優惠。
• 優惠碼【GODDOG100】：單筆滿 NT$1,000 現折 NT$100。
• 優惠碼【VIP95】：老客戶專屬 95 折優惠。
• 空盤環保回收：寄回神狗勾或主流品牌 1kg 空線盤，每盤直接回饋 NT$20 購物金！`,
    };
  }

  if (/ams|拓竹|bambu|x1|p1s|a1/.test(q)) {
    return {
      modelUsed,
      reply: `【Bambu Lab 拓竹 AMS 與高速機相容性指南】
• 原生直上免轉接環：神狗勾全系列 1kg 線材皆採用標準 200mm 外徑、65mm 寬度強化塑膠線盤，放入拓竹 AMS 絕不掉紙屑、不卡盤。
• 高流量配方：High-Speed PLA+ 與 PETG-HF 支援高達 22–28 mm³/s 體積流量，完美適配 X1C、P1S、A1 全系列高速列印。
• 實戰提醒：TPU 95A 彈性軟膠因材質柔軟，請勿放入 AMS，建議直接從機身後方外掛料架進料！`,
    };
  }

  if ((/pla/.test(q) && /petg/.test(q)) || /差別|比較|選哪|哪個好|差異|vs/.test(q)) {
    return {
      modelUsed,
      reply: `【High-Speed PLA+ 與 PETG-HF 實戰選材比較】
• High-Speed PLA+（噴嘴 210–225°C / 熱床 55–60°C）：流動性極佳、懸垂與橋接表現最好、幾乎零翹邊，適合公仔模型、文創擺件與精密外殼（耐溫約 58°C）。
• PETG-HF 高速耐候（噴嘴 235–250°C / 熱床 70–75°C）：具備優異韌性與抗衝擊力、耐溫達 78°C 且抗紫外線與防水，適合車內支架、戶外零件與卡扣結構件。`,
    };
  }

  if (/溫度|幾度|參數|設定|切片|噴嘴|熱床|速度/.test(q)) {
    return {
      modelUsed,
      reply: `【主力耗材建議切片參數一覽】
• High-Speed PLA+ / 啞光 PLA：噴嘴 210–225°C｜熱床 55–60°C｜風扇 100%｜速度 250–500 mm/s
• PETG-HF 高速耐候：噴嘴 235–250°C｜熱床 70–75°C｜風扇 40–60%｜回抽 0.8mm @ 30mm/s
• TPU 95A 彈性軟膠：噴嘴 220–230°C｜熱床 45–50°C｜速度 40–60 mm/s（外掛直驅供料）
• ABS+ / ASA 工程料：噴嘴 250–265°C｜熱床 95–105°C｜建議封箱保溫列印
• PLA-CF 碳纖維：噴嘴 220–235°C｜熱床 60°C｜建議搭配 0.4mm 以上硬化鋼噴嘴`,
    };
  }

  if (/拉絲|牽絲|蜘蛛網|漏料|回抽|受潮|烘乾/.test(q)) {
    return {
      modelUsed,
      reply: `【快速解決 3D 列印拉絲（Stringing）3 步驟】
1. 線材除濕烘乾：線材開袋後吸濕是最常見的拉絲主因，建議 PLA 以 50°C、PETG 以 60°C 烘乾 4 小時，氣泡與細毛會立刻消失。
2. 調降噴嘴溫度：將噴嘴溫度微調降低 5–10°C，減少空駛移動時的殘料滴漏。
3. 最佳化回抽與擦拭：近端直驅機型（如拓竹、K1）建議回抽距離設為 0.8mm、回抽速度 35mm/s，並在切片軟體勾選「回抽時擦拭 (Wipe)」。`,
      solution: {
        solutions: [
          '將線材放入乾燥盒（PLA 50°C / PETG 60°C）烘烤 4 小時去除水氣微氣泡',
          '噴嘴溫度調降 5–10°C，降低熔融塑料空駛時的滴漏',
          '近端直驅回抽設為 0.8mm @ 35mm/s，並勾選「回抽時擦拭 (Wipe)」',
          '提高空駛移動速度 (Travel Speed) 至 300mm/s 以上',
        ],
        recommendedAdjustment: {
          temperature: '噴嘴 205–215°C (PLA) / 235°C (PETG)',
          speed: '空駛速度 300–400 mm/s',
          retraction: '近端 0.8mm @ 35mm/s / 遠端 4.5mm',
          cooling: 'PLA 100% / PETG 50%',
        },
      },
    };
  }

  if (/翹邊|不黏|脫落|首層|第一層|底板|熱床/.test(q)) {
    return {
      modelUsed,
      reply: `【首層不黏與邊角翹邊（Warping）急救指南】
1. 徹底清潔 PEI 鋼板：手部油脂會讓首層完全失去抓地力，請用溫水加洗碗精刷洗 PEI 彈簧鋼板並擦乾，效果遠勝單擦酒精。
2. 放慢首層並提高床溫：首層速度降至 35–45 mm/s、前 2 層關閉冷卻風扇，並將熱床溫度調高 5°C。
3. 開啟外圈裙邊（Brim）：列印大面積盒體或銳角零件時，在切片軟體開啟 5–8mm 外側 Brim，即可牢牢抓緊平台不翹曲。`,
      solution: {
        solutions: [
          '以溫水加中性洗碗精徹底刷洗 PEI 彈簧鋼板表面，去除手部指紋油脂',
          '微調 Z-Offset 降低 0.03mm–0.05mm 增強首層擠出壓實感',
          '切片設定首層列印速度降至 30 mm/s，前 2 層完全關閉冷卻風扇',
          '開啟切片外側裙邊 (Brim) 5mm–8mm 擴大邊角抓附面積',
        ],
        recommendedAdjustment: {
          temperature: '噴嘴 215–225°C / 熱床 60–65°C',
          speed: '首層 30 mm/s (其餘層 200–300 mm/s)',
          retraction: '近端 0.8mm @ 35mm/s',
          cooling: '首層 0% (第 3 層後開啟至 100%)',
        },
      },
    };
  }

  const viewingNoteZh = storeContext?.viewingProduct
    ? `\n\n看到您正在瀏覽【${storeContext.viewingProduct.name}】(${storeContext.viewingProduct.material}, NT$${storeContext.viewingProduct.price})，需要我提供這款線材的專屬切片參數嗎？`
    : '';

  return {
    modelUsed,
    reply: `您好！為您整理最實用的選材與設定重點：
• High-Speed PLA+ / 啞光 PLA：支援 300–500mm/s 高速列印、表面細膩無層紋（噴嘴 215°C / 熱床 60°C）。
• PETG-HF / ABS+：高韌性耐衝擊、適合戶外耐候與車用機構件（噴嘴 240°C / 熱床 75°C）。
• 全館滿 NT$999 免運、24H 快速出貨，輸入優惠碼【PRINTCORE10】再享 9 折優惠。${viewingNoteZh}

您可以直接告訴我您使用的 3D 列印機型或想印的作品，我馬上幫您配出最佳參數！`,
  };
}

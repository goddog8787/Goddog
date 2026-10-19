import { GoogleGenAI } from '@google/genai';

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
    console.warn('[Gemini Client] gemini-3.8-flash call error, trying backup model:', err?.message || err);
    try {
      const backupRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      if (backupRes.text && backupRes.text.trim()) {
        return backupRes.text.trim();
      }
    } catch (backupErr) {
      console.warn('[Gemini Client] backup model call failed:', backupErr);
      throw backupErr;
    }
  }

  return '';
}

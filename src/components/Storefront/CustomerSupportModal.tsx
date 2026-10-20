import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  Bot, 
  User, 
  RefreshCw, 
  Brain, 
  RotateCcw, 
  Cloud,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ArrowLeft,
  Cpu,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { generateClientGeminiChat } from '../../lib/geminiClient';
import { FilamentProduct, CartItem, MemberProfile, SUPPORTED_AI_MODELS, LanguageCode } from '../../types';
import { 
  saveCustomerChatMessages, 
  loadCustomerChatMessages,
  ChatMessage,
  DiagnosticSolution
} from '../../lib/customerPersistence';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingProduct?: FilamentProduct | null;
  cartItems?: CartItem[];
  member?: MemberProfile;
  initialPrompt?: string;
  onSelectProduct?: (product: FilamentProduct) => void;
  lang?: LanguageCode;
}

const STORAGE_KEY = 'goddog_ai_chat_history_v2';

/**
 * Sanitizes chat messages to eliminate unwanted ** asterisks, markdown headers, and unnecessary fluff
 */
export function cleanChatText(rawText: string): string {
  if (!rawText) return '';
  let cleaned = String(rawText);

  // 1. Remove markdown headers (###, ##, #) at line beginnings
  cleaned = cleaned.replace(/^#{1,4}\s+/gm, '');

  // 2. Remove horizontal rule lines (---)
  cleaned = cleaned.replace(/\n\s*---\s*$/g, '').replace(/^\s*---\s*$/gm, '');

  // 3. Remove raw bold asterisks (**keyword** -> keyword)
  cleaned = cleaned.replace(/\*\*/g, '');

  // 4. Clean bullet markdown (* or - at line beginnings -> • )
  cleaned = cleaned.replace(/^[\*\-]\s+/gm, '• ');

  // 5. Clean redundant robotic filler opening lines
  cleaned = cleaned.replace(/^針對您詢問的[^\n]*[為以]您整理如下[：:]\s*\n*/g, '');
  cleaned = cleaned.replace(/^針對您詢問的[^\n]*，[為以]您整理如下[：:]\s*\n*/g, '');
  cleaned = cleaned.replace(/^針對您詢問的[^\n]*[為以]您說明如下[：:]\s*\n*/g, '');
  cleaned = cleaned.replace(/^針對您詢問的[^\n]*，[為以]您說明如下[：:]\s*\n*/g, '');

  // 6. Clean consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-init',
  sender: 'ai',
  text: '您好！我是神狗勾 3D 智能顧問。\n\n無論是 PLA+、PETG、TPU 還是碳纖維線材的切片推薦溫度、速度、拓竹 AMS 供料設定或列印故障排查，請隨時告訴我！',
  timestamp: Date.now(),
  modelUsed: 'Gemini 3.8 Flash',
};

// Intelligent built-in 3D printing engineering engine for zero-failure client replies
function generateClientExpertReply(text: string): { reply: string; modelUsed: string; solution?: DiagnosticSolution } {
  const lower = text.toLowerCase();
  
  if (/差別|不同|比較|差異|對比|哪裡不同|vs|versus/i.test(lower)) {
    if ((lower.includes('pla') && lower.includes('petg')) || lower.includes('petg')) {
      return {
        reply: '【PLA+ 與 PETG 深度對比指引】\n• 耐溫性能：PLA+ 耐溫約 55~60°C，高溫車內曝曬易軟化變形；PETG 耐溫達 75~80°C，耐候抗 UV 性能顯著優異。\n• 機械強度：PLA+ 剛性硬度高、列印不易翹邊，適合精緻公仔與展示模型；PETG 韌性極佳、抗衝擊摔不裂，適合機械治具、掛鉤與受力件。\n• 列印難易：PLA+ 極易列印且支援 600mm/s 高速機；PETG 黏著力強，建議熱床降溫後再取件，列印速度建議 80~150mm/s。\n\n選購建議：室內展示首選 High-Speed PLA+；功能耐摔或戶外首選 PETG-HF。',
        modelUsed: '神狗勾 3D 專家顧問',
      };
    }
  }

  if (/溫度|設幾度|幾度|熱床/i.test(lower)) {
    if (lower.includes('petg')) {
      return {
        reply: '【神狗勾 PETG-HF 推薦參數】\n• 噴嘴溫度：235°C ~ 250°C（高速機型首層 245°C）\n• 熱床溫度：70°C ~ 80°C（PEI 塗層板建議 75°C）\n• 冷卻風扇：20% ~ 50%（高速過橋可開至 70%）\n• 列印速度：80 ~ 200 mm/s\n\n小提醒：取件時請待熱床降溫至室溫（約 35°C 以下）再輕彎底板，避免破壞 PEI 鍍層。',
        modelUsed: '神狗勾 3D 專家顧問',
      };
    }
    if (lower.includes('tpu')) {
      return {
        reply: '【神狗勾 TPU 95A 柔性線材參數】\n• 噴嘴溫度：215°C ~ 230°C\n• 熱床溫度：40°C ~ 50°C（亦可不加熱）\n• 列印速度：20 ~ 40 mm/s（柔性線材請關閉高加減速）\n• 回抽距離：0.8 ~ 1.5mm（直驅擠出機），關閉過長回抽以防纏輪。\n\n重要提示：TPU 軟膠禁止放入拓竹 AMS 多色供料系統，請改用後方單盤料架直供。',
        modelUsed: '神狗勾 3D 專家顧問',
      };
    }
    if (lower.includes('abs') || lower.includes('asa')) {
      return {
        reply: '【神狗勾 ABS+ / ASA 耐熱線材參數】\n• 噴嘴溫度：245°C ~ 265°C\n• 熱床溫度：95°C ~ 105°C\n• 設備要求：強烈建議封箱機型（拓竹 X1/P1S、Creality K1），列印時務必關閉箱體通風與輔助側風扇，以徹底防止層裂與翹邊。',
        modelUsed: '神狗勾 3D 專家顧問',
      };
    }
    if (lower.includes('cf') || lower.includes('碳纖維')) {
      return {
        reply: '【神狗勾 PLA-CF 碳纖維強化線材參數】\n• 噴嘴溫度：215°C ~ 235°C\n• 熱床溫度：55°C ~ 65°C\n• 噴嘴規格：硬度要求極高，務必使用「0.4mm 或 0.6mm 硬化鋼噴嘴」，嚴禁使用一般黃銅噴嘴以防快速磨損磨穿。\n• 外觀特點：消光碳纖質感，層紋極不明顯，剛性比標準 PLA 提升 35% 以上。',
        modelUsed: '神狗勾 3D 專家顧問',
      };
    }
    return {
      reply: '【神狗勾 High-Speed PLA+ 推薦切片參數】\n• 噴嘴溫度：205°C ~ 220°C（高速機首層 215°C）\n• 熱床溫度：50°C ~ 60°C\n• 冷卻風扇：100% 全速運轉\n• 列印速度：相容 50 ~ 500 mm/s（拓竹 AMS / K1 預設 Standard 即可完美成型）。',
      modelUsed: '神狗勾 3D 專家顧問',
    };
  }

  if (/ams|拓竹|bambu/i.test(lower)) {
    return {
      reply: '【拓竹 Bambu Lab AMS 多色系統完全相容保證】\n• 神狗勾全系列 1kg 線材均採用標準外徑 200mm、軸寬 65mm 規格，可 100% 完美放入 AMS 與 AMS Lite，蓋子順暢密合旋轉不卡料。\n• 線盤出廠均通過光學高精度 ±0.02mm 檢測與真空乾燥包裝。\n• 注意：TPU 彈性軟膠請由機身後方掛架單獨進料，其餘 PLA、PETG、ABS、PLA-CF 均完全相容 AMS 多色切換！',
      modelUsed: '神狗勾 3D 專家顧問',
    };
  }

  if (/拉絲|牽絲/i.test(lower)) {
    return {
      reply: '【3D 列印拉絲排查四大對策】\n1. 降低噴嘴溫度：以 5°C 為單位微調降溫（高溫會大幅增加流動性造成滲料）。\n2. 調整回抽（Retraction）：直驅機型建議回抽距離 0.8~1.2mm、速度 30~45mm/s；遠程機型建議 4~6mm。\n3. 開啟空駛擦嘴（Wipe while retracting）與退料滑行（Coasting）。\n4. 線材防潮退濕：線材受潮氣化會產生氣泡並擠出拉絲，建議使用乾燥烘料盒 50°C 烘烤 4~6 小時。',
      modelUsed: '神狗勾 3D 專家顧問',
    };
  }

  if (/翹邊|不黏|底板/i.test(lower)) {
    return {
      reply: '【首層不黏與翹邊急救 SOP】\n1. 清洗熱床底板：使用洗碗精與溫水刷洗 PEI 板表面油脂，再以無水酒精擦拭（勿直接徒手觸碰列印區域）。\n2. 提高首層熱床溫度：PLA 設 60°C、PETG 設 75°C、ABS 設 100°C。\n3. 首層列印降速：第一層列印速度降至 25~35 mm/s，首層關閉冷卻風扇。\n4. 切片輔助邊框：在切片軟體中開啟裙邊或加寬 Brim（外側邊緣 5mm）。',
      modelUsed: '神狗勾 3D 專家顧問',
    };
  }

  if (/^欸|哈囉|你好|嗨|hi|hello|在嗎|安安|早安|午安|晚安|神狗勾|小幫手/i.test(lower) || lower.length <= 3) {
    return {
      reply: '您好！我是神狗勾 3D 官方智能顧問。\n\n無論是材料選購、拓竹 AMS 多色系統相容性、切片溫度與速度參數調整，或是列印拉絲、翹邊等故障排查，都可以隨時跟我聊聊喔！請告訴我您的疑問或使用的 3D 印表機型號！',
      modelUsed: '神狗勾 3D 專家顧問',
    };
  }

  const topic = text.trim();
  return {
    reply: `關於您詢問的「${topic}」：\n\n神狗勾 3D 顧問團隊為您提供以下說明與建議：\n• High-Speed PLA+ 推薦噴嘴 205~220°C / 熱床 55~60°C；PETG-HF 推薦噴嘴 235~245°C / 熱床 75°C。\n• 線盤與 AMS 相容性：神狗勾全館 1kg 標準線盤外徑 200mm，100% 相容拓竹 Bambu AMS 多色系統與 Creality K1 高速機型。\n• 現貨出貨與免運：下單後 24 小時內快速出庫，全館滿 NT$999 享超商與宅配免運！\n\n您可以隨時告訴我您使用的印表機型號或切片疑問，我將為您提供最適合的參數調校！`,
    modelUsed: '神狗勾 3D 專家顧問',
  };
}

// Sanitize any historically corrupted chat order so AI answers never appear behind subsequent questions
function sanitizeChatOrder(msgs: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(msgs) || msgs.length === 0) return [DEFAULT_WELCOME_MESSAGE];
  
  // Ensure every message has clean text and a unique ID
  return msgs.map((m, idx) => ({
    ...m,
    id: m.id || `${m.sender}-${idx}-${m.timestamp || Date.now()}`,
    text: m.sender === 'ai' ? cleanChatText(m.text) : m.text,
  }));
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  viewingProduct,
  cartItems = [],
  member,
  initialPrompt,
  lang: propLang,
}) => {
  const lang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const [isLoading, setIsLoading] = useState(false);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [activeViewingProduct, setActiveViewingProduct] = useState<FilamentProduct | null>(viewingProduct || null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedParamId, setCopiedParamId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from persistent storage or default
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((m: any) => {
            if (!m || !m.text) return false;
            const text = String(m.text);
            return !(
              text.includes('【Gemini 模型調度指示】') ||
              text.includes('【Gemini 模型調度異常】') ||
              text.includes('【Gemini 調度異常】') ||
              text.includes('尚未偵測到 Google Gemini API Key') ||
              text.includes('針對您詢問的')
            );
          });
          if (cleaned.length > 0) return sanitizeChatOrder(cleaned);
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [chatInput, setChatInput] = useState('');

  // AI Model Selection state with localStorage persistence
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('printcore_selected_ai_model');
      if (saved && SUPPORTED_AI_MODELS.some((m) => m.id === saved)) {
        return saved;
      }
      return 'gemini-3.8-flash';
    } catch {
      return 'gemini-3.8-flash';
    }
  });
  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem('printcore_selected_ai_model', modelId);
    } catch {}
    setShowModelPicker(false);
  };

  const currentModelObj = SUPPORTED_AI_MODELS.find((m) => m.id === selectedModel) || SUPPORTED_AI_MODELS[0];

  // Load customer chat history once on mount or when member ID changes
  const initialLoadedRef = useRef(false);
  useEffect(() => {
    if (isOpen && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      loadCustomerChatMessages(member?.id).then((loaded) => {
        if (loaded && loaded.length > 0) {
          setMessages(sanitizeChatOrder(loaded));
        }
        
        // If there is an initial prompt from another modal (e.g. AI Advisor)
        if (initialPrompt && initialPrompt.trim()) {
          // We pass messages state to triggerPromptExecution to ensure it uses the latest loaded ones
          const baseMessages = (loaded && loaded.length > 0) ? sanitizeChatOrder(loaded) : [DEFAULT_WELCOME_MESSAGE];
          triggerPromptExecution(initialPrompt.trim(), baseMessages);
        }
      });
    }
    // We don't reset initialLoadedRef.current on !isOpen anymore to keep the history during the session
  }, [isOpen, member?.id]);

  // Handle member ID changes - if user logs in/out, we should allow a reload
  useEffect(() => {
    initialLoadedRef.current = false;
  }, [member?.id]);

  // Persist messages whenever they change
  useEffect(() => {
    if (messages && messages.length > 0) {
      saveCustomerChatMessages(member?.id, messages);
    }
  }, [messages, member?.id]);

  // Keep viewing product updated if opened with one
  useEffect(() => {
    if (viewingProduct) {
      setActiveViewingProduct(viewingProduct);
    }
  }, [viewingProduct]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Support ESC key to close modal and return to main page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Toggle checklist item status
  const toggleChecklistStep = (key: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy parameters to clipboard
  const handleCopyParams = (id: string, solution?: DiagnosticSolution) => {
    if (!solution?.recommendedAdjustment) return;
    const adj = solution.recommendedAdjustment;
    const text = `【神狗勾 3D 切片推薦參數】\n• 噴嘴/熱床溫度: ${adj.temperature || '未指定'}\n• 列印速度: ${adj.speed || '未指定'}\n• 回抽設定: ${adj.retraction || '未指定'}\n• 冷卻風扇: ${adj.cooling || '未指定'}`;
    navigator.clipboard?.writeText(text);
    setCopiedParamId(id);
    setTimeout(() => setCopiedParamId(null), 2000);
  };

  // Reset conversation memory
  const handleResetConversation = () => {
    const freshMessages: ChatMessage[] = [
      {
        id: 'reset-welcome-' + Date.now(),
        sender: 'ai',
        text: '記憶已重新整理！我已為您開啟全新對話視窗。請問今天想了解哪一款線材或諮詢哪台 3D 印表機的切片與列印設定呢？',
        timestamp: Date.now(),
      },
    ];
    setMessages(freshMessages);
    setCheckedSteps({});
    setIsResetConfirming(false);
    saveCustomerChatMessages(member?.id, freshMessages);
  };

  // Dynamic context-aware quick prompts
  const quickPrompts = activeViewingProduct
    ? [
        lang === 'en' ? `Is ${activeViewingProduct.name} compatible with Bambu AMS?` : lang === 'ja' ? `【${activeViewingProduct.name}】はBambu AMSに対応していますか？` : `這款【${activeViewingProduct.name}】相容拓竹 AMS 嗎？`,
        lang === 'en' ? `Recommended nozzle & bed temp for ${activeViewingProduct.name}?` : lang === 'ja' ? `【${activeViewingProduct.name}】の推奨ノズル・ベッド温度は？` : `【${activeViewingProduct.name}】推薦噴嘴與熱床溫度？`,
        lang === 'en' ? `Does ${activeViewingProduct.name} require an enclosed chamber?` : lang === 'ja' ? `【${activeViewingProduct.name}】の印刷に密閉チャンバーは必要ですか？` : `列印【${activeViewingProduct.name}】需要密閉機箱嗎？`,
        lang === 'en' ? 'What is the free shipping threshold and dispatch speed?' : lang === 'ja' ? '送料無料の金額条件と発送時期を教えてください' : '全館消費滿多少免運？多久出庫？',
      ]
    : [
        lang === 'en' ? 'What is the free shipping threshold?' : lang === 'ja' ? '送料無料の条件は？' : '全館滿多少免運？多久出貨？',
        lang === 'en' ? 'Can Bambu AMS use your spools?' : lang === 'ja' ? 'Bambu AMSで使えますか？' : 'Bambu AMS 拓竹能用你們的線材嗎？',
        lang === 'en' ? 'What is the difference between PLA and PETG?' : lang === 'ja' ? 'PLAとPETGの違いは何ですか？' : 'PETG 與 PLA 差別在哪裡？',
        lang === 'en' ? 'How to prevent flexible TPU 95A jamming?' : lang === 'ja' ? 'TPU軟質フィラメント造形の注意点は？' : 'TPU 95A 軟膠列印該注意什麼？',
        lang === 'en' ? 'Do I need a hardened steel nozzle for PLA-CF?' : lang === 'ja' ? 'PLA-CFに焼入れ鋼ノズルは必要？' : 'PLA-CF 碳纖維需要更換硬化鋼噴嘴嗎？',
        lang === 'en' ? 'How to troubleshoot first-layer bed warping?' : lang === 'ja' ? '第1層の反りの解決方法は？' : '首層不黏翹邊怎麼排查？',
      ];

  // AbortController ref for disconnecting stream manually
  const abortControllerRef = useRef<AbortController | null>(null);

  // We intentionally do NOT abort on unmount here to allow the background generation 
  // requested by the user, unless the entire app unmounts or we want strict cleanup.
  // However, for persistence during modal close/open, we keep the controller alive.
  useEffect(() => {
    return () => {
      // Final cleanup when component is completely destroyed (app refresh/close)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.isLoading
          ? {
              ...m,
              isLoading: false,
              text: m.text ? `${m.text} (已手動停止生成)` : '已手動停止生成。',
            }
          : m
      )
    );
  };

  // Core Prompt Dispatcher: Guarantees strict Question -> Answer pairing
  const triggerPromptExecution = async (text: string, currentMsgs: ChatMessage[]) => {
    if (!text || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsgId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const aiMsgId = `ai-${Date.now() + 1}-${Math.random().toString(36).substring(2, 7)}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const pendingAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isLoading: true,
      timestamp: Date.now() + 1,
    };

    // Insert BOTH user message and its paired AI placeholder immediately
    // This physically prevents any subsequent question from cutting in between!
    const updatedHistory = [...currentMsgs, userMsg, pendingAiMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    const userTier = member?.membershipTier || (member?.tier === 'Diamond' ? 'PLUS' : member?.tier === 'Gold' ? 'GO' : member?.subscriptionPlan && member.subscriptionPlan !== 'None' ? 'PLUS' : 'FREE');

    // On static hosting (goddog.space), invoke client Gemini AI directly for instant response without server timeout delays
    const isStaticHost = typeof window !== 'undefined' && (window.location.hostname.includes('goddog.space') || (!window.location.hostname.includes('run.app') && !window.location.hostname.includes('localhost')));

    if (isStaticHost) {
      try {
        const geminiReply = await generateClientGeminiChat(
          text,
          updatedHistory.filter((m) => !m.isLoading).map((m) => ({ sender: m.sender, text: m.text }))
        );

        if (geminiReply && geminiReply.trim()) {
          const cleanText = cleanChatText(geminiReply);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: cleanText,
                    isLoading: false,
                    modelUsed: currentModelObj.name,
                  }
                : m
            )
          );
          return;
        }
      } catch (clientGenAiErr) {
        console.warn('[Direct Client Gemini] Fallback to expert reply:', clientGenAiErr);
        const fallback = generateClientExpertReply(text);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: fallback.reply,
                  solution: fallback.solution,
                  isLoading: false,
                  modelUsed: fallback.modelUsed,
                }
              : m
          )
        );
        return;
      }
    }

    const apiBase = '';

    try {
      // 1. Try SSE Streaming first for instant token-by-token feedback
      const streamRes = await fetch(`${apiBase}/api/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          model: selectedModel,
          membershipTier: userTier,
          messages: updatedHistory
            .filter((m) => !m.isLoading)
            .map((m) => ({ sender: m.sender, text: m.text })),
          storeContext: {
            viewingProduct: activeViewingProduct
              ? {
                  name: activeViewingProduct.name,
                  material: activeViewingProduct.material,
                  price: activeViewingProduct.price,
                }
              : undefined,
            cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
            member: member ? { name: member.name, points: (member?.points || 0) } : undefined,
          },
        }),
      });

      if (streamRes.status === 403) {
        const errJson = await streamRes.json().catch(() => ({}));
        const forbiddenMsg = errJson?.reply || '【會員權限提示】此高階旗艦模型僅限 PLUS 付費會員使用，請切換至 Flash 推薦模型或至會員中心升級！';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: forbiddenMsg,
                  isLoading: false,
                  modelUsed: '權限攔截 (403)',
                }
              : m
          )
        );
        return;
      }

      if (streamRes.ok && streamRes.body) {
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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          text: accumulatedText,
                          isLoading: false,
                          modelUsed: currentModelObj.name,
                        }
                      : m
                  )
                );
              }
            } catch {}
          }
        }

        if (accumulatedText) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: cleanChatText(accumulatedText),
                    isLoading: false,
                    modelUsed: currentModelObj.name,
                  }
                : m
            )
          );
          return;
        }
      }

      // Fallback to standard /api/ai/chat if streaming was empty
      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          model: selectedModel,
          membershipTier: userTier,
          messages: updatedHistory
            .filter((m) => !m.isLoading)
            .map((m) => ({ sender: m.sender, text: m.text })),
          storeContext: {
            viewingProduct: activeViewingProduct
              ? {
                  name: activeViewingProduct.name,
                  material: activeViewingProduct.material,
                  price: activeViewingProduct.price,
                }
              : undefined,
            cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
            member: member ? { name: member.name, points: (member?.points || 0) } : undefined,
          },
        }),
      });

      if (res.status === 403) {
        const fallback = generateClientExpertReply(text);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: fallback.reply,
                  solution: fallback.solution,
                  isLoading: false,
                  modelUsed: fallback.modelUsed,
                }
              : m
          )
        );
        return;
      }

      const data = await res.json();
      const replyText = cleanChatText(
        data?.reply ||
        '您好！我是神狗勾 3D 耗材智能顧問，請隨時告訴我您的列印問題或耗材需求！'
      );

      // Update ONLY the exact paired AI message with full text, structured solution and model name
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: replyText,
                solution: data?.solution,
                isLoading: false,
                modelUsed: data?.modelUsed || currentModelObj.name,
              }
            : m
        )
      );
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.warn('[AI Support] Streaming endpoint unavailable, invoking direct client Gemini SDK:', err?.message || err);
      
      try {
        const geminiReply = await generateClientGeminiChat(
          text,
          updatedHistory.filter((m) => !m.isLoading).map((m) => ({ sender: m.sender, text: m.text }))
        );

        if (geminiReply && geminiReply.trim()) {
          const cleanText = cleanChatText(geminiReply);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: cleanText,
                    isLoading: false,
                    modelUsed: currentModelObj.name,
                  }
                : m
            )
          );
          return;
        }
      } catch (clientGenAiErr) {
        console.warn('[Client Gemini API Error]', clientGenAiErr);
      }

      const fallback = generateClientExpertReply(text);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: fallback.reply,
                solution: fallback.solution,
                isLoading: false,
                modelUsed: fallback.modelUsed,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Quick symptom diagnosis with structured checklist
  const handleQuickDiagnose = async (category: string) => {
    if (isLoading) return;

    const userTxt = `排查列印異常：${category}`;
    const userMsgId = `usr-diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const aiMsgId = `ai-diag-${Date.now() + 1}-${Math.random().toString(36).substring(2, 7)}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userTxt,
      timestamp: Date.now(),
    };

    const pendingAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isLoading: true,
      timestamp: Date.now() + 1,
    };

    // Strict pairing insertion
    setMessages((prev) => [...prev, userMsg, pendingAiMsg]);
    setIsLoading(true);

    const apiBase = typeof window !== 'undefined' && (window.location.hostname.includes('goddog.space') || !window.location.hostname.includes('run.app')) 
      ? 'https://ais-pre-epkqvggcyqcjwbkc4rilrx-662608706001.asia-northeast1.run.app' 
      : '';

    try {
      const res = await fetch(`${apiBase}/api/ai/support-diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: category,
          filamentType: activeViewingProduct?.material || 'PLA / PETG / TPU',
          description: `創客排查問題：${category}`,
        }),
      });
      const data = await res.json();
      const aiTxt = cleanChatText(
        data.answer ||
        `【異常排查建議】針對「${category}」，請逐項核對下方「切片與列印參數確認清單」，通常只需微調溫度與清潔熱床即可解決！`
      );

      // Update strictly the paired slot
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: aiTxt,
                solution: data,
                isLoading: false,
                modelUsed: data?.modelUsed || '神狗勾 3D 專家模式',
              }
            : m
        )
      );
    } catch (e) {
      console.warn('Quick diagnose error fallback:', e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: `【異常排查建議】建議先以 99% 異丙醇擦拭熱床去除指紋手汗油脂，並適當將熱床溫度提高 5°C、降低第一層列印速度至 30mm/s。`,
                solution: {
                  solutions: [
                    '以 99% 異丙醇或洗碗精徹底清洗熱床表面，消除指紋油脂',
                    '微調 Z-Offset 降低 0.03mm-0.05mm 增強首層擠出壓實感',
                    '切片設定首層列印速度降至 25-30 mm/s，首層完全關閉風扇',
                    '開啟切片裙邊 (Brim) 5mm-8mm 以擴大與熱床的抓附面積',
                  ],
                  recommendedAdjustment: {
                    temperature: '噴嘴 215-225°C / 熱床 60-65°C',
                    speed: '首層 30 mm/s (其餘層 200-300 mm/s)',
                    retraction: '近端 0.8mm @ 35mm/s / 遠端 4.5mm',
                    cooling: '首層 0% (第 3 層後開啟至 100%)',
                  },
                },
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = (overrideText?: string) => {
    const text = (overrideText || chatInput).trim();
    if (!text || isLoading) return;
    if (!overrideText) setChatInput('');
    triggerPromptExecution(text, messages);
  };

  const userTurnCount = messages.filter((m) => m.sender === 'user').length;

  return (
    <div 
      id="customer-support-modal-backdrop"
      className={`fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 transition-all duration-300 cursor-pointer select-none ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
      onClick={onClose}
      title="點擊背景空白處可立即關閉並返回商城主頁"
    >
      <div 
        id="customer-support-modal-window"
        className={`bg-white w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col transition-all duration-500 cursor-default select-text ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'
        } ${
          isExpanded 
            ? 'sm:max-w-5xl h-[94vh]' 
            : 'sm:max-w-[490px] h-[660px] max-h-[88vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed layout for mobile to prevent squashing */}
        <div className="p-2 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 min-h-[60px]">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            {/* Back to Home Button - Hidden text on small mobile */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="關閉並返回商城主頁"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">返回主頁</span>
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <h3 className="font-black text-[11px] sm:text-sm text-white tracking-tight truncate shrink-0">
                  {lang === 'en' ? 'GodDog 3D AI Advisor' : lang === 'ja' ? '神狗勾 3D AIアドバイザー' : '神狗勾 3D 智能顧問'}
                </h3>
                <span className="hidden xs:flex items-center gap-1 text-[8px] sm:text-[9px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{lang === 'en' ? 'Online' : lang === 'ja' ? 'オンライン' : '在線'}</span>
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-indigo-200/80 truncate opacity-80">
                {lang === 'en' ? '3D Printing Filament & Slicing Advice' : lang === 'ja' ? '3Dプリント材料相談＆スライサー設定' : '3D 列印材料諮詢與切片設定'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Model Switcher Button */}
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              title={lang === 'en' ? `Current model: ${currentModelObj.name}` : lang === 'ja' ? `現在モデル: ${currentModelObj.name}` : `目前模型：${currentModelObj.name}（點擊自選回覆模型）`}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-400/40 text-indigo-100 hover:text-white text-[10px] sm:text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span className="hidden sm:inline">{currentModelObj.name.split(' ')[0]}</span>
              <span className="text-[9px] sm:text-[10px] bg-indigo-400/30 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">
                {currentModelObj.badge}
              </span>
              <ChevronDown className="w-3 h-3 text-indigo-300 shrink-0" />
            </button>

            {/* Clear Memory Button */}
            {isResetConfirming ? (
              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/50 px-2 py-1 rounded-xl text-[10px] animate-fade-in">
                <span className="text-rose-200 text-[10px]">{lang === 'en' ? 'Clear?' : lang === 'ja' ? '削除？' : '清空？'}</span>
                <button
                  onClick={handleResetConversation}
                  className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded cursor-pointer text-[10px]"
                >
                  {lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : '是'}
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="px-1 py-0.5 text-slate-300 hover:text-white cursor-pointer text-[10px]"
                >
                  {lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : '否'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetConfirming(true)}
                title={lang === 'en' ? 'Clear conversation history' : lang === 'ja' ? '会話履歴をリセット' : '清空對話記憶並開啟新話題'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop Maximize / Restore Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? '切換為小視窗' : '放大為寬螢幕視窗'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Restore floating button if removed */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('printcore_show_chat_widget'));
              }}
              title="在畫面上開啟/還原 AI 客服可調位置懸浮球"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
            >
              <Bot className="w-3 h-3 text-sky-200" />
              <span>懸浮球</span>
            </button>

            {/* Close Button */}
            <button
              id="close-customer-support-modal-btn"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="關閉客服視窗 (亦可點擊背景空白處)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Model Picker Popover */}
        {showModelPicker && (
          <div 
            className="absolute top-16 right-3 sm:right-6 z-50 w-[calc(100%-24px)] sm:w-[390px] bg-slate-900/98 backdrop-blur-xl border border-indigo-500/40 rounded-2xl shadow-2xl p-3 sm:p-4 text-white animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">自選 AI 顧問回覆模型</h4>
                  <p className="text-[10px] text-slate-400">所有切換自動儲存於瀏覽器，下輪對話立即生效</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModelPicker(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 mt-2.5 max-h-[340px] overflow-y-auto pr-1">
              {SUPPORTED_AI_MODELS.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-inner'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="font-bold text-xs truncate text-white">{model.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                          isSelected ? 'bg-indigo-400 text-slate-950' : 'bg-slate-700 text-indigo-300'
                        }`}>
                          {model.speed}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300/80 mt-1 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Active Product Context Bar (if viewing a product) */}
        {activeViewingProduct && (
          <div className="px-3 sm:px-4 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                目前討論商品
              </span>
              <span className="font-bold truncate text-[11px] sm:text-xs">
                {activeViewingProduct.name} ({activeViewingProduct.material})
              </span>
              <span className="text-indigo-600 font-mono text-[11px] font-bold shrink-0">
                NT$ {activeViewingProduct.price}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewingProduct(null)}
              className="text-[11px] text-indigo-500 hover:text-indigo-800 ml-2 shrink-0 underline cursor-pointer"
            >
              切換一般諮詢
            </button>
          </div>
        )}

        {/* Quick Symptoms buttons */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none shrink-0">
          <span className="text-slate-400 font-semibold shrink-0 text-[11px] ml-0.5">常見排查速診：</span>
          <button
            disabled={isLoading}
            onClick={() => handleQuickDiagnose('首層不黏/嚴重翹邊 (Warping)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors disabled:opacity-50 text-[11px]"
          >
            首層脫落翹邊
          </button>
          <button
            disabled={isLoading}
            onClick={() => handleQuickDiagnose('劇烈拉絲/蜘蛛絲 (Stringing)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors disabled:opacity-50 text-[11px]"
          >
            劇烈拉絲蜘蛛絲
          </button>
          <button
            disabled={isLoading}
            onClick={() => handleQuickDiagnose('噴嘴堵塞/喀喀齒輪打滑 (Clogged Nozzle)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors disabled:opacity-50 text-[11px]"
          >
            噴嘴堵塞打滑
          </button>
          <button
            disabled={isLoading}
            onClick={() => handleQuickDiagnose('層間剝離脆弱 (Layer Delamination)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors disabled:opacity-50 text-[11px]"
          >
            層間開裂脆弱
          </button>
        </div>

        {/* Chat / Solution Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} gap-1.5`}
            >
              <div
                className={`flex gap-2.5 sm:gap-3 text-xs w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[84%] p-3 sm:p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Inline loading indicator inside this specific AI response bubble */}
                  {m.isLoading ? (
                    <div className="flex items-center gap-2.5 text-indigo-600 py-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span className="text-xs font-medium">AI 顧問正在調取上下文並計算切片參數與排查清單...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs sm:text-[13px]">{cleanChatText(m.text)}</div>

                      {/* AI Structured Solution Card attached directly to this specific response */}
                      {m.solution && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3 text-xs">
                          {/* 1. Interactive Confirmation Checklist */}
                          {m.solution.solutions && m.solution.solutions.length > 0 && (
                            <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-[11px] sm:text-xs">
                                  <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>🔧 列印與切片參數確認清單 (點擊逐項勾選確認)：</span>
                                </div>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                  已確認 {m.solution.solutions.filter((_, i) => checkedSteps[`${m.id}-step-${i}`]).length} / {m.solution.solutions.length} 項
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {m.solution.solutions.map((step: string, i: number) => {
                                  const stepKey = `${m.id}-step-${i}`;
                                  const isChecked = !!checkedSteps[stepKey];
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => toggleChecklistStep(stepKey)}
                                      className={`w-full text-left flex items-start gap-2 p-2 rounded-xl transition-all cursor-pointer text-[11px] sm:text-xs leading-relaxed border ${
                                        isChecked
                                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                                          : 'bg-white hover:bg-indigo-50/40 border-slate-200/80 text-slate-700'
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                          isChecked
                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                            : 'border-slate-300 bg-slate-50'
                                        }`}
                                      >
                                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                                      </div>
                                      <span className={isChecked ? 'line-through opacity-80' : ''}>
                                        {step}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 2. Slicing Golden Parameters Grid with 1-Click Copy */}
                          {m.solution.recommendedAdjustment && (
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-[11px] sm:text-xs flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>切片黃金推薦參數：</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyParams(m.id || `${idx}`, m.solution)}
                                  className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 cursor-pointer transition-colors"
                                >
                                  {copiedParamId === (m.id || `${idx}`) ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">已複製參數</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>一鍵複製參數</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-mono text-[11px]">
                                {m.solution.recommendedAdjustment.temperature && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">溫度設定 (噴嘴/熱床)</span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.temperature}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.speed && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">列印速度設定</span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.speed}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.retraction && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">回抽長度與速度</span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.retraction}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.cooling && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">冷卻風扇配置</span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.cooling}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Model Attribution & Timestamp */}
                      {m.sender === 'ai' && !m.isLoading && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Cpu className="w-3 h-3 text-indigo-500" />
                            <span className="text-slate-400">回覆模型：</span>
                            <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              {m.modelUsed || currentModelObj.name}
                            </span>
                          </div>
                          {m.timestamp && (
                            <span className="text-slate-300">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
          <span className="text-slate-400 shrink-0 flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{lang === 'en' ? 'Quick Qs:' : lang === 'ja' ? '質問例：' : '接續提問：'}</span>
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              disabled={isLoading}
              onClick={() => handleSendChat(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 shrink-0 transition-colors cursor-pointer disabled:opacity-50 text-[11px] whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat input box with mobile safe area */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="customer-support-chat-input"
              type="text"
              disabled={isLoading}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isLoading 
                ? (lang === 'en' ? 'AI Advisor is analyzing, please wait...' : lang === 'ja' ? 'AIアドバイザーが回答を生成中...' : 'AI 顧問正在分析回覆中，請稍候...') 
                : (lang === 'en' ? 'Ask about 3D printing filaments, slicer tuning, or orders...' : lang === 'ja' ? '3Dフィラメント、スライサー設定、注文について質問...' : '輸入列印問題、機型切片參數或耗材詢問...')}
              className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                title={lang === 'en' ? 'Stop generating' : lang === 'ja' ? '生成を停止' : '中止當前 AI 串流請求，防止 Token 消耗'}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-xs" />
                <span>{lang === 'en' ? 'Stop' : lang === 'ja' ? '停止' : '停止'}</span>
              </button>
            ) : (
              <button
                id="customer-support-send-btn"
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Send' : lang === 'ja' ? '送信' : '發送'}</span>
              </button>
            )}
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 select-none">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>{lang === 'en' ? 'Click background to close and return' : lang === 'ja' ? '背景をクリックすると閉じて戻ります' : '點擊外圍空白背景即可關閉並返回主頁面'}</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-indigo-600 underline cursor-pointer"
            >
              {lang === 'en' ? 'Close' : lang === 'ja' ? '閉じる' : '返回主頁面'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

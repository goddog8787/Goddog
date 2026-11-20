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
import {
  dispatchGeminiStream,
  generateSmart3DExpertReply,
} from '../../lib/geminiClient';
import { FilamentProduct, CartItem, MemberProfile, SUPPORTED_AI_MODELS, LanguageCode } from '../../types';
import { 
  normalizeCustomerId,
  getStoredCustomerChatSync,
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

function getWelcomeMessage(lang: LanguageCode = 'zh-TW'): ChatMessage {
  if (lang === 'en') {
    return {
      id: 'welcome-init',
      sender: 'ai',
      text: "Hey there! I'm the GodDog 3D Filament & Slicing Specialist.\n\nWhether you need dialed-in nozzle & bed temps for PLA+, PETG-HF, TPU 95A, or Carbon Fiber, Bambu Lab AMS tips, or help fixing stringing and warping—just ask away!",
      timestamp: Date.now(),
    };
  }
  if (lang === 'ja') {
    return {
      id: 'welcome-init',
      sender: 'ai',
      text: 'こんにちは！神狗勾 (GodDog) 3Dフィラメント専属AIアドバイザーです。\n\nPLA+・PETG・TPU・炭素繊維フィラメントの最適な温度設定やスライサー調整、Bambu Lab AMSでの給紙のコツ、糸引き・反り対策など、何でもお気軽にご相談ください！',
      timestamp: Date.now(),
    };
  }
  return {
    id: 'welcome-init',
    sender: 'ai',
    text: '您好！我是神狗勾 3D 智能顧問。\n\n無論是 PLA+、PETG、TPU 還是碳纖維線材的切片推薦溫度、速度、拓竹 AMS 供料設定或列印故障排查，請隨時告訴我！',
    timestamp: Date.now(),
  };
}


// Intelligent built-in 3D printing engineering engine for zero-failure client replies
function restoreChatHistory(messages: ChatMessage[] | null, lang: LanguageCode): ChatMessage[] {
  const restored = (messages ?? []).filter(message => message.text && !message.isLoading);
  return restored.length ? restored : [getWelcomeMessage(lang)];
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

  const activeChatUserId = normalizeCustomerId(member?.id);
  const chatChangedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    restoreChatHistory(getStoredCustomerChatSync(activeChatUserId), lang)
  );

  const [chatInput, setChatInput] = useState('');

  // AI Model Selection state with localStorage persistence
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('printcore_selected_ai_model');
      if (saved === 'gemini-flash-latest') return 'gemini-3.8-flash';
      if (saved && SUPPORTED_AI_MODELS.some((m) => m.id === saved)) {
        return saved;
      }
      return 'gemini-3.1-flash-lite';
    } catch {
      return 'gemini-3.1-flash-lite';
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

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    void loadCustomerChatMessages(activeChatUserId).then(loaded => {
      if (!active || chatChangedRef.current) return;
      const history = restoreChatHistory(loaded, lang);
      const prompt = initialPrompt?.trim();
      if (prompt) void triggerPromptExecution(prompt, history);
      else setMessages(history);
    });
    return () => { active = false; };
  }, [isOpen, activeChatUserId, initialPrompt]);

  useEffect(() => {
    if (chatChangedRef.current && !isLoading) void saveCustomerChatMessages(activeChatUserId, messages);
  }, [messages, activeChatUserId, isLoading]);

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
    const text =
      lang === 'en'
        ? `[GodDog 3D Recommended Slicer Profile]\n• Nozzle / Bed Temp: ${adj.temperature || 'N/A'}\n• Print Speed: ${adj.speed || 'N/A'}\n• Retraction: ${adj.retraction || 'N/A'}\n• Part Cooling Fan: ${adj.cooling || 'N/A'}`
        : lang === 'ja'
        ? `【神狗勾 3D 推奨スライサー設定】\n• ノズル/ベッド温度: ${adj.temperature || '未指定'}\n• 造形速度: ${adj.speed || '未指定'}\n• リトラクション: ${adj.retraction || '未指定'}\n• 冷却ファン: ${adj.cooling || '未指定'}`
        : `【神狗勾 3D 切片推薦參數】\n• 噴嘴/熱床溫度: ${adj.temperature || '未指定'}\n• 列印速度: ${adj.speed || '未指定'}\n• 回抽設定: ${adj.retraction || '未指定'}\n• 冷卻風扇: ${adj.cooling || '未指定'}`;
    navigator.clipboard?.writeText(text);
    setCopiedParamId(id);
    setTimeout(() => setCopiedParamId(null), 2000);
  };

  // Reset conversation memory
  const handleResetConversation = () => {
    const resetText =
      lang === 'en'
        ? "Conversation history cleared! What filament, printer setup, or slicer setting can I help you dial in today?"
        : lang === 'ja'
        ? '会話履歴をリセットしました！今日はどのフィラメントや3Dプリンターの設定についてご相談されますか？'
        : '記憶已重新整理！我已為您開啟全新對話視窗。請問今天想了解哪一款線材或諮詢哪台 3D 印表機的切片與列印設定呢？';
    const freshMessages: ChatMessage[] = [
      {
        id: 'reset-welcome-' + Date.now(),
        sender: 'ai',
        text: resetText,
        timestamp: Date.now(),
      },
    ];
    chatChangedRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setMessages(freshMessages);
    setCheckedSteps({});
    setIsResetConfirming(false);
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
    if (!text || abortControllerRef.current) return;
    chatChangedRef.current = true;
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
    const storeContextPayload = {
      viewingProduct: activeViewingProduct
        ? {
            name: activeViewingProduct.name,
            material: activeViewingProduct.material,
            price: activeViewingProduct.price,
            tempRange: activeViewingProduct.nozzleTemp || activeViewingProduct.printTemp,
            bedTemp: activeViewingProduct.bedTemp,
            diameter: activeViewingProduct.diameter,
            description: activeViewingProduct.description,
          }
        : undefined,
      cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      member: member ? { name: member.name, points: (member?.points || 0) } : undefined,
    };
    const historyPayload = currentMsgs
      .filter(m => m.sender === 'user' || (m.source === 'gemini' && m.modelId === selectedModel))
      .map((m) => ({ sender: m.sender, text: m.text }));

    try {
      // Only use local offline rule engine if user explicitly selected 'local-expert'
      if (selectedModel === 'local-expert') {
        const fallback = generateSmart3DExpertReply(text, storeContextPayload, lang);
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

      let resolvedModelName = '';
      const dispatched = await dispatchGeminiStream({
        message: text,
        model: selectedModel,
        membershipTier: userTier,
        history: historyPayload,
        storeContext: storeContextPayload,
        signal: controller.signal,
        lang,
        onMeta: (meta) => {
          if (meta?.modelUsed) {
            resolvedModelName = meta.modelUsed;
          }
        },
        onChunk: (streamedSoFar) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text: streamedSoFar,
                    isLoading: false,
                    modelUsed: resolvedModelName,
                  }
                : m
            )
          );
        },
      });

      if (dispatched?.forbidden) {
        const forbiddenMsg =
          dispatched.forbiddenMessage ||
          (lang === 'en'
            ? '[Membership Notice] This flagship Pro model is exclusive to PLUS members. Please switch to the recommended Flash model or upgrade in your Member Center!'
            : lang === 'ja'
            ? '【会員ランク制限】この上位ProモデルはPLUS会員限定です。推奨のFlashモデルに切り替えるか、会員センターでアップグレードしてください！'
            : '【會員權限提示】此高階旗艦模型僅限 PLUS 付費會員使用，請切換至 Gemini 4 Hydrogen 或至會員中心升級！');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: forbiddenMsg,
                  isLoading: false,
                  modelUsed: lang === 'en' ? 'Access Restricted (403)' : lang === 'ja' ? 'アクセス制限 (403)' : '權限攔截 (403)',
                }
              : m
          )
        );
        return;
      }

      if (dispatched?.reply && dispatched.reply.trim()) {
        const finalModel = dispatched.modelUsed || resolvedModelName;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text: cleanChatText(dispatched.reply),
                  isLoading: false,
                  modelUsed: finalModel,
                  modelId: dispatched.modelId,
                  source: 'gemini',
                }
              : m
          )
        );
        return;
      }

      throw new Error('MODEL_UNAVAILABLE');
    } catch {
      if (controller.signal.aborted) return;
      const message = lang === 'en'
        ? `${currentModelObj.name} is temporarily unavailable. Try again or select another model.`
        : lang === 'ja'
        ? `${currentModelObj.name} は現在利用できません。再試行するか、別のモデルを選んでください。`
        : `${currentModelObj.name} 目前無法回覆。請稍後重試，或自行選擇其他模型。`;
      setMessages(prev => prev.map(m => m.id === aiMsgId
        ? { ...m, text: message, isLoading: false, modelUsed: lang === 'en' ? 'Connection status' : lang === 'ja' ? '接続状況' : '連線狀態' }
        : m));
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleQuickDiagnose = (category: string) => {
    const question = lang === 'en'
      ? `Troubleshoot print issue: ${category}`
      : lang === 'ja'
      ? `造形トラブル診断：${category}`
      : `排查列印異常：${category}`;
    void triggerPromptExecution(question, messages);
  };

  const handleSendChat = (overrideText?: string) => {
    const text = (overrideText || chatInput).trim();
    if (!text || isLoading) return;
    if (!overrideText) setChatInput('');
    triggerPromptExecution(text, messages);
  };

  const userTurnCount = messages.filter((m) => m.sender === 'user').length;

  const shortModelLabel =
    currentModelObj.id === 'gemini-4-hydrogen'
      ? '4 Hydrogen'
      : currentModelObj.id === 'gemini-3.1-flash-lite'
      ? '3.1 Flash-Lite'
      : currentModelObj.id === 'gemini-3.1-pro-preview'
      ? '3.1 Pro'
      : currentModelObj.id === 'local-expert'
      ? (lang === 'en' ? 'Offline Expert' : lang === 'ja' ? 'オフライン' : '離線專家')
      : 'Gemini Flash';

  return (
    <div 
      id="customer-support-modal-backdrop"
      className={`fixed inset-0 z-50 overflow-hidden bg-slate-950/65 flex items-center justify-center p-2 sm:p-5 transition-all duration-200 cursor-pointer select-none ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
      onClick={onClose}
      title="點擊背景空白處可立即關閉並返回商城主頁"
    >
      <div 
        id="customer-support-modal-window"
        className={`bg-white w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col transition-all duration-300 cursor-default select-text ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        } ${
          isExpanded 
            ? 'sm:max-w-5xl h-[92dvh] sm:h-[90vh]' 
            : 'sm:max-w-[540px] h-[92dvh] sm:h-[680px] sm:max-h-[88vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Clean 2-tier layout on mobile (zero title crushing), sleek single-row on desktop */}
        <div className="bg-slate-900 text-white border-b border-slate-800 shrink-0 px-3.5 py-2.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          {/* Primary Row: Back + Avatar + Full Readable Title + Mobile Close */}
          <div className="flex items-center justify-between gap-2.5 min-w-0 sm:flex-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title={lang === 'en' ? 'Close and return to store' : lang === 'ja' ? '閉じてショップに戻る' : '關閉並返回商城主頁'}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Back' : lang === 'ja' ? '戻る' : '返回'}</span>
              </button>

              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[15px] text-white tracking-tight truncate leading-tight">
                  {lang === 'en' ? 'GodDog 3D AI Specialist' : lang === 'ja' ? '神狗勾 3D AIアドバイザー' : '神狗勾 3D 智能顧問'}
                </h3>
                <p className="text-[11px] text-slate-300/85 truncate leading-tight mt-0.5">
                  {lang === 'en' ? 'Filament Selection · Slicer Tuning' : lang === 'ja' ? 'フィラメント相談 · スライサー設定' : '選材推薦 · 切片調參 · 售後諮詢'}
                </p>
              </div>
            </div>

            {/* Mobile-only top-right Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label={lang === 'en' ? 'Close' : lang === 'ja' ? '閉じる' : '關閉視窗'}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Secondary Toolbar (Row 2 on mobile, Right zone on desktop) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-white/10 sm:border-t-0 sm:pt-0 shrink-0">
            {/* Active AI Model Switcher showing exact model name */}
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              title={lang === 'en' ? `Model: ${currentModelObj.name}` : lang === 'ja' ? `モデル: ${currentModelObj.name}` : `目前模型：${currentModelObj.name}`}
              className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/35 text-indigo-100 hover:text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span>{shortModelLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 shrink-0 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Clear Memory Button */}
              {isResetConfirming ? (
                <div className="h-9 flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/50 px-2.5 rounded-xl text-xs">
                  <span className="text-rose-200 whitespace-nowrap">{lang === 'en' ? 'Clear?' : lang === 'ja' ? '削除？' : '清空？'}</span>
                  <button
                    type="button"
                    onClick={handleResetConversation}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer text-[11px]"
                  >
                    {lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : '確定'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirming(false)}
                    className="px-1.5 py-1 text-slate-300 hover:text-white cursor-pointer text-[11px]"
                  >
                    {lang === 'en' ? 'No' : lang === 'ja' ? '戻す' : '取消'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsResetConfirming(true)}
                  title={lang === 'en' ? 'Clear conversation history' : lang === 'ja' ? '会話履歴をリセット' : '清空對話記憶'}
                  className="h-9 px-2.5 sm:w-9 sm:px-0 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs font-medium whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">{lang === 'en' ? 'Clear' : lang === 'ja' ? 'リセット' : '清空'}</span>
                </button>
              )}

              {/* Restore Floating Widget Button */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('printcore_show_chat_widget'));
                }}
                title={lang === 'en' ? 'Show floating AI button' : lang === 'ja' ? 'フローティングAIボタンを表示' : '開啟/還原畫面懸浮球'}
                className="h-9 flex items-center gap-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span>{lang === 'en' ? 'Widget' : lang === 'ja' ? '浮動球' : '懸浮球'}</span>
              </button>

              {/* Desktop Maximize / Restore Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? (lang === 'en' ? 'Compact window' : lang === 'ja' ? 'コンパクト表示' : '切換為標準視窗') : (lang === 'en' ? 'Expand window' : lang === 'ja' ? 'ワイド表示' : '放大為寬螢幕視窗')}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Desktop Close Button */}
              <button
                id="close-customer-support-modal-btn"
                type="button"
                onClick={onClose}
                className="hidden sm:flex w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-white items-center justify-center cursor-pointer transition-colors shrink-0"
                title={lang === 'en' ? 'Close window' : lang === 'ja' ? 'ウィンドウを閉じる' : '關閉客服視窗'}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Model Picker Popover */}
        {showModelPicker && (
          <div 
            className="absolute top-[108px] sm:top-16 left-3 right-3 sm:left-auto sm:right-5 z-50 sm:w-[390px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3.5 text-white animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">
                    {lang === 'en' ? 'Select AI Engine' : lang === 'ja' ? 'AI応答モデルの選択' : '自選 AI 顧問回覆模型'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en' ? 'Saved automatically for your next message' : lang === 'ja' ? '次の会話から即座に反映されます' : '切換後自動儲存，下一則訊息立即生效'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModelPicker(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 mt-2.5 max-h-[320px] overflow-y-auto pr-1">
              {SUPPORTED_AI_MODELS.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-400 text-white'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs truncate text-white">{model.name}</span>
                        <span className={`text-[11px] font-mono font-semibold shrink-0 tabular-nums ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {model.speed}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Active Product Context Bar */}
        {activeViewingProduct && (
          <div className="px-3.5 sm:px-5 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between gap-2 text-xs text-indigo-950 shrink-0">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="font-semibold text-indigo-700 shrink-0">
                {lang === 'en' ? 'Active:' : lang === 'ja' ? '相談中:' : '諮詢商品：'}
              </span>
              <span className="font-bold truncate">
                {activeViewingProduct.name} ({activeViewingProduct.material})
              </span>
              <span className="text-indigo-600 font-mono font-bold shrink-0 tabular-nums">
                NT${activeViewingProduct.price}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewingProduct(null)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 shrink-0 underline cursor-pointer whitespace-nowrap"
            >
              {lang === 'en' ? 'General' : lang === 'ja' ? '一般相談' : '切換一般'}
            </button>
          </div>
        )}

        {/* Quick Symptoms Bar */}
        <div className="px-3.5 sm:px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none shrink-0">
          <span className="text-slate-500 font-semibold shrink-0 text-[11px] whitespace-nowrap">
            {lang === 'en' ? 'Quick Fix:' : lang === 'ja' ? '排查診斷：' : '排查速診：'}
          </span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDiagnose(lang === 'en' ? 'First-layer warping & poor bed adhesion (Warping)' : lang === 'ja' ? '1層目の剥がれ・反り (Warping)' : '首層不黏/嚴重翹邊 (Warping)')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 shrink-0 font-medium cursor-pointer transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
          >
            {lang === 'en' ? 'Bed Warping' : lang === 'ja' ? '1層目の反り' : '首層翹邊'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDiagnose(lang === 'en' ? 'Heavy stringing & oozing (Stringing)' : lang === 'ja' ? '糸引き・クモの巣現象 (Stringing)' : '劇烈拉絲/蜘蛛絲 (Stringing)')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 shrink-0 font-medium cursor-pointer transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
          >
            {lang === 'en' ? 'Stringing' : lang === 'ja' ? '糸引き対策' : '拉絲蜘蛛絲'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDiagnose(lang === 'en' ? 'Clogged nozzle & extruder clicking (Clogged Nozzle)' : lang === 'ja' ? 'ノズル詰まり・ギア空回り (Clogged Nozzle)' : '噴嘴堵塞/喀喀齒輪打滑 (Clogged Nozzle)')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 shrink-0 font-medium cursor-pointer transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
          >
            {lang === 'en' ? 'Nozzle Clog' : lang === 'ja' ? 'ノズル詰まり' : '噴嘴堵塞'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDiagnose(lang === 'en' ? 'Weak layer bonding & splitting (Layer Delamination)' : lang === 'ja' ? '層間剥離・割れ (Layer Delamination)' : '層間剝離脆弱 (Layer Delamination)')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 shrink-0 font-medium cursor-pointer transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
          >
            {lang === 'en' ? 'Layer Split' : lang === 'ja' ? '層間剥離' : '層間開裂'}
          </button>
        </div>

        {/* Chat / Solution Feed */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-5 sm:py-5 space-y-4 bg-slate-50/70">
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} gap-1`}
            >
              <div
                className={`flex gap-2 sm:gap-2.5 text-xs w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                  }`}
                >
                  {/* Inline loading indicator inside this specific AI response bubble */}
                  {m.isLoading ? (
                    <div className="flex items-center gap-2.5 text-indigo-600 py-0.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span className="text-xs font-medium">
                        {lang === 'en'
                          ? `Connecting to ${shortModelLabel} for real-time answer...`
                          : lang === 'ja'
                          ? `${shortModelLabel} へ接続してリアルタイム解析中...`
                          : `正在連線 ${shortModelLabel} 即時分析回覆...`}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[13px] sm:text-sm leading-relaxed">{cleanChatText(m.text)}</div>

                      {/* AI Structured Solution Card attached directly to this specific response */}
                      {m.solution && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3 text-xs">
                          {/* 1. Interactive Confirmation Checklist */}
                          {m.solution.solutions && m.solution.solutions.length > 0 && (
                            <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-[11px] sm:text-xs">
                                  <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>
                                    {lang === 'en'
                                      ? '🔧 Slicer & Print Verification Checklist:'
                                      : lang === 'ja'
                                      ? '🔧 スライサー＆造形チェックリスト：'
                                      : '🔧 列印與切片參數確認清單 (點擊逐項勾選確認)：'}
                                  </span>
                                </div>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                  {lang === 'en'
                                    ? `${m.solution.solutions.filter((_, i) => checkedSteps[`${m.id}-step-${i}`]).length} / ${m.solution.solutions.length} Checked`
                                    : lang === 'ja'
                                    ? `${m.solution.solutions.filter((_, i) => checkedSteps[`${m.id}-step-${i}`]).length} / ${m.solution.solutions.length} 確認済`
                                    : `已確認 ${m.solution.solutions.filter((_, i) => checkedSteps[`${m.id}-step-${i}`]).length} / ${m.solution.solutions.length} 項`}
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
                                  <span>
                                    {lang === 'en'
                                      ? 'Recommended Slicer Settings:'
                                      : lang === 'ja'
                                      ? '推奨スライサーパラメータ：'
                                      : '切片黃金推薦參數：'}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyParams(m.id || `${idx}`, m.solution)}
                                  className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 cursor-pointer transition-colors"
                                >
                                  {copiedParamId === (m.id || `${idx}`) ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">
                                        {lang === 'en' ? 'Copied!' : lang === 'ja' ? 'コピー完了' : '已複製參數'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>
                                        {lang === 'en' ? 'Copy Settings' : lang === 'ja' ? '設定をコピー' : '一鍵複製參數'}
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-mono text-[11px]">
                                {m.solution.recommendedAdjustment.temperature && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">
                                      {lang === 'en' ? 'Temperature (Nozzle / Bed)' : lang === 'ja' ? '温度設定 (ノズル/ベッド)' : '溫度設定 (噴嘴/熱床)'}
                                    </span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.temperature}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.speed && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">
                                      {lang === 'en' ? 'Print Speed' : lang === 'ja' ? '造形速度' : '列印速度設定'}
                                    </span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.speed}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.retraction && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">
                                      {lang === 'en' ? 'Retraction' : lang === 'ja' ? 'リトラクション' : '回抽長度與速度'}
                                    </span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.retraction}</span>
                                  </div>
                                )}
                                {m.solution.recommendedAdjustment.cooling && (
                                  <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                    <span className="text-slate-400 font-sans block text-[10px]">
                                      {lang === 'en' ? 'Part Cooling Fan' : lang === 'ja' ? '冷却ファン' : '冷卻風扇配置'}
                                    </span>
                                    <span className="font-bold text-slate-900">{m.solution.recommendedAdjustment.cooling}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Model Attribution & Timestamp (unboxed clean metadata) */}
                      {m.sender === 'ai' && !m.isLoading && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Cpu className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="text-slate-600 font-medium truncate">
                              {m.modelUsed || '神狗勾 3D 智能顧問'}
                            </span>
                          </div>
                          {m.timestamp && (
                            <span className="text-slate-400 tabular-nums shrink-0">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestions */}
        <div className="px-3.5 sm:px-5 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none shrink-0">
          <span className="text-slate-500 font-medium shrink-0 text-[11px] whitespace-nowrap">
            {lang === 'en' ? 'Suggested:' : lang === 'ja' ? '質問例：' : '常見提問：'}
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              type="button"
              key={i}
              disabled={isLoading}
              onClick={() => handleSendChat(prompt)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 shrink-0 transition-colors cursor-pointer disabled:opacity-50 text-xs font-medium whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Box with Mobile Safe Area */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
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
                ? (lang === 'en' ? 'Generating reply...' : lang === 'ja' ? '回答を生成中...' : 'AI 顧問正在即時生成回覆...') 
                : (lang === 'en' ? 'Ask about filaments, slicer settings, or orders...' : lang === 'ja' ? 'フィラメント・設定・注文について質問...' : '輸入列印問題、機型切片參數或耗材詢問...')}
              className="flex-1 h-11 px-3.5 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                className="h-11 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title={lang === 'en' ? 'Stop generating' : lang === 'ja' ? '生成を停止' : '停止生成'}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-xs" />
                <span>{lang === 'en' ? 'Stop' : lang === 'ja' ? '停止' : '停止'}</span>
              </button>
            ) : (
              <button
                id="customer-support-send-btn"
                type="submit"
                disabled={!chatInput.trim()}
                className="h-11 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Send' : lang === 'ja' ? '送信' : '發送'}</span>
              </button>
            )}
          </form>

          <div className="hidden sm:flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 select-none">
            <span>{lang === 'en' ? 'Press ESC or click outside to close' : lang === 'ja' ? 'ESCまたは背景クリックで閉じます' : '點擊視窗外空白處或按 ESC 即可返回主頁面'}</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-indigo-600 underline cursor-pointer"
            >
              {lang === 'en' ? 'Close' : lang === 'ja' ? '閉じる' : '返回主頁面'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

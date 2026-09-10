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
  CheckCircle
} from 'lucide-react';
import { FilamentProduct, CartItem, MemberProfile, SUPPORTED_AI_MODELS, AIModelOption } from '../../types';
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
}

const STORAGE_KEY = 'goddog_ai_chat_history_v2';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-init',
  sender: 'ai',
  text: '您好！我是神狗勾 3D 專屬 AI 技術顧問。\n\n🧠 【多輪上下文記憶】已全面啟動：我會完整記住我們剛才討論過的線材、印表機機型或切片需求。後續問題您可以直接以「這個要設幾度？」或「它需要封箱嗎？」發問，切片與列印參數確認清單將即時生成並精準對應！',
  timestamp: Date.now(),
};

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  viewingProduct,
  cartItems = [],
  member,
  initialPrompt,
}) => {
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
          return sanitizeChatOrder(parsed);
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

  // Sanitize any historically corrupted chat order so AI answers never appear behind subsequent questions
  function sanitizeChatOrder(msgs: ChatMessage[]): ChatMessage[] {
    if (!Array.isArray(msgs) || msgs.length === 0) return [DEFAULT_WELCOME_MESSAGE];
    
    // Ensure every message has a unique ID
    return msgs.map((m, idx) => ({
      ...m,
      id: m.id || `${m.sender}-${idx}-${m.timestamp || Date.now()}`,
    }));
  }

  // Load customer chat on open or member change
  const initialLoadedRef = useRef(false);
  useEffect(() => {
    if (isOpen && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      loadCustomerChatMessages(member?.id).then((loaded) => {
        let baseMessages = [DEFAULT_WELCOME_MESSAGE];
        if (loaded && loaded.length > 0) {
          baseMessages = sanitizeChatOrder(loaded);
        }
        setMessages(baseMessages);

        // If there is an initial prompt from another modal (e.g. AI Advisor)
        if (initialPrompt && initialPrompt.trim()) {
          triggerPromptExecution(initialPrompt.trim(), baseMessages);
        }
      });
    } else if (!isOpen) {
      initialLoadedRef.current = false;
    }
  }, [isOpen, member?.id]);

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
        `這款【${activeViewingProduct.name}】相容拓竹 AMS 嗎？`,
        `【${activeViewingProduct.name}】推薦噴嘴與熱床溫度？`,
        `列印【${activeViewingProduct.name}】需要密閉機箱嗎？`,
        '全館消費滿多少免運？多久出庫？',
        '目前有什麼新會員優惠或折扣代碼？',
      ]
    : [
        '全館滿多少免運？多久出貨？',
        'Bambu AMS 拓竹能用你們的線材嗎？',
        'PETG 與 PLA 差別在哪裡？',
        'TPU 95A 軟膠列印該注意什麼？',
        'PLA-CF 碳纖維需要更換硬化鋼噴嘴嗎？',
        '首層不黏翹邊怎麼排查？',
      ];

  // Core Prompt Dispatcher: Guarantees strict Question -> Answer pairing
  const triggerPromptExecution = async (text: string, currentMsgs: ChatMessage[]) => {
    if (!text || isLoading) return;

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

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          model: selectedModel,
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
            member: member ? { name: member.name, points: member.points } : undefined,
          },
        }),
      });
      const data = await res.json();
      const replyText =
        data?.reply ||
        `針對「${text}」，神狗勾 3D 耗材均具備國際 ISO 認證且公差在 ±0.02mm 之內。全館滿 NT$999 免運，工作日 24H 快速出貨！`;

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
    } catch (err) {
      console.warn('Chat error fallback:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: `針對您提到的「${text}」，建議檢查噴嘴溫度與回抽設定。若有任何材料相容性或出貨問題，隨時問我！全館滿 NT$999 享免運費！`,
                isLoading: false,
                modelUsed: currentModelObj.name,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
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

    try {
      const res = await fetch('/api/ai/support-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: category,
          filamentType: activeViewingProduct?.material || 'PLA / PETG / TPU',
          description: `創客排查問題：${category}`,
        }),
      });
      const data = await res.json();
      const aiTxt =
        data.answer ||
        `【異常排查建議】針對「${category}」，請逐項核對下方「切片與列印參數確認清單」，通常只需微調溫度與清潔熱床即可解決！`;

      // Update strictly the paired slot
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: aiTxt,
                solution: data,
                isLoading: false,
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

  if (!isOpen) return null;

  return (
    <div 
      id="customer-support-modal-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可立即關閉並返回商城主頁"
    >
      <div 
        id="customer-support-modal-window"
        className={`bg-white w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col transition-all duration-300 cursor-default select-text ${
          isExpanded 
            ? 'sm:max-w-5xl h-[92vh]' 
            : 'sm:max-w-[490px] h-[640px] max-h-[86vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            {/* Back to Home Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer mr-0.5"
              title="關閉並返回商城主頁"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">返回主頁</span>
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-xs sm:text-sm text-white tracking-tight">
                  神狗勾 3D 智能顧問
                </h3>
                <span className="flex items-center gap-1 text-[9px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>在線</span>
                </span>
                {member ? (
                  <span className="hidden sm:flex text-[9px] bg-sky-500/20 text-sky-200 border border-sky-400/30 px-1.5 py-0.5 rounded-full items-center gap-1 font-medium">
                    <Cloud className="w-2.5 h-2.5 text-sky-400" />
                    <span>雲端同步</span>
                  </span>
                ) : null}
              </div>
              <p className="text-[10px] text-indigo-200/80 line-clamp-1">
                多輪對話記憶 • 智慧推薦切片參數與排查
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Model Switcher Button */}
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              title={`目前模型：${currentModelObj.name}（點擊自選回覆模型）`}
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
                <span className="text-rose-200 text-[10px]">清空？</span>
                <button
                  onClick={handleResetConversation}
                  className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded cursor-pointer text-[10px]"
                >
                  是
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="px-1 py-0.5 text-slate-300 hover:text-white cursor-pointer text-[10px]"
                >
                  否
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetConfirming(true)}
                title="清空對話記憶並開啟新話題"
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
          {/* Memory tip banner for user peace of mind */}
          <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-700">
            <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              多輪上下文已連線：您提問時可直接說「這個要設幾度？」、「相容AMS嗎？」，AI 顧問將精準對應，清單嚴格附屬於對應問題下方。
            </span>
          </div>

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
                      <div className="text-xs sm:text-[13px]">{m.text}</div>

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
            <span>接續提問：</span>
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
              placeholder={isLoading ? 'AI 顧問正在分析回覆中，請稍候...' : '輸入列印問題、機型切片參數或耗材詢問...'}
              className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <button
              id="customer-support-send-btn"
              type="submit"
              disabled={!chatInput.trim() || isLoading}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">發送</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 select-none">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>點擊外圍空白背景即可關閉並返回主頁面</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-indigo-600 underline cursor-pointer"
            >
              返回主頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

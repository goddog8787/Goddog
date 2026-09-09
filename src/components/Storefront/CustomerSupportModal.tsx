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
  Tag,
  ShoppingBag,
  Layers,
  ChevronRight,
  Info,
  Cloud
} from 'lucide-react';
import { FilamentProduct, CartItem, MemberProfile } from '../../types';
import { 
  saveCustomerChatMessages, 
  loadCustomerChatMessages 
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

const DEFAULT_WELCOME_MESSAGE = {
  sender: 'ai' as const,
  text: '您好！我是神狗勾 3D 專屬 AI 技術顧問。\n\n🧠 【多輪上下文記憶】已全面啟動：我會完整記住我們剛才討論過的線材、印表機機型或切片需求，後續問題您可以直接以「這個要設幾度？」或「它需要封箱嗎？」發問，我絕不會失憶！隨時告訴我您的列印疑問！',
};

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  viewingProduct,
  cartItems = [],
  member,
  initialPrompt,
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<any | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [activeViewingProduct, setActiveViewingProduct] = useState<FilamentProduct | null>(viewingProduct || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from persistent storage or default
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; timestamp?: number }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [chatInput, setChatInput] = useState('');

  // Load customer chat on open or member change
  useEffect(() => {
    if (isOpen) {
      loadCustomerChatMessages(member?.id).then((loaded) => {
        if (loaded && loaded.length > 0) {
          setMessages(loaded);
        }
      });
    }
  }, [isOpen, member?.id]);

  // Persist messages whenever they change
  useEffect(() => {
    if (messages && messages.length > 0) {
      saveCustomerChatMessages(member?.id, messages);
    }
  }, [messages, member?.id]);

  // Handle initialPrompt if provided
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendChat(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

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

  // Reset conversation memory
  const handleResetConversation = () => {
    const freshMessages = [
      {
        sender: 'ai' as const,
        text: '記憶已重新整理！我已為您開啟全新對話視窗。請問今天想了解哪一款線材或諮詢哪台 3D 印表機的設定呢？',
      },
    ];
    setMessages(freshMessages);
    setSolution(null);
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

  const handleQuickDiagnose = async (category: string) => {
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
      setSolution(data);
      const userTxt = `排查異常：${category}`;
      const aiTxt = data.answer || `【異常排查建議】首要排查步驟：${data.solutions?.[0] || '以 99% 異丙醇擦拭 PEI 熱床，並確認首層 Z-Offset 均勻壓實'}`;
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: userTxt },
        { sender: 'ai', text: aiTxt },
      ]);
    } catch (e) {
      console.warn('Quick diagnose error fallback:', e);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: `排查異常：${category}` },
        {
          sender: 'ai',
          text: `【異常排查建議】建議先以 99% 異丙醇擦拭熱床去除指紋手汗油脂，並適當將熱床溫度提高 5°C、降低第一層列印速度至 35mm/s。`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async (overrideText?: string) => {
    const text = (overrideText || chatInput).trim();
    if (!text || isLoading) return;
    if (!overrideText) setChatInput('');

    const newMessages = [...messages, { sender: 'user' as const, text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: newMessages,
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
      if (data && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `針對「${text}」，神狗勾 3D 耗材均具備國際 ISO 認證且公差在 ±0.02mm 之內。全館滿 NT$999 免運，工作日 24H 快速出貨！`,
          },
        ]);
      }
    } catch (err) {
      console.warn('Chat error fallback:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `針對您提到的「${text}」，建議檢查噴嘴溫度與回抽設定。若有任何材料相容性或出貨問題，隨時問我！全館滿 NT$999 享免運費！`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const userTurnCount = messages.filter((m) => m.sender === 'user').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white tracking-tight">神狗勾 3D 創客智能顧問</h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>上下文記憶啟用</span>
                </span>
                {member ? (
                  <span className="text-[10px] bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <Cloud className="w-2.5 h-2.5 text-sky-400" />
                    <span>會員對話已保留</span>
                  </span>
                ) : null}
                {userTurnCount > 0 && (
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-md font-mono">
                    已記憶 {userTurnCount} 輪提問
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                完整上下文多輪對話，代名詞自動關聯，不失憶、不斷線
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Memory Button */}
            {isResetConfirming ? (
              <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 px-2 py-1 rounded-xl text-[11px] animate-fade-in">
                <span className="text-rose-200">確定清空記憶？</span>
                <button
                  onClick={handleResetConversation}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  確認
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="px-1.5 py-0.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetConfirming(true)}
                title="清空對話記憶並開啟新話題"
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">重新開局</span>
              </button>
            )}

            {/* Close Button */}
            <button
              id="close-customer-support-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Active Product Context Bar (if viewing a product) */}
        {activeViewingProduct && (
          <div className="px-4 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                目前討論商品
              </span>
              <span className="font-semibold truncate">
                {activeViewingProduct.name} ({activeViewingProduct.material})
              </span>
              <span className="text-indigo-600 font-mono text-[11px] shrink-0">
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
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-400 font-semibold shrink-0 ml-1">常見異常排查：</span>
          <button
            onClick={() => handleQuickDiagnose('首層不黏/嚴重翹邊 (Warping)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors"
          >
            首層脫落翹邊
          </button>
          <button
            onClick={() => handleQuickDiagnose('劇烈拉絲/蜘蛛絲 (Stringing)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors"
          >
            劇烈拉絲蜘蛛絲
          </button>
          <button
            onClick={() => handleQuickDiagnose('噴嘴堵塞/喀喀齒輪打滑 (Clogged Nozzle)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors"
          >
            噴嘴堵塞打滑
          </button>
          <button
            onClick={() => handleQuickDiagnose('層間剝離脆弱 (Layer Delamination)')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 shrink-0 font-medium cursor-pointer shadow-2xs hover:text-indigo-600 transition-colors"
          >
            層間開裂脆弱
          </button>
        </div>

        {/* Chat / Solution Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Memory tip banner for user peace of mind */}
          <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-700">
            <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              已載入多輪上下文記憶引擎：您提問時可直接使用「這個」、「那款」、「需要封箱嗎」，AI 顧問將自動結合上下文持續分析。
            </span>
          </div>

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[84%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white text-indigo-600 rounded-2xl rounded-tl-none border border-slate-200 shadow-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI 顧問正在調取上下文記憶並分析回覆中...</span>
              </div>
            </div>
          )}

          {/* AI Structured Solution Card if available */}
          {solution && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-indigo-800 font-bold">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>詳細排查檢查清單：</span>
              </div>
              <div className="space-y-1.5">
                {solution.solutions?.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              {solution.recommendedAdjustment && (
                <div className="bg-white p-3 rounded-xl border border-indigo-100 mt-2 shadow-2xs">
                  <span className="font-bold text-slate-900 block mb-1">切片推薦參數：</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                    <div>溫度：{solution.recommendedAdjustment.temperature}</div>
                    <div>速度：{solution.recommendedAdjustment.speed}</div>
                    <div>回抽：{solution.recommendedAdjustment.retraction}</div>
                    <div>風扇：{solution.recommendedAdjustment.cooling}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>接續提問：</span>
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendChat(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="輸入問題（例如：那這個需要封箱嗎？噴嘴溫度設多少？我購物車滿額免運了嗎？）..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              id="customer-support-send-btn"
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

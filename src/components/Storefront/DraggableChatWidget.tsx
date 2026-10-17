import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, X, Sparkles, Trash2 } from 'lucide-react';
import { LanguageCode } from '../../types';

interface DraggableChatWidgetProps {
  onOpenSupport: () => void;
  onOpenAdvisor: () => void;
  lang?: LanguageCode;
}

export const DraggableChatWidget: React.FC<DraggableChatWidgetProps> = ({
  onOpenSupport,
  onOpenAdvisor,
  lang: propLang,
}) => {
  const lang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';

  // Persistence for button position and visibility
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('printcore_chat_widget_pos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default: bottom-right corner, comfortably above bottom nav bar
    const defaultX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 130) : 300;
    const defaultY = typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 150) : 550;
    return { x: defaultX, y: defaultY };
  });

  const [isRemoved, setIsRemoved] = useState<boolean>(() => {
    try {
      return localStorage.getItem('printcore_chat_widget_removed') === 'true';
    } catch {
      return false;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isOverRecycleZone, setIsOverRecycleZone] = useState(false);

  const dragRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Listen for global restore event (e.g., from Navbar or Settings)
  useEffect(() => {
    const handleRestore = () => {
      setIsRemoved(false);
      try {
        localStorage.removeItem('printcore_chat_widget_removed');
      } catch {
        // ignore
      }
    };

    window.addEventListener('printcore_show_chat_widget', handleRestore);
    return () => window.removeEventListener('printcore_show_chat_widget', handleRestore);
  }, []);

  // Keep inside screen boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 120;
        const maxY = window.innerHeight - 80;
        const newX = Math.max(16, Math.min(prev.x, maxX));
        const newY = Math.max(70, Math.min(prev.y, maxY));
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save position
  useEffect(() => {
    try {
      localStorage.setItem('printcore_chat_widget_pos', JSON.stringify(position));
    } catch {
      // ignore
    }
  }, [position]);

  // Remove handler
  const handleRemove = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setIsRemoved(true);
    setShowMenu(false);
    try {
      localStorage.setItem('printcore_chat_widget_removed', 'true');
    } catch {
      // ignore
    }
  };

  // Drag handlers
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setHasMoved(true);
      }

      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      const nextX = Math.max(12, Math.min(dragStartRef.current.startX + dx, maxX));
      const nextY = Math.max(60, Math.min(dragStartRef.current.startY + dy, maxY));

      setPosition({ x: nextX, y: nextY });

      // Check if inside bottom recycle area
      if (nextY > window.innerHeight - 110 && nextX > window.innerWidth / 2 - 130 && nextX < window.innerWidth / 2 + 130) {
        setIsOverRecycleZone(true);
      } else {
        setIsOverRecycleZone(false);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (isOverRecycleZone) {
          handleRemove();
        }
        setIsOverRecycleZone(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setHasMoved(true);
      }

      const maxX = window.innerWidth - 110;
      const maxY = window.innerHeight - 70;
      const nextX = Math.max(8, Math.min(dragStartRef.current.startX + dx, maxX));
      const nextY = Math.max(60, Math.min(dragStartRef.current.startY + dy, maxY));

      setPosition({ x: nextX, y: nextY });

      if (nextY > window.innerHeight - 110 && nextX > window.innerWidth / 2 - 130 && nextX < window.innerWidth / 2 + 130) {
        setIsOverRecycleZone(true);
      } else {
        setIsOverRecycleZone(false);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        if (isOverRecycleZone) {
          handleRemove();
        }
        setIsOverRecycleZone(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isOverRecycleZone]);

  if (isRemoved) return null;

  return (
    <>
      {/* Visual Bottom Recycle Drop-Zone when dragging */}
      {isDragging && (
        <div
          className={`fixed bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 pointer-events-none flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl shadow-2xl border-2 ${
            isOverRecycleZone
              ? 'bg-rose-600 border-rose-300 text-white scale-110'
              : 'bg-slate-900/90 border-dashed border-rose-400/60 text-slate-200 backdrop-blur-md'
          }`}
        >
          <Trash2 className={`w-5 h-5 ${isOverRecycleZone ? 'animate-bounce text-white' : 'text-rose-400'}`} />
          <span className="text-xs font-bold">
            {isOverRecycleZone 
              ? (lang === 'en' ? 'Release to hide this button' : lang === 'ja' ? '離すとボタンを非表示' : '鬆開即可永久移除此按鈕')
              : (lang === 'en' ? 'Drag here to remove button' : lang === 'ja' ? 'ここにドラッグして非表示' : '拖曳至此處可移除按鈕')}
          </span>
        </div>
      )}

      {/* Draggable AI Floating Customer Support Button */}
      <div
        ref={dragRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        className={`fixed z-40 select-none touch-none transition-shadow ${
          isDragging ? 'cursor-grabbing opacity-90 scale-105' : 'cursor-grab'
        }`}
      >
        <div className="relative group">
          {/* Main Floating Pill Button */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              handleStart(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onClick={() => {
              if (!hasMoved) {
                onOpenSupport();
              }
            }}
            className="flex items-center gap-2 pl-3 pr-2 py-2.5 rounded-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 hover:from-indigo-600 hover:to-sky-500 text-white shadow-xl shadow-indigo-700/35 border border-white/40 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            title={lang === 'en' ? 'Click to open AI Support, drag to move' : lang === 'ja' ? 'クリックでAIサポート開始、ドラッグで位置調整' : '點擊開啟 AI 客服對話，按住可任意拖曳調整位置'}
          >
            {/* Bot Icon with Pulse */}
            <div className="relative flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-pulse" />
            </div>

            {/* Label */}
            <span className="text-xs font-black tracking-tight whitespace-nowrap">
              {lang === 'en' ? 'AI Support' : lang === 'ja' ? 'AIサポート' : 'AI 客服'}
            </span>

            {/* Direct Remove 'X' Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(e);
              }}
              className="w-5 h-5 rounded-full bg-black/25 hover:bg-rose-600 text-white/80 hover:text-white flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
              title={lang === 'en' ? 'Hide AI Support button' : lang === 'ja' ? 'AIボタンを非表示' : '移除此 AI 客服懸浮按鈕'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Optional Quick Secondary Advisor button on hover */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-slate-900/90 text-white px-2 py-0.5 rounded-full text-[10px] border border-slate-700 shadow-md whitespace-nowrap animate-fade-in pointer-events-none">
            <span>{lang === 'en' ? 'Drag anywhere to reposition' : lang === 'ja' ? 'ドラッグで移動可能' : '可任意拖曳移動位置'}</span>
          </div>
        </div>
      </div>
    </>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { getSafeProductImageUrl } from '../../utils/productImage';

export const FLY_TO_CART_EVENT = 'printcore:fly-to-cart';
export const FLY_TO_CART_LANDED_EVENT = 'printcore:fly-to-cart-landed';

export interface FlyToCartTriggerOptions {
  sourceEl?: HTMLElement | null;
  imageUrl?: string;
  material?: string;
  productName?: string;
  accentColor?: string;
}

interface FlyToCartFlight {
  id: string;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  rotateMid: number;
  rotateEnd: number;
  imageUrl: string;
  accentColor?: string;
}

/**
 * Triggers a subtle Framer Motion fly-to-cart particle from sourceEl (or click origin)
 * smoothly arcing into the header's cart button (#btn-open-cart).
 */
export function triggerFlyToCart({
  sourceEl,
  imageUrl,
  material,
  productName,
  accentColor,
}: FlyToCartTriggerOptions): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    window.dispatchEvent(new CustomEvent(FLY_TO_CART_LANDED_EVENT));
    return;
  }

  const cartButton = document.getElementById('btn-open-cart');
  if (!cartButton) return;

  const cartRect = cartButton.getBoundingClientRect();
  // Skip if cart button is off-screen or hidden (0x0)
  if (cartRect.width === 0 && cartRect.height === 0) return;

  // Aim at the cart icon inside the button rather than wide button edge
  const cartIcon = cartButton.querySelector('svg');
  const targetRect = cartIcon ? cartIcon.getBoundingClientRect() : cartRect;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  let startX = window.innerWidth * 0.5;
  let startY = window.innerHeight * 0.6;

  if (sourceEl && typeof sourceEl.getBoundingClientRect === 'function') {
    const srcRect = sourceEl.getBoundingClientRect();
    if (srcRect.width > 0 || srcRect.height > 0) {
      startX = srcRect.left + srcRect.width / 2;
      startY = srcRect.top + srcRect.height / 2;
    }
  }

  // Gentle upward arc control point
  const dx = endX - startX;
  const dy = endY - startY;
  const arcLift = Math.min(64, Math.max(22, Math.hypot(dx, dy) * 0.14));
  const midX = startX + dx * 0.48;
  const midY = Math.min(startY, endY) - arcLift;
  const direction = dx >= 0 ? 1 : -1;

  const resolvedImageUrl = getSafeProductImageUrl(imageUrl, material, productName);

  const detail: FlyToCartFlight = {
    id: `fly-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startX,
    startY,
    midX,
    midY,
    endX,
    endY,
    rotateMid: direction * 6,
    rotateEnd: direction * 12,
    imageUrl: resolvedImageUrl,
    accentColor,
  };

  window.dispatchEvent(new CustomEvent<FlyToCartFlight>(FLY_TO_CART_EVENT, { detail }));
}

export const FlyToCartOverlay: React.FC = () => {
  const [flights, setFlights] = useState<FlyToCartFlight[]>([]);

  const removeFlight = useCallback((id: string, emitLanded: boolean) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
    if (emitLanded && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FLY_TO_CART_LANDED_EVENT));
    }
  }, []);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<FlyToCartFlight>;
      if (!customEvent.detail) return;
      const flight = customEvent.detail;
      setFlights((prev) => [...prev.slice(-4), flight]);

      // Safety cleanup in case animation callback doesn't fire (e.g. tab backgrounded)
      window.setTimeout(() => {
        removeFlight(flight.id, false);
      }, 950);
    };

    window.addEventListener(FLY_TO_CART_EVENT, handleTrigger);
    return () => window.removeEventListener(FLY_TO_CART_EVENT, handleTrigger);
  }, [removeFlight]);

  if (typeof document === 'undefined') return null;

  const ITEM_SIZE = 38;
  const HALF = ITEM_SIZE / 2;

  return createPortal(
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[120] overflow-hidden"
    >
      <AnimatePresence>
        {flights.map((flight) => (
          <motion.div
            key={flight.id}
            initial={{
              x: flight.startX - HALF,
              y: flight.startY - HALF,
              scale: 0.85,
              opacity: 0.96,
              rotate: 0,
            }}
            animate={{
              x: [
                flight.startX - HALF,
                flight.midX - HALF,
                flight.endX - HALF,
              ],
              y: [
                flight.startY - HALF,
                flight.midY - HALF,
                flight.endY - HALF,
              ],
              scale: [0.88, 1.06, 0.34],
              opacity: [0.95, 0.98, 0.2],
              rotate: [0, flight.rotateMid, flight.rotateEnd],
            }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{
              duration: 0.56,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.45, 1],
            }}
            onAnimationComplete={() => removeFlight(flight.id, true)}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            className="fixed top-0 left-0 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-500/85 shadow-lg shadow-indigo-500/25 flex items-center justify-center overflow-visible will-change-transform"
          >
            {flight.imageUrl ? (
              <img
                src={flight.imageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
            )}
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs border border-white dark:border-slate-900"
              style={flight.accentColor ? { backgroundColor: flight.accentColor } : undefined}
            >
              <ShoppingCart className="w-2.5 h-2.5" />
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

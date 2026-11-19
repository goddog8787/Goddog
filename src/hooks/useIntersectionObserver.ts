import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  /** Whether observation is active; when false (e.g., priority above-the-fold cards), renders immediately. */
  enabled?: boolean;
  /** IntersectionObserver root element (defaults to browser viewport). */
  root?: Element | Document | null;
  /** Margin around the root bounding box (defaults to '120px 0px' for smooth pre-viewport loading). */
  rootMargin?: string;
  /** Visibility ratio threshold(s) to trigger intersection. */
  threshold?: number | number[];
  /**
   * Brief settle window (ms) before enabling heavy image rendering while rapidly scrolling on mobile.
   * Prevents decoding skipped offscreen cards during fast fling scrolls.
   */
  scrollSettleMs?: number;
  /** Keep mounted once first seen instead of releasing offscreen DOM/bitmap memory. */
  freezeOnceVisible?: boolean;
}

export interface UseIntersectionObserverResult<T extends Element> {
  ref: React.RefObject<T | null>;
  isIntersecting: boolean;
  shouldRender: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Custom IntersectionObserver hook tailored for mobile scroll performance.
 * Ensures only elements within (or right near) the visible viewport mount and decode images,
 * debounces rapid fling scrolls, and unmounts far-offscreen bitmaps to conserve mobile RAM/GPU.
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>({
  enabled = true,
  root = null,
  rootMargin = '120px 0px',
  threshold = 0.01,
  scrollSettleMs = 70,
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverResult<T> {
  const ref = useRef<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(() => !enabled);
  const [shouldRender, setShouldRender] = useState<boolean>(() => !enabled);

  useEffect(() => {
    if (!enabled) {
      setIsIntersecting(true);
      setShouldRender(true);
      return;
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      setShouldRender(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let settleTimer: number | null = null;
    let isCancelled = false;

    const clearSettleTimer = () => {
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (isCancelled) return;
        const latest = entries[entries.length - 1];
        if (!latest) return;

        setEntry(latest);
        const visible = latest.isIntersecting || latest.intersectionRatio > 0;
        setIsIntersecting(visible);

        if (visible) {
          if (scrollSettleMs <= 0) {
            setShouldRender(true);
          } else {
            clearSettleTimer();
            settleTimer = window.setTimeout(() => {
              if (!isCancelled) {
                setShouldRender(true);
              }
            }, scrollSettleMs);
          }
          if (freezeOnceVisible) {
            observer.unobserve(node);
          }
        } else if (!freezeOnceVisible) {
          clearSettleTimer();
          setShouldRender(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      isCancelled = true;
      clearSettleTimer();
      observer.disconnect();
    };
  }, [enabled, root, rootMargin, threshold, scrollSettleMs, freezeOnceVisible]);

  return { ref, isIntersecting, shouldRender, entry };
}

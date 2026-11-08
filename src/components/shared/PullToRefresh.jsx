import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

/**
 * Wraps scrollable content and lets users pull down at the top of the page
 * to refresh. Calls `onRefresh` (which should refetch the page's queries)
 * when the pull exceeds the threshold. Uses native touch listeners with
 * passive:false so we can preventDefault the overscroll while pulling.
 */
export default function PullToRefresh({ onRefresh, children, threshold = 70 }) {
  const containerRef = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDist = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e) => {
      if (window.scrollY > 0 || refreshingRef.current) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };
    const onMove = (e) => {
      if (!pulling.current || refreshingRef.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        const dist = Math.min(delta * 0.5, threshold * 1.6);
        pullDist.current = dist;
        setPull(dist);
        if (e.cancelable) e.preventDefault();
      } else if (delta <= 0 && pullDist.current > 0) {
        pullDist.current = 0;
        setPull(0);
      }
    };
    const onEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDist.current >= threshold) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(threshold);
        try {
          await onRefreshRef.current?.();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
          pullDist.current = 0;
        }
      } else {
        setPull(0);
        pullDist.current = 0;
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [threshold]);

  const progress = Math.min(pull / threshold, 1);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-primary pointer-events-none"
        style={{ top: 0, height: 40, transform: `translate(-50%, ${pull - 40}px)` }}
      >
        {refreshing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <RefreshCw
            className="w-5 h-5 transition-opacity"
            style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
          />
        )}
      </div>
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pulling.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
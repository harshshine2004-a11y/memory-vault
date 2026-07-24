import { useRef } from 'react';

interface TouchGestureHandlers {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const lastTapRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  const handleTouchStart = () => {
    // Start Long Press Timer (500ms)
    timerRef.current = setTimeout(() => {
      if (handlers.onLongPress) {
        handlers.onLongPress();
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const now = Date.now();
    const DOUBLE_TAP_THRESHOLD = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
      // Double Tap Detected
      if (handlers.onDoubleTap) {
        handlers.onDoubleTap();
      }
      lastTapRef.current = 0;
    } else {
      // Single Tap Detected
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now && handlers.onSingleTap) {
          handlers.onSingleTap();
        }
      }, DOUBLE_TAP_THRESHOLD);
    }
  };

  const handleTouchMove = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove
  };
}

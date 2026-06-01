import { useState, useEffect, useRef, useCallback } from 'react';

export const useSceneManager = () => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [sceneRefs, setSceneRefs] = useState<Array<HTMLDivElement | null>>([
    null, null, null, null, null, null
  ]);
  const wheelDeltaRef = useRef(0);
  const tickingRef = useRef(false);
  const lastSceneTimeRef = useRef(Date.now());

  // Palace scene specific - frame scrubbing
  const [palaceFrame, setPalaceFrame] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    const handleWheel = (e: WheelEvent) => {
      // Prevent default scrolling
      e.preventDefault();

      // Accumulate delta
      wheelDeltaRef.current += e.deltaY;

      // Request animation frame for smooth handling
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          const now = Date.now();
          // Throttle to prevent too frequent scene changes
          if (now - lastSceneTimeRef.current > 1200) { // 1.2s crossfade duration
            if (wheelDeltaRef.current > 50) {
              // Scroll down - next scene
              if (sceneIndex < 5) { // Max 5 scenes (0-5)
                setSceneIndex(prev => prev + 1);
                lastSceneTimeRef.current = now;
              }
            } else if (wheelDeltaRef.current < -50) {
              // Scroll up - previous scene
              if (sceneIndex > 0) {
                setSceneIndex(prev => prev - 1);
                lastSceneTimeRef.current = now;
              }
            }
            wheelDeltaRef.current = 0;
          }
          tickingRef.current = false;
        });
      }
    };

    // Handle touch events for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      const now = Date.now();
      if (now - lastSceneTimeRef.current > 1200 && Math.abs(diff) > 50) {
        if (diff > 0 && sceneIndex < 5) {
          // Swipe up - next scene
          setSceneIndex(prev => prev + 1);
          lastSceneTimeRef.current = now;
        } else if (diff < 0 && sceneIndex > 0) {
          // Swipe down - previous scene
          setSceneIndex(prev => prev - 1);
          lastSceneTimeRef.current = now;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sceneIndex, isMounted]);

  // Palace frame calculation based on scroll progress within scene 0
  useEffect(() => {
    if (sceneIndex === 0 && isMounted) {
      // For Palace scene, we'll simulate frame scrubbing based on a virtual scroll
      // This would typically be tied to actual scroll position within the scene
      // For simplicity, we'll animate frames automatically when in Palace scene
      const frameInterval = setInterval(() => {
        setPalaceFrame(prev => (prev + 1) % 145); // 0-144 frames
      }, 16.67); // ~60fps

      return () => clearInterval(frameInterval);
    } else {
      // Reset frame when leaving palace scene
      setPalaceFrame(0);
    }
  }, [sceneIndex, isMounted]);

  // Determine if body scroll should be enabled (only for Space scene and beyond)
  const shouldEnableBodyScroll = sceneIndex >= 4; // Space scene index is 4

  // Set body overflow based on scroll state
  useEffect(() => {
    if (shouldEnableBodyScroll) {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [shouldEnableBodyScroll]);

  return {
    sceneIndex,
    isMounted,
    sceneRefs,
    setSceneRefs,
    palaceFrame,
    shouldEnableBodyScroll
  };
};
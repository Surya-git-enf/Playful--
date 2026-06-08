import { useState, useEffect, useRef } from 'react';

const TOTAL_SCENES = 6;
const TOTAL_PALACE_FRAMES = 144;
const SCENE_COOLDOWN_MS = 1000;
const PALACE_DELTA_PER_FRAME = 12;

export const useSceneManager = () => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [palaceFrame, setPalaceFrame] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const sceneRef = useRef(0);
  const palaceFrameRef = useRef(0);
  const lastSceneTime = useRef(Date.now());
  const accDelta = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const down = e.deltaY > 0;
      const now = Date.now();

      // ── Scene 0: scrub palace frames first ──────────────────────
      if (sceneRef.current === 0) {
        accDelta.current += e.deltaY;

        if (down) {
          while (accDelta.current >= PALACE_DELTA_PER_FRAME) {
            accDelta.current -= PALACE_DELTA_PER_FRAME;
            if (palaceFrameRef.current < TOTAL_PALACE_FRAMES) {
              palaceFrameRef.current++;
              setPalaceFrame(palaceFrameRef.current);
            } else {
              // Frames exhausted → advance scene
              if (now - lastSceneTime.current > SCENE_COOLDOWN_MS) {
                sceneRef.current = 1;
                setSceneIndex(1);
                lastSceneTime.current = now;
                accDelta.current = 0;
              }
              return;
            }
          }
        } else {
          while (accDelta.current <= -PALACE_DELTA_PER_FRAME) {
            accDelta.current += PALACE_DELTA_PER_FRAME;
            if (palaceFrameRef.current > 0) {
              palaceFrameRef.current--;
              setPalaceFrame(palaceFrameRef.current);
            }
            // At frame 0 scrolling up — no previous scene
          }
        }
        return;
      }

      // ── All other scenes: snap on cooldown ──────────────────────
      if (now - lastSceneTime.current < SCENE_COOLDOWN_MS) return;

      if (down && sceneRef.current < TOTAL_SCENES - 1) {
        sceneRef.current++;
        setSceneIndex(sceneRef.current);
        lastSceneTime.current = now;
      } else if (!down && sceneRef.current > 0) {
        sceneRef.current--;
        // Reset palace frames when going back to scene 0
        if (sceneRef.current === 0) {
          palaceFrameRef.current = TOTAL_PALACE_FRAMES;
          setPalaceFrame(TOTAL_PALACE_FRAMES);
        }
        setSceneIndex(sceneRef.current);
        lastSceneTime.current = now;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;
      const now = Date.now();
      if (now - lastSceneTime.current < SCENE_COOLDOWN_MS) return;
      const down = diff > 0;

      if (sceneRef.current === 0) {
        // On mobile just advance scene directly (no frame scrub on swipe)
        if (down) {
          sceneRef.current = 1;
          setSceneIndex(1);
          lastSceneTime.current = now;
        }
        return;
      }

      if (down && sceneRef.current < TOTAL_SCENES - 1) {
        sceneRef.current++;
        setSceneIndex(sceneRef.current);
        lastSceneTime.current = now;
      } else if (!down && sceneRef.current > 0) {
        sceneRef.current--;
        if (sceneRef.current === 0) {
          palaceFrameRef.current = TOTAL_PALACE_FRAMES;
          setPalaceFrame(TOTAL_PALACE_FRAMES);
        }
        setSceneIndex(sceneRef.current);
        lastSceneTime.current = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const shouldEnableBodyScroll = sceneIndex >= 5;

  useEffect(() => {
    document.body.style.overflow = shouldEnableBodyScroll ? 'auto' : 'hidden';
    document.body.style.height = shouldEnableBodyScroll ? 'auto' : '100vh';
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [shouldEnableBodyScroll]);

  return {
    sceneIndex,
    palaceFrame,
    isMounted,
    shouldEnableBodyScroll,
  };
};

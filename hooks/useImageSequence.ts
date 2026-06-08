import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 144;

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(4, "0");
  return `/palace/palace-frame_${num}.webp`;
}

export function useImageSequence() {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const total = TOTAL_FRAMES;
    const images: HTMLImageElement[] = new Array(total);

    const onLoad = () => {
      if (cancelled) return;
      loadedCount++;
      if (loadedCount === total) {
        imagesRef.current = images;
        setLoaded(true);
      } else {
        setProgress(loadedCount / total);
      }
    };

    for (let i = 0; i < total; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = onLoad;
      img.onerror = onLoad; // Don't block on missing frames
      images[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { images: imagesRef, loaded, loadProgress: progress, totalFrames: TOTAL_FRAMES };
}
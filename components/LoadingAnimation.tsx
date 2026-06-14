'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface LoadingAnimationProps {
  progress?: number;
}

interface IconData {
  id: string;
  paths: string[];
}

const ICONS: IconData[] = [
  {
    id: 'watch',
    paths: [
      "M35 30 a6 6 0 0 1 6 -6 h18 a6 6 0 0 1 6 6 v40 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 z",
      "M65 42 h3 a2 2 0 0 1 2 2 v12 a2 2 0 0 1 -2 2 h-3",
      "M42 24 v-8 a2 2 0 0 1 2 -2 h12 a2 2 0 0 1 2 2 v8",
      "M42 76 v8 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-8",
    ],
  },
  {
    id: 'monitor',
    paths: [
      "M12 32 a4 4 0 0 1 4 -4 h68 a4 4 0 0 1 4 4 v32 a4 4 0 0 1 -4 4 h-68 a4 4 0 0 1 -4 -4 z",
      "M42 56 h16",
      "M45 64 v12",
      "M55 64 v12",
      "M32 76 h36 a3 3 0 0 1 3 3 v1 a3 3 0 0 1 -3 3 h-36 a3 3 0 0 1 -3 -3 v-1 a3 3 0 0 1 3 -3 z",
    ],
  },
  {
    id: 'phone',
    paths: [
      "M32 20 a6 6 0 0 1 6 -6 h24 a6 6 0 0 1 6 6 v60 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 z",
      "M45 22 h10",
      "M42 76 h16",
    ],
  },
];

export default function LoadingAnimation({ progress }: LoadingAnimationProps): React.ReactElement {
  const controls = useAnimation();
  const [idx, setIdx] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    controls.set({ y: -120, scaleX: 1, scaleY: 1 });

    const animateSequence = async () => {
      while (isMounted) {
        await controls.start({
          y: 0,
          scaleX: 0.9,
          scaleY: 1.1,
          transition: { duration: 0.35, ease: 'easeIn' },
        });

        if (!isMounted) break;

        await controls.start({
          y: 0,
          scaleX: 1.4,
          scaleY: 0.6,
          transition: { duration: 0.12, ease: 'easeOut' },
        });

        if (!isMounted) break;

        setIdx((prev) => (prev + 1) % ICONS.length);

        await controls.start({
          y: -120,
          scaleX: 1,
          scaleY: 1,
          transition: { type: 'spring', stiffness: 250, damping: 20 },
        });

        if (!isMounted) break;

        await new Promise<void>((resolve) => setTimeout(resolve, 450));
      }
    };

    animateSequence();

    return () => {
      isMounted = false;
    };
  }, [controls]);

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-72 h-72 flex flex-col items-center justify-end pb-12">
        <div className="absolute bottom-11 w-24 h-[2px] bg-white/10 blur-[1px] rounded-full" />

        <motion.div
          animate={controls}
          style={{ transformOrigin: '50% 85%' }}
          className="relative z-10"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 overflow-visible"
            style={{
              filter:
                'drop-shadow(0 0 12px rgba(255,255,255,0.4)) drop-shadow(0 0 24px rgba(255,255,255,0.15))',
            }}
          >
            <AnimatePresence>
              <motion.g key={idx}>
                {ICONS[idx].paths.map((path, i) => (
                  <motion.path
                    key={`${idx}-${i}`}
                    d={path}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                ))}
              </motion.g>
            </AnimatePresence>
          </svg>
        </motion.div>
      </div>

      {/* Progress bar — only shown when progress prop is provided */}
      {progress !== undefined && (
        <div className="absolute bottom-10 w-48 flex flex-col items-center gap-2">
          <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span
            className="text-white/30 tabular-nums"
            style={{ fontSize: 10, letterSpacing: '0.2em', fontFamily: 'monospace' }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

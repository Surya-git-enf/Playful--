
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Define the structure of our icon data
interface IconData {
  id: string;
  paths: string[];
}

// Carefully mapped paths for the sequence: Watch -> Monitor -> Smartphone
// All designed to perfectly fit a 100x100 viewBox and share a centered base.
const ICONS: IconData[] = [
  {
    id: 'watch',
    paths: [
      // Main body
      "M35 30 a6 6 0 0 1 6 -6 h18 a6 6 0 0 1 6 6 v40 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 z",
      // Dial
      "M65 42 h3 a2 2 0 0 1 2 2 v12 a2 2 0 0 1 -2 2 h-3",
      // Top band
      "M42 24 v-8 a2 2 0 0 1 2 -2 h12 a2 2 0 0 1 2 2 v8",
      // Bottom band
      "M42 76 v8 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-8"
    ]
  },
  {
    id: 'monitor',
    paths: [
      // Screen outline
      "M12 32 a4 4 0 0 1 4 -4 h68 a4 4 0 0 1 4 4 v32 a4 4 0 0 1 -4 4 h-68 a4 4 0 0 1 -4 -4 z",
      // Bottom bezel detail line
      "M42 56 h16",
      // Stand neck left
      "M45 64 v12",
      // Stand neck right
      "M55 64 v12",
      // Stand base
      "M32 76 h36 a3 3 0 0 1 3 3 v1 a3 3 0 0 1 -3 3 h-36 a3 3 0 0 1 -3 -3 v-1 a3 3 0 0 1 3 -3 z"
    ]
  },
  {
    id: 'phone',
    paths: [
      // Phone Body
      "M32 20 a6 6 0 0 1 6 -6 h24 a6 6 0 0 1 6 6 v60 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 z",
      // Top speaker
      "M45 22 h10",
      // Bottom button/line
      "M42 76 h16",
    ]
  }
];

export default function App(): JSX.Element {
  const controls = useAnimation();
  const [idx, setIdx] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    // Set initial position (hanging at the top)
    controls.set({ y: -120, scaleX: 1, scaleY: 1 });

    const animateSequence = async () => {
      while (isMounted) {
        // 1. Fall down to ground
        await controls.start({
          y: 0,
          scaleX: 0.9, // Stretch slightly while falling
          scaleY: 1.1,
          transition: { duration: 0.35, ease: "easeIn" }
        });

        if (!isMounted) break;

        // 2. Hit the ground and Squash
        await controls.start({
          y: 0,
          scaleX: 1.4, // Widen out
          scaleY: 0.6, // Flatten down
          transition: { duration: 0.12, ease: "easeOut" }
        });

        if (!isMounted) break;

        // 3. Trigger path transformation during squash
        // This will cause AnimatePresence to exit the old lines and enter the new ones
        setIdx((prev) => (prev + 1) % ICONS.length);

        // 4. Spring back up (transform happens simultaneously while rising)
        await controls.start({
          y: -120,
          scaleX: 1,
          scaleY: 1,
          transition: { type: "spring", stiffness: 250, damping: 20 }
        });

        if (!isMounted) break;

        // 5. Hang at the peak briefly so the user can see the new shape
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
    };

    animateSequence();

    return () => {
      isMounted = false; // Clean up safely on unmount
    };
  }, [controls]);

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center overflow-hidden">
      
      {/* Stage Container */}
      <div className="relative w-72 h-72 flex flex-col items-center justify-end pb-12">
        
        {/* Subtle Ground Indicator */}
        <div className="absolute bottom-11 w-24 h-[2px] bg-white/10 blur-[1px] rounded-full" />

        {/* Animated Wrapper */}
        <motion.div
          animate={controls}
          // The origin is set near 85% to match the base of the SVG drawings
          // This ensures it squashes downwards onto the ground realistically
          style={{ transformOrigin: "50% 85%" }}
          className="relative z-10"
        >
          {/* ONLY ONE SVG container rendering animated paths inside */}
          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 overflow-visible"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4)) drop-shadow(0 0 24px rgba(255,255,255,0.15))'
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
                    // Undraw -> Draw effect perfectly syncs with the jump duration
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                ))}
              </motion.g>
            </AnimatePresence>
          </svg>
        </motion.div>
        
      </div>
    </div>
  );
}

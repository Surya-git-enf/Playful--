'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';

// Define simplified SVG icons as strings (white outlines, viewBox="0 0 100 100")
const ICONS = [
  // Chess piece (pawn-like)
  `<path d="M50 10 L45 20 L40 20 L30 35 L30 50 L20 50 L20 60 L30 60 L30 70 L20 70 L20 80 L80 80 L80 70 L70 70 L70 60 L80 60 L80 50 L70 50 L70 35 L60 35 L60 20 L55 20 L50 10 Z" stroke="white" strokeWidth="4" fill="none"/>`,

  // Racing car (simplified)
  `<g>
    <path d="M20 80 L20 60 L10 60 L10 40 L30 40 L30 20 L70 20 L70 40 L90 40 L90 60 L80 60 L80 80 L20 80 Z" stroke="white" strokeWidth="4" fill="none"/>
    <circle cx="30" cy="80" r="5" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="70" cy="80" r="5" stroke="white" strokeWidth="2" fill="none"/>
  </g>`,

  // Football (ellipse with stitches)
  `<g>
    <ellipse cx="50" cy="50" rx="20" ry="30" stroke="white" strokeWidth="4" fill="none"/>
    <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2"/>
    <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="2"/>
  </g>`,

  // Rocket (simplified)
  `<g>
    <path d="M50 10 L45 20 L40 20 L40 60 L30 60 L30 80 L50 90 L70 80 L70 60 L60 60 L60 20 L55 20 L50 10 Z" stroke="white" strokeWidth="4" fill="none"/>
    <path d="M50 90 L48 95 L52 95 Z" stroke="white" strokeWidth="3" fill="none"/>
  </g>`,

  // Game controller (simplified)
  `<g>
    <rect x="30" y="30" width="40" height="40" rx="5" ry="5" stroke="white" strokeWidth="4" fill="none"/>
    <rect x="20" y="50" width="10" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/>
    <rect x="70" y="50" width="10" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="40" cy="50" r="3" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="60" cy="50" r="3" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="40" cy="40" r="2" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="60" cy="60" r="2" stroke="white" strokeWidth="1.5" fill="none"/>
  </g>`
];

// Animation variants for the main icon container explicitly typed as Variants
const iconVariants: Variants = {
  initial: { y: -150, opacity: 0, scale: 0 },
  fall: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  settled: {
    y: 0,
    opacity: 1,
    scale: 1
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

interface Props {
  // Optional: shows a "Loading X%" label under the icon, driven by the
  // real asset-preload progress from page.tsx.
  progress?: number
}

export default function LoadingAnimation({ progress }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(0); // 0: falling, 1: settled, 2: crossfade (fading out current, fading in next)
  const [showRing, setShowRing] = useState(false);

  const iconRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const nextIconRef = useRef<HTMLDivElement>(null);

  // Handle animation steps with timeouts
  useEffect(() => {
    if (step === 0) {
      // Start falling animation
      // We'll let the motion component handle it via animate prop
      // When fall completes (settled), go to step 1
      const timer = setTimeout(() => {
        setStep(1); // Settled after bounce
      }, 600); // Approximate time for fall+bounce (reduced for mobile)
      return () => clearTimeout(timer);
    }

    if (step === 1) {
      // Settled - show impact ring
      setShowRing(true);
      // After ring animation, start crossfade
      const timer = setTimeout(() => {
        setStep(2); // Crossfade
      }, 200); // Further reduced for mobile
      return () => clearTimeout(timer);
    }

    if (step === 2) {
      // Crossfade complete - reset for next icon
      const timer = setTimeout(() => {
        // Set current icon to next icon, and reset step to 0 (falling)
        setCurrentIndex(prev => (prev + 1) % ICONS.length);
        setStep(0);
        setShowRing(false); // Clean up the ring for the next cycle
      }, 150); // Reduced crossfade duration for mobile
      return () => clearTimeout(timer);
    }
  }, [step]);

  const nextIndex = (currentIndex + 1) % ICONS.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#02030a',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
    }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        {/* Impact Ring */}
        {showRing && (
          <motion.div
            ref={ringRef}
            style={{
              position: 'absolute',
              bottom: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '80px',
              pointerEvents: 'none'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 0.4, 0], transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)'
            }}/>
          </motion.div>
        )}

        {/* Current Icon */}
        <motion.div
          ref={iconRef}
          style={{
            position: 'absolute',
            inset: 0,
          }}
          initial="initial"
          animate={step === 0 ? 'fall' : step === 1 ? 'settled' : 'exit'}
          variants={iconVariants}
        >
          <div
            dangerouslySetInnerHTML={{ __html: ICONS[currentIndex] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </motion.div>

        {/* Next Icon (only during crossfade) */}
        {step === 2 && (
          <motion.div
            ref={nextIconRef}
            style={{
              position: 'absolute',
              inset: 0,
            }}
            initial={{ y: 0, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1, transition: { duration: 0.2 } }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: ICONS[nextIndex] }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </motion.div>
        )}
      </div>

      {typeof progress === 'number' && (
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}>
          Loading {progress}%
        </span>
      )}
    </div>
  );
}

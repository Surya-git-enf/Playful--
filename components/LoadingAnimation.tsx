'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, Variants } from 'framer-motion'

const ICONS = [
  `<path d="M50 10 L45 20 L40 20 L30 35 L30 50 L20 50 L20 60 L30 60 L30 70 L20 70 L20 80 L80 80 L80 70 L70 70 L70 60 L80 60 L80 50 L70 50 L70 35 L60 35 L60 20 L55 20 L50 10 Z" stroke="white" strokeWidth="4" fill="none"/>`,
  `<g><path d="M20 80 L20 60 L10 60 L10 40 L30 40 L30 20 L70 20 L70 40 L90 40 L90 60 L80 60 L80 80 L20 80 Z" stroke="white" strokeWidth="4" fill="none"/><circle cx="30" cy="80" r="5" stroke="white" strokeWidth="2" fill="none"/><circle cx="70" cy="80" r="5" stroke="white" strokeWidth="2" fill="none"/></g>`,
  `<g><ellipse cx="50" cy="50" rx="20" ry="30" stroke="white" strokeWidth="4" fill="none"/><line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2"/><line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="2"/></g>`,
  `<g><path d="M50 10 L45 20 L40 20 L40 60 L30 60 L30 80 L50 90 L70 80 L70 60 L60 60 L60 20 L55 20 L50 10 Z" stroke="white" strokeWidth="4" fill="none"/><path d="M50 90 L48 95 L52 95 Z" stroke="white" strokeWidth="3" fill="none"/></g>`,
  `<g><rect x="30" y="30" width="40" height="40" rx="5" ry="5" stroke="white" strokeWidth="4" fill="none"/><rect x="20" y="50" width="10" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/><rect x="70" y="50" width="10" height="10" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/><circle cx="40" cy="50" r="3" stroke="white" strokeWidth="2" fill="none"/><circle cx="60" cy="50" r="3" stroke="white" strokeWidth="2" fill="none"/><circle cx="40" cy="40" r="2" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="60" cy="60" r="2" stroke="white" strokeWidth="1.5" fill="none"/></g>`,
]

const iconVariants: Variants = {
  initial: { y: -150, opacity: 0, scale: 0 },
  fall: {
    y: 0, opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  settled: { y: 0, opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
}

interface Props {
  progress?: number
}

export default function LoadingAnimation({ progress }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [step, setStep] = useState(0) // 0: falling, 1: settled, 2: crossfade
  const [showRing, setShowRing] = useState(false)

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 800)
      return () => clearTimeout(t)
    }
    if (step === 1) {
      setShowRing(true)
      const t = setTimeout(() => setStep(2), 400)
      return () => clearTimeout(t)
    }
    if (step === 2) {
      const t = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % ICONS.length)
        setStep(0)
        setShowRing(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [step])

  const nextIndex = (currentIndex + 1) % ICONS.length

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: '#02030a', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: '32px',
    }}>

      {/* Icon container */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>

        {/* Impact ring */}
        {showRing && (
          <motion.div
            style={{
              position: 'absolute', bottom: '-20%', left: '50%',
              transform: 'translateX(-50%)',
              width: 80, height: 80, pointerEvents: 'none',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)',
            }} />
          </motion.div>
        )}

        {/* Current icon */}
        <motion.div
          style={{ position: 'absolute', inset: 0 }}
          initial="initial"
          animate={step === 0 ? 'fall' : step === 1 ? 'settled' : 'exit'}
          variants={iconVariants}
        >
          <svg
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: ICONS[currentIndex] }}
          />
        </motion.div>

        {/* Next icon — crossfade only */}
        {step === 2 && (
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%' }}
              dangerouslySetInnerHTML={{ __html: ICONS[nextIndex] }}
            />
          </motion.div>
        )}
      </div>

      {/* Progress label */}
      {typeof progress === 'number' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 'min(60vw, 240px)', height: 2, borderRadius: 99,
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(120,180,255,0.9), #ffffff)',
              borderRadius: 99,
              transition: 'width 0.2s ease-out',
            }} />
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem', letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          }}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  )
}

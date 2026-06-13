// ChainHeadline.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChainHeadlineProps {
  text: string
  previousText?: string
  isAnimating: boolean
  animationDirection: 'forward' | 'reverse'
  sceneIndex: number

  // Per-scene typography overrides
  fontFamily?: string
  fontSize?: string
  fontWeight?: number | string
  color?: string
  letterSpacing?: string
  textShadow?: string
  textTransform?: React.CSSProperties['textTransform']

  // Cell sizing (controls flip geometry)
  letterWidth?: string
  letterHeight?: string

  // Animation variant
  variant?: 'chain' | 'fade-up'
}

const STAGGER_MS = 40 // delay between letters

export default function ChainHeadline({
  text,
  previousText = '',
  isAnimating,
  animationDirection,
  sceneIndex,
  fontFamily = "var(--font-bebas, 'Bebas Neue', sans-serif)",
  fontSize = 'clamp(1.4rem, 4vw, 3.5rem)',
  fontWeight = 700,
  color = '#FFFFFF',
  letterSpacing = '0.02em',
  textShadow = '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25)',
  textTransform = 'uppercase',
  letterWidth = '0.78em',
  letterHeight = '1.2em',
  variant = 'chain',
}: ChainHeadlineProps) {
  const doFlip = isAnimating && previousText !== text

  const maxLen = Math.max(text.length, previousText.length, 1)
  const pad = (s: string) => s.padEnd(maxLen, ' ')

  const currChars = pad(text).split('')
  const prevChars = pad(previousText).split('')

  const flipTo = animationDirection === 'forward' ? -90 : 90
  const backRotation = animationDirection === 'forward' ? 90 : -90

  // Responsive one-line calculation
  const fitFontSize = `min(${fontSize}, calc(80vw / ${maxLen}))`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        fontFamily,
        fontSize: fitFontSize,
        fontWeight,
        color,
        letterSpacing,
        textShadow,
        textTransform,
        lineHeight: 1,
        maxWidth: '90vw',
        overflow: 'visible',
      }}
    >
      {currChars.map((char, index) => {
        const prevChar = prevChars[index] ?? ' '
        const showAnimation = doFlip && prevChar !== char

        if (variant === 'fade-up') {
          return (
            <div
              key={`wrap-${sceneIndex}-${index}`}
              style={{
                position: 'relative',
                width: letterWidth,
                height: letterHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <motion.div
                key={`fade-${sceneIndex}-${text}-${index}`}
                initial={{ opacity: 0.2, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.05,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                style={{
                  willChange: 'transform, opacity',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.div>
            </div>
          )
        }

        // Default 'chain' variant
        return (
          <div
            key={`wrap-${sceneIndex}-${index}`}
            style={{
              position: 'relative',
              width: letterWidth,
              height: letterHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1000px',
              flexShrink: 0,
            }}
          >
            {showAnimation ? (
              <motion.div
                key={`flip-${sceneIndex}-${text}-${index}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: flipTo }}
                transition={{
                  duration: 0.6,
                  delay: (index * STAGGER_MS) / 1000,
                  ease: [0.65, 0.05, 0.36, 1],
                }}
              >
                {/* Front face — outgoing character */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0.28em)',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {prevChar === ' ' ? '\u00A0' : prevChar}
                </div>

                {/* Back face — incoming character */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    transform: `rotateX(${backRotation}deg) translateZ(0.28em)`,
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </div>
              </motion.div>
            ) : (
              <span key={`static-${sceneIndex}-${text}-${index}`} style={{ display: 'block' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

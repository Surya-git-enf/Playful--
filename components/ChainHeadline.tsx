'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChainHeadlineProps {
  text: string
  previousText?: string
  isAnimating: boolean
  animationDirection: 'forward' | 'reverse'

  // Per-scene typography overrides
  fontFamily?: string
  fontSize?: string
  fontWeight?: number | string
  color?: string
  letterSpacing?: string
  textShadow?: string
  textTransform?: React.CSSProperties['textTransform']

  // Cell sizing (controls flip geometry — keep consistent across scenes
  // unless you intentionally want a different "card" size)
  letterWidth?: string
  letterHeight?: string
}

const STAGGER_MS = 40 // delay between letters

export default function ChainHeadline({
  text,
  previousText = '',
  isAnimating,
  animationDirection,
  fontFamily = "var(--font-bebas, 'Bebas Neue', sans-serif)",
  fontSize = 'clamp(1.4rem, 4vw, 3.5rem)',
  fontWeight = 700,
  color = '#FFD400',
  letterSpacing = '0.02em',
  textShadow = '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.25)',
  textTransform = 'uppercase',
  letterWidth = '0.78em',
  letterHeight = '1.2em',
}: ChainHeadlineProps) {
  const doFlip = isAnimating && previousText !== '' && previousText !== text

  const maxLen = Math.max(text.length, previousText.length)
  const pad = (s: string) => s.padEnd(maxLen, ' ')

  const currChars = pad(text).split('')
  const prevChars = pad(previousText).split('')

  // Forward: rotor rotates to -90deg, back face sits at +90deg so it lands at 0.
  // Reverse: rotor rotates to +90deg, back face sits at -90deg so it lands at 0.
  const flipTo = animationDirection === 'forward' ? -90 : 90
  const backRotation = animationDirection === 'forward' ? 90 : -90

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        fontFamily,
        fontSize,
        fontWeight,
        color,
        letterSpacing,
        textShadow,
        textTransform,
        lineHeight: 1,
      }}
    >
      {currChars.map((char, index) => {
        const prevChar = prevChars[index] ?? ' '
        const showFlip = doFlip && prevChar !== char

        return (
          <div
            key={index}
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
            {showFlip ? (
              <motion.div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
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
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </div>
              </motion.div>
            ) : (
              // Static — no flip needed
              <span style={{ display: 'block' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

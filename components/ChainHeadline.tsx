'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'

interface ChainHeadlineProps {
  text: string
  previousText?: string
  isAnimating: boolean
  animationDirection: 'forward' | 'reverse'
}

export default function ChainHeadline({
  text,
  previousText,
  isAnimating,
  animationDirection
}: ChainHeadlineProps) {
  // Define variants for the chain flip animation
  const getVariant = (isDifferent: boolean, index: number): Variants => {
    if (!isDifferent || !previousText) {
      return {
        initial: { rotateX: 0 },
        animate: { rotateX: 0 },
      } as Variants
    }

    const delay = index * 40 // 40ms stagger between characters

    if (animationDirection === 'forward') {
      // Forward scroll: old text rotates downward (up and away), new text comes from below (up and over)
      return {
        initial: { rotateX: 0 },
        animate: {
          rotateX: [0, -90, 0],
          transition: {
            delay,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.5, 1]
          }
        },
      } as Variants
    } else {
      // Reverse scroll: old text rotates upward (down and over), new text comes from above (down and under)
      return {
        initial: { rotateX: 0 },
        animate: {
          rotateX: [0, 90, 0],
          transition: {
            delay,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.5, 1]
          }
        },
      } as Variants
    }
  }

  // Split text into characters
  const chars = text.split('')
  const prevChars = previousText ? previousText.split('') : []

  return (
    <motion.div
      className="chain-headline"
      style={{
        position: 'relative',
        display: 'inline-flex',
        gap: '0.05em',
        fontFamily: 'var(--font-bebas, "Bebas Neue", sans-serif)',
        fontSize: 'clamp(4rem, 12vw, 8rem)',
        fontWeight: 800,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        color: '#FFD400',
        textAlign: 'center',
        lineHeight: 1,
        textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(255,212,0,0.3)',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
      }}
    >
      {chars.map((char, index) => {
        const prevChar = prevChars[index] || ''
        const isDifferent = prevChar !== char

        return (
          <motion.div
            key={index}
            variants={getVariant(isDifferent, index)}
            initial={isAnimating && isDifferent ? 'initial' : undefined}
            animate={isAnimating && isDifferent ? 'animate' : undefined}
            style={{
              display: 'inline-block',
              width: '1ch',
              height: '1em',
              textAlign: 'center',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              // 3D transform properties for chain effect
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              // Hide overflow during rotation
              overflow: 'hidden',
              // Ensure proper layering
              position: 'relative',
            }}
          >
            {/* Front face - visible character */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0.5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
              }}
            >
              {isDifferent && animationDirection === 'forward'
                ? prevChar
                : char
              }
            </div>

            {/* Back face - for rotation */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg) translateZ(0.5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
              }}
            >
              {isDifferent && animationDirection === 'forward'
                ? char
                : prevChar
              }
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

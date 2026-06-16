'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 80
const BOUNCE_DURATION = 1.2
const TRANSFORM_DURATION = 0.8

// SVG Shapes - Simple outline paths
const SVG_SHAPES = [
  {
    name: 'chess',
    paths: ['M50,20 L50,10 M30,20 L70,20 M35,20 L35,40 M65,20 L65,40 M40,40 L60,40 M40,45 L60,45 M30,45 L70,45 M30,50 L70,50 Q70,70 50,70 Q30,70 30,50'],
    viewBox: '0 0 100 100',
  },
  {
    name: 'car',
    paths: ['M20,50 L80,50 L85,35 L75,30 L25,30 L15,35 Z M30,50 L30,65 Q30,75 40,75 L40,65 M70,50 L70,65 Q70,75 60,75 L60,65 M35,65 Q35,75 40,75 M65,65 Q65,75 60,75 M40,52 L60,52'],
    viewBox: '0 0 100 100',
  },
  {
    name: 'ball',
    paths: ['M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 M50,10 L50,90 M20,50 L80,50 M35,30 L65,70 M65,30 L35,70 M30,50 Q50,30 70,50 M30,50 Q50,70 70,50'],
    viewBox: '0 0 100 100',
  },
  {
    name: 'rocket',
    paths: ['M50,10 L60,35 L55,35 L55,70 L45,70 L45,35 L40,35 Z M35,65 L30,85 L35,75 M65,65 L70,85 L65,75 M45,70 L55,70 L50,90 Z M50,40 Q50,35 50,30'],
    viewBox: '0 0 100 100',
  },
  {
    name: 'controller',
    paths: ['M20,40 Q20,25 35,25 L65,25 Q80,25 80,40 L80,60 Q80,75 65,75 L35,75 Q20,75 20,60 Z M40,35 L40,45 L50,45 L50,35 M35,40 L45,40 M40,45 L40,55 M60,35 A5,5 0 1,1 60,45 M70,40 A5,5 0 1,1 70,[...]'],
    viewBox: '0 0 100 100',
  },
]

function SVGIcon({ shape, isTransforming }: { shape: typeof SVG_SHAPES[number]; isTransforming: boolean }) {
  return (
    <motion.svg
      viewBox={shape.viewBox}
      width={ICON_SIZE}
      height={ICON_SIZE}
      animate={{
        rotateZ: isTransforming ? 360 : 0,
        scale: isTransforming ? [1, 1.15, 0.95, 1.05, 1] : 1,
      }}
      transition={{
        rotateZ: { duration: TRANSFORM_DURATION, ease: 'easeInOut' },
        scale: { duration: TRANSFORM_DURATION, ease: 'easeInOut' },
      }}
    >
      {shape.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="white"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </motion.svg>
  )
}

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const [objIndex, setObjIndex] = useState<ObjIndex>(0)
  const [isTransforming, setIsTransforming] = useState(false)
  const [bounceProgress, setBounceProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBounceProgress((prev) => {
        const next = prev + 0.016 / BOUNCE_DURATION
        if (next >= 1) {
          setIsTransforming(true)
          setTimeout(() => {
            setIsTransforming(false)
            setObjIndex((prev) => ((prev + 1) % 5) as ObjIndex)
            setBounceProgress(0)
          }, TRANSFORM_DURATION * 1000)
          return 1
        }
        return next
      })
    }, 16)

    return () => clearInterval(interval)
  }, [])

  // Bounce curve: parabolic down then up
  const bounceY = (() => {
    if (bounceProgress <= 0.5) {
      return (bounceProgress * 2) ** 2 * 100 // Falling phase
    } else {
      const riseT = bounceProgress - 0.5
      return (1 - (riseT * 2) ** 2) * 100 // Rising phase
    }
  })()

  const currentShape = SVG_SHAPES[objIndex]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* Loading Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
        }}
      >
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: '#333333',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 3,
              background: '#ffffff',
              fontWeight: 'bold',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Bouncing Component */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 'calc(25% + 30px)',
          left: '50%',
          marginLeft: -ICON_SIZE / 2,
        }}
        animate={{
          y: bounceY,
        }}
        transition={{
          y: { duration: 0.016, ease: 'linear' },
        }}
      >
        <SVGIcon shape={currentShape} isTransforming={isTransforming} />
      </motion.div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'falling' | 'squash' | 'bounce' | 'settling' | 'idle' | 'morphing'
type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 140
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]
const MORPH_DURATION = 0.7

const ALL_PATHS: string[][] = [
  // Chess Pawn ♟️ - detailed with cross hatching
  [
    'M50 8 a12 12 0 1 1 0 24 a12 12 0 1 1 0 -24',
    'M38 32 Q50 28 62 32',
    'M36 32 Q34 38 38 44',
    'M64 32 Q66 38 60 44',
    'M42 44 Q50 42 58 44',
    'M40 44 Q36 58 30 78 Q28 88 34 94',
    'M60 44 Q64 58 70 78 Q72 88 66 94',
    'M34 94 Q32 100 36 106',
    'M66 94 Q68 100 64 106',
    'M36 106 Q50 112 64 106',
    'M30 106 Q28 114 34 120',
    'M70 106 Q72 114 66 120',
    'M34 120 Q50 126 66 120',
    'M28 120 L26 130 L74 130 L72 120',
    'M50 50 L50 80',
    'M44 58 L56 58',
    'M42 68 L58 68',
  ],
  // Race Car 🏎️ - detailed side profile with wheels
  [
    'M8 72 L18 72 L22 62 L32 58 L48 56 L72 56 L82 62 L92 64 L96 72 L8 72',
    'M22 62 L30 50 L42 46 L60 46 L68 50 L72 56',
    'M30 50 L36 38 L50 34 L60 34 L66 38 L68 50',
    'M36 38 L40 28 L48 26 L56 26 L60 28 L64 38',
    'M42 26 L44 18 L56 18 L58 26',
    'M18 72 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0',
    'M66 72 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0',
    'M20 72 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0',
    'M68 72 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0',
    'M48 46 L48 56',
    'M56 46 L56 56',
    'M12 64 L18 64 L18 72 L12 72',
    'M82 64 L92 64 L92 72 L82 72',
    'M44 38 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0',
    'M50 34 L50 46',
  ],
  // Soccer Ball ⚽ - detailed pentagon + hexagon pattern
  [
    'M50 6 a44 44 0 1 1 0 88 a44 44 0 1 1 0 -88',
    'M50 24 L42 34 L46 46 L54 46 L58 34 Z',
    'M42 34 L28 30',
    'M58 34 L72 30',
    'M46 46 L38 60',
    'M54 46 L62 60',
    'M28 30 L24 44',
    'M24 44 L32 56',
    'M32 56 L38 60',
    'M72 30 L76 44',
    'M76 44 L68 56',
    'M68 56 L62 60',
    'M38 60 L36 74',
    'M62 60 L64 74',
    'M36 74 L44 82',
    'M64 74 L56 82',
    'M44 82 L56 82',
    'M50 6 L50 18',
    'M14 50 L24 44',
    'M86 50 L76 44',
    'M36 74 L28 80',
    'M64 74 L72 80',
  ],
  // Rocket 🚀 - detailed with fins, window, flame lines
  [
    'M50 4 Q52 4 54 12 L56 30',
    'M50 4 Q48 4 46 12 L44 30',
    'M46 12 L38 24 L36 44 L36 56',
    'M54 12 L62 24 L64 44 L64 56',
    'M36 56 L34 70 L30 78 L26 82',
    'M64 56 L66 70 L70 78 L74 82',
    'M30 78 L38 86',
    'M70 78 L62 86',
    'M38 86 L44 90 L44 86',
    'M62 86 L56 90 L56 86',
    'M50 30 a10 10 0 1 1 0 20 a10 10 0 1 1 0 -20',
    'M50 30 a6 6 0 1 1 0 12 a6 6 0 1 1 0 -12',
    'M36 56 L22 64 L20 72 L26 76 L36 70',
    'M64 56 L78 64 L80 72 L74 76 L64 70',
    'M44 86 L50 98 L56 86',
    'M47 92 L50 106 L53 92',
    'M50 100 L46 108',
    'M50 100 L54 108',
    'M50 100 L50 110',
    'M38 36 L46 36',
    'M62 36 L54 36',
  ],
  // Game Controller 🎮 - detailed with D-pad, buttons, triggers
  [
    'M16 48 Q10 36 16 26 Q26 16 40 14 L60 14 Q74 16 84 26 Q90 36 84 48 L82 62 Q78 74 68 80 L60 82 Q50 84 40 82 L32 80 Q22 74 18 62 Z',
    'M34 32 L44 32 M39 27 L39 37',
    'M66 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10',
    'M78 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10',
    'M62 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8',
    'M50 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8',
    'M22 18 Q28 10 36 8',
    'M78 18 Q72 10 64 8',
    'M30 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6',
    'M38 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6',
    'M18 36 L24 42',
    'M82 36 L76 42',
    'M44 14 L44 8 L48 4 L52 4 L56 8 L56 14',
    'M36 32 L42 32',
    'M39 29 L39 35',
  ],
]

const SVG_CONFIGS: { viewBox: string; width: number; height: number }[] = [
  { viewBox: '0 0 100 140', width: ICON_SIZE, height: ICON_SIZE * 1.4 },
  { viewBox: '0 0 100 86', width: ICON_SIZE, height: ICON_SIZE * 0.86 },
  { viewBox: '0 0 100 92', width: ICON_SIZE, height: ICON_SIZE * 0.92 },
  { viewBox: '0 0 100 114', width: ICON_SIZE, height: ICON_SIZE * 1.14 },
  { viewBox: '0 0 100 88', width: ICON_SIZE, height: ICON_SIZE * 0.88 },
]

const SCATTER_TARGETS = ALL_PATHS.map((paths) =>
  paths.map(() => ({
    tx: (Math.random() - 0.5) * 240,
    ty: (Math.random() - 0.5) * 240,
    r: (Math.random() - 0.5) * 180,
  }))
)

const STABLE_PARTICLE_DATA = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 30 + (((i * 7 + 3) % 11) / 11) * 50
  return {
    id: i,
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist - 10,
    dur: 0.35 + (((i * 3 + 5) % 8) / 8) * 0.25,
  }
})

const STABLE_BG_DOTS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1 + ((i * 11 + 3) % 10) / 10 * 2,
  dur: 3 + ((i * 7 + 2) % 10) / 10 * 4,
  delay: ((i * 13 + 1) % 10) / 10 * 3,
}))

function StaticSVG({ paths, config }: { paths: string[]; config: typeof SVG_CONFIGS[number] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="white"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
        />
      ))}
    </svg>
  )
}

function DrawSVG({ paths, config }: { paths: string[]; config: typeof SVG_CONFIGS[number] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="white"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
        />
      ))}
    </svg>
  )
}

function ScatterSVG({ paths, config, targets }: { paths: string[]; config: typeof SVG_CONFIGS[number]; targets: { tx: number; ty: number; r: number }[] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="white"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          animate={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0.2, opacity: 0 }}
          transition={{ duration: MORPH_DURATION, delay: i * 0.015, ease: EASE_OUT }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
        />
      ))}
    </svg>
  )
}

function AssembleSVG({ paths, config, targets }: { paths: string[]; config: typeof SVG_CONFIGS[number]; targets: { tx: number; ty: number; r: number }[] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="white"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0.2, opacity: 0, pathLength: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, pathLength: 1 }}
          transition={{ duration: MORPH_DURATION * 0.8, delay: MORPH_DURATION * 0.15 + i * 0.02, ease: EASE_BOUNCE }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
        />
      ))}
    </svg>
  )
}

function Shockwave() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: '18%',
        left: '50%',
        width: 140,
        height: 35,
        marginLeft: -70,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.5)',
        pointerEvents: 'none',
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 1.4, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  )
}

function GroundFlash() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: '16%',
        left: '50%',
        width: 160,
        height: 6,
        marginLeft: -80,
        borderRadius: 3,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 1, scaleX: 0.6 }}
      animate={{ opacity: 0, scaleX: 1.3 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    />
  )
}

function BurstParticles() {
  return (
    <>
      {STABLE_PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            width: 3,
            height: 3,
            marginLeft: -1.5,
            borderRadius: '50%',
            background: 'white',
            pointerEvents: 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: p.dur, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

function EnergyBurst() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: '18%',
        left: '50%',
        width: 50,
        height: 50,
        marginLeft: -25,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
        pointerEvents: 'none',
      }}
      initial={{ scale: 0.4, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    />
  )
}

function Scanline() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
        height: '100%',
        pointerEvents: 'none',
      }}
      animate={{ y: ['-100%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function BackgroundParticles() {
  return (
    <>
      {STABLE_BG_DOTS.map((d) => (
        <motion.div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.08, 0.35, 0.08], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

export default function PlayfulLoader() {
  const [objIndex, setObjIndex] = useState<ObjIndex>(0)
  const [phase, setPhase] = useState<Phase>('falling')
  const [showImpact, setShowImpact] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const advance = useCallback(() => {
    if (objIndex < 4) {
      setPhase('morphing')
      const nextIndex = (objIndex + 1) as ObjIndex
      setTimeout(() => {
        setObjIndex(nextIndex)
        if (nextIndex === 4) {
          setIsComplete(true)
          setPhase('idle')
        } else {
          setPhase('falling')
        }
      }, MORPH_DURATION * 1000 + 150)
    }
  }, [objIndex])

  useEffect(() => {
    if (phase === 'falling') {
      const t = setTimeout(() => setPhase('squash'), 420)
      return () => clearTimeout(t)
    }
    if (phase === 'squash') {
      setShowImpact(true)
      const t = setTimeout(() => {
        setPhase('bounce')
        setShowImpact(false)
      }, 180)
      return () => clearTimeout(t)
    }
    if (phase === 'bounce') {
      const t = setTimeout(() => setPhase('settling'), 280)
      return () => clearTimeout(t)
    }
    if (phase === 'settling') {
      const t = setTimeout(() => setPhase('idle'), 180)
      return () => clearTimeout(t)
    }
    if (phase === 'idle' && objIndex < 4) {
      const t = setTimeout(advance, 700)
      return () => clearTimeout(t)
    }
  }, [phase, objIndex, advance])

  const isRocket = objIndex === 3
  const isController = objIndex === 4 && isComplete

  const getObjectTransform = () => {
    switch (phase) {
      case 'falling':
        return { y: isRocket ? -220 : -180, rotate: isRocket ? -120 : 0, scale: isRocket ? 0.8 : 1, scaleX: 1, scaleY: 1 }
      case 'squash':
        return { y: 0, rotate: 0, scale: 1, scaleX: 1.12, scaleY: 0.85 }
      case 'bounce':
        return { y: -45, rotate: 0, scale: 1, scaleX: 0.95, scaleY: 1.06 }
      case 'settling':
        return { y: -8, rotate: 0, scale: 1, scaleX: 1.02, scaleY: 0.98 }
      default:
        return { y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }
    }
  }

  const getTransition = () => {
    if (phase === 'falling') return { type: 'spring' as const, stiffness: 280, damping: 22, mass: 0.9 }
    if (phase === 'squash') return { duration: 0.1, ease: [0.36, 0, 0.66, -0.56] as [number, number, number, number] }
    if (phase === 'bounce') return { duration: 0.25, ease: EASE_BOUNCE }
    if (phase === 'settling') return { duration: 0.15, ease: EASE_OUT }
    return { duration: 0.2, ease: EASE_OUT }
  }

  const getIdleAnimate = () => {
    if (isController) return { y: [0, -5, 0], scale: [1, 1.02, 1] }
    return { y: [0, -6, 0], scale: [1, 1.02, 1] }
  }

  const getIdleTransition = () => {
    if (isController) return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    return { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
  }

  const rocketTransition = useMemo(() => ({ type: 'spring' as const, stiffness: 200, damping: 20, mass: 1.0 }), [])

  const transform = getObjectTransform()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#05060B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(100,120,255,0.02) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <Scanline />
      <BackgroundParticles />

      <div style={{ position: 'relative', width: ICON_SIZE, height: ICON_SIZE * 1.4 }}>
        {phase === 'morphing' ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScatterSVG
                paths={ALL_PATHS[objIndex]}
                config={SVG_CONFIGS[objIndex]}
                targets={SCATTER_TARGETS[objIndex]}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssembleSVG
                paths={ALL_PATHS[objIndex + 1]}
                config={SVG_CONFIGS[objIndex + 1]}
                targets={SCATTER_TARGETS[objIndex + 1]}
              />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={isController ? 'controller-done' : `${objIndex}`}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <motion.div
                animate={phase === 'idle' ? getIdleAnimate() : transform}
                transition={(phase === 'idle' ? getIdleTransition() : getTransition()) as any}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {objIndex === 0 && !isComplete ? (
                  <DrawSVG paths={ALL_PATHS[0]} config={SVG_CONFIGS[0]} />
                ) : (
                  <StaticSVG paths={ALL_PATHS[objIndex]} config={SVG_CONFIGS[objIndex]} />
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showImpact && (
          <>
            <Shockwave />
            <GroundFlash />
            <BurstParticles />
            <EnergyBurst />
          </>
        )}
      </AnimatePresence>

      {isController && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 2,
            borderRadius: 1,
            background: 'rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.12, 0.3, 0.12] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

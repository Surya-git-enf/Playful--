'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'falling' | 'squash' | 'bounce' | 'idle' | 'morphing'
type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 140
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1]
const SPRING_FALL = { type: 'spring' as const, stiffness: 160, damping: 18, mass: 1.1 }
const MORPH_DURATION = 0.55

const ALL_PATHS: string[][] = [
  [
    'M50 8 a14 14 0 1 1 0 28 a14 14 0 1 1 0 -28',
    'M40 42 Q50 38 60 42 Q58 48 50 50 Q42 48 40 42',
    'M42 50 Q36 72 30 94 Q28 104 32 110 L68 110 Q72 104 70 94 Q64 72 58 50',
    'M26 110 L74 110 L76 120 L24 120 Z',
    'M22 120 L78 120 L80 130 L20 130 Z',
  ],
  [
    'M12 88 L30 88 L34 74 L66 74 L70 88 L88 88',
    'M10 88 L90 88 L90 94 L10 94 Z',
    'M18 94 L38 94 L36 82 L20 82 Z',
    'M62 94 L82 94 L80 82 L64 82 Z',
    'M26 60 L40 52 L60 52 L74 60',
    'M34 52 L34 42 L44 38 L56 38 L66 42 L66 52',
    'M28 74 L28 80',
    'M72 74 L72 80',
    'M44 82 L44 94',
    'M56 82 L56 94',
    'M24 94 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0',
    'M60 94 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0',
  ],
  [
    'M50 8 a42 42 0 1 1 0 84 a42 42 0 1 1 0 -84',
    'M50 30 L38 42 L42 58 L58 58 L62 42 Z',
    'M38 42 L22 36',
    'M62 42 L78 36',
    'M42 58 L36 76',
    'M58 58 L64 76',
    'M50 30 L50 16',
    'M36 76 L44 88',
    'M64 76 L56 88',
    'M44 88 L56 88',
  ],
  [
    'M50 6 L50 30',
    'M50 6 Q38 22 34 42 L34 70',
    'M50 6 Q62 22 66 42 L66 70',
    'M34 70 L34 86 L40 90 L40 86',
    'M66 70 L66 86 L60 90 L60 86',
    'M50 38 a8 8 0 1 1 0 16 a8 8 0 1 1 0 -16',
    'M34 62 L20 68 L22 74 L34 70',
    'M66 62 L80 68 L78 74 L66 70',
    'M40 86 L50 98 L60 86',
    'M44 92 L50 104 L56 92',
  ],
  [
    'M16 50 Q10 38 18 28 Q28 18 42 16 L58 16 Q72 18 82 28 Q90 38 84 50 L82 64 Q78 74 68 78 L60 80 Q50 82 40 80 L32 78 Q22 74 18 64 Z',
    'M36 36 L36 48 M30 42 L42 42',
    'M64 36 a6 6 0 1 1 0 12 a6 6 0 1 1 0 -12',
    'M74 36 a6 6 0 1 1 0 12 a6 6 0 1 1 0 -12',
    'M56 56 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10',
    'M44 56 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10',
    'M50 34 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8',
    'M22 22 Q28 14 36 12',
    'M78 22 Q72 14 64 12',
  ],
]

const SVG_CONFIGS: { viewBox: string; width: number; height: number }[] = [
  { viewBox: '0 0 100 140', width: ICON_SIZE, height: ICON_SIZE * 1.4 },
  { viewBox: '0 0 100 100', width: ICON_SIZE, height: ICON_SIZE },
  { viewBox: '0 0 100 100', width: ICON_SIZE, height: ICON_SIZE },
  { viewBox: '0 0 100 110', width: ICON_SIZE, height: ICON_SIZE * 1.1 },
  { viewBox: '0 0 100 90', width: ICON_SIZE, height: ICON_SIZE * 0.9 },
]

const SCATTER_TARGETS = ALL_PATHS.map((paths) =>
  paths.map(() => ({
    tx: (Math.random() - 0.5) * 300,
    ty: (Math.random() - 0.5) * 300,
    r: (Math.random() - 0.5) * 360,
  }))
)

const STABLE_PARTICLE_DATA = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  const dist = 40 + (((i * 7 + 3) % 11) / 11) * 60
  return {
    id: i,
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist - 20,
    dur: 0.5 + (((i * 3 + 5) % 8) / 8) * 0.3,
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
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35))' }}
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
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35))' }}
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
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          animate={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0, opacity: 0 }}
          transition={{ duration: MORPH_DURATION, delay: i * 0.025, ease: EASE }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35))' }}
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
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0, opacity: 0, pathLength: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, pathLength: 1 }}
          transition={{ duration: MORPH_DURATION * 0.85, delay: MORPH_DURATION * 0.2 + i * 0.035, ease: EASE }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.35))' }}
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
        width: 160,
        height: 40,
        marginLeft: -80,
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.6)',
        pointerEvents: 'none',
      }}
      initial={{ scale: 0.2, opacity: 1 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
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
        width: 200,
        height: 8,
        marginLeft: -100,
        borderRadius: 4,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent 70%)',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 1, scaleX: 0.5 }}
      animate={{ opacity: 0, scaleX: 1.5 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
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
            width: 4,
            height: 4,
            marginLeft: -2,
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
        width: 60,
        height: 60,
        marginLeft: -30,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)',
        pointerEvents: 'none',
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  )
}

function Scanline() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
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
            background: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.8, 1.2, 0.8] }}
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
      }, MORPH_DURATION * 1000 + 100)
    }
  }, [objIndex])

  useEffect(() => {
    if (phase === 'falling') {
      const t = setTimeout(() => setPhase('squash'), 650)
      return () => clearTimeout(t)
    }
    if (phase === 'squash') {
      setShowImpact(true)
      const t = setTimeout(() => {
        setPhase('bounce')
        setShowImpact(false)
      }, 250)
      return () => clearTimeout(t)
    }
    if (phase === 'bounce') {
      const t = setTimeout(() => setPhase('idle'), 350)
      return () => clearTimeout(t)
    }
    if (phase === 'idle' && objIndex < 4) {
      const t = setTimeout(advance, 900)
      return () => clearTimeout(t)
    }
  }, [phase, objIndex, advance])

  const isRocket = objIndex === 3
  const isController = objIndex === 4 && isComplete

  const fallY = isRocket ? -450 : -400
  const fallRotate = isRocket ? -180 : 0
  const fallScale = isRocket ? 0.7 : 1

  const rocketTransition = useMemo(() => ({ duration: 1.2, ease: EASE }), [])

  const getObjectTransform = () => {
    switch (phase) {
      case 'falling':
        return { y: fallY, rotate: fallRotate, scale: fallScale, scaleX: 1, scaleY: 1 }
      case 'squash':
        return { y: 0, rotate: 0, scale: 1, scaleX: 1.25, scaleY: 0.72 }
      case 'bounce':
        return { y: -60, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }
      default:
        return { y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }
    }
  }

  const getTransition = () => {
    if (phase === 'falling') return isRocket ? rocketTransition : SPRING_FALL
    if (phase === 'squash') return { duration: 0.12, ease: [0.36, 0, 0.66, -0.56] as [number, number, number, number] }
    if (phase === 'bounce') return { duration: 0.3, ease: EASE }
    return { duration: 0.25, ease: EASE }
  }

  const getIdleAnimate = () => {
    if (isController) return { y: [0, -8, 0], scale: [1, 1.03, 1] }
    return { y: [0, -12, 0, -5, 0], scale: [1, 1.05, 1, 1.02, 1] }
  }

  const getIdleTransition = () => {
    if (isController) return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    return { duration: 0.9, ease: 'easeInOut' }
  }

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
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(100,120,255,0.03) 0%, transparent 50%)',
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
              transition={{ duration: 0.15 }}
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
            background: 'rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

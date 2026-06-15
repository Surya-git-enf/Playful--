'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'falling' | 'squash' | 'morphing'
type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 140
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]
const MORPH_DURATION = 0.7

const ALL_PATHS: string[][] = [
  // Chess King 👑 - detailed stroke paths tracing the outline
  [
    // Cross vertical
    'M25 0 L25 15',
    // Cross horizontal
    'M18 6 L32 6',
    // Cross ball
    'M25 10 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6',
    // Crown points (zigzag)
    'M8 30 L4 18 L12 22 L16 10 L20 20 L24 4 L28 20 L32 10 L36 22 L44 18 L44 30',
    // Crown band top
    'M6 34 Q25 28 44 34',
    // Crown band bottom
    'M8 40 Q25 34 42 40',
    // Crown left side
    'M8 40 Q6 50 10 58',
    // Crown right side
    'M42 40 Q44 50 40 58',
    // Crown body curve 1
    'M12 66 Q25 58 38 66',
    // Crown body curve 2
    'M16 74 Q25 66 34 74',
    // Neck
    'M20 82 Q25 76 30 82',
    // Neck lower
    'M22 90 Q25 84 28 90',
    // Body upper
    'M18 98 Q25 90 32 98',
    // Body mid
    'M14 106 Q25 98 36 106',
    // Body lower
    'M10 114 Q25 106 40 114',
    // Base upper
    'M8 122 Q25 114 42 122',
    // Base mid
    'M6 130 Q25 122 44 130',
    // Base bottom
    'M4 138 L2 144 L48 144 L46 138',
    // Cross detail left
    'M20 12 L20 16',
    // Cross detail right
    'M30 12 L30 16',
    // Crown jewel left
    'M16 36 a2 2 0 1 1 0 4 a2 2 0 1 1 0 -4',
    // Crown jewel center
    'M25 34 a2 2 0 1 1 0 4 a2 2 0 1 1 0 -4',
    // Crown jewel right
    'M34 36 a2 2 0 1 1 0 4 a2 2 0 1 1 0 -4',
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
  // Rocket 🚀 - upside down (nose pointing down), no rotation during fall
  [
    'M50 110 Q52 110 54 102 L56 84',
    'M50 110 Q48 110 46 102 L44 84',
    'M46 102 L38 90 L36 70 L36 58',
    'M54 102 L62 90 L64 70 L64 58',
    'M36 58 L34 44 L30 36 L26 32',
    'M64 58 L66 44 L70 36 L74 32',
    'M30 36 L38 28',
    'M70 36 L62 28',
    'M38 28 L44 24 L44 28',
    'M62 28 L56 24 L56 28',
    'M50 84 a10 10 0 1 1 0 -20 a10 10 0 1 1 0 20',
    'M50 84 a6 6 0 1 1 0 -12 a6 6 0 1 1 0 12',
    'M36 58 L22 50 L20 42 L26 38 L36 44',
    'M64 58 L78 50 L80 42 L74 38 L64 44',
    'M44 28 L50 16 L56 28',
    'M47 22 L50 8 L53 22',
    'M50 14 L46 6',
    'M50 14 L54 6',
    'M50 14 L50 4',
    'M38 78 L46 78',
    'M62 78 L54 78',
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
  { viewBox: '0 0 50 144', width: ICON_SIZE, height: ICON_SIZE * 2.88 },
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

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const [objIndex, setObjIndex] = useState<ObjIndex>(0)
  const [phase, setPhase] = useState<Phase>('falling')
  const [showImpact, setShowImpact] = useState(false)

  const advance = useCallback(() => {
    setPhase('morphing')
    const nextIndex = ((objIndex + 1) % 5) as ObjIndex
    setTimeout(() => {
      setObjIndex(nextIndex)
      setPhase('falling')
    }, MORPH_DURATION * 1000 + 100)
  }, [objIndex])

  useEffect(() => {
    if (phase === 'falling') {
      const t = setTimeout(() => setPhase('squash'), 380)
      return () => clearTimeout(t)
    }
    if (phase === 'squash') {
      setShowImpact(true)
      const t = setTimeout(() => {
        setShowImpact(false)
        advance()
      }, 160)
      return () => clearTimeout(t)
    }
  }, [phase, advance])

  const isRocket = objIndex === 3

  const getObjectTransform = () => {
    switch (phase) {
      case 'falling':
        return { y: isRocket ? -220 : -180, rotate: 0, scale: isRocket ? 0.8 : 1, scaleX: 1, scaleY: 1 }
      case 'squash':
        return { y: 0, rotate: 0, scale: 1, scaleX: 1.12, scaleY: 0.85 }
      default:
        return { y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }
    }
  }

  const getTransition = () => {
    if (phase === 'falling') return { type: 'spring' as const, stiffness: 280, damping: 22, mass: 0.9 }
    if (phase === 'squash') return { duration: 0.1, ease: [0.36, 0, 0.66, -0.56] as [number, number, number, number] }
    return { duration: 0.2, ease: EASE_OUT }
  }

  const nextIdx = ((objIndex + 1) % 5) as ObjIndex

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

      <div style={{ position: 'relative', width: ICON_SIZE, height: ICON_SIZE * 2.88 }}>
        {phase === 'morphing' ? (
          <motion.div
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ y: 0 }}
            animate={{ y: isRocket ? -220 : -180 }}
            transition={{ duration: MORPH_DURATION, ease: EASE_OUT }}
          >
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScatterSVG
                paths={ALL_PATHS[objIndex]}
                config={SVG_CONFIGS[objIndex]}
                targets={SCATTER_TARGETS[objIndex]}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssembleSVG
                paths={ALL_PATHS[nextIdx]}
                config={SVG_CONFIGS[nextIdx]}
                targets={SCATTER_TARGETS[nextIdx]}
              />
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${objIndex}`}
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
              transition={{ duration: 0.1 }}
            >
              <motion.div
                animate={getObjectTransform()}
                transition={getTransition() as any}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {objIndex === 0 ? (
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

      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 2,
              background: 'rgba(255,255,255,0.7)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
          }}
        >
          {progress}%
        </span>
      </div>
    </div>
  )
                   }

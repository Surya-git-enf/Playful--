
'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 140
const MORPH_DURATION = 1.0

// EXACTLY 5 SVGS with the 100% Detailed Chess King implementation
const ALL_PATHS: string[][] = [
  // 1. Chess King 👑 - High detail trace matching the uploaded image
  [
    // Cross Top & Arms
    'M 44 14 L 56 14 L 56 20 L 62 20 L 62 28 L 56 28 L 56 38 L 44 38 L 44 28 L 38 28 L 38 20 L 44 20 Z',
    // Cross Base trapezoid
    'M 44 40 L 56 40 L 62 48 L 38 48 Z',
    // Crown Base Line
    'M 36 50 L 64 50',
    // Crown Left Cheek
    'M 36 50 C 12 50 12 75 25 88 C 30 94 38 98 50 98',
    // Crown Right Cheek
    'M 64 50 C 88 50 88 75 75 88 C 70 94 62 98 50 98',
    // Crown Inner V-neck
    'M 36 50 C 46 50 46 65 50 65 C 54 65 54 50 64 50',
    // Crown Center Jewel
    'M 48 78 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0',
    // Crown Left Jewel
    'M 32 75 a 1.5 1.5 0 1 0 3 0 a 1.5 1.5 0 1 0 -3 0',
    // Crown Right Jewel
    'M 65 75 a 1.5 1.5 0 1 0 3 0 a 1.5 1.5 0 1 0 -3 0',
    // Top Collar
    'M 32 104 C 32 98 68 98 68 104 C 68 110 32 110 32 104 Z',
    // Second Collar
    'M 28 116 C 28 108 72 108 72 116 C 72 124 28 124 28 116 Z',
    // Neck Left curve
    'M 32 122 C 45 145 45 165 24 185',
    // Neck Right curve
    'M 68 122 C 55 145 55 165 76 185',
    // Neck Bottom Curve connector
    'M 24 185 C 40 189 60 189 76 185',
    // Third Collar
    'M 22 192 C 22 185 78 185 78 192 C 78 199 22 199 22 192 Z',
    // Base Bell Left
    'M 20 200 C 6 210 6 220 16 226',
    // Base Bell Right
    'M 80 200 C 94 210 94 220 84 226',
    // Base Bell Bottom Curve connector
    'M 16 226 C 30 230 70 230 84 226',
    // Base Bell Inner Detail Line
    'M 26 215 C 40 220 60 220 74 215',
    // Foot Ring (Very bottom)
    'M 14 234 C 14 226 86 226 86 234 C 86 242 14 242 14 234 Z',
  ],
  // 2. Race Car 🏎️
  [
    'M8 72 L18 72 L22 62 L32 58 L48 56 L72 56 L82 62 L92 64 L96 72 L8 72',
    'M22 62 L30 50 L42 46 L60 46 L68 50 L72 56', 'M30 50 L36 38 L50 34 L60 34 L66 38 L68 50',
    'M36 38 L40 28 L48 26 L56 26 L60 28 L64 38', 'M42 26 L44 18 L56 18 L58 26',
    'M18 72 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0', 'M66 72 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0',
    'M20 72 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0', 'M68 72 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0',
    'M48 46 L48 56', 'M56 46 L56 56', 'M12 64 L18 64 L18 72 L12 72',
    'M82 64 L92 64 L92 72 L82 72', 'M44 38 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0', 'M50 34 L50 46',
  ],
  // 3. Soccer Ball ⚽
  [
    'M50 6 a44 44 0 1 1 0 88 a44 44 0 1 1 0 -88', 'M50 24 L42 34 L46 46 L54 46 L58 34 Z',
    'M42 34 L28 30', 'M58 34 L72 30', 'M46 46 L38 60', 'M54 46 L62 60',
    'M28 30 L24 44', 'M24 44 L32 56', 'M32 56 L38 60', 'M72 30 L76 44',
    'M76 44 L68 56', 'M68 56 L62 60', 'M38 60 L36 74', 'M62 60 L64 74',
    'M36 74 L44 82', 'M64 74 L56 82', 'M44 82 L56 82', 'M50 6 L50 18',
    'M14 50 L24 44', 'M86 50 L76 44', 'M36 74 L28 80', 'M64 74 L72 80',
  ],
  // 4. Rocket 🚀
  [
    'M50 110 Q52 110 54 102 L56 84', 'M50 110 Q48 110 46 102 L44 84',
    'M46 102 L38 90 L36 70 L36 58', 'M54 102 L62 90 L64 70 L64 58',
    'M36 58 L34 44 L30 36 L26 32', 'M64 58 L66 44 L70 36 L74 32',
    'M30 36 L38 28', 'M70 36 L62 28', 'M38 28 L44 24 L44 28',
    'M62 28 L56 24 L56 28', 'M50 84 a10 10 0 1 1 0 -20 a10 10 0 1 1 0 20',
    'M50 84 a6 6 0 1 1 0 -12 a6 6 0 1 1 0 12', 'M36 58 L22 50 L20 42 L26 38 L36 44',
    'M64 58 L78 50 L80 42 L74 38 L64 44', 'M44 28 L50 16 L56 28',
    'M47 22 L50 8 L53 22', 'M50 14 L46 6', 'M50 14 L54 6',
    'M50 14 L50 4', 'M38 78 L46 78', 'M62 78 L54 78',
  ],
  // 5. Game Controller 🎮
  [
    'M16 48 Q10 36 16 26 Q26 16 40 14 L60 14 Q74 16 84 26 Q90 36 84 48 L82 62 Q78 74 68 80 L60 82 Q50 84 40 82 L32 80 Q22 74 18 62 Z',
    'M34 32 L44 32 M39 27 L39 37', 'M66 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10',
    'M78 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10', 'M62 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8',
    'M50 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8', 'M22 18 Q28 10 36 8',
    'M78 18 Q72 10 64 8', 'M30 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6',
    'M38 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6', 'M18 36 L24 42',
    'M82 36 L76 42', 'M44 14 L44 8 L48 4 L52 4 L56 8 L56 14',
    'M36 32 L42 32', 'M39 29 L39 35',
  ],
]

const SVG_CONFIGS = [
  { viewBox: '0 0 100 250', width: ICON_SIZE, height: ICON_SIZE * 2.5 },
  { viewBox: '0 0 100 86', width: ICON_SIZE, height: ICON_SIZE * 0.86 },
  { viewBox: '0 0 100 92', width: ICON_SIZE, height: ICON_SIZE * 0.92 },
  { viewBox: '0 0 100 114', width: ICON_SIZE, height: ICON_SIZE * 1.14 },
  { viewBox: '0 0 100 88', width: ICON_SIZE, height: ICON_SIZE * 0.88 },
]

// Pre-calculate stable random targets for the morph scatter effect
const SCATTER_TARGETS = ALL_PATHS.map((paths) =>
  paths.map(() => ({
    tx: (Math.random() - 0.5) * 350,
    ty: (Math.random() - 0.5) * 350,
    r: (Math.random() - 0.5) * 360,
  }))
)

// Impact effect definitions
const STABLE_PARTICLE_DATA = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 30 + (((i * 7 + 3) % 11) / 11) * 60
  return {
    id: i,
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist - 10,
    dur: 0.35 + (((i * 3 + 5) % 8) / 8) * 0.25,
  }
})

const STABLE_BG_DOTS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 1 + (((i * 11 + 3) % 10) / 10) * 2,
  dur: 3 + (((i * 7 + 2) % 10) / 10) * 4,
  delay: (((i * 13 + 1) % 10) / 10) * 3,
}))

// --- SVG Sub-components ---

function StaticSVG({ paths, config }: { paths: string[]; config: typeof SVG_CONFIGS[number] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }} />
      ))}
    </svg>
  )
}

function ScatterSVG({ paths, config, targets }: { paths: string[]; config: typeof SVG_CONFIGS[number]; targets: { tx: number; ty: number; r: number }[] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <motion.path
          key={i} d={d} stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round"
          initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          animate={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0, opacity: 0 }}
          transition={{ duration: MORPH_DURATION * 0.45, delay: i * 0.005, ease: 'easeIn' }}
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
          key={i} d={d} stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round"
          initial={{ x: targets[i].tx, y: targets[i].ty, rotate: targets[i].r, scale: 0, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: MORPH_DURATION * 0.45, delay: MORPH_DURATION * 0.55 + i * 0.005, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' }}
        />
      ))}
    </svg>
  )
}

// --- Effects Components ---

function ImpactEffects() {
  return (
    <>
      <motion.div
        style={{
          position: 'absolute', bottom: '10%', left: '50%', width: 140, height: 35, marginLeft: -70,
          borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', pointerEvents: 'none',
        }}
        initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.div
        style={{
          position: 'absolute', bottom: '11%', left: '50%', width: 160, height: 6, marginLeft: -80,
          borderRadius: 3, background: 'radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)', pointerEvents: 'none',
        }}
        initial={{ opacity: 1, scaleX: 0.6 }} animate={{ opacity: 0, scaleX: 1.4 }} transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      {STABLE_PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute', bottom: '15%', left: '50%', width: 3, height: 3, marginLeft: -1.5,
            borderRadius: '50%', background: 'white', pointerEvents: 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }} transition={{ duration: p.dur, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

function BackgroundEffects() {
  return (
    <>
      <motion.div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', height: '100%' }}
        animate={{ y: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      {STABLE_BG_DOTS.map((d) => (
        <motion.div
          key={d.id}
          style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}
          animate={{ opacity: [0.08, 0.35, 0.08], scale: [0.8, 1.1, 0.8] }} transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

// --- Main Component ---

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const controls = useAnimation()
  const [objIndex, setObjIndex] = useState<ObjIndex>(0)
  const [isMorphing, setIsMorphing] = useState(false)
  const [impactKey, setImpactKey] = useState<number>(0)

  // PERFECT SEQUENTIAL STATE MACHINE (No double jumps, guaranteed sync)
  useEffect(() => {
    let isMounted = true

    const runAnimationLoop = async () => {
      // Ensure we start high up out of view
      await controls.set({ y: -300, scale: 0.8, opacity: 0 })

      while (isMounted) {
        // 1. Drop
        await controls.start({
          y: 0, scale: 1, opacity: 1,
          transition: { type: 'spring', bounce: 0.35, duration: 0.6 }
        })

        if (!isMounted) break

        // 2. Squash & trigger impact graphics exactly on landing
        setImpactKey((k) => k + 1)
        await controls.start({
          y: [0, 20, 0], scaleX: [1, 1.3, 1], scaleY: [1, 0.65, 1],
          transition: { duration: 0.3, ease: 'easeInOut' }
        })

        // 3. Rest momentarily
        await new Promise((r) => setTimeout(r, 400))

        if (!isMounted) break

        // 4. Fly up & Morph simultaneously
        setIsMorphing(true)
        await controls.start({
          y: -220,
          transition: { duration: MORPH_DURATION, ease: 'easeInOut' }
        })

        if (!isMounted) break

        // 5. Instantly lock in the new object while high up and loop back to drop
        setIsMorphing(false)
        setObjIndex((prev) => ((prev + 1) % 5) as ObjIndex)
      }
    }

    runAnimationLoop()
    return () => { isMounted = false }
  }, [controls])

  const nextIdx = ((objIndex + 1) % 5) as ObjIndex

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#05060B', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 9999,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(100,120,255,0.02) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <BackgroundEffects />

      {impactKey > 0 && (
        <div key={`impact-${impactKey}`} style={{ position: 'absolute', inset: 0 }}>
          <ImpactEffects />
        </div>
      )}

      {/* Main Motion Container controlling unified positioning without re-mounting */}
      <motion.div
        animate={controls}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', width: ICON_SIZE, height: ICON_SIZE * 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {isMorphing ? (
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScatterSVG paths={ALL_PATHS[objIndex]} config={SVG_CONFIGS[objIndex]} targets={SCATTER_TARGETS[objIndex]} />
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssembleSVG paths={ALL_PATHS[nextIdx]} config={SVG_CONFIGS[nextIdx]} targets={SCATTER_TARGETS[nextIdx]} />
              </div>
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StaticSVG paths={ALL_PATHS[objIndex]} config={SVG_CONFIGS[objIndex]} />
            </div>
          )}

        </div>
      </motion.div>

      {/* Loading Progress Bar */}
      <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.7)' }}
            initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
          {progress}%
        </span>
      </div>
    </div>
  )
}

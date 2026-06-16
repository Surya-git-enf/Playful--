'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Phase = 'idle' | 'out' | 'in'
type ObjIndex = 0 | 1 | 2 | 3 | 4
type PathDef = { d: string; delay?: number }

const ICON_SIZE = 144
const CARD_W = 560
const CARD_H = 280

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

const IDLE_MS = 1350
const OUT_MS = 220
const IN_MS = 560

const ICONS: { title: string; viewBox: string; width: number; height: number; strokeWidth: number; paths: PathDef[] }[] = [
  {
    title: 'King',
    viewBox: '0 0 100 100',
    width: ICON_SIZE,
    height: ICON_SIZE,
    strokeWidth: 5.2,
    paths: [
      { d: 'M18 76 H82' },
      { d: 'M22 76 L27 42 L37 54 L50 28 L63 54 L73 42 L78 76' },
      { d: 'M30 76 C30 58 70 58 70 76' },
      { d: 'M34 28 L28 16 L38 22 L44 8 L50 18 L56 8 L62 22 L72 16 L66 28' },
      { d: 'M42 76 V88 H58 V76' },
    ],
  },
  {
    title: 'Car',
    viewBox: '0 0 100 100',
    width: ICON_SIZE,
    height: ICON_SIZE * 0.88,
    strokeWidth: 5.0,
    paths: [
      { d: 'M20 58 L24 44 L37 34 H63 L76 44 L80 58 Z' },
      { d: 'M26 44 L34 30 H66 L74 44' },
      { d: 'M30 58 H70' },
      { d: 'M30 58 a8 8 0 1 1 0.01 0' },
      { d: 'M70 58 a8 8 0 1 1 0.01 0' },
      { d: 'M36 38 H64' },
    ],
  },
  {
    title: 'Ball',
    viewBox: '0 0 100 100',
    width: ICON_SIZE,
    height: ICON_SIZE,
    strokeWidth: 5.0,
    paths: [
      { d: 'M50 12 a38 38 0 1 1 0 76 a38 38 0 1 1 0 -76' },
      { d: 'M50 28 L40 38 L44 52 L56 52 L60 38 Z' },
      { d: 'M40 38 L28 34' },
      { d: 'M60 38 L72 34' },
      { d: 'M44 52 L36 66' },
      { d: 'M56 52 L64 66' },
      { d: 'M28 34 L24 48 L32 60' },
      { d: 'M72 34 L76 48 L68 60' },
    ],
  },
  {
    title: 'Rocket',
    viewBox: '0 0 100 120',
    width: ICON_SIZE,
    height: ICON_SIZE * 1.12,
    strokeWidth: 5.0,
    paths: [
      { d: 'M50 8 L62 26 L60 76 L50 104 L40 76 L38 26 Z' },
      { d: 'M50 26 a9 9 0 1 1 0 18 a9 9 0 1 1 0 -18' },
      { d: 'M38 54 L22 42 L20 52 L30 62' },
      { d: 'M62 54 L78 42 L80 52 L70 62' },
      { d: 'M44 18 L50 10 L56 18' },
      { d: 'M46 94 H54' },
      { d: 'M41 100 L50 112 L59 100' },
    ],
  },
  {
    title: 'Joystick',
    viewBox: '0 0 100 100',
    width: ICON_SIZE,
    height: ICON_SIZE * 0.88,
    strokeWidth: 5.0,
    paths: [
      { d: 'M18 54 C18 32 30 20 50 20 C70 20 82 32 82 54 C82 66 75 78 64 82 H36 C25 78 18 66 18 54 Z' },
      { d: 'M36 36 H44' },
      { d: 'M40 32 V40' },
      { d: 'M62 34 a5 5 0 1 1 0.01 0' },
      { d: 'M74 34 a5 5 0 1 1 0.01 0' },
      { d: 'M60 48 a4 4 0 1 1 0.01 0' },
      { d: 'M48 48 a4 4 0 1 1 0.01 0' },
      { d: 'M28 28 Q34 18 42 14' },
      { d: 'M72 28 Q66 18 58 14' },
      { d: 'M30 66 a3 3 0 1 1 0.01 0' },
      { d: 'M40 66 a3 3 0 1 1 0.01 0' },
    ],
  },
]

const BG_DOTS = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 100) / 100,
  y: ((i * 53 + 7) % 100) / 100,
  size: 1 + (((i * 11 + 3) % 10) / 10) * 2,
  dur: 3 + (((i * 7 + 2) % 10) / 10) * 4,
  delay: (((i * 13 + 1) % 10) / 10) * 3,
}))

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  const dist = 28 + (((i * 7 + 3) % 11) / 11) * 40
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 8,
    size: 2 + ((i * 5) % 3),
    dur: 0.28 + (((i * 3 + 5) % 8) / 8) * 0.24,
  }
})

function BackgroundParticles() {
  return (
    <>
      {BG_DOTS.map((d) => (
        <motion.div
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.x * 100}%`,
            top: `${d.y * 100}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.08, 0.35, 0.08], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

function Scanline() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
        pointerEvents: 'none',
      }}
      animate={{ y: ['-120%', '120%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function GlowOrb() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 'auto 50% 15% auto',
        width: 280,
        height: 120,
        transform: 'translateX(50%)',
        borderRadius: '999px',
        background:
          'radial-gradient(ellipse at center, rgba(150,170,255,0.14) 0%, rgba(100,120,255,0.05) 45%, transparent 75%)',
        pointerEvents: 'none',
        filter: 'blur(1px)',
      }}
      animate={{ opacity: [0.55, 1, 0.55], scale: [0.98, 1.02, 0.98] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function BurstParticles({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 &&
        BURST.map((p) => (
          <motion.div
            key={`${trigger}-${p.id}`}
            style={{
              position: 'absolute',
              bottom: '22%',
              left: '50%',
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              borderRadius: '50%',
              background: 'white',
              pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.dur, ease: 'easeOut' }}
          />
        ))}
    </AnimatePresence>
  )
}

function Shockwave({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '50%',
            width: 180,
            height: 40,
            marginLeft: -90,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.42)',
            pointerEvents: 'none',
          }}
          initial={{ scale: 0.45, opacity: 1 }}
          animate={{ scale: 1.35, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

function ImpactFlash({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '16%',
            left: '50%',
            width: 200,
            height: 7,
            marginLeft: -100,
            borderRadius: 99,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent 70%)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 1, scaleX: 0.6 }}
          animate={{ opacity: 0, scaleX: 1.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

function IconSVG({ index, mode }: { index: ObjIndex; mode: 'idle' | 'out' | 'in' }) {
  const icon = ICONS[index]

  const animateState =
    mode === 'out'
      ? { opacity: 0, scale: 0.74, y: -12, rotate: -7 }
      : mode === 'in'
        ? { opacity: 1, scale: [0.74, 1.08, 1], y: [12, -4, 0], rotate: [8, -4, 0] }
        : { opacity: 1, scale: 1, y: 0, rotate: 0 }

  return (
    <motion.svg
      viewBox={icon.viewBox}
      width={icon.width}
      height={icon.height}
      style={{ overflow: 'visible', display: 'block' }}
      animate={animateState}
      transition={{ duration: mode === 'in' ? 0.56 : 0.28, ease: mode === 'in' ? EASE_BOUNCE : EASE_OUT }}
    >
      {icon.paths.map((p, i) => (
        <motion.path
          key={`${icon.title}-${i}`}
          d={p.d}
          fill="none"
          stroke="white"
          strokeWidth={icon.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.25))' }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.52, delay: p.delay ?? i * 0.02, ease: EASE_OUT }}
        />
      ))}
    </motion.svg>
  )
}

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const [index, setIndex] = useState<ObjIndex>(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [burst, setBurst] = useState(0)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  useEffect(() => {
    const schedule = () => {
      clearTimers()
      timers.current.push(
        window.setTimeout(() => {
          setPhase('out')
        }, IDLE_MS)
      )
    }

    schedule()
    return () => clearTimers()
  }, [index])

  useEffect(() => {
    if (phase !== 'out') return

    setBurst((n) => n + 1)
    clearTimers()
    timers.current.push(
      window.setTimeout(() => {
        setIndex((n) => ((n + 1) % ICONS.length) as ObjIndex)
        setPhase('in')
      }, OUT_MS)
    )

    timers.current.push(
      window.setTimeout(() => {
        setPhase('idle')
      }, OUT_MS + IN_MS)
    )

    return () => clearTimers()
  }, [phase])

  const cardMotion = useMemo(
    () => ({
      rotate: [-4.5, -3.5, -4.5],
      y: [0, -2, 0],
      scale: [1, 1.01, 1],
    }),
    []
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#05060B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 58%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(100,120,255,0.03) 0%, transparent 56%)',
          pointerEvents: 'none',
        }}
      />

      <GlowOrb />
      <Scanline />
      <BackgroundParticles />

      <motion.div
        style={{
          width: 'min(92vw, 560px)',
          height: CARD_H,
          borderRadius: 28,
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(145,155,232,0.92) 0%, rgba(111,120,195,0.94) 100%)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transformOrigin: 'center center',
        }}
        animate={cardMotion}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent 38%, rgba(0,0,0,0.08) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.07), transparent 38%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.03em',
            color: 'rgba(255,255,255,0.96)',
            textShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
          animate={{ opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Advanced Loader
        </motion.div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 18,
          }}
        >
          <AnimatePresence mode="wait">
            {phase === 'out' ? (
              <motion.div
                key={`icon-out-${index}`}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                initial={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                animate={{ opacity: 0, scale: 0.72, y: -24, rotate: -12 }}
                transition={{ duration: 0.22, ease: 'easeIn' }}
              >
                <IconSVG index={index} mode="out" />
              </motion.div>
            ) : (
              <motion.div
                key={`icon-${index}-${phase}`}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                initial={phase === 'in' ? { opacity: 0, scale: 0.74, y: 14, rotate: 8 } : { opacity: 1, scale: 1, y: 0, rotate: 0 }}
                animate={phase === 'idle' ? { opacity: 1, scale: 1, y: [0, -4, 0], rotate: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <IconSVG index={index} mode={phase === 'in' ? 'in' : 'idle'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            width: 160,
            height: 5,
            transform: 'translateX(-50%)',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, progress))}%`,
              borderRadius: 99,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.45), rgba(255,255,255,0.95))',
              boxShadow: '0 0 12px rgba(255,255,255,0.25)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.18em',
          }}
          animate={{ opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {progress}%
        </motion.div>
      </motion.div>

      <Shockwave trigger={burst} />
      <ImpactFlash trigger={burst} />
      <BurstParticles trigger={burst} />
    </div>
  )
}

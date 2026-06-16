'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

type Phase = 'idle' | 'squashing' | 'rising' | 'wiping'

const ICONS = [
  { src: '/svg/chess.png', alt: 'Chess' },
  { src: '/svg/car.png', alt: 'Car' },
  { src: '/svg/ball.png', alt: 'Ball' },
  { src: '/svg/rocket.png', alt: 'Rocket' },
  { src: '/svg/controller.png', alt: 'Controller' },
]

const ICON_SIZE = 110
const MORPH_MS = 550

const BG_DOTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1 + ((i * 11 + 3) % 10) / 10 * 1.5,
  dur: 3.5 + ((i * 7 + 2) % 10) / 10 * 3.5,
  delay: ((i * 13 + 1) % 10) / 10 * 2.5,
}))

function Scanline() {
  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.015) 50%, transparent 100%)",
        pointerEvents: "none",
      }}
      animate={{ y: ["-100%", "100%"] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
    />
  )
}

function BackgroundParticles() {
  return (
    <>
      {BG_DOTS.map((d) => (
        <motion.div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            pointerEvents: "none",
          }}
          animate={{ opacity: [0.06, 0.3, 0.06], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  )
}

function GradientBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        width: 200,
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          borderRadius: 2,
          background: "linear-gradient(90deg, #ffffff 0%, #ff8a00 33%, #ff6b9d 66%, #4a9eff 100%)",
          boxShadow: "0 0 12px rgba(255,138,0,0.4), 0 0 20px rgba(255,107,157,0.2)",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      />
      {progress > 5 && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: 40,
            borderRadius: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            pointerEvents: "none",
          }}
          animate={{ x: [0, 160, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  )
}

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [wipeDir, setWipeDir] = useState<'in' | 'out'>('in')
  const cycleRef = useRef<NodeJS.Timeout | null>(null)

  const springY = useSpring(-200, { stiffness: 180, damping: 18, mass: 1.2 })
  const springScaleX = useSpring(1, { stiffness: 300, damping: 14 })
  const springScaleY = useSpring(1, { stiffness: 300, damping: 14 })
  const wipeClip = useSpring(0, { stiffness: 120, damping: 22 })

  const nextIdx = ((idx + 1) % ICONS.length)

  const startCycle = useCallback(() => {
    springY.set(-200)
    springScaleX.set(1)
    springScaleY.set(1)
    wipeClip.set(0)
    setWipeDir('in')

    requestAnimationFrame(() => {
      springY.set(0)
    })

    const hitTimer = setTimeout(() => {
      springScaleX.set(1.15)
      springScaleY.set(0.82)

      const recoverTimer = setTimeout(() => {
        springScaleX.set(1)
        springScaleY.set(1)
        setPhase('wiping')
        setWipeDir('in')
        wipeClip.set(100)

        const morphTimer = setTimeout(() => {
          setIdx((prev) => (prev + 1) % ICONS.length)
          setWipeDir('out')
          wipeClip.set(0)

          const riseTimer = setTimeout(() => {
            springY.set(-200)
            const nextCycle = setTimeout(() => {
              setPhase('rising')
              const settleTimer = setTimeout(() => {
                setPhase('idle')
                startCycle()
              }, 400)
              cycleRef.current = settleTimer
            }, 100)
            cycleRef.current = nextCycle
          }, MORPH_MS)
          cycleRef.current = riseTimer
        }, 50)
        cycleRef.current = morphTimer
      }, 120)
      cycleRef.current = recoverTimer
    }, 450)
    cycleRef.current = hitTimer
  }, [springY, springScaleX, springScaleY, wipeClip])

  useEffect(() => {
    const t = setTimeout(startCycle, 300)
    return () => {
      clearTimeout(t)
      if (cycleRef.current) clearTimeout(cycleRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05060B",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 9999,
        gap: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.025) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 85%, rgba(100,120,255,0.02) 0%, transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <Scanline />
      <BackgroundParticles />

      <motion.div
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          y: springY,
          scaleX: springScaleX,
          scaleY: springScaleY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              position: "relative",
              overflow: "hidden",
              borderRadius: 20,
            }}
          >
            <img
              src={ICONS[idx].src}
              alt={ICONS[idx].alt}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 0 18px rgba(255,138,0,0.3)) drop-shadow(0 0 30px rgba(74,158,255,0.15))",
              }}
            />
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,138,0,0.1) 100%)",
                borderRadius: 20,
                pointerEvents: "none",
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <GradientBar progress={progress} />
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.18em",
          }}
        >
          {progress}%
        </span>
      </div>
    </div>
  )
}

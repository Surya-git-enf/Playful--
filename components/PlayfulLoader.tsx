'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValueEvent } from 'framer-motion'

const ICONS = [
  { src: '/svg/chess.png', alt: 'Chess' },
  { src: '/svg/car.png', alt: 'Car' },
  { src: '/svg/ball.png', alt: 'Ball' },
  { src: '/svg/rocket.png', alt: 'Rocket' },
  { src: '/svg/controller.png', alt: 'Controller' },
]

const ICON_SIZE = 120
const DROP_HEIGHT = 260

const ALL_ASSETS = [
  '/svg/chess.png', '/svg/car.png', '/svg/ball.png', '/svg/rocket.png', '/svg/controller.png',
  '/logo.png',
  '/retro/sky.png', '/retro/clouds.png', '/retro/hills.png', '/retro/terrain.png',
  '/retro/castle.png', '/retro/character.png', '/retro/coin.png',
  '/racing/bg.png', '/racing/road.png', '/racing/car.png', '/racing/racing.mp4',
  '/openworld/sky.png', '/openworld/ground.png', '/openworld/moon.png', '/openworld/world.png', '/openworld/hero.png',
  '/space/astronaut.png', '/space/earth.png', '/space/lunar-ground.png',
  '/cards/bang.mp4', '/cards/lego.mp4', '/cards/play.mp4',
]

function preloadAssets(onProgress: (p: number) => void) {
  let loaded = 0
  const total = ALL_ASSETS.length
  const mark = () => {
    loaded++
    onProgress(Math.min(Math.round((loaded / total) * 100), 100))
  }
  ALL_ASSETS.forEach((src) => {
    if (src.endsWith('.mp4')) {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = mark
      v.onerror = mark
      v.src = src
    } else {
      const img = new Image()
      img.onload = mark
      img.onerror = mark
      img.src = src
    }
  })
}

export default function PlayfulLoader({ progress: externalProgress }: { progress?: number }) {
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'falling' | 'rising' | 'wiping'>('falling')
  const timers = useRef<NodeJS.Timeout[]>([])

  const y = useSpring(-DROP_HEIGHT, { stiffness: 120, damping: 13, mass: 1 })
  const sx = useSpring(1, { stiffness: 500, damping: 12 })
  const sy = useSpring(1, { stiffness: 500, damping: 12 })

  useEffect(() => {
    preloadAssets(setProgress)
  }, [])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }

  const bounce = useCallback(() => {
    clearTimers()
    sx.set(1)
    sy.set(1)

    setPhase('falling')
    y.set(0)
    sx.set(1.2)
    sy.set(0.78)

    schedule(() => {
      sx.set(1)
      sy.set(1)
      setPhase('rising')
      y.set(-DROP_HEIGHT)
    }, 380)

    schedule(() => {
      setPhase('wiping')
      schedule(() => {
        setIdx((p) => (p + 1) % ICONS.length)
        schedule(() => {
          setPhase('falling')
          bounce()
        }, 50)
      }, 400)
    }, 380 + 420)
  }, [y, sx, sy])

  useEffect(() => {
    const t = setTimeout(bounce, 300)
    return () => { clearTimers(); clearTimeout(t) }
  }, [bounce])

  const pct = externalProgress ?? progress

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
      }}
    >
      <motion.div
        style={{
          y,
          scaleX: sx,
          scaleY: sy,
          width: ICON_SIZE,
          height: ICON_SIZE,
          willChange: "transform",
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              position: "absolute",
              inset: 0,
            }}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          >
            <img
              src={ICONS[idx].src}
              alt={ICONS[idx].alt}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 0 12px rgba(255,138,0,0.2))",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: "18%",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 14,
            fontWeight: 800,
            color: "#ffffff",
            minWidth: 40,
            textAlign: "right",
            letterSpacing: "0.05em",
          }}
        >
          {pct}%
        </span>
        <div
          style={{
            width: 200,
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              borderRadius: 2,
              background: "linear-gradient(90deg, #ffffff 0%, #ff8a00 33%, #ff6b9d 66%, #4a9eff 100%)",
              boxShadow: "0 0 10px rgba(255,138,0,0.35)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </div>
      </div>
    </div>
  )
}

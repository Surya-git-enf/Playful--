'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

const ICONS = [
  { src: '/svg/chess.png', alt: 'Chess' },
  { src: '/svg/car.png', alt: 'Car' },
  { src: '/svg/ball.png', alt: 'Ball' },
  { src: '/svg/rocket.png', alt: 'Rocket' },
  { src: '/svg/controller.png', alt: 'Controller' },
]

const DROP = 180

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

function preloadAssets(onDone: (p: number) => void) {
  let loaded = 0
  const total = ALL_ASSETS.length
  const tick = () => { loaded++; onDone(Math.min(Math.round((loaded / total) * 100), 100)) }
  ALL_ASSETS.forEach((s) => {
    if (s.endsWith('.mp4')) {
      const v = document.createElement('video'); v.preload = 'metadata'
      v.onloadedmetadata = tick; v.onerror = tick; v.src = s
    } else {
      const i = new Image(); i.onload = tick; i.onerror = tick; i.src = s
    }
  })
}

const raf = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export default function PlayfulLoader({ progress: ext }: { progress?: number }) {
  const [curIdx, setCurIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'wiping'>('idle')
  const idxRef = useRef(0)
  const aliveRef = useRef(true)

  const y = useSpring(-DROP, { stiffness: 120, damping: 13, mass: 1 })
  const sx = useSpring(1, { stiffness: 500, damping: 12 })
  const sy = useSpring(1, { stiffness: 500, damping: 12 })

  useEffect(() => { preloadAssets(setProgress) }, [])

  const pct = ext ?? progress

  useEffect(() => {
    aliveRef.current = true

    const run = async () => {
      await wait(300)

      while (aliveRef.current) {
        const ci = idxRef.current
        const ni = (ci + 1) % ICONS.length

        setNextIdx(null)
        setPhase('idle')

        await wait(50)

        y.set(0)
        sx.set(1.2)
        sy.set(0.78)
        await wait(400)

        sx.set(1)
        sy.set(1)
        y.set(-DROP)
        await wait(420)

        setNextIdx(ni)

        await raf()

        setPhase('wiping')

        await wait(380)

        idxRef.current = ni
        setCurIdx(ni)
        setNextIdx(null)
        setPhase('idle')

        await wait(50)
      }
    }

    run()
    return () => { aliveRef.current = false }
  }, [y, sx, sy])

  const curClip = phase === 'wiping' ? 'inset(0 100% 0 0)' : 'inset(0 0% 0 0)'
  const nextClip = phase === 'wiping' ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)'

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
          width: 'clamp(80px, 10vw, 140px)',
          height: 'clamp(80px, 10vw, 140px)',
          willChange: "transform",
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
        }}
      >
        <img
          key={`cur-${curIdx}`}
          src={ICONS[curIdx].src}
          alt={ICONS[curIdx].alt}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 12px rgba(255,138,0,0.2))",
            clipPath: curClip,
            transition: "clip-path 0.35s ease-in-out",
          }}
        />
        {nextIdx !== null && (
          <img
            key={`next-${nextIdx}`}
            src={ICONS[nextIdx].src}
            alt={ICONS[nextIdx].alt}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 0 12px rgba(255,138,0,0.2))",
              clipPath: nextClip,
              transition: "clip-path 0.35s ease-in-out",
            }}
          />
        )}
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: "47%",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 'clamp(160px, 20vw, 280px)',
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
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 800,
            color: "#ffffff",
            minWidth: 40,
            letterSpacing: "0.05em",
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

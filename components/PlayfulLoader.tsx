'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useSpring, animate } from 'framer-motion'

const ICONS = [
  { src: '/svg/chess.png', alt: 'Chess' },
  { src: '/svg/car.png', alt: 'Car' },
  { src: '/svg/ball.png', alt: 'Ball' },
  { src: '/svg/rocket.png', alt: 'Rocket' },
  { src: '/svg/controller.png', alt: 'Controller' },
]

const ICON_SIZE = 120
const DROP = 260

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
    if (s.endsWith('.mp4')) { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = tick; v.onerror = tick; v.src = s }
    else { const i = new Image(); i.onload = tick; i.onerror = tick; i.src = s }
  })
}

export default function PlayfulLoader({ progress: ext }: { progress?: number }) {
  const [curIdx, setCurIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState(1)
  const [progress, setProgress] = useState(0)
  const [wipeIn, setWipeIn] = useState(0)
  const [wipeOut, setWipeOut] = useState(100)
  const running = useRef(true)

  const y = useSpring(-DROP, { stiffness: 120, damping: 13, mass: 1 })
  const sx = useSpring(1, { stiffness: 500, damping: 12 })
  const sy = useSpring(1, { stiffness: 500, damping: 12 })

  useEffect(() => { preloadAssets(setProgress) }, [])

  const pct = ext ?? progress

  useEffect(() => {
    let timers: NodeJS.Timeout[] = []
    const wait = (ms: number) => new Promise<void>((r) => { const t = setTimeout(r, ms); timers.push(t) })

    const run = async () => {
      while (running.current) {
        // 1. Set next icon
        const ni = (curIdx + 1) % ICONS.length
        setNextIdx(ni)
        setWipeIn(0)
        setWipeOut(100)

        // 2. Fall
        await wait(60)
        y.set(0)
        sx.set(1.2)
        sy.set(0.78)
        await wait(400)

        // 3. Squash recover + rise
        sx.set(1)
        sy.set(1)
        y.set(-DROP)
        await wait(420)

        // 4. Wipe: current OUT + next IN simultaneously
        setWipeOut(0)
        setWipeIn(100)
        await wait(400)

        // 5. Swap
        setCurIdx(ni)
        setWipeIn(0)
        setWipeOut(100)
        await wait(60)
      }
    }

    run()
    return () => { running.current = false; timers.forEach(clearTimeout) }
  }, [y, sx, sy])

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
        {/* Current: wipes OUT to right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 0 0 ${wipeOut}%)`,
            transition: "clip-path 0.38s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <img
            src={ICONS[curIdx].src}
            alt={ICONS[curIdx].alt}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(255,138,0,0.2))" }}
          />
        </div>

        {/* Next: wipes IN from right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${100 - wipeIn}% 0 0)`,
            transition: "clip-path 0.38s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <img
            src={ICONS[nextIdx].src}
            alt={ICONS[nextIdx].alt}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(255,138,0,0.2))" }}
          />
        </div>
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
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 14,
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

'use client'

import { useEffect, useRef, useState } from 'react'

const TOTAL_FRAMES = 145
const pad = (n: number) => String(n).padStart(4, '0')
const FRAME_URL = (n: number) => `/palace/palace-frame_${pad(n)}.webp`

// How much wheel delta = 1 frame advance
const DELTA_PER_FRAME = 18

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const ir = img.naturalWidth / img.naturalHeight
  const cr = w / h
  let dw: number, dh: number, ox: number, oy: number
  if (ir > cr) {
    dh = h; dw = dh * ir; ox = (w - dw) / 2; oy = 0
  } else {
    dw = w; dh = dw / ir; ox = 0; oy = (h - dh) / 2
  }
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, ox, oy, dw, dh)
}

interface Props {
  isActive: boolean
  // Called when user scrolls past last frame (wants next scene)
  onExitForward?: () => void
  // Called when user scrolls back before frame 0 (wants prev scene)
  onExitBackward?: () => void
}

export default function PalaceSequence({ isActive, onExitForward, onExitBackward }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const frameRef = useRef(0)
  const accDeltaRef = useRef(0)
  const rafRef = useRef<number>(0)
  const drawnRef = useRef(-1)
  const needsDrawRef = useRef(false)
  const [loadPct, setLoadPct] = useState(0)
  const [textProgress, setTextProgress] = useState(0)

  // ── Preload all frames ──────────────────────────────────────────
  useEffect(() => {
    let loaded = 0
    const imgs: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES).fill(null)

    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = FRAME_URL(i)
      img.onload = () => {
        loaded++
        setLoadPct(Math.round((loaded / TOTAL_FRAMES) * 100))
        if (drawnRef.current === -1 && i === 0) {
          // Draw frame 0 as soon as it arrives
          needsDrawRef.current = true
        }
      }
      imgs[i] = img
    }
    imagesRef.current = imgs
  }, [])

  // ── Canvas resize ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth, h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        needsDrawRef.current = true
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── RAF draw loop ───────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      if (needsDrawRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const img = imagesRef.current[frameRef.current]
        if (canvas && ctx && img?.complete && img.naturalWidth > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          drawCover(ctx, img, canvas.width / dpr, canvas.height / dpr)
          drawnRef.current = frameRef.current
        }
        needsDrawRef.current = false

        // Update text progress
        const TEXT_START = 100
        const TEXT_END = TOTAL_FRAMES - 1
        const f = frameRef.current
        const tp = f < TEXT_START ? 0 : Math.min(1, (f - TEXT_START) / (TEXT_END - TEXT_START))
        setTextProgress(tp)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Wheel handler — only active when this scene is shown ────────
  useEffect(() => {
    if (!isActive) {
      accDeltaRef.current = 0
      return
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      accDeltaRef.current += e.deltaY

      // Advance/retreat frames
      while (accDeltaRef.current >= DELTA_PER_FRAME) {
        accDeltaRef.current -= DELTA_PER_FRAME
        if (frameRef.current < TOTAL_FRAMES - 1) {
          frameRef.current++
          needsDrawRef.current = true
        } else {
          // Past last frame → hand off to scene manager
          onExitForward?.()
          accDeltaRef.current = 0
          return
        }
      }

      while (accDeltaRef.current <= -DELTA_PER_FRAME) {
        accDeltaRef.current += DELTA_PER_FRAME
        if (frameRef.current > 0) {
          frameRef.current--
          needsDrawRef.current = true
        } else {
          onExitBackward?.()
          accDeltaRef.current = 0
          return
        }
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [isActive, onExitForward, onExitBackward])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#020202' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      />

      {/* Loading bar */}
      {loadPct < 100 && (
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)', width: '180px',
          height: '2px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px', zIndex: 10,
        }}>
          <div style={{
            height: '100%', width: `${loadPct}%`,
            background: '#00eaff', borderRadius: '2px',
            boxShadow: '0 0 8px rgba(0,234,255,0.7)',
            transition: 'width 0.2s ease',
          }} />
        </div>
      )}

      {/* Headline — fades in frames 100–144 */}
      <div
        style={{
          position: 'absolute', bottom: '12%', left: '50%',
          transform: `translateX(-50%) translateY(${(1 - textProgress) * 24}px)`,
          opacity: textProgress,
          textAlign: 'center', pointerEvents: 'none', zIndex: 10,
          transition: 'none',
          willChange: 'opacity, transform',
        }}
      >
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
          color: '#fff',
          textShadow: '0 4px 40px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>
          Kingdoms Never Sleep
        </h2>
      </div>
    </div>
  )
}

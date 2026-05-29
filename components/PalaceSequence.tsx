'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  isActive: boolean
  palaceFrame: React.MutableRefObject<number>
}

const TOTAL_FRAMES = 145
const padded = (n: number) => String(n).padStart(4, '0')
const FRAME_PATH = (n: number) => `/palace/${padded(n)}.jpg`

export default function PalaceSequence({ isActive, palaceFrame }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const titleRef    = useRef<HTMLDivElement>(null)
  const framesRef   = useRef<HTMLImageElement[]>([])
  const loadedCount = useRef(0)
  const currentIdx  = useRef(-1)
  const [loadProgress, setLoadProgress] = useState(0)

  // ── Draw frame ──────────────────────────────────────────
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current
    const img    = framesRef.current[idx]
    if (!canvas || !img || !img.complete || !img.naturalWidth) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const scale = Math.max(canvas.width / iw, canvas.height / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (canvas.width  - sw) / 2
    const sy = (canvas.height - sh) / 2
    ctx.drawImage(img, sx, sy, sw, sh)
    currentIdx.current = idx
  }

  // ── Preload frames ──────────────────────────────────────
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES)
    framesRef.current = images
    loadedCount.current = 0

    // Load first frame immediately so screen isn't blank
    const first = new Image()
    first.onload = () => {
      images[0] = first
      loadedCount.current = 1
      drawFrame(0)
      setLoadProgress(1)
    }
    first.src = FRAME_PATH(1)
    images[0] = first

    // Load rest
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const idx = i
      img.onload = () => {
        loadedCount.current++
        setLoadProgress(loadedCount.current)
      }
      img.src = FRAME_PATH(i + 1)
      images[i] = img
    }

    return () => { framesRef.current = [] }
  }, [])

  // ── Resize canvas ───────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width  = window.innerWidth
        canvasRef.current.height = window.innerHeight
        if (currentIdx.current >= 0) drawFrame(currentIdx.current)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── RAF scrub loop ──────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    let smooth = 0
    let raf: number

    const tick = () => {
      const target = palaceFrame.current
      smooth += (target - smooth) * 0.09
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(smooth)))

      // Draw if frame has changed and image is ready
      if (idx !== currentIdx.current) {
        const img = framesRef.current[idx]
        if (img?.complete && img.naturalWidth) drawFrame(idx)
      }

      // Title: fade in f100–144
      if (titleRef.current) {
        const p = Math.max(0, Math.min(1, (smooth - 100) / 44))
        titleRef.current.style.opacity   = String(p)
        titleRef.current.style.filter    = `blur(${(1 - p) * 14}px)`
        titleRef.current.style.transform =
          `perspective(800px) rotateY(${(1 - p) * -80}deg)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isActive, palaceFrame])

  const pct = Math.round((loadProgress / TOTAL_FRAMES) * 100)

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      // Visible background while frames load
      background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #0d0630 0%, #030118 60%, #010010 100%)',
    }}>

      {/* Frame canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          display: 'block',
        }}
      />

      {/* Loading bar — disappears once all frames loaded */}
      {pct < 100 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2, zIndex: 50, background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #00eaff)',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 8px rgba(0,234,255,0.6)',
          }} />
        </div>
      )}

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(2,5,16,0.75) 0%, transparent 65%),' +
          'linear-gradient(to bottom, rgba(2,5,16,0.4) 0%, transparent 25%, transparent 65%, rgba(2,5,16,0.55) 100%)',
      }} />

      {/* Title — revealed f100–144 by RAF */}
      <div ref={titleRef} style={{
        position: 'absolute', bottom: '10%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30, willChange: 'opacity, filter, transform',
      }}>
        <div className="scene-eyebrow">✦ Palace ✦</div>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(2.8rem, 7vw, 6rem)',
          lineHeight: 1.05, color: '#fff',
          letterSpacing: '-0.01em',
          textShadow: '0 0 60px rgba(139,92,246,0.5), 0 0 120px rgba(139,92,246,0.2)',
        }}>
          Kingdoms Never Sleep
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.65rem, 1.2vw, 0.82rem)',
          color: 'rgba(196,181,253,0.65)',
          marginTop: 14, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Scroll to explore ↓
        </p>
      </div>

      {/* Scroll hint overlay — visible before scrolling */}
      {loadProgress > 0 && palaceFrame.current === 0 && (
        <div style={{
          position: 'absolute', bottom: '4%',
          left: 0, right: 0, textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem', letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase', zIndex: 40,
          animation: 'blurFadeIn 1s ease 0.5s both',
          pointerEvents: 'none',
        }}>
          ↓ &nbsp; Scroll to begin
        </div>
      )}
    </div>
  )
}


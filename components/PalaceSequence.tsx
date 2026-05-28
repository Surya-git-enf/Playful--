
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  isActive: boolean
  palaceFrame: React.MutableRefObject<number>
}

const TOTAL_FRAMES = 145
const FRAME_PATH = (n: number) => `/palace/${String(n).padStart(4, '0')}.jpg`

export default function PalaceSequence({ isActive, palaceFrame }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const framesRef  = useRef<HTMLImageElement[]>([])
  const loadedRef  = useRef(0)
  const readyRef   = useRef(false)
  const currentRef = useRef(0)  // currently drawn frame index

  // -- Preload all frames --
  useEffect(() => {
    const images: HTMLImageElement[] = []
    framesRef.current = images

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = FRAME_PATH(i)
      img.onload = () => {
        loadedRef.current++
        if (loadedRef.current >= TOTAL_FRAMES) {
          readyRef.current = true
          drawFrame(0)
        }
      }
      images.push(img)
    }

    return () => {
      framesRef.current = []
      readyRef.current = false
      loadedRef.current = 0
    }
  }, [])

  // -- Draw a specific frame to canvas --
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = framesRef.current[index]
    if (!canvas || !img || !img.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill canvas maintaining cover aspect
    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth  || img.width
    const ih = img.naturalHeight || img.height
    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (cw - sw) / 2
    const sy = (ch - sh) / 2
    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

  // -- Resize canvas to fill viewport --
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      if (readyRef.current) drawFrame(currentRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // -- RAF loop: read palaceFrame ref → scrub canvas --
  useEffect(() => {
    if (!isActive) return

    let smoothFrame = 0
    let rafId: number

    const tick = () => {
      const target = palaceFrame.current  // 0–144
      smoothFrame += (target - smoothFrame) * 0.10
      const idx = Math.round(smoothFrame)

      if (idx !== currentRef.current && readyRef.current) {
        currentRef.current = idx
        drawFrame(idx)
      }

      // Title fade in when past frame 100
      if (titleRef.current) {
        const progress = Math.max(0, (smoothFrame - 100) / 44)  // 0→1 over f100–144
        titleRef.current.style.opacity = String(progress)
        titleRef.current.style.filter  = `blur(${(1 - progress) * 14}px)`
        titleRef.current.style.transform =
          `perspective(800px) rotateY(${(1 - progress) * -80}deg)`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, palaceFrame])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>

      {/* Frame canvas — full bleed */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Gradient vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(2,5,16,0.7) 0%, transparent 70%),' +
          'linear-gradient(to bottom, rgba(2,5,16,0.35) 0%, transparent 30%, transparent 60%, rgba(2,5,16,0.5) 100%)',
      }} />

      {/* Title — appears at f100–144 */}
      <div
        ref={titleRef}
        style={{
          position: 'absolute', bottom: '10%',
          left: 0, right: 0, textAlign: 'center',
          opacity: 0, zIndex: 30,
          transition: 'none',
          willChange: 'opacity, filter, transform',
        }}
      >
        <div className="scene-eyebrow">✦ Palace ✦</div>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(2.8rem, 7vw, 6rem)',
          lineHeight: 1.05,
          color: '#fff',
          letterSpacing: '-0.01em',
          textShadow: '0 0 60px rgba(139,92,246,0.5), 0 0 120px rgba(139,92,246,0.2)',
        }}>
          Kingdoms Never Sleep
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.65rem, 1.2vw, 0.82rem)',
          color: 'rgba(196,181,253,0.65)',
          marginTop: 14,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Scroll to explore ↓
        </p>
      </div>
    </div>
  )
}

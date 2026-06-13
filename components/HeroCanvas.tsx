'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'
import ChainHeadline from './ChainHeadline'

const TOTAL_SCENES = 4   // scenes 0-4, scene 4 = Space
const TOTAL_FRAMES = 144
const SNAP_LOCK_MS = 900
const TEXT_FADE_START = 100
const FRICTION = 0.80
const FRAMES_PER_DELTA = 0.16

const pad = (n: number) => String(n).padStart(4, '0')

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ZOOM_FACTOR = 1.1;

  const ir = img.naturalWidth / img.naturalHeight, cr = w / h
  let dw: number, dh: number, ox: number, oy: number

  if (ir > cr) {
    dh = h * ZOOM_FACTOR;
    dw = dh * ir;
  } else {
    dw = w * ZOOM_FACTOR;
    dh = dw / ir;
  }

  ox = (w - dw) / 2;
  oy = (h - dh) / 2;

  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, ox, oy, dw, dh)
}

interface Props {
  onRelease: () => void
  onSceneChange: (scene: number) => void
  isReleased: boolean
}

// FIXED: Defined sceneSlogans here so we can pad Scene 0 with spaces!
const sceneSlogans: Record<number, string> = {
  0: '                      ', // Spaces ensure a smooth chain flip transition to Scene 1
  1: 'PIXELS NEVER DIE',
  2: 'FASTER THAN FEAR',
  3: 'WONDER WITHOUT LIMITS',
  4: 'IMAGINE BEYOND GRAVITY'
}

export default function HeroCanvas({ onRelease, onSceneChange, isReleased }: Props) {
  const [scene, setSceneState] = useState(0)
  const [textProgress, setTextProgress] = useState(0)
  const [previousScene, setPreviousScene] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'reverse'>('forward')

  const sceneRef    = useRef(0)
  const frameFloat  = useRef(0)
  const frameDrawn  = useRef(-1)
  const velocity    = useRef(0)
  const snapLocked  = useRef(false)
  const wheelActive = useRef(false)
  const wheelTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasReleased = useRef(false)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const imagesRef   = useRef<(HTMLImageElement | null)[]>([])
  const rafRef      = useRef<number>(0)

  useEffect(() => {
    hasReleased.current = isReleased
  }, [isReleased])

  useEffect(() => {
    if (sceneRef.current !== scene) {
      const prev = sceneRef.current
      setPreviousScene(prev)
      sceneRef.current = scene

      const direction = scene > prev ? 'forward' : 'reverse'
      setAnimationDirection(direction)
      setIsAnimating(true)

      // FIXED: Increased to 2000ms so long text strings have time to finish flipping!
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [scene])

  const setScene = useCallback((n: number) => {
    sceneRef.current = n
    setSceneState(n)
    onSceneChange(n)
  }, [onSceneChange])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width  = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width  = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d')
    const img    = imagesRef.current[idx]
    if (!canvas || !ctx || !img?.complete || img.naturalWidth === 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    drawCover(ctx, img, canvas.width / dpr, canvas.height / dpr)
    frameDrawn.current = idx
  }, [])

  useEffect(() => {
    setupCanvas()
    window.addEventListener('resize', setupCanvas)
    const imgs: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES + 1).fill(null)
    imagesRef.current = imgs
    const f0 = new Image()
    f0.src = `/palace/palace-frame_${pad(0)}.webp`
    f0.onload = () => drawFrame(0)
    imgs[0] = f0
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image(); img.src = `/palace/palace-frame_${pad(i)}.webp`; imgs[i] = img
    }
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas, drawFrame])

  const doRelease = useCallback(() => {
    if (hasReleased.current) return
    hasReleased.current = true
    document.body.style.overflow = 'auto'
    onRelease()
  }, [onRelease])

  const snapTo = useCallback((next: number) => {
    if (snapLocked.current) return
    velocity.current = 0
    if (next > TOTAL_SCENES) {
      snapLocked.current = true
      doRelease()
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
      return
    }
    if (next < 0) return
    snapLocked.current = true
    setScene(next)
    setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
  }, [doRelease, setScene])

  useEffect(() => {
    const loop = () => {
      if (sceneRef.current === 0) {
        if (!wheelActive.current && Math.abs(velocity.current) > 0.03) {
          velocity.current *= FRICTION * 0.95
          frameFloat.current += velocity.current * 0.7
        } else if (!wheelActive.current) {
          velocity.current = 0
        }

        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES, frameFloat.current))
        const idx = Math.round(frameFloat.current)

        if (idx !== frameDrawn.current) {
          drawFrame(idx)

          let tp = 0
          if (idx < TEXT_FADE_START) {
            tp = 0
          } else if (idx >= 120) {
            tp = 1
          } else {
            const progress = (idx - TEXT_FADE_START) / (120 - TEXT_FADE_START)
            tp = progress
          }
          setTextProgress(tp)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFrame, snapTo])

  useEffect(() => {
    const styleId = 'palace-float-keyframes'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `
      document.head.appendChild(styleElement)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const handleWheel = (e: WheelEvent) => {
      if (hasReleased.current) return
      e.preventDefault()
      if (snapLocked.current) return
      const down = e.deltaY > 0

      if (sceneRef.current === 0) {
        velocity.current += e.deltaY * FRAMES_PER_DELTA
        wheelActive.current = true
        if (wheelTimer.current) clearTimeout(wheelTimer.current)
        wheelTimer.current = setTimeout(() => {
          wheelActive.current = false
          if (frameFloat.current >= TOTAL_FRAMES - 1) snapTo(1)
          if (frameFloat.current <= 1) { frameFloat.current = 0; velocity.current = 0 }
        }, 150)
        return
      }
      if (Math.abs(e.deltaY) > 15) snapTo(sceneRef.current + (down ? 1 : -1))
    }

    let ty0 = 0, tyLast = 0, tvY = 0, ttLast = 0
    const onTouchStart = (e: TouchEvent) => {
      ty0 = e.touches[0].clientY; tyLast = ty0; tvY = 0; ttLast = Date.now()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (hasReleased.current) return
      e.preventDefault()
      const now = Date.now()
      const dy = tyLast - e.touches[0].clientY
      tvY = dy / Math.max(1, now - ttLast)
      tyLast = e.touches[0].clientY; ttLast = now
      if (sceneRef.current === 0) {
        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES, frameFloat.current + dy * 0.55))
      }
    }
    const onTouchEnd = () => {
      if (hasReleased.current || snapLocked.current) return
      if (sceneRef.current === 0) {
        velocity.current = tvY * 16.67 * 0.55
        wheelActive.current = false
        if (frameFloat.current >= TOTAL_FRAMES - 4 || velocity.current > 6) { snapTo(1); return }
        if (frameFloat.current <= 3 && velocity.current < -3) { frameFloat.current = 0; velocity.current = 0 }
        return
      }
      const dy = ty0 - tyLast
      if (Math.abs(dy) > 40) snapTo(sceneRef.current + (dy > 0 ? 1 : -1))
    }

    window.addEventListener('wheel',      handleWheel,  { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: false })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      window.removeEventListener('wheel',      handleWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [snapTo])

  const gs = (i: number): React.CSSProperties => ({
    position: 'absolute', inset: 0,
    opacity: scene === i ? 1 : 0,
    pointerEvents: scene === i ? 'auto' : 'none',
    transition: 'opacity 0.85s cubic-bezier(0.65,0.35,1)',
    zIndex: scene === i ? 10 : 0,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: '#020202' }}>

      {/* Scene 0 — Palace */}
      <div style={gs(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block', width: '100vw', height: '100dvh' }} />

        <div style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: `translateX(-50%) translateY(${(1 - textProgress) * 40}px)`,
          opacity: textProgress,
          pointerEvents: 'none',
          zIndex: 20,
          willChange: 'opacity, transform',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif,"Instrument Serif",serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.6rem, 7vw, 6.5rem)',
            color: '#fff',
            margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.2)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            Step into the Kingdom
          </h2>
          {textProgress >= 1 && (
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              width: '100%',
              height: '200%',
              pointerEvents: 'none',
              animation: 'float 6s ease-in-out infinite',
            }}/>
          )}
        </div>

        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(255,212,0,0.1) 0%, transparent 70%)',
          opacity: textProgress * 0.5,
        }}/>
      </div>

      {/* Scene 1 — Retro */}
      <div style={gs(1)}>
        <RetroSequence isActive={scene === 1} />
        <div style={{
          position: 'absolute',
          top: '8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 200,
          padding: '0 5vw',
        }}>
          <ChainHeadline
            text={sceneSlogans[1]}
            previousText={sceneSlogans[previousScene]}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            fontFamily="'Press Start 2P', cursive"
            fontSize="clamp(1.1rem, 4vw, 2.6rem)"
            fontWeight={400}
            color="#FFFFFF"
            letterSpacing="0.04em"
            textShadow="0 6px 0px #000"
          />
        </div>
      </div>

      {/* Scene 2 — Racing */}
      <div style={gs(2)}>
        <RacingSequence isActive={scene === 2} />
        <div style={{
          position: 'absolute',
          top: '8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 200,
          padding: '0 5vw',
        }}>
          <ChainHeadline
            text={sceneSlogans[2]}
            previousText={sceneSlogans[previousScene]}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            fontFamily="'Inter', sans-serif"
            fontSize="clamp(1.4rem, 4.5vw, 3.2rem)"
            fontWeight={800}
            color="#FFFFFF"
            letterSpacing="-0.02em"
            textShadow="0 4px 20px rgba(0,0,0,0.6)"
          />
        </div>
      </div>

      {/* Scene 3 — Open World */}
      <div style={gs(3)}>
        <OpenWorldSequence isActive={scene === 3} />
        <div style={{
          position: 'absolute',
          top: '8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 200,
          padding: '0 5vw',
        }}>
          <ChainHeadline
            text={sceneSlogans[3]}
            previousText={sceneSlogans[previousScene]}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            fontFamily="'Cinzel Decorative', serif"
            fontSize="clamp(1.2rem, 3.5vw, 2.8rem)"
            fontWeight={900}
            color="#FFFFFF"
            letterSpacing="0.04em"
            textShadow="0 2px 0px rgba(0,0,0,1), 0 8px 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,200,80,0.25), 0 0 160px rgba(0,150,60,0.12)"
          />
        </div>
      </div>

      {/* Scene 4 — Space */}
      <div style={gs(4)}>
        <SpaceSequence isActive={scene === 4} />
        <div style={{
          position: 'absolute',
          top: '8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 200,
          padding: '0 5vw',
        }}>
          {/* FIXED: Polaris Font + White Color + White Neon Glow applied! */}
          <ChainHeadline
            text={sceneSlogans[4]}
            previousText={sceneSlogans[previousScene]}
            isAnimating={isAnimating}
            animationDirection={animationDirection}
            fontFamily="'Polaris', sans-serif"
            fontSize="clamp(1.2rem, 3.8vw, 2.8rem)"
            fontWeight={400}
            color="#FFFFFF"
            letterSpacing="0.08em"
            textShadow="0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2)"
          />
        </div>
      </div>
    </div>
  )
          }
      

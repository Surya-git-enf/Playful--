'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'

const TOTAL_SCENES = 4
const TOTAL_FRAMES = 144
const SNAP_LOCK_MS = 1100
const TEXT_FADE_START = 100

const pad = (n: number) => String(n).padStart(4, '0')

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h
  let dw: number, dh: number, ox: number, oy: number
  if (ir > cr) { dh = h; dw = dh * ir; ox = (w - dw) / 2; oy = 0 }
  else { dw = w; dh = dw / ir; ox = 0; oy = (h - dh) / 2 }
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, ox, oy, dw, dh)
}

export default function HeroCanvas() {
  const [scene, setSceneState] = useState(0)
  const [isReleased, setIsReleased] = useState(false)
  const [loadPct, setLoadPct] = useState(0)
  const [textProgress, setTextProgress] = useState(0)

  const sceneRef = useRef(0)
  // Use a float ref for smooth sub-frame interpolation
  const frameFloat = useRef(0)
  const frameDisplayed = useRef(-1)
  const velocity = useRef(0)          // frames/tick momentum
  const snapLocked = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const rafRef = useRef<number>(0)
  // Wheel-end detection
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelActive = useRef(false)

  const setScene = useCallback((n: number) => {
    sceneRef.current = n
    setSceneState(n)
  }, [])

  // ── Preload ──────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0
    const imgs: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES + 1).fill(null)
    for (let i = 0; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/palace/palace-frame_${pad(i)}.webp`
      img.onload = () => {
        loaded++
        setLoadPct(Math.round((loaded / (TOTAL_FRAMES + 1)) * 100))
      }
      imgs[i] = img
    }
    imagesRef.current = imgs
  }, [])

  // ── Canvas resize ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Main RAF loop — momentum + draw ─────────────────────────
  useEffect(() => {
    const FRICTION = 0.82        // higher = more coast (0–1)
    const MIN_VEL = 0.04         // stop threshold
    const FRAMES_PER_DELTA = 0.18 // sensitivity: delta px → frames

    const snapTo = (next: number) => {
      if (snapLocked.current || next < 0) return
      if (next > TOTAL_SCENES) {
        snapLocked.current = true
        setIsReleased(true)
        document.body.style.overflow = 'auto'
        velocity.current = 0
        setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
        return
      }
      snapLocked.current = true
      velocity.current = 0
      setScene(next)
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
    }

    const loop = () => {
      if (sceneRef.current === 0) {
        // Apply friction when wheel not actively spinning
        if (!wheelActive.current && Math.abs(velocity.current) > MIN_VEL) {
          velocity.current *= FRICTION
          frameFloat.current += velocity.current
        } else if (!wheelActive.current) {
          velocity.current = 0
        }

        // Clamp
        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES, frameFloat.current))

        const frameIdx = Math.round(frameFloat.current)

        // Draw only when frame changes
        if (frameIdx !== frameDisplayed.current) {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          const img = imagesRef.current[frameIdx]
          if (canvas && ctx && img?.complete && img.naturalWidth > 0) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            drawCover(ctx, img, canvas.width / dpr, canvas.height / dpr)
            frameDisplayed.current = frameIdx
          }

          // Text progress
          const tp = frameIdx < TEXT_FADE_START
            ? 0
            : Math.min(1, (frameIdx - TEXT_FADE_START) / (TOTAL_FRAMES - TEXT_FADE_START))
          setTextProgress(tp)

          // Auto-advance scene when frames exhausted by momentum
          if (frameIdx >= TOTAL_FRAMES && Math.abs(velocity.current) < MIN_VEL && !wheelActive.current) {
            snapTo(1)
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setScene])

  // ── Input handlers ───────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const FRAMES_PER_DELTA = 0.18
    const TOUCH_MULTIPLIER = 0.6

    const snapTo = (next: number) => {
      if (snapLocked.current || next < 0) return
      if (next > TOTAL_SCENES) {
        snapLocked.current = true
        setIsReleased(true)
        document.body.style.overflow = 'auto'
        velocity.current = 0
        setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
        return
      }
      snapLocked.current = true
      velocity.current = 0
      setScene(next)
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isReleased) return
      e.preventDefault()
      if (snapLocked.current) return

      if (sceneRef.current === 0) {
        // Accumulate velocity — trackpad gives small deltas, mouse wheel gives large
        const delta = e.deltaY * FRAMES_PER_DELTA
        velocity.current += delta

        // Mark wheel as active, reset end-detection timer
        wheelActive.current = true
        if (wheelTimer.current) clearTimeout(wheelTimer.current)
        wheelTimer.current = setTimeout(() => {
          wheelActive.current = false
          // Snap to next scene if coasted past end
          if (frameFloat.current >= TOTAL_FRAMES - 2) snapTo(1)
          // Snap back if barely moved
          if (frameFloat.current < 5) frameFloat.current = 0
        }, 120)
        return
      }

      // Other scenes — snap on intent (>20px delta)
      if (Math.abs(e.deltaY) > 20) {
        snapTo(sceneRef.current + (e.deltaY > 0 ? 1 : -1))
      }
    }

    // ── Touch — velocity from swipe distance ─────────────────
    let touchStartY = 0
    let touchLastY = 0
    let touchVelY = 0
    let touchLastTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchLastY = touchStartY
      touchVelY = 0
      touchLastTime = Date.now()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isReleased) return
      e.preventDefault()

      const now = Date.now()
      const dt = Math.max(1, now - touchLastTime)
      const dy = touchLastY - e.touches[0].clientY
      touchVelY = dy / dt  // px per ms

      touchLastY = e.touches[0].clientY
      touchLastTime = now

      if (sceneRef.current === 0) {
        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES,
          frameFloat.current + dy * TOUCH_MULTIPLIER
        ))
      }
    }

    const handleTouchEnd = () => {
      if (isReleased || snapLocked.current) return

      if (sceneRef.current === 0) {
        // Fling: inject velocity from swipe speed (px/ms → frames/tick at 60fps)
        velocity.current = touchVelY * 16.67 * TOUCH_MULTIPLIER
        wheelActive.current = false

        // Snap to next scene if flung hard enough or past threshold
        if (frameFloat.current >= TOTAL_FRAMES - 5 || velocity.current > 8) {
          snapTo(1)
        } else if (frameFloat.current <= 5 && velocity.current < -4) {
          frameFloat.current = 0
          velocity.current = 0
        }
        return
      }

      const totalDy = touchStartY - touchLastY
      if (Math.abs(totalDy) > 40) {
        snapTo(sceneRef.current + (totalDy > 0 ? 1 : -1))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isReleased, setScene])

  const getSceneStyle = (i: number): React.CSSProperties => ({
    position: 'absolute', inset: 0,
    opacity: scene === i ? 1 : 0,
    pointerEvents: scene === i ? 'auto' : 'none',
    transition: 'opacity 0.85s cubic-bezier(0.65,0,0.35,1)',
    zIndex: scene === i ? 10 : 0,
  })

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: isReleased ? -1 : 100,
      overflow: 'hidden',
      background: '#020202',
      pointerEvents: isReleased ? 'none' : 'auto',
    }}>

      {/* ── Scene 0: Palace ── */}
      <div style={getSceneStyle(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

        {loadPct < 100 && scene === 0 && (
          <div style={{
            position: 'absolute', bottom: '28px', left: '50%',
            transform: 'translateX(-50%)', width: '140px',
            height: '1.5px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', zIndex: 20,
          }}>
            <div style={{
              height: '100%', width: `${loadPct}%`, background: '#00eaff',
              borderRadius: '2px', boxShadow: '0 0 8px rgba(0,234,255,0.6)',
              transition: 'width 0.1s linear',
            }} />
          </div>
        )}

        <div style={{
          position: 'absolute', bottom: '12%', left: '50%',
          transform: `translateX(-50%) translateY(${(1 - textProgress) * 30}px)`,
          opacity: textProgress,
          textAlign: 'center', pointerEvents: 'none', zIndex: 20,
          willChange: 'opacity, transform',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), "Instrument Serif", serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(2.2rem,6vw,5.5rem)',
            color: '#fff', margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
          }}>
            Kingdoms Never Sleep
          </h2>
        </div>
      </div>

      {/* ── Scene 1–4 ── */}
      <div style={getSceneStyle(1)}><RetroSequence isActive={scene === 1} /></div>
      <div style={getSceneStyle(2)}><RacingSequence isActive={scene === 2} /></div>
      <div style={getSceneStyle(3)}><OpenWorldSequence isActive={scene === 3} /></div>
      <div style={getSceneStyle(4)}><SpaceSequence isActive={scene === 4} /></div>

      {/* Scene dots */}
      <div style={{
        position: 'absolute', right: '28px', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 200,
      }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: '4px',
            height: scene === i ? '24px' : '4px',
            borderRadius: '4px',
            background: scene === i ? '#fff' : 'rgba(255,255,255,0.18)',
            cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.65,0,0.35,1)',
          }} />
        ))}
      </div>
    </div>
  )
        }

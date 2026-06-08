'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'

const TOTAL_SCENES = 4
const TOTAL_FRAMES = 144
const SCRUB_STEP = 6
const SNAP_LOCK_MS = 900
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
  const frameRef = useRef(0)
  const snapLocked = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const needsDrawRef = useRef(false)
  const rafRef = useRef<number>(0)

  const setScene = useCallback((n: number) => {
    sceneRef.current = n
    setSceneState(n)
  }, [])

  // ── Preload palace frames ──────────────────────────────────────
  useEffect(() => {
    let loaded = 0
    const imgs: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES + 1).fill(null)
    for (let i = 0; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/palace/palace-frame_${pad(i)}.webp`
      img.onload = () => {
        loaded++
        setLoadPct(Math.round((loaded / (TOTAL_FRAMES + 1)) * 100))
        if (i === 0) needsDrawRef.current = true
      }
      imgs[i] = img
    }
    imagesRef.current = imgs
  }, [])

  // ── Canvas resize ──────────────────────────────────────────────
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
      if (ctx) { ctx.scale(dpr, dpr); needsDrawRef.current = true }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── RAF draw loop ──────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      if (needsDrawRef.current && sceneRef.current === 0) {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const img = imagesRef.current[frameRef.current]
        if (canvas && ctx && img?.complete && img.naturalWidth > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          drawCover(ctx, img, canvas.width / dpr, canvas.height / dpr)
        }
        needsDrawRef.current = false
        const f = frameRef.current
        const tp = f < TEXT_FADE_START ? 0 : Math.min(1, (f - TEXT_FADE_START) / (TOTAL_FRAMES - TEXT_FADE_START))
        setTextProgress(tp)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Scroll & touch ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const snapTo = (next: number) => {
      if (snapLocked.current || next < 0) return
      if (next > TOTAL_SCENES) {
        snapLocked.current = true
        setIsReleased(true)
        document.body.style.overflow = 'auto'
        setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
        return
      }
      snapLocked.current = true
      setScene(next)
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isReleased) return
      e.preventDefault()
      if (snapLocked.current) return
      const down = e.deltaY > 0

      if (sceneRef.current === 0) {
        if (down && frameRef.current < TOTAL_FRAMES) {
          frameRef.current = Math.min(TOTAL_FRAMES, frameRef.current + SCRUB_STEP)
          needsDrawRef.current = true
          return
        }
        if (!down && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - SCRUB_STEP)
          needsDrawRef.current = true
          return
        }
      }
      snapTo(sceneRef.current + (down ? 1 : -1))
    }

    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    const handleTouchMove = (e: TouchEvent) => { if (!isReleased) e.preventDefault() }
    const handleTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40 || snapLocked.current || isReleased) return
      const down = dy > 0
      if (sceneRef.current === 0) {
        if (down && frameRef.current < TOTAL_FRAMES) {
          frameRef.current = Math.min(TOTAL_FRAMES, frameRef.current + SCRUB_STEP * 8)
          needsDrawRef.current = true
          return
        }
        if (!down && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - SCRUB_STEP * 8)
          needsDrawRef.current = true
          return
        }
      }
      snapTo(sceneRef.current + (down ? 1 : -1))
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

      {/* ── Scene 0: Palace canvas (always mounted) ── */}
      <div style={getSceneStyle(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

        {/* Loading bar */}
        {loadPct < 100 && scene === 0 && (
          <div style={{
            position: 'absolute', bottom: '28px', left: '50%',
            transform: 'translateX(-50%)', width: '160px',
            height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', zIndex: 20,
          }}>
            <div style={{
              height: '100%', width: `${loadPct}%`,
              background: '#00eaff', borderRadius: '2px',
              boxShadow: '0 0 8px rgba(0,234,255,0.7)',
              transition: 'width 0.15s ease',
            }} />
          </div>
        )}

        {/* Headline */}
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%',
          transform: `translateX(-50%) translateY(${(1 - textProgress) * 28}px)`,
          opacity: textProgress,
          textAlign: 'center', pointerEvents: 'none', zIndex: 20,
          willChange: 'opacity, transform',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), serif',
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

      {/* ── Scene 1: Retro ── */}
      <div style={getSceneStyle(1)}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* ── Scene 2: Racing ── */}
      <div style={getSceneStyle(2)}>
        <RacingSequence isActive={scene === 2} />
      </div>

      {/* ── Scene 3: Open World ── */}
      <div style={getSceneStyle(3)}>
        <OpenWorldSequence isActive={scene === 3} />
      </div>

      {/* ── Scene 4: Space ── */}
      <div style={getSceneStyle(4)}>
        <SpaceSequence isActive={scene === 4} />
      </div>

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

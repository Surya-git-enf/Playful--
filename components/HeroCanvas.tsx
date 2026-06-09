'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'

const TOTAL_SCENES   = 4
const TOTAL_FRAMES   = 144
const SNAP_LOCK_MS   = 900
const TEXT_FADE_START = 100
const FRICTION       = 0.80
const FRAMES_PER_DELTA = 0.16

const pad = (n: number) => String(n).padStart(4, '0')

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ZOOM_FACTOR = 1.1
  const ir = img.naturalWidth / img.naturalHeight, cr = w / h
  let dw: number, dh: number, ox: number, oy: number
  if (ir > cr) { dh = h * ZOOM_FACTOR; dw = dh * ir }
  else         { dw = w * ZOOM_FACTOR; dh = dw / ir  }
  ox = (w - dw) / 2; oy = (h - dh) / 2
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, ox, oy, dw, dh)
}

interface Props {
  onRelease: () => void
  onSceneChange: (scene: number) => void
  isReleased: boolean
}

export default function HeroCanvas({ onRelease, onSceneChange, isReleased }: Props) {
  const [scene, setSceneState] = useState(0)
  const [textProgress, setTextProgress] = useState(0)

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

  // ── KEY ADDITION: ref to RetroSequence's exposed handle ─────────────────
  const retroRef    = useRef<RetroHandle>(null)

  useEffect(() => { hasReleased.current = isReleased }, [isReleased])

  const setScene = useCallback((n: number) => {
    sceneRef.current = n
    setSceneState(n)
    onSceneChange(n)
    // Reset retro world when leaving it
    if (n !== 1) retroRef.current?.reset()
  }, [onSceneChange])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width  = window.innerWidth  * dpr
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

  // RAF loop
  useEffect(() => {
    const loop = () => {
      if (sceneRef.current === 0) {
        if (!wheelActive.current && Math.abs(velocity.current) > 0.05) {
          velocity.current *= FRICTION
          frameFloat.current += velocity.current
        } else if (!wheelActive.current) {
          velocity.current = 0
        }
        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES, frameFloat.current))
        const idx = Math.round(frameFloat.current)
        if (idx !== frameDrawn.current) {
          drawFrame(idx)
          const tp = idx < TEXT_FADE_START ? 0
            : Math.min(1, (idx - TEXT_FADE_START) / (TOTAL_FRAMES - TEXT_FADE_START))
          setTextProgress(tp)
          if (idx >= TOTAL_FRAMES && !wheelActive.current && Math.abs(velocity.current) < 0.1)
            snapTo(1)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFrame, snapTo])

  // ── WHEEL + TOUCH ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const handleWheel = (e: WheelEvent) => {
      if (hasReleased.current) return
      e.preventDefault()
      if (snapLocked.current) return

      const down = e.deltaY > 0

      // ── SCENE 0 (Palace frame scrub) ──────────────────────────────────
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

      // ── SCENE 1 (Retro world) — delegate to RetroSequence ─────────────
      // Only let HeroCanvas snap away if Retro is at its boundary.
      if (sceneRef.current === 1) {
        const retro = retroRef.current
        const dir   = down ? "down" : "up"

        if (retro && retro.isAtEdge(dir)) {
          // Retro world is at its edge — HeroCanvas takes over and snaps scenes
          snapTo(sceneRef.current + (down ? 1 : -1))
        } else if (retro) {
          // Retro world has more panels — let it scroll internally
          retro.onScroll(e.deltaY)
        }
        return
      }

      // ── ALL OTHER SCENES — snap between worlds ─────────────────────────
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
      const dy  = tyLast - e.touches[0].clientY
      tvY    = dy / Math.max(1, now - ttLast)
      tyLast = e.touches[0].clientY; ttLast = now
      if (sceneRef.current === 0) {
        frameFloat.current = Math.max(0, Math.min(TOTAL_FRAMES, frameFloat.current + dy * 0.55))
      }
    }
    const onTouchEnd = () => {
      if (hasReleased.current || snapLocked.current) return

      if (sceneRef.current === 0) {
        velocity.current    = tvY * 16.67 * 0.55
        wheelActive.current = false
        if (frameFloat.current >= TOTAL_FRAMES - 4 || velocity.current > 6) { snapTo(1); return }
        if (frameFloat.current <= 3 && velocity.current < -3) { frameFloat.current = 0; velocity.current = 0 }
        return
      }

      // For scene 1 (Retro), RetroSequence's own touchend handler fires first
      // (with stopPropagation if it consumed the event), so we only reach here
      // when Retro is at its boundary. Fall through to normal snap logic.
      const dy = ty0 - tyLast
      if (Math.abs(dy) > 40) snapTo(sceneRef.current + (dy > 0 ? 1 : -1))
    }

    window.addEventListener('wheel',      handleWheel,  { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true  })
    window.addEventListener('touchmove',  onTouchMove,  { passive: false })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true  })
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
    transition: 'opacity 0.85s cubic-bezier(0.65,0,0.35,1)',
    zIndex: scene === i ? 10 : 0,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: '#020202' }}>

      {/* Scene 0 — Palace */}
      <div style={gs(0)}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100vw', height: '100dvh' }}
        />
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%',
          transform: `translateX(-50%) translateY(${(1 - textProgress) * 30}px)`,
          opacity: textProgress, textAlign: 'center',
          pointerEvents: 'none', zIndex: 20, willChange: 'opacity, transform',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif,"Instrument Serif",serif)',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(2.2rem,6vw,5.5rem)',
            color: '#fff', margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
          }}>Step into the Kingdom</h2>
        </div>
      </div>

      {/* Scene 1 — Retro (ref wired to retroRef so HeroCanvas can talk to it) */}
      <div style={gs(1)}>
        <RetroSequence ref={retroRef} isActive={scene === 1} />
      </div>

      <div style={gs(2)}><RacingSequence   isActive={scene === 2} /></div>
      <div style={gs(3)}><OpenWorldSequence isActive={scene === 3} /></div>
      <div style={gs(4)}><SpaceSequence     isActive={scene === 4} /></div>
    </div>
  )
      }
      

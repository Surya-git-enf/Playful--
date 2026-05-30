
'use client'

import { useEffect, useRef, useState } from 'react'
import RetroSequence     from './RetroSequence'
import RacingSequence    from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence     from './SpaceSequence'

const PALACE_TOTAL = 144
const PALACE_STEP  = 8
const SNAP_LOCK_MS = 950
const framePath    = (n: number) => `/palace/${String(n + 1).padStart(4, '0')}.jpg`

export default function HeroCanvas() {
  const [scene, setSceneState] = useState(0)
  const sceneRef    = useRef(0)
  const snapLocked  = useRef(false)
  // hidden = slid off screen but still mounted so we can bring it back
  const [hidden, setHidden] = useState(false)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const imgsRef     = useRef<HTMLImageElement[]>([])
  const frameRef    = useRef(0)
  const smoothRef   = useRef(0)
  const drawnRef    = useRef(-1)
  const [loadPct, setLoadPct] = useState(0)
  const palTitleRef = useRef<HTMLDivElement>(null)
  const [transitioning, setTransitioning] = useState(false)

  const setScene = (n: number) => { sceneRef.current = n; setSceneState(n) }

  // ── Snap to scene ────────────────────────────────────────────
  const snapTo = (next: number) => {
    if (snapLocked.current) return
    if (next < 0) return

    // Scroll past space → release to cards
    if (next >= 5) {
      snapLocked.current = true
      setHidden(true)
      document.body.style.overflow = 'auto'
      // scroll to cards top
      window.scrollTo({ top: 0, behavior: 'instant' })
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
      return
    }

    snapLocked.current = true
    setTransitioning(true)
    setTimeout(() => setTransitioning(false), 200)
    setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
    setScene(next)
  }

  // ── Wheel / touch / key — registered ONCE, empty deps ────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const onWheel = (e: WheelEvent) => {
      // If hidden (cards visible): only handle scroll-up at page top
      if (hidden) {
        if (window.scrollY === 0 && e.deltaY < 0) {
          e.preventDefault()
          // Bring hero back at space scene
          setHidden(false)
          document.body.style.overflow = 'hidden'
          setScene(4)
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
        return
      }

      e.preventDefault()
      const down = e.deltaY > 0

      if (sceneRef.current === 0) {
        if (down && frameRef.current < PALACE_TOTAL) {
          frameRef.current = Math.min(PALACE_TOTAL, frameRef.current + PALACE_STEP)
          return
        }
        if (!down && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - PALACE_STEP)
          return
        }
      }

      snapTo(sceneRef.current + (down ? 1 : -1))
    }

    let ty = 0
    const onTS = (e: TouchEvent) => { ty = e.touches[0].clientY }
    const onTE = (e: TouchEvent) => {
      const delta = ty - e.changedTouches[0].clientY
      if (Math.abs(delta) < 50) return
      const down = delta > 0

      if (hidden) {
        if (window.scrollY === 0 && !down) {
          setHidden(false)
          document.body.style.overflow = 'hidden'
          setScene(4)
        }
        return
      }

      if (sceneRef.current === 0) {
        if (down && frameRef.current < PALACE_TOTAL) {
          frameRef.current = Math.min(PALACE_TOTAL, frameRef.current + PALACE_STEP * 3)
          return
        }
        if (!down && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - PALACE_STEP * 3)
          return
        }
      }
      snapTo(sceneRef.current + (down ? 1 : -1))
    }

    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)) return
      if (hidden) return
      e.preventDefault()
      const down = ['ArrowDown','PageDown',' '].includes(e.key)
      if (sceneRef.current > 0 || (down ? frameRef.current >= PALACE_TOTAL : frameRef.current <= 0)) {
        snapTo(sceneRef.current + (down ? 1 : -1))
      }
    }

    window.addEventListener('wheel',      onWheel, { passive: false })
    window.addEventListener('touchstart', onTS,    { passive: true })
    window.addEventListener('touchend',   onTE,    { passive: true })
    window.addEventListener('keydown',    onKey)

    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTS)
      window.removeEventListener('touchend',   onTE)
      window.removeEventListener('keydown',    onKey)
      document.body.style.overflow = 'auto'
    }
  }, [hidden]) // re-register when hidden flips so closure is fresh

  // ── Preload palace frames ─────────────────────────────────────
  useEffect(() => {
    const total = PALACE_TOTAL + 1
    const imgs: HTMLImageElement[] = new Array(total)
    imgsRef.current = imgs
    let loaded = 0

    for (let i = 0; i < total; i++) {
      const img = new Image()
      img.onload = () => {
        loaded++
        setLoadPct(Math.round((loaded / total) * 100))
        if (i === 0) drawAt(0)
      }
      img.src = framePath(i)
      imgs[i] = img
    }
    return () => { imgsRef.current = [] }
  }, [])

  // ── Canvas resize ─────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current
      if (!c) return
      c.width  = window.innerWidth
      c.height = window.innerHeight
      if (drawnRef.current >= 0) drawAt(drawnRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Draw frame (cover-fit) ─────────────────────────────────────
  const drawAt = (idx: number) => {
    const c   = canvasRef.current
    const img = imgsRef.current[idx]
    if (!c || !img?.complete || !img.naturalWidth) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight)
    const sw = img.naturalWidth  * scale
    const sh = img.naturalHeight * scale
    ctx.drawImage(img, (c.width - sw) / 2, (c.height - sh) / 2, sw, sh)
    drawnRef.current = idx
  }

  // ── Palace RAF ────────────────────────────────────────────────
  useEffect(() => {
    let raf: number
    const tick = () => {
      if (sceneRef.current === 0 && !hidden) {
        smoothRef.current += (frameRef.current - smoothRef.current) * 0.09
        const idx = Math.min(PALACE_TOTAL, Math.max(0, Math.round(smoothRef.current)))
        if (idx !== drawnRef.current) drawAt(idx)

        if (palTitleRef.current) {
          const p = Math.max(0, Math.min(1, (smoothRef.current - 100) / 44))
          palTitleRef.current.style.opacity   = String(p)
          palTitleRef.current.style.filter    = `blur(${(1 - p) * 14}px)`
          palTitleRef.current.style.transform =
            `perspective(800px) rotateY(${(1 - p) * -80}deg)`
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hidden])

  const DOTS = ['Palace','Retro','Racing','World','Space']

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden',
      background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #0d0630 0%, #030118 60%, #010010 100%)',
      // Slide up when hidden, slide back when not
      transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.75s cubic-bezier(0.77,0,0.18,1)',
      pointerEvents: hidden ? 'none' : 'auto',
    }}>

      {/* Palace canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'block',
        opacity: scene === 0 ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }} />

      {/* Palace loading bar */}
      {scene === 0 && loadPct < 100 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, zIndex: 60, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: `${loadPct}%`, background: 'linear-gradient(90deg,#8b5cf6,#00eaff)', transition: 'width 0.3s ease', boxShadow: '0 0 8px rgba(0,234,255,0.7)' }} />
        </div>
      )}

      {/* Palace vignette */}
      {scene === 0 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(2,5,16,0.8) 0%, transparent 65%), linear-gradient(to bottom, rgba(2,5,16,0.45) 0%, transparent 25%, transparent 65%, rgba(2,5,16,0.6) 100%)',
        }} />
      )}

      {/* Palace title */}
      <div ref={palTitleRef} style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30, willChange: 'opacity,filter,transform', pointerEvents: 'none',
        display: scene === 0 ? 'block' : 'none',
      }}>
        <div className="scene-eyebrow">✦ Palace ✦</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(2.8rem,7vw,6rem)', lineHeight: 1.05, color: '#fff', textShadow: '0 0 60px rgba(139,92,246,0.5)' }}>
          Kingdoms Never Sleep
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem,1.2vw,0.82rem)', color: 'rgba(196,181,253,0.65)', marginTop: 14, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Scroll to explore ↓
        </p>
      </div>

      {/* Retro */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: scene === 1 ? 1 : 0,
        transform: scene === 1 ? 'translateY(0)' : scene < 1 ? 'translateY(100%)' : 'translateY(-100%)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.77,0,0.18,1)',
        pointerEvents: scene === 1 ? 'auto' : 'none',
      }}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* Racing */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: scene === 2 ? 1 : 0,
        transform: scene === 2 ? 'translateY(0)' : scene < 2 ? 'translateY(100%)' : 'translateY(-100%)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.77,0,0.18,1)',
        pointerEvents: scene === 2 ? 'auto' : 'none',
      }}>
        <RacingSequence isActive={scene === 2} />
      </div>

      {/* Open World */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: scene === 3 ? 1 : 0,
        transform: scene === 3 ? 'translateY(0)' : scene < 3 ? 'translateY(100%)' : 'translateY(-100%)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.77,0,0.18,1)',
        pointerEvents: scene === 3 ? 'auto' : 'none',
      }}>
        <OpenWorldSequence isActive={scene === 3} />
      </div>

      {/* Space */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: scene === 4 ? 1 : 0,
        transform: scene === 4 ? 'translateY(0)' : scene < 4 ? 'translateY(100%)' : 'translateY(-100%)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.77,0,0.18,1)',
        pointerEvents: scene === 4 ? 'auto' : 'none',
      }}>
        <SpaceSequence isActive={scene === 4} />
      </div>

      {/* Flash overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(2,5,16,0.5)', opacity: transitioning ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: 'none' }} />

      {/* Scene dots */}
      <div style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 150, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DOTS.map((label, i) => (
          <div key={i} title={label} onClick={() => snapTo(i)} style={{
            width: 6, height: scene === i ? 22 : 6, borderRadius: 99, cursor: 'pointer',
            background: scene === i ? '#00eaff' : 'rgba(255,255,255,0.2)',
            boxShadow: scene === i ? '0 0 8px #00eaff,0 0 16px rgba(0,234,255,0.4)' : 'none',
            transition: 'all 0.4s ease', border: '1px solid rgba(255,255,255,0.1)',
          }} />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-arrow-item" />
        <div className="scroll-arrow-item" />
        <div className="scroll-arrow-item" />
      </div>
    </div>
  )
      }
      

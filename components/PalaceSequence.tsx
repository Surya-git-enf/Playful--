
```react
'use client'

import React, { useEffect, useRef, useState } from 'react'

// ============================================================================
// 1. GLOBAL STYLES & TYPOGRAPHY (Injecting Premium Fonts)
// ============================================================================
const injectStyles = () => {
  if (typeof document === 'undefined' || document.getElementById('playful-styles')) return
  const style = document.createElement('style')
  style.id = 'playful-styles'
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@200;300;400;500;700&display=swap');
    
    :root {
      --bg-obsidian: #020202;
      --bg-slate: #0A0B0E;
      --text-main: #F5F5F7;
      --text-muted: rgba(255, 255, 255, 0.5);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --glass-bg: rgba(10, 11, 14, 0.4);
    }
    
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg-obsidian); color: var(--text-main); font-family: 'Inter', sans-serif; overflow: hidden; }
    
    .font-display { font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
    .font-ui { font-family: 'Inter', sans-serif; }
    
    .glass-panel {
      background: var(--glass-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: var(--glass-border);
      border-radius: 16px;
    }

    /* Premium minimalist scrollbar */
    ::-webkit-scrollbar { width: 0px; }
  `
  document.head.appendChild(style)
}

// ============================================================================
// 2. PALACE SEQUENCE (The Canvas Engine)
// ============================================================================
const PALACE_TOTAL_FRAMES = 144
const padded = (n) => String(n).padStart(4, '0')

// Note: Using a placeholder image generator for the preview since local images aren't available here.
// In your project, change this back to: `/palace/palace-frame_${padded(n)}.webp`
const FRAME_PATH = (n) => `https://picsum.photos/id/${(n % 50) + 10}/1920/1080` 

function PalaceSequence({ isActive, frameRef }) {
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const framesRef = useRef([])
  const drawnRef = useRef(-1)
  const [loadedPct, setLoadedPct] = useState(0)

  // -- Draw Frame Logic --
  const drawAt = (idx) => {
    const c = canvasRef.current
    const img = framesRef.current[idx]
    if (!c || !img?.complete || !img.naturalWidth) return
    
    const ctx = c.getContext('2d')
    if (!ctx) return
    
    // Cover-fit calculation
    const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight)
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const sx = (c.width - sw) / 2
    const sy = (c.height - sh) / 2
    
    ctx.drawImage(img, sx, sy, sw, sh)
    drawnRef.current = idx
  }

  // -- Preload Images --
  useEffect(() => {
    let loaded = 0
    const images = new Array(PALACE_TOTAL_FRAMES + 1)
    framesRef.current = images

    for (let i = 0; i <= PALACE_TOTAL_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        loaded++
        setLoadedPct(Math.round((loaded / (PALACE_TOTAL_FRAMES + 1)) * 100))
        if (i === 0) drawAt(0)
      }
      img.src = FRAME_PATH(i + 1)
      images[i] = img
    }
    return () => { framesRef.current = [] }
  }, [])

  // -- Canvas Resize --
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        if (drawnRef.current >= 0) drawAt(drawnRef.current)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // -- RAF Render Loop (Smooth Scrub Engine) --
  useEffect(() => {
    let smoothFrame = frameRef.current
    let raf

    const tick = () => {
      if (isActive) {
        // Smooth interpolation for that buttery Apple feel (Lerp 0.08)
        smoothFrame += (frameRef.current - smoothFrame) * 0.08
        const currentIdx = Math.min(PALACE_TOTAL_FRAMES, Math.max(0, Math.round(smoothFrame)))
        
        if (currentIdx !== drawnRef.current) {
          drawAt(currentIdx)
        }

        // Animate text gracefully in the last 40 frames
        if (titleRef.current) {
          const progress = Math.max(0, Math.min(1, (smoothFrame - 100) / 44))
          titleRef.current.style.opacity = String(progress)
          titleRef.current.style.transform = `translateY(${(1 - progress) * 20}px)`
          titleRef.current.style.filter = `blur(${(1 - progress) * 10}px)`
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isActive, frameRef])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          display: 'block', objectFit: 'cover'
        }}
      />
      
      {/* Sleek Loading Bar */}
      {loadedPct < 100 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ height: '100%', width: `${loadedPct}%`, background: '#FFFFFF', transition: 'width 0.2s ease' }} />
        </div>
      )}

      {/* Cinematic Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(2,2,2,0.9) 0%, rgba(2,2,2,0.4) 25%, transparent 60%)'
      }} />

      {/* Elegant Typography (Bottom Center) */}
      <div ref={titleRef} style={{
        position: 'absolute', bottom: '12%', left: '0', right: '0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform, filter'
      }}>
        <span className="font-ui" style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✦ Palace ✦
        </span>
        <h2 className="font-display" style={{
          fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 500, margin: 0,
          color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          Kingdoms Never Sleep
        </h2>
      </div>
    </div>
  )
}

// ============================================================================
// 3. PLACEHOLDER SCENES (With Premium Typography Positions)
// ============================================================================
const ScenePlaceholder = ({ title, eyebrow, isActive }) => (
  <div style={{
    position: 'absolute', inset: 0, 
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: '15vh', // Top middle position
    background: 'var(--bg-slate)',
  }}>
    <div style={{
      opacity: isActive ? 1 : 0, 
      transform: isActive ? 'translateY(0)' : 'translateY(20px)',
      filter: isActive ? 'blur(0)' : 'blur(10px)',
      transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      textAlign: 'center'
    }}>
      <span className="font-ui" style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {eyebrow}
      </span>
      <h2 className="font-display" style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', fontWeight: 400, margin: '8px 0 0 0', color: '#FFF' }}>
        {title}
      </h2>
    </div>
  </div>
)

const SpacePromptUI = ({ isActive }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-obsidian)' }}>
    {/* Space Background Layer */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, #1A1F35 0%, #020202 70%)' }} />
    
    {/* Top Text */}
    <div style={{
      position: 'absolute', top: '15vh', left: 0, right: 0, textAlign: 'center',
      opacity: isActive ? 1 : 0, transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
    }}>
      <span className="font-ui" style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Stage 5 · Space
      </span>
      <h2 className="font-display" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 300, margin: '8px 0 0 0' }}>
        Beyond Orbit
      </h2>
    </div>

    {/* Prompt UI (Center) */}
    <div style={{
      position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
      opacity: isActive ? 1 : 0, filter: isActive ? 'blur(0)' : 'blur(12px)',
      transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
      width: 'min(90vw, 600px)'
    }}>
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="A cinematic space shooter..." 
          className="font-ui"
          style={{ 
            flex: 1, background: 'transparent', border: 'none', color: '#FFF', 
            padding: '16px 20px', fontSize: '1rem', outline: 'none' 
          }} 
        />
        <button style={{
          background: '#FFFFFF', color: '#000000', border: 'none', borderRadius: '12px',
          padding: '14px 28px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Inter', sans-serif"
        }}>
          Build it
        </button>
      </div>
    </div>
  </div>
)


// ============================================================================
// 4. MASTER ENGINE (HeroCanvas)
// ============================================================================
const TOTAL_SCENES = 4
const PALACE_SCRUB_STEP = 8
const SNAP_LOCK_MS = 1000

export default function App() {
  useEffect(() => { injectStyles() }, [])

  const [scene, setSceneState] = useState(0)
  const sceneRef = useRef(0)
  const frameRef = useRef(0)
  const snapLocked = useRef(false)

  const setScene = (n) => {
    sceneRef.current = n
    setSceneState(n)
  }

  const snapTo = (next) => {
    if (snapLocked.current || next < 0 || next > TOTAL_SCENES) return
    snapLocked.current = true
    setScene(next)
    setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
  }

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      if (snapLocked.current) return

      const isScrollingDown = e.deltaY > 0

      if (sceneRef.current === 0) {
        if (isScrollingDown && frameRef.current < PALACE_TOTAL_FRAMES) {
          frameRef.current = Math.min(PALACE_TOTAL_FRAMES, frameRef.current + PALACE_SCRUB_STEP)
          return
        }
        if (!isScrollingDown && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - PALACE_SCRUB_STEP)
          return
        }
      }
      snapTo(sceneRef.current + (isScrollingDown ? 1 : -1))
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const getSceneStyle = (index) => ({
    position: 'absolute', inset: 0,
    opacity: scene === index ? 1 : 0,
    pointerEvents: scene === index ? 'auto' : 'none',
    transition: 'opacity 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
    zIndex: scene === index ? 10 : 0,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--bg-obsidian)' }}>
      
      {/* Scene 0: Palace */}
      <div style={getSceneStyle(0)}>
        <PalaceSequence isActive={scene === 0} frameRef={frameRef} />
      </div>

      {/* Scene 1: Retro */}
      <div style={getSceneStyle(1)}>
        <ScenePlaceholder isActive={scene === 1} eyebrow="Stage 2 · Retro" title="Pixels Never Died" />
      </div>

      {/* Scene 2: Racing */}
      <div style={getSceneStyle(2)}>
        <ScenePlaceholder isActive={scene === 2} eyebrow="Stage 3 · Racing" title="Heads Up, Gear" />
      </div>

      {/* Scene 3: Open World */}
      <div style={getSceneStyle(3)}>
        <ScenePlaceholder isActive={scene === 3} eyebrow="Stage 4 · Open World" title="Every Path Breathes" />
      </div>

      {/* Scene 4: Space + Prompt */}
      <div style={getSceneStyle(4)}>
        <SpacePromptUI isActive={scene === 4} />
      </div>

      {/* Progress Indicator */}
      <div style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 50 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} onClick={() => snapTo(i)} style={{
            width: '4px', height: scene === i ? '24px' : '4px', borderRadius: '4px',
            backgroundColor: scene === i ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)', cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.65, 0, 0.35, 1)'
          }} />
        ))}
      </div>
    </div>
  )
}

```
    

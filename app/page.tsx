
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamically import sequences (assuming these live in your components folder)
const RetroSequence = dynamic(() => import('../components/RetroSequence').catch(() => () => <div />), { ssr: false })
const RacingSequence = dynamic(() => import('../components/RacingSequence').catch(() => () => <div />), { ssr: false })
const OpenWorldSequence = dynamic(() => import('../components/OpenWorldSequence').catch(() => () => <div />), { ssr: false })
const SpaceSequence = dynamic(() => import('../components/SpaceSequence').catch(() => () => <div />), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards').catch(() => () => <div />),  { ssr: false })

const TOTAL_SCENES = 4
const TOTAL_FRAMES = 144
const SNAP_LOCK_MS = 900
const TEXT_FADE_START = 100
const FRICTION = 0.80
const FRAMES_PER_DELTA = 0.16
const SCENE_FADE_S = 0.85

const pad = (n: number) => String(n).padStart(4, '0')

// ------------------------------------------------------------------
// 1. PRELOADER COMPONENT
// ------------------------------------------------------------------
function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let loaded = 0
    const totalToLoad = TOTAL_FRAMES + 1
    const images: HTMLImageElement[] = []

    for (let i = 0; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/palace/palace-frame_${pad(i)}.webp`
      
      const handleLoad = () => {
        loaded++
        setProgress(Math.floor((loaded / totalToLoad) * 100))
        if (loaded >= totalToLoad) {
          setTimeout(onComplete, 400) // Small delay so user sees 100%
        }
      }

      img.onload = handleLoad
      img.onerror = handleLoad // Fallback so it doesn't hang forever if 1 frame is missing
      images.push(img)
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#02030a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'var(--font-orbitron, "Orbitron", sans-serif)'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ 
          width: 50, height: 50, borderRadius: '50%', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#00c8ff', marginBottom: 24 
        }}
      />
      <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em' }}>
        {progress}%
      </div>
      <div style={{ 
        fontSize: '12px', color: 'rgba(255,255,255,0.4)', 
        marginTop: 8, letterSpacing: '0.25em' 
      }}>
        INITIALIZING WORLD
      </div>
    </div>
  )
}

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

// ------------------------------------------------------------------
// 2. GLOBAL HEADLINE SYSTEM
// ------------------------------------------------------------------
const SCENE_CONFIG: Record<number, { text: string, font: string, scale: number, style: React.CSSProperties }> = {
  0: { text: "", font: "var(--font-bebas, 'Bebas Neue', sans-serif)", scale: 1, style: {} },
  1: {
    text: "PIXELS NEVER DIE", font: "'Press Start 2P', cursive", scale: 0.75,
    style: {
      fontWeight: 400, backgroundImage: 'linear-gradient(180deg, #FFD400 0%, #FF3300 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
      filter: 'drop-shadow(0px 3px 0px rgba(0,0,0,1))', lineHeight: '1.2',
    }
  },
  2: {
    text: "CHASE THE HORIZON", font: "'Bebas Neue', sans-serif", scale: 1.4,
    style: { textShadow: "0 4px 20px rgba(0,0,0,0.6)", fontWeight: 800, letterSpacing: '0.02em', lineHeight: '1.2' }
  },
  3: {
    text: "WONDER WITHOUT LIMITS", font: "'Cinzel Decorative', serif", scale: 1.05,
    style: {
      textShadow: "0 2px 0px rgba(0,0,0,1), 0 8px 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,200,80,0.25), 0 0 160px rgba(0,150,60,0.12)",
      fontWeight: 900, letterSpacing: '0.04em', lineHeight: '1.2',
    }
  },
  4: {
    text: "IMAGINE BEYOND GRAVITY", font: "'Orbitron', sans-serif", scale: 0.95,
    style: {
      textShadow: "0 0 8px rgba(255,255,255,.95), 0 0 16px rgba(255,255,255,.85), 0 0 32px rgba(255,255,255,.65), 0 0 64px rgba(255,255,255,.35), 0 0 120px rgba(255,255,255,.15)",
      fontWeight: 700, letterSpacing: '0.08em', lineHeight: '1.2',
    }
  }
};

function padCenter(str: string, len: number) {
  if (str.length >= len) return str.substring(0, len);
  const padTotal = len - str.length;
  const padLeft = Math.floor(padTotal / 2);
  const padRight = padTotal - padLeft;
  return ' '.repeat(padLeft) + str + ' '.repeat(padRight);
}

function GlobalHeadline({ scene }: { scene: number }) {
  const prevSceneRef = useRef(scene);
  const transRef = useRef({ from: 0, to: 0, key: 0 });

  if (scene !== prevSceneRef.current) {
    transRef.current = { from: prevSceneRef.current, to: scene, key: transRef.current.key + 1 };
    prevSceneRef.current = scene;
  }
  const trans = transRef.current;
  const fromConf = SCENE_CONFIG[trans.from] || SCENE_CONFIG[0];
  const toConf = SCENE_CONFIG[trans.to] || SCENE_CONFIG[0];

  const GLOBAL_MAX_LEN = 22;
  const fromChars = padCenter(fromConf.text, GLOBAL_MAX_LEN).split('');
  const toChars = padCenter(toConf.text, GLOBAL_MAX_LEN).split('');

  const isForward = trans.to >= trans.from;
  const flipTo = isForward ? -90 : 90;
  const backRotation = isForward ? 90 : -90;

  const baseFontSize = `clamp(14px, 4.5vw, 55px)`;
  const FLIP_DURATION = 0.45;
  const STAGGER_S = 0.015;

  return (
    <div
      key={`headline-${trans.key}`}
      style={{
        position: 'absolute', top: 'clamp(6%, 7.5vh, 8%)', left: '50%',
        transform: 'translateX(-50%) translateZ(100px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        whiteSpace: 'nowrap', width: 'max-content', maxWidth: '96vw',
        color: '#FFFFFF', pointerEvents: 'none', WebkitFontSmoothing: 'antialiased',
      }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: trans.to === 4 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute', inset: '-50% -20%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 65%)',
          filter: 'blur(25px)', zIndex: -1,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {toChars.map((char, i) => {
          const prevChar = fromChars[i] ?? ' ';
          const charIsAnimating = trans.from !== trans.to && prevChar !== char;
          const animDelay = i * STAGGER_S;

          return (
            <div key={`wrap-${i}`} style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', perspective: '1000px', flexShrink: 0 }}>
              <div style={{ display: 'grid', visibility: 'hidden', padding: '0 0.02em' }}>
                <span style={{ gridArea: '1/1', fontFamily: fromConf.font, fontSize: `calc(${baseFontSize} * ${fromConf.scale})`, whiteSpace: 'pre', ...fromConf.style }}>{prevChar}</span>
                <span style={{ gridArea: '1/1', fontFamily: toConf.font, fontSize: `calc(${baseFontSize} * ${toConf.scale})`, whiteSpace: 'pre', ...toConf.style }}>{char}</span>
              </div>
              {charIsAnimating ? (
                <motion.div
                  key={`flip-${trans.key}-${i}`}
                  style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: flipTo }}
                  transition={{ duration: FLIP_DURATION, delay: animDelay, ease: [0.65, 0.05, 0.36, 1] }}
                >
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0.4em)', fontFamily: fromConf.font, fontSize: `calc(${baseFontSize} * ${fromConf.scale})`, whiteSpace: 'pre', paddingBottom: '0.1em', ...fromConf.style }}>{prevChar}</div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: `rotateX(${backRotation}deg) translateZ(0.4em)`, fontFamily: toConf.font, fontSize: `calc(${baseFontSize} * ${toConf.scale})`, whiteSpace: 'pre', paddingBottom: '0.1em', ...toConf.style }}>{char}</div>
                </motion.div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: toConf.font, fontSize: `calc(${baseFontSize} * ${toConf.scale})`, whiteSpace: 'pre', paddingBottom: '0.1em', ...toConf.style }}>{char}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// 3. HERO CANVAS 
// ------------------------------------------------------------------
interface HeroProps {
  onRelease: () => void
  onSceneChange: (scene: number) => void
  isReleased: boolean
}

function HeroCanvas({ onRelease, onSceneChange, isReleased }: HeroProps) {
  const [scene, setSceneState] = useState(0)

  const palaceTextRef = useRef<HTMLDivElement>(null)
  const palaceGlowRef = useRef<HTMLDivElement>(null)

  const sceneRef    = useRef(0)
  const frameFloat  = useRef(0)
  const frameDrawn  = useRef(-1)
  const velocity    = useRef(0)
  const snapLocked  = useRef(false)
  const wheelActive = useRef(false)
  const wheelTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasReleased = useRef(false)
  const wheelAccum  = useRef(0)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const imagesRef   = useRef<(HTMLImageElement | null)[]>([])
  const rafRef      = useRef<number>(0)

  useEffect(() => {
    hasReleased.current = isReleased
  }, [isReleased])

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
    
    // Grab from cache immediately since preloader fetched them
    for (let i = 0; i <= TOTAL_FRAMES; i++) {
      const img = new Image(); 
      img.src = `/palace/palace-frame_${pad(i)}.webp`; 
      imgs[i] = img;
      if (i === 0) img.onload = () => drawFrame(0);
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
    // If trying to release out of the canvas entirely
    if (next > TOTAL_SCENES) {
      if (hasReleased.current) return
      snapLocked.current = true
      doRelease()
      // Lock prevents scrolling backwards into the canvas immediately
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
      return
    }

    if (snapLocked.current) return
    if (next < 0) return
    
    velocity.current = 0
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
          if (idx < TEXT_FADE_START) tp = 0
          else if (idx >= 120) tp = 1
          else tp = (idx - TEXT_FADE_START) / (120 - TEXT_FADE_START)

          if (palaceTextRef.current) {
            palaceTextRef.current.style.opacity = tp.toString()
            palaceTextRef.current.style.transform = `translateX(-50%) translateY(${(1 - tp) * 40}px)`
          }
          if (palaceGlowRef.current) {
            palaceGlowRef.current.style.opacity = (tp * 0.5).toString()
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFrame, snapTo])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const handleWheel = (e: WheelEvent) => {
      if (hasReleased.current) return
      e.preventDefault()
      
      const isScrollingDown = e.deltaY > 0

      // ---- THE "MONSTER SCROLL" FIX ----
      // Bypasses the lock sequence if actively trying to escape the space sequence downwards
      if (snapLocked.current) {
        if (sceneRef.current === TOTAL_SCENES && isScrollingDown) {
          wheelAccum.current += e.deltaY
          if (wheelAccum.current > 40) {
            snapTo(TOTAL_SCENES + 1) // Force Release
            wheelAccum.current = 0
          }
        } else {
          wheelAccum.current = 0 
        }
        return
      }

      // Handle Scene 0 (Frames)
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

      // Handle Scenes 1-4
      wheelAccum.current += e.deltaY
      if (Math.abs(wheelAccum.current) > 30) {
        snapTo(sceneRef.current + (wheelAccum.current > 0 ? 1 : -1))
        wheelAccum.current = 0
      }
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
    transition: `opacity ${SCENE_FADE_S}s cubic-bezier(0.65,0.35,1)`,
    zIndex: scene === i ? 10 : 0,
    willChange: 'opacity',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: '#020202' }}>
      <GlobalHeadline scene={scene} />

      {/* Scene 0 — Palace */}
      <div style={gs(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block', width: '100vw', height: '100dvh' }} />

        <div
          ref={palaceTextRef}
          style={{
            position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%) translateY(40px)',
            opacity: 0, pointerEvents: 'none', zIndex: 20, textAlign: 'center', willChange: 'transform, opacity',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-serif,"Instrument Serif",serif)', fontStyle: 'italic',
            fontWeight: 400, fontSize: 'clamp(2.6rem, 7vw, 6.5rem)', color: '#fff',
            margin: 0, textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.2)',
            whiteSpace: 'nowrap', letterSpacing: '0.02em',
          }}>
            Step into the Kingdom
          </h2>
          <div
            ref={palaceGlowRef}
            style={{
              position: 'absolute', top: '-70%', left: '50%', transform: 'translateX(-50%)',
              width: '120%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              zIndex: -1, opacity: 0, willChange: 'opacity'
            }}
          />
        </div>
      </div>

            {/* Scene 1 — Retro */}
      <div style={gs(1)}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* Scene 2 — Racing */}
      <div style={gs(2)}>
        <RacingSequence isActive={scene === 2} />
      </div>

      {/* Scene 3 — OpenWorld */}
      <div style={gs(3)}>
        <OpenWorldSequence isActive={scene === 3} />
      </div>

      {/* Scene 4 — Space */}
      <div style={gs(4)}>
        <SpaceSequence isActive={scene === 4} />
      </div>
      }
}

// ------------------------------------------------------------------
// 4. MAIN HOME PAGE (Export)
// FIX: Removed `props: any` to satisfy Next.js 15 type checker.
// ------------------------------------------------------------------
export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [heroReleased, setHeroReleased] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const heroReleasedRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }, 80)
  }, [])

  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY <= 10) { 
        heroReleasedRef.current = false
        setHeroReleased(false)
        document.body.style.overflow = 'hidden'
        window.scrollTo({ top: 0, behavior: 'instant' }) 
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  const showNavbar = heroReleased || currentScene === 4

  return (
    <main>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
          >
            <Preloader onComplete={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, height: '70px', padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        opacity: showNavbar ? 1 : 0, transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showNavbar ? 'auto' : 'none', transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playful" style={{
            width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)', borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(0,200,255,.3)', boxShadow: '0 0 15px rgba(0,234,255,.2)',
          }} />
          <span style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontWeight: 900, fontSize: 'clamp(.85rem,2vw,1.3rem)', letterSpacing: '.2em', color: '#fff' }}>PLAYFUL</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/auth" className="nbtn signin" style={{ color: '#fff', textDecoration: 'none' }}>Sign in</a>
          <a href="/auth" className="nbtn signup" style={{ color: '#fff', textDecoration: 'none', background: '#00c8ff', padding: '8px 16px', borderRadius: '4px' }}>Try Free</a>
        </div>
      </nav>

      {/* Keeps HeroCanvas mounted in background while loading so it's instantly ready when loading fades */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        pointerEvents: heroReleased ? 'none' : 'auto',
      }}>
        <HeroCanvas 
          onRelease={handleRelease} 
          onSceneChange={setCurrentScene} 
          isReleased={heroReleased} 
        />
      </div>

      <div style={{ height: '100vh', scrollSnapAlign: 'start' }} aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 200 }}>
        <SnapCards isActive={heroReleased} />
      </div>
    </main>
  )
}
 

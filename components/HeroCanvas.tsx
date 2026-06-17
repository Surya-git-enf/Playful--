'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'

const TOTAL_SCENES = 4
const TOTAL_FRAMES = 144
// Headline flip (see below) now completes in ~0.78s total, so the snap
// lock just needs to be a hair longer than the 0.85s scene fade — keeping
// these two durations close is what removes the "stuck" feeling between
// Retro/Racing/etc. and keeps the headline in sync with the world.
const SNAP_LOCK_MS = 900
const TEXT_FADE_START = 100
const FRICTION = 0.80
const FRAMES_PER_DELTA = 0.16
const SCENE_FADE_S = 0.85

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

// ------------------------------------------------------------------
// GLOBAL HEADLINE SYSTEM (Perfect Letter Spacing & Z-Index Locks)
// ------------------------------------------------------------------
const SCENE_CONFIG: Record<number, { text: string, font: string, scale: number, style: React.CSSProperties }> = {
  0: {
    text: "",
    font: "var(--font-bebas, 'Bebas Neue', sans-serif)",
    scale: 1,
    style: {}
  },
  1: {
    text: "PIXELS NEVER DIE",
    font: "'Press Start 2P', cursive",
    scale: 0.75, // Scaled for mobile pixel crispness
    style: {
      fontWeight: 400,
      backgroundImage: 'linear-gradient(180deg, #FFD400 0%, #FF3300 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      filter: 'drop-shadow(0px 3px 0px rgba(0,0,0,1))',
      lineHeight: '1.2',
    }
  },
  2: {
    text: "CHASE THE HORIZON",
    font: "'Bebas Neue', sans-serif",
    scale: 1.4,
    style: {
      textShadow: "0 4px 20px rgba(0,0,0,0.6)",
      fontWeight: 800,
      letterSpacing: '0.02em',
      lineHeight: '1.2',
    }
  },
  3: {
    text: "WONDER WITHOUT LIMITS",
    font: "'Cinzel Decorative', serif",
    scale: 1.05,
    style: {
      textShadow: "0 2px 0px rgba(0,0,0,1), 0 8px 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,200,80,0.25), 0 0 160px rgba(0,150,60,0.12)",
      fontWeight: 900,
      letterSpacing: '0.04em',
      lineHeight: '1.2',
    }
  },
  4: {
    text: "IMAGINE BEYOND GRAVITY",
    font: "'Orbitron', sans-serif",
    scale: 0.95,
    style: {
      textShadow: "0 0 8px rgba(255,255,255,.95), 0 0 16px rgba(255,255,255,.85), 0 0 32px rgba(255,255,255,.65), 0 0 64px rgba(255,255,255,.35), 0 0 120px rgba(255,255,255,.15)",
      fontWeight: 700,
      letterSpacing: '0.08em',
      lineHeight: '1.2',
    }
  }
};

// Pads strings to center them perfectly during transitions
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
    transRef.current = {
      from: prevSceneRef.current,
      to: scene,
      key: transRef.current.key + 1
    };
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

  // Flip duration + per-letter stagger. Kept deliberately tight so the
  // LAST letter's flip finishes at (FLIP_DURATION + 21 * STAGGER) ≈ 0.78s,
  // comfortably inside the 0.85s scene-fade window. This is what keeps
  // the headline change in sync with the new world appearing, instead of
  // lagging behind it.
  const FLIP_DURATION = 0.45;
  const STAGGER_S = 0.015; // 15ms per letter

  return (
    <div
      // Remounting the whole headline on every scene transition guarantees
      // there's no leftover per-letter animation/font state bleeding over
      // from the previous transition (the cause of "previous font" ghosts).
      key={`headline-${trans.key}`}
      style={{
        position: 'absolute',
        top: 'clamp(6%, 7.5vh, 8%)',
        left: '50%',
        transform: 'translateX(-50%) translateZ(100px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        width: 'max-content',
        maxWidth: '96vw',
        color: '#FFFFFF',
        pointerEvents: 'none',
        WebkitFontSmoothing: 'antialiased',
      }}>

      {/* Cinematic Fog Bloom exclusively for Space Scene */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: trans.to === 4 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: '-50% -20%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 65%)',
          filter: 'blur(25px)',
          zIndex: -1,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {toChars.map((char, i) => {
          const prevChar = fromChars[i] ?? ' ';
          const charIsAnimating = trans.from !== trans.to && prevChar !== char;

          const animDelay = i * STAGGER_S;

          return (
            <div key={`wrap-${i}`} style={{
              position: 'relative',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              perspective: '1000px',
              flexShrink: 0,
            }}>

              {/* CSS GRID ANCHOR: The safest cross-browser way to ensure cells never squish or overlap */}
              <div style={{ display: 'grid', visibility: 'hidden', padding: '0 0.02em' }}>
                <span style={{
                  gridArea: '1/1',
                  fontFamily: fromConf.font,
                  fontSize: `calc(${baseFontSize} * ${fromConf.scale})`,
                  whiteSpace: 'pre',
                  ...fromConf.style
                }}>
                  {prevChar}
                </span>
                <span style={{
                  gridArea: '1/1',
                  fontFamily: toConf.font,
                  fontSize: `calc(${baseFontSize} * ${toConf.scale})`,
                  whiteSpace: 'pre',
                  ...toConf.style
                }}>
                  {char}
                </span>
              </div>

              {charIsAnimating ? (
                <motion.div
                  key={`flip-${trans.key}-${i}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transformStyle: 'preserve-3d',
                  }}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: flipTo }}
                  transition={{
                    duration: FLIP_DURATION,
                    delay: animDelay,
                    ease: [0.65, 0.05, 0.36, 1]
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0.4em)',
                    fontFamily: fromConf.font,
                    fontSize: `calc(${baseFontSize} * ${fromConf.scale})`,
                    whiteSpace: 'pre',
                    paddingBottom: '0.1em',
                    ...fromConf.style
                  }}>
                    {prevChar}
                  </div>

                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: `rotateX(${backRotation}deg) translateZ(0.4em)`,
                    fontFamily: toConf.font,
                    fontSize: `calc(${baseFontSize} * ${toConf.scale})`,
                    whiteSpace: 'pre',
                    paddingBottom: '0.1em',
                    ...toConf.style
                  }}>
                    {char}
                  </div>
                </motion.div>
              ) : (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: toConf.font,
                  fontSize: `calc(${baseFontSize} * ${toConf.scale})`,
                  whiteSpace: 'pre',
                  paddingBottom: '0.1em',
                  ...toConf.style
                }}>
                  {char}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
// ------------------------------------------------------------------

export default function HeroCanvas({ onRelease, onSceneChange, isReleased }: Props) {
  const [scene, setSceneState] = useState(0)

  // Direct DOM refs bypass React renders during high-speed scroll (Massive Performance Boost)
  const palaceTextRef = useRef<HTMLDivElement>(null)
  const palaceGlowRef = useRef<HTMLDivElement>(null)

  const sceneRef    = useRef(0)
  const frameFloat  = useRef(1)
  const frameDrawn  = useRef(-1)
  const velocity    = useRef(0)
  const snapLocked  = useRef(false)
  const wheelActive = useRef(false)
  const wheelTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasReleased = useRef(false)
  // Accumulates small/fractional deltaY from trackpads so gentle scrolls
  // on scenes 1-4 still register instead of feeling "stuck".
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
    // Don't touch body overflow — page.tsx's #scroll-root container
    // switches to overflow:scroll when heroReleased flips to true.
    onRelease()
  }, [onRelease])

  const snapTo = useCallback((next: number) => {
    if (snapLocked.current) return
    velocity.current = 0
    if (next > TOTAL_SCENES) {
      snapLocked.current = true
      wheelAccum.current = 0
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

          // Direct DOM updates for buttery smooth scrolling (NO REACT RE-RENDERS)
          let tp = 0
          if (idx < TEXT_FADE_START) {
            tp = 0
          } else if (idx >= 120) {
            tp = 1
          } else {
            tp = (idx - TEXT_FADE_START) / (120 - TEXT_FADE_START)
          }

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

      // Scenes 1-4: fire on the first sufficiently-large wheel tick.
      // (Previously this accumulated deltaY across events, but inertial/
      // momentum scrolling sends a MIX of positive and negative deltas —
      // those can cancel each other out indefinitely, so "doom scrolling"
      // never crossed the threshold and the page felt permanently stuck
      // on Space. snapLocked's 900ms window already prevents double-fires
      // within a single gesture, so no accumulation is needed.)
      if (Math.abs(e.deltaY) > 1) {
        snapTo(sceneRef.current + (e.deltaY > 0 ? 1 : -1))
      }
    }

    let ty0 = 0, tyLast = 0, tvY = 0, ttLast = 0
    const onTouchStart = (e: TouchEvent) => {
      ty0 = e.touches[0].clientY; tyLast = ty0; tvY = 0; ttLast = Date.now()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (hasReleased.current) return
      e.preventDefault() // Prevents default scroll bounce smoothly
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

      {/* GLOBAL HEADLINE OVERLAY */}
      <GlobalHeadline scene={scene} />

      {/* Scene 0 — Palace */}
      <div style={gs(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block', width: '100vw', height: '100dvh' }} />

        <div
          ref={palaceTextRef}
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '50%',
            transform: 'translateX(-50%) translateY(40px)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 20,
            textAlign: 'center',
            willChange: 'transform, opacity',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-serif,"Instrument Serif",serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.6rem, 7vw, 6.5rem)',
            color: '#fff',
            margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.2)',
            letterSpacing: '0.02em',
            maxWidth: '92vw',
          }}>
            Step into the Kingdom
          </h2>
          <div style={{
            position: 'absolute',
            top: '-70%',
            left: '50%',
            width: '100%',
            height: '200%',
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}/>
        </div>

        <div
          ref={palaceGlowRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(255,212,0,0.1) 0%, transparent 70%)',
            opacity: 0,
            willChange: 'opacity',
          }}
        />
      </div>

      {/* Scene 1 — Retro */}
      <div style={gs(1)}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* Scene 2 — Racing */}
      <div style={gs(2)}>
        <RacingSequence isActive={scene === 2} />
      </div>

      {/* Scene 3 — Open World */}
      <div style={gs(3)}>
        <OpenWorldSequence isActive={scene === 3} />
      </div>

      {/* Scene 4 — Space */}
      <div style={gs(4)}>
        <SpaceSequence isActive={scene === 4} />
      </div>

      {/* SCROLL ARROWS - Visible initially to indicate scrolling down starts the experience */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        pointerEvents: 'none',
        zIndex: 9999,
        animation: 'blurIn .8s ease .6s both',
        opacity: scene === 0 ? 1 : 0, // Only show in palace scene
        transition: 'opacity 0.5s ease'
      }}>
        <style>{`
          @keyframes blurIn {
            from { opacity: 0; filter: blur(8px); transform: translateY(10px); }
            to { opacity: 1; filter: blur(0px); transform: translateY(0); }
          }

          .scroll-arrow {
            width: 28px;
            height: 16px;
            position: relative;
            opacity: 0;
          }

          .scroll-arrow::before,
          .scroll-arrow::after {
            content: '';
            position: absolute;
            width: 14px;
            height: 2.5px;
            background: #ffe000;
            border-radius: 2px;
            top: 50%;
          }

          .scroll-arrow::before {
            left: 0;
            transform-origin: right center;
            transform: translateY(-50%) rotate(35deg);
            box-shadow: 0 0 8px #ffe000, 0 0 18px rgba(255,224,0,0.6);
          }

          .scroll-arrow::after {
            right: 0;
            transform-origin: left center;
            transform: translateY(-50%) rotate(-35deg);
            box-shadow: 0 0 8px #ffe000, 0 0 18px rgba(255,224,0,0.6);
          }

          /* Each arrow pulses in sequence with a stagger */
          @keyframes arrowGlow {
            0%, 100% { opacity: 0.15; filter: drop-shadow(0 0 2px #ffe000); }
            50%       { opacity: 1;    filter: drop-shadow(0 0 10px #ffe000) drop-shadow(0 0 22px rgba(255,224,0,0.8)); }
          }

          .scroll-arrow:nth-child(1) { animation: arrowGlow 1.4s ease-in-out infinite 0s; }
          .scroll-arrow:nth-child(2) { animation: arrowGlow 1.4s ease-in-out infinite 0.28s; }
          .scroll-arrow:nth-child(3) { animation: arrowGlow 1.4s ease-in-out infinite 0.56s; }
        `}</style>
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
      </div>
    </div>
  )
}

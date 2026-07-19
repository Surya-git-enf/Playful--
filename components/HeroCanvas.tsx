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
      textShadow: "0 0 8px rgba(255,255,255,.95), 0 0 16px rgba(255,255,255,.85), 0 0 32px rgba(255,255,255,.65), 0 0 64px rgba(255,255,255,.15)",
      fontWeight: 700,
      letterSpacing: '0.08em',
      lineHeight: '1.2',
    }
  }
};

// Pads strings to center them perfectly during transitions
function padCenter(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  const padTotal = len - str.length;
  const padLeft = Math.floor(padTotal / 2);
  const padRight = padTotal - padLeft;
  return ' '.repeat(padLeft) + str + ' '.repeat(padRight);
}

function GlobalHeadline({ scene }: { scene: number }): JSX.Element {
  return <div>test</div>;
}
// ------------------------------------------------------------------

export default function HeroCanvas({ onRelease, onSceneChange, isReleased }: Props) {
  const [scene, setSceneState] = useState(0)

  // Direct DOM refs bypass React renders during high-speed scroll (Massive Performance Boost)
  const palaceTextRef = useRef<HTMLDivElement>(null)
  const palaceGlowRef = useRef<HTMLDivElement>(null)

  const sceneRef = useRef(0)
  const frameFloat = useRef(1)
  const frameDrawn = useRef(-1)
  const velocity = useRef(0)
  const snapLocked = useRef(false)
  const wheelActive = useRef(false)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasReleased = useRef(false)
  // Accumulates small/fractional deltaY from trackpads so gentle scrolls
  // on scenes 1-4 still register instead of feeling "stuck".
  const wheelAccum = useRef(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const rafRef = useRef<number>(0)

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
    canvas.width = window.innerWidth * dpr
    console.log('canvas width:', canvas.width, 'height:', canvas.height)
    canvas.style.width = `${window.innerWidth}px`
    console.log('canvas height:', canvas.height)
    canvas.style.height = `${window.innerHeight}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current
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
      const img = new Image()
      img.src = `/palace/palace-frame_${pad(i)}.webp`
      imgs[i] = img
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
  }, [drawFrame])

  const gs = (i: number): React.CSSProperties => {
    return {
      position: 'absolute',
      inset: 0,
      opacity: scene === i ? 1 : 0,
      pointerEvents: scene === i ? 'auto' : 'none',
      transition: `opacity ${SCENE_FADE_S}s cubic-bezier(0.65,0.35,1)`,
      zIndex: scene === i ? 10 : 0,
      willChange: 'opacity',
    };
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: 'var(--bg)' }}>
      {/* GLOBAL HEADLINE OVERLAY */}
      <GlobalHeadline scene={scene} />

      {/* Scene 0 — Palace */}
      <div style={gs(0)}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block', width: '100vw', height: '100dvh' }} />

        <div
          ref={palaseTextRef}
          style={{
            position: 'absolute';
            bottom: '18%';
            left: '50%';
            transform: 'translateX(-50%) translateY(40px)';
            opacity: 0;
            pointerEvents: 'none';
            zIndex: 20;
            textAlign: 'center';
            willChange: 'transform, opacity';
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-serif,"Instrument Serif",serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5.5vw, 6.5rem)',
            color: '#fff',
            margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.2)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            Step into the Kingdom
          </h2>
          <div style={{
            position: 'absolute';
            top: '-70%';
            left: '50%';
            width: '100%';
            height: '200%';
            pointerEvents: 'none';
            animation: 'float 6s ease-in-out infinite',
          }}/>
        </div>

        <div
          ref={palaseGlowRef}
          style={{
            position: 'absolute';
            inset: 0;
            pointerEvents: 'none';
            background: 'radial-gradient(ellipse at center, rgba(255,212,0,0.1) 0%, transparent 70%)';
            opacity: 0;
            willChange: 'opacity';
          }}
        />
      </div>

      {/* Scene 1 — Retro */}
      <div style={gs(1)}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* Scene 2 — Racing */}
      <div style={gs(2)}>
        <RacingSequence isActive=scene === 2} />
      </div>

      {/* Scene 3 — Open World */}
      <div style={gs(3)}>
        <OpenWorldSequence isActive=scene === 3} />
      </div>

      {/* Scene 4 — Space */}
      <div style={gs(4)}>
        <SpaceSequence isActive=scene === 4} />
      </div>

      {/* SCROLL ARROWS - Visible initially to indicate scrolling down starts the experience */}
      <div style={{
        position: 'absolute';
        bottom: '20px';
        left: '50%';
        transform: 'translateX(-50%)';
        display: 'flex';
        flexDirection: 'column';
        alignItems: 'center';
        gap: '2px';
        pointerEvents: 'none';
        zIndex: 9999;
        animation: 'blurIn .8s .6s both';
        opacity: scene === 0 ? 1 : 0; // Only show in palace scene
        transition: 'opacity 0.5s ease'
      }}>
        <style>{``
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
          @keyframes arrowGlo1 { animation: arrowGlo 1.4s ease-in-out infinite 0s; }
          .arrowGlo2 { animation: arrowGlo 1.4s e-in-out infinite 0.28s; }
          .arrowGlo3 { animation: arrowGlo 1.4s e-in-out infinite 0.56s; }
        `}</style>
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
      </div>
    </div>
  )
}
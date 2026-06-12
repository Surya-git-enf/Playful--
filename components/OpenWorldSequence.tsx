'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function OpenWorldSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isActive) {
      timer = setTimeout(() => setMounted(true), 50)
    } else {
      setMounted(false)
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [isActive])

  const snap    = 'cubic-bezier(0.19, 1, 0.22, 1)'
  const smooth  = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const bounce  = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#02050A' }}>
      <style>{`

        /* ─────────────────────────────────────────
           WORLD — arrival IS the first breath-in.
           After arrival settles, continues:
           breathe out → breathe in → breathe out …
           Use scale + glow together.
        ───────────────────────────────────────── */
        @keyframes worldBreathe {
          0%   { transform: scale(1);    filter: drop-shadow(0 0 40px rgba(0,180,80,0.22)); }
          100% { transform: scale(1.06); filter: drop-shadow(0 0 80px rgba(0,180,80,0.46)); }
        }

        /* ─────────────────────────────────────────
           MOON — EXACT same keyframe, but starts
           at animation-delay: -5s (half of 10s)
           → phase-shifted 180° = async breathing.
           When world is big  → moon is small.
           When world is small → moon is big.
        ───────────────────────────────────────── */
        @keyframes moonBreathe {
          0%   { transform: translateX(-50%) scale(1);    filter: drop-shadow(0 0 30px rgba(200,220,255,0.35)); }
          100% { transform: translateX(-50%) scale(1.09); filter: drop-shadow(0 0 70px rgba(200,220,255,0.65)); }
        }

        /* GROUND: subtle forward-rise idle */
        @keyframes groundIdle {
          0%, 100% { transform: translateY(0%); }
          50%       { transform: translateY(-3px); }
        }

        /* HERO: gentle bob */
        @keyframes heroBob {
          0%, 100% { transform: translateX(-50%) translateY(0px)   scale(1); }
          40%       { transform: translateX(-50%) translateY(-8px)  scale(1.02); }
          70%       { transform: translateX(-50%) translateY(-4px)  scale(1.01); }
        }

        /* BG radial pulse — very subtle */
        @keyframes bgPulse {
          0%, 100% { opacity: 0.9; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* ── BASE BACKGROUND ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 110% 90% at 50% 60%, #061e10 0%, #020e08 55%, #000000 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.6s ${smooth} 0s`,
        animation: mounted ? 'bgPulse 14s ease-in-out infinite 2s' : 'none',
      }} />

      {/* ── WORLD (fills entire screen) ──
          Arrival: scale 0.72 → 1 — this IS the breath-in.
          After transition settles, continues breathing out then in via animation.
          We use a wrapper for the CSS transition entrance, inner div for the loop.
      ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        /* arrival: scale up from small = "breath in" */
        transform: mounted ? 'scale(1)' : 'scale(0.72)',
        transition: `opacity 1.6s ${smooth} 0.05s, transform 1.6s ${smooth} 0.05s`,
        transformOrigin: 'center center',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          /* after arrival (1.6s), continue: first breath-out then loop */
          animation: mounted ? 'worldBreathe 10s ease-in-out infinite alternate 1.6s' : 'none',
          /* starts at scale(1) = inhale done → breathes OUT first, then in, then out… */
          animationDirection: 'alternate-reverse',
        }}>
          <img
            src="/openworld/world.png"
            alt="World"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── GROUND — rises from below, stagger 0s ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '26%',
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%)' : 'translateY(100%)',
        transition: `opacity 0.9s ${snap} 0s, transform 1.0s ${snap} 0s`,
        animation: mounted ? 'groundIdle 9s ease-in-out infinite 1.2s' : 'none',
      }}>
        <img
          src="/openworld/ground.png"
          alt="Ground"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
          }}
        />
      </div>

      {/* ── MOON — drops from top with arc, stagger 0.3s ──
          Phase-shifted by -5s (half of 10s period) → fully async with world.
      ── */}
      <div style={{
        position: 'absolute',
        top: '4%',
        left: '50%',
        width: 'clamp(80px, 13vw, 170px)',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        /* arc drop: starts high + slightly rotated, lands in place */
        transform: mounted
          ? 'translateX(-50%) translateY(0px) rotate(0deg)'
          : 'translateX(-50%) translateY(-60px) rotate(-12deg)',
        transition: `opacity 1.0s ${smooth} 0.3s, transform 1.1s ${bounce} 0.3s`,
      }}>
        <div style={{
          /* async with world: delay = -(period/2) = -5s so phases are opposite */
          animation: mounted ? 'moonBreathe 10s ease-in-out infinite alternate -5s' : 'none',
          animationDirection: 'alternate',
        }}>
          <img
            src="/openworld/moon.png"
            alt="Moon"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* ── HERO — slams down with bounce, stagger 0.5s ── */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '50%',
        width: 'clamp(40px, 5.5vw, 80px)',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'translateX(-50%) translateY(0px)'
          : 'translateX(-50%) translateY(-90px)',
        transition: `opacity 0.7s ${smooth} 0.5s, transform 1.0s ${bounce} 0.5s`,
      }}>
        <div style={{
          animation: mounted ? 'heroBob 4s ease-in-out infinite 1.6s' : 'none',
        }}>
          <img
            src="/openworld/hero.png"
            alt="Hero"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 16px rgba(0,220,90,0.6))',
            }}
          />
        </div>
      </div>

      {/* ── VIGNETTE / MASK ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: [
          'linear-gradient(to bottom, rgba(2,5,10,0.88) 0%, rgba(2,5,10,0.18) 18%, transparent 35%)',
          'linear-gradient(to top,    rgba(2,5,10,0.6)  0%, transparent 30%)',
          'radial-gradient(ellipse 120% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        ].join(', '),
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.2s ${smooth} 0.1s`,
        zIndex: 5,
      }} />

      {/* ── TYPOGRAPHY ── */}
      <div style={{
        position: 'absolute',
        top: '10vh',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%) skewX(0deg)' : 'translateY(-8%) skewX(-6deg)',
        filter: mounted ? 'blur(0px)' : 'blur(14px)',
        transition: `opacity 1.1s ${snap} 0.65s, transform 1.2s ${snap} 0.65s, filter 1.0s ${snap} 0.65s`,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.35em',
          color: 'rgba(120,255,160,0.7)',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Stage 4 · Open World
        </span>
        <h2 style={{
          fontFamily: "'Cinzel', 'Times New Roman', serif",
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          margin: 0,
          color: '#FFFFFF',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
          textShadow: '0 8px 40px rgba(0,0,0,0.9), 0 0 60px rgba(0,180,80,0.2)',
          textAlign: 'center',
        }}>
          Every Path
          <br />
          Breathes
        </h2>
      </div>
    </div>
  )
}

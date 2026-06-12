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

  const snap   = 'cubic-bezier(0.19, 1, 0.22, 1)'
  const smooth = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const bounce = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#02050A' }}>
      <style>{`

        /* ── WORLD: subtle alive zoom, green pulse glow ── */
        @keyframes worldBreathe {
          0%   { transform: scale(1);      filter: brightness(0.92) drop-shadow(0 0 60px rgba(0,180,80,0.18)); }
          100% { transform: scale(1.045);  filter: brightness(1.04) drop-shadow(0 0 120px rgba(0,200,90,0.38)); }
        }

        /* ── MOON: glows brighter as world dims — async phase ── */
        @keyframes moonFloat {
          0%   { transform: scale(1)    translateY(0px);  filter: drop-shadow(0 0 24px rgba(255,80,60,0.55)) drop-shadow(0 0 60px rgba(220,60,40,0.3)); }
          50%  { transform: scale(1.06) translateY(-6px); filter: drop-shadow(0 0 50px rgba(255,100,60,0.85)) drop-shadow(0 0 100px rgba(220,60,40,0.55)); }
          100% { transform: scale(1)    translateY(0px);  filter: drop-shadow(0 0 24px rgba(255,80,60,0.55)) drop-shadow(0 0 60px rgba(220,60,40,0.3)); }
        }

        /* ── MOON CLOUD: drifts slowly left-right ── */
        @keyframes cloudDrift {
          0%   { transform: translateX(0px);   opacity: 0.75; }
          50%  { transform: translateX(-14px); opacity: 0.9; }
          100% { transform: translateX(0px);   opacity: 0.75; }
        }

        /* ── HERO: real alive breathing — chest rise + subtle sway ── */
        @keyframes heroBreath {
          0%   { transform: translateX(-50%) translateY(0px)   scaleY(1)    scaleX(1); }
          30%  { transform: translateX(-50%) translateY(-9px)  scaleY(1.02) scaleX(0.99); }
          60%  { transform: translateX(-50%) translateY(-5px)  scaleY(1.01) scaleX(1); }
          80%  { transform: translateX(-50%) translateY(-11px) scaleY(1.025) scaleX(0.985); }
          100% { transform: translateX(-50%) translateY(0px)   scaleY(1)    scaleX(1); }
        }

        /* ── CAPE: independent cape flutter ── */
        @keyframes capeFlutter {
          0%,100% { skewX(0deg) translateX(0px); }
          25%      { skewX(2deg) translateX(2px); }
          75%      { skewX(-2deg) translateX(-2px); }
        }

        /* ── GROUND: subtle forward push ── */
        @keyframes groundPush {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-4px) scale(1.004); }
        }

        /* ── BG radial pulse ── */
        @keyframes bgPulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }

        /* ── ATMOSPHERIC FOG ── */
        @keyframes fogDrift {
          0%   { transform: translateX(0%) scaleX(1);   opacity: 0.18; }
          50%  { transform: translateX(-3%) scaleX(1.04); opacity: 0.28; }
          100% { transform: translateX(0%) scaleX(1);   opacity: 0.18; }
        }

        /* ── MOON RED CORONA pulse ── */
        @keyframes coronaPulse {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.6;  transform: scale(1.15); }
        }
      `}</style>

      {/* ── BASE BACKGROUND ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 60%, #0a1a0e 0%, #030d06 55%, #000000 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.6s ${smooth} 0s`,
        animation: mounted ? 'bgPulse 16s ease-in-out infinite 2s' : 'none',
      }} />

      {/* ── WORLD IMAGE — no stretch, fills frame, breathes ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.88)',
        transition: `opacity 1.8s ${smooth} 0.05s, transform 2s ${smooth} 0.05s`,
        transformOrigin: 'center bottom',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          animation: mounted ? 'worldBreathe 12s ease-in-out infinite alternate 2s' : 'none',
          animationDirection: 'alternate-reverse',
        }}>
          <img
            src="/openworld/world.png"
            alt="World"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              /* ← KEY: anchor to bottom so sky stays at top, no stretch */
              objectPosition: 'center bottom',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── ATMOSPHERIC FOG LAYER ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,30,10,0.45) 0%, transparent 40%)',
        animation: mounted ? 'fogDrift 18s ease-in-out infinite' : 'none',
        opacity: mounted ? 1 : 0,
        transition: `opacity 2s ${smooth} 0.5s`,
      }} />

      {/* ── MOON — top-left, sitting inside the clouds ──
          Position: left ~12%, top ~6% so it peeks through clouds
      ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '11%',          /* ← top-left cloud area */
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'translateY(0px) scale(1)'
          : 'translateY(-80px) scale(0.6)',
        transition: `opacity 1.2s ${smooth} 0.4s, transform 1.4s ${bounce} 0.4s`,
      }}>
        {/* Red corona glow ring behind moon */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          /* ── CHANGE MOON SIZE HERE ──
             width/height = moon corona size.
             Currently: clamp(220px, 22vw, 320px)
             Increase both values to make bigger.
          ── */
          width:  'clamp(220px, 22vw, 320px)',
          height: 'clamp(220px, 22vw, 320px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,60,30,0.45) 0%, rgba(200,40,20,0.25) 40%, transparent 70%)',
          animation: mounted ? 'coronaPulse 6s ease-in-out infinite' : 'none',
          zIndex: -1,
        }} />

        <div style={{
          animation: mounted ? 'moonFloat 8s ease-in-out infinite 0.5s' : 'none',
        }}>
          <img
            src="/openworld/moon.png"
            alt="Moon"
            style={{
              /* ── CHANGE MOON SIZE HERE ──
                 clamp(min, preferred, max)
                 Currently: clamp(120px, 14vw, 200px)
                 e.g. change to clamp(160px, 18vw, 260px) for larger
              ── */
              width: 'clamp(120px, 14vw, 200px)',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 30px rgba(255,70,40,0.7))',
            }}
          />
        </div>
      </div>

      {/* ── GROUND ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28%',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%)' : 'translateY(100%)',
        transition: `opacity 1s ${snap} 0.1s, transform 1.1s ${snap} 0.1s`,
        animation: mounted ? 'groundPush 11s ease-in-out infinite 1.5s' : 'none',
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

      {/* ── HERO — large, sits on ground, real breathing ──
          bottom: ~24% = sits just above ground layer
          The hero is NOW massive.
      ── */}
      <div style={{
        position: 'absolute',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'translateX(-50%) translateY(0px)'
          : 'translateX(-50%) translateY(-120px) scale(0.7)',
        transition: `opacity 0.8s ${smooth} 0.6s, transform 1.1s ${bounce} 0.6s`,

        /* ── CHANGE HERO POSITION HERE ──
           left:   move hero left/right (50% = center)
           bottom: move hero up/down (24% = sits on ground)
        ── */
        left:   '50%',
        bottom: '22%',

        /* ── CHANGE HERO SIZE HERE ──
           clamp(min, preferred-vw, max)
           Currently: clamp(180px, 22vw, 340px)  ← MASSIVE
           Decrease preferred-vw (e.g. 14vw) to shrink
           Increase (e.g. 28vw) to grow even more
        ── */
        width: 'clamp(180px, 22vw, 340px)',
      }}>
        <div style={{
          animation: mounted ? 'heroBreath 5s ease-in-out infinite 1.8s' : 'none',
        }}>
          <img
            src="/openworld/hero.png"
            alt="Hero"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              /* green battle-glow on hero */
              filter: 'drop-shadow(0 0 20px rgba(0,220,90,0.55)) drop-shadow(0 4px 30px rgba(0,0,0,0.9))',
            }}
          />
        </div>
      </div>

      {/* ── VIGNETTE ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: [
          /* top edge dark — no black bar, gentle fade only */
          'linear-gradient(to bottom, rgba(2,5,10,0.55) 0%, rgba(2,5,10,0.08) 12%, transparent 28%)',
          'linear-gradient(to top,    rgba(2,5,10,0.65) 0%, transparent 35%)',
          'radial-gradient(ellipse 130% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 100%)',
        ].join(', '),
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.4s ${smooth} 0.2s`,
        zIndex: 6,
      }} />

      {/* ── TYPOGRAPHY ── */}
      <div style={{
        position: 'absolute',
        top: '8vh',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%) skewX(0deg)' : 'translateY(-8%) skewX(-6deg)',
        filter: mounted ? 'blur(0px)' : 'blur(14px)',
        transition: `opacity 1.1s ${snap} 0.7s, transform 1.2s ${snap} 0.7s, filter 1.0s ${snap} 0.7s`,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.68rem',
          letterSpacing: '0.38em',
          color: 'rgba(120,255,160,0.65)',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Stage 4 · Open World
        </span>
        <h2 style={{
          fontFamily: "'Cinzel', 'Times New Roman', serif",
          fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
          margin: 0,
          color: '#FFFFFF',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
          textShadow: '0 8px 40px rgba(0,0,0,0.95), 0 0 60px rgba(0,180,80,0.18)',
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

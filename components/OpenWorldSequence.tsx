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

        /* ── WORLD: strong zoom pulse — clearly visible ── */
        @keyframes worldBreathe {
          0%   { transform: scale(1);     filter: brightness(0.88) saturate(0.9); }
          100% { transform: scale(1.08);  filter: brightness(1.08) saturate(1.2) drop-shadow(0 0 80px rgba(0,200,80,0.4)); }
        }

        /* ── MOON: big glow pulse — fast and obvious ── */
        @keyframes moonPulse {
          0%   { transform: scale(1);    filter: drop-shadow(0 0 20px rgba(255,80,50,0.6))  drop-shadow(0 0 50px rgba(200,40,20,0.3)); }
          50%  { transform: scale(1.12); filter: drop-shadow(0 0 60px rgba(255,100,60,1.0)) drop-shadow(0 0 120px rgba(220,50,30,0.7)); }
          100% { transform: scale(1);    filter: drop-shadow(0 0 20px rgba(255,80,50,0.6))  drop-shadow(0 0 50px rgba(200,40,20,0.3)); }
        }

        /* ── MOON CORONA: independent fast pulse ── */
        @keyframes coronaPulse {
          0%,100% { opacity: 0.3;  transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.75; transform: translate(-50%, -50%) scale(1.25); }
        }

        /* ── HERO BREATH: pure Y + scale only — NO translateX ── */
        @keyframes heroBreath {
          0%   { transform: translateY(0px)   scaleY(1)     scaleX(1); }
          30%  { transform: translateY(-10px) scaleY(1.025) scaleX(0.988); }
          60%  { transform: translateY(-5px)  scaleY(1.012) scaleX(0.994); }
          80%  { transform: translateY(-13px) scaleY(1.03)  scaleX(0.985); }
          100% { transform: translateY(0px)   scaleY(1)     scaleX(1); }
        }

        /* ── GROUND: subtle forward push ── */
        @keyframes groundPush {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }

        /* ── BG pulse ── */
        @keyframes bgPulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }

        /* ── FOG drift ── */
        @keyframes fogDrift {
          0%   { transform: translateX(0%);    opacity: 0.2; }
          50%  { transform: translateX(-3.5%); opacity: 0.35; }
          100% { transform: translateX(0%);    opacity: 0.2; }
        }
      `}</style>

      {/* ── BASE BACKGROUND ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 60%, #0a1a0e 0%, #030d06 55%, #000000 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.6s ${smooth} 0s`,
        animation: mounted ? 'bgPulse 10s ease-in-out infinite 2s' : 'none',
      }} />

      {/* ── WORLD IMAGE ──
          objectPosition: center bottom = image anchors from bottom up.
          No black bar. transformOrigin: center bottom = zoom from ground up.
      ── */}
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
          /* Speed: 4s — was 12s. Direction alternate so it zooms in/out */
          animation: mounted ? 'worldBreathe 4s ease-in-out infinite alternate 2s' : 'none',
        }}>
          <img
            src="/openworld/world.png"
            alt="World"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center bottom',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── FOG ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,30,10,0.5) 0%, transparent 45%)',
        animation: mounted ? 'fogDrift 14s ease-in-out infinite' : 'none',
        opacity: mounted ? 1 : 0,
        transition: `opacity 2s ${smooth} 0.5s`,
      }} />

      {/* ── MOON — TOP RIGHT in the clouds ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '8%',   /* ← TOP RIGHT */
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0px) scale(1)' : 'translateY(-80px) scale(0.5)',
        transition: `opacity 1.2s ${smooth} 0.4s, transform 1.4s ${bounce} 0.4s`,
      }}>
        {/* Corona glow behind moon */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width:  'clamp(240px, 24vw, 340px)',
          height: 'clamp(240px, 24vw, 340px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,60,30,0.5) 0%, rgba(200,40,20,0.28) 45%, transparent 70%)',
          /* Speed: 3s — was 6s */
          animation: mounted ? 'coronaPulse 3s ease-in-out infinite' : 'none',
          zIndex: -1,
        }} />

        <div style={{
          /* Speed: 3s — was 8s */
          animation: mounted ? 'moonPulse 3s ease-in-out infinite' : 'none',
        }}>
          <img
            src="/openworld/moon.png"
            alt="Moon"
            style={{
              width: 'clamp(130px, 15vw, 210px)',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 30px rgba(255,70,40,0.8))',
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
        animation: mounted ? 'groundPush 9s ease-in-out infinite 1.5s' : 'none',
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

      {/* ── HERO ──
          CRITICAL: parent handles all positioning + arrival translateX(-50%).
          The heroBreath keyframe has ZERO translateX — only Y + scale.
          This stops the leftward drift completely.
      ── */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '22%',
        width: 'clamp(180px, 22vw, 340px)',
        zIndex: 5,
        /* Arrival: only translateX(-50%) + translateY drop. No X drift. */
        transform: mounted
          ? 'translateX(-50%) translateY(0px)'
          : 'translateX(-50%) translateY(-130px) scale(0.65)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.8s ${smooth} 0.6s, transform 1.1s ${bounce} 0.6s`,
      }}>
        {/* Inner div: only breathes in Y — no translateX ever */}
        <div style={{
          animation: mounted ? 'heroBreath 5s ease-in-out infinite 1.8s' : 'none',
          transformOrigin: 'center bottom',
        }}>
          <img
            src="/openworld/hero.png"
            alt="Hero"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 20px rgba(0,220,90,0.6)) drop-shadow(0 6px 30px rgba(0,0,0,0.95))',
            }}
          />
        </div>
      </div>

      {/* ── VIGNETTE ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        background: [
          'linear-gradient(to bottom, rgba(2,5,10,0.5) 0%, rgba(2,5,10,0.06) 14%, transparent 30%)',
          'linear-gradient(to top,    rgba(2,5,10,0.65) 0%, transparent 35%)',
          'radial-gradient(ellipse 130% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)',
        ].join(', '),
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.4s ${smooth} 0.2s`,
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
        pointerEvents: 'none',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%) skewX(0deg)' : 'translateY(-8%) skewX(-6deg)',
        filter: mounted ? 'blur(0px)' : 'blur(14px)',
        transition: `opacity 1.1s ${snap} 0.7s, transform 1.2s ${snap} 0.7s, filter 1.0s ${snap} 0.7s`,
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
          textShadow: '0 8px 40px rgba(0,0,0,0.95), 0 0 60px rgba(0,180,80,0.2)',
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

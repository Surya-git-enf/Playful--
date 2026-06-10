'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RacingSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [isActive])

  const ease = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0a0608' }}>
      <style>{`
        @keyframes panBgRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes panRoadUp {
          0%   { background-position-y: 100%; }
          100% { background-position-y: 0%; }
        }
        @keyframes engineVibrate {
          0%,100% { transform: translateY(0)    rotate(0deg);   }
          25%      { transform: translateY(1.5px) rotate(0.4deg);  }
          75%      { transform: translateY(-1px)  rotate(-0.4deg); }
        }
        @keyframes roadSlideUp {
          from { transform: translateY(120px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes bgRise {
          from { transform: translateX(-50%) translateY(40px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Background — rises in, then pans RIGHT (backward = retro continuity) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.7s ${ease}`,
      }}>
        <div style={{
          width: '200%', height: '100%',
          display: 'flex',
          animation: mounted ? 'panBgRight 38s linear infinite' : 'none',
        }}>
          <img src="/racing/bg.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <img src="/racing/bg.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* ── Road — slides up from bottom, then scrolls upward ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(160px, 35vh, 320px)',
        animation: mounted ? `roadSlideUp 0.9s ${ease} 0.1s both` : 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '200%', height: '100%',
          backgroundImage: 'url(/racing/road.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          animation: mounted ? 'panBgRight 1.4s linear infinite' : 'none',
        }} />
      </div>

      {/* ── Car — slams in from LEFT ── */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(120px, 26vh, 260px)',
        left: '50%',
        width: 'clamp(260px, 44vw, 620px)',
        transform: 'translateX(-50%)',
        opacity: mounted ? 1 : 0,
        marginLeft: mounted ? '0px' : '-120vw',
        transition: `opacity 0.01s, margin-left 0.95s ${ease} 0.2s`,
        zIndex: 10,
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))',
      }}>
        <div style={{
          animation: mounted ? 'engineVibrate 0.09s linear infinite' : 'none',
          transformOrigin: 'bottom center',
        }}>
          <img
            src="/racing/car.png"
            alt="Racing Car"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* ── Top gradient mask ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.88) 0%, rgba(2,2,2,0.2) 22%, transparent 42%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.8s ${ease}`,
      }} />

      {/* ── Typography ── */}
      <div style={{
        position: 'absolute',
        top: 'clamp(60px, 12vh, 110px)',
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-40px) skewX(-10deg)',
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1.1s ${ease} 0.3s`,
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase' as const,
          marginBottom: '10px',
        }}>
          Stage 3 · Racing
        </span>
        <h2 style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: 'clamp(4rem, 10vw, 8.5rem)',
          margin: 0, color: '#FFFFFF',
          fontWeight: 800, lineHeight: 0.9,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          textShadow: '0 10px 40px rgba(0,0,0,0.9)',
        }}>
          Heads Up, Gear
        </h2>
      </div>

    </div>
  )
}


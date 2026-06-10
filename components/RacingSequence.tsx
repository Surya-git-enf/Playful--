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
        @keyframes engineVibrate {
          0%,100% { transform: translateY(0)     rotate(0deg);   }
          25%      { transform: translateY(1.5px)  rotate(0.4deg);  }
          75%      { transform: translateY(-1px)   rotate(-0.4deg); }
        }
      `}</style>

      {/* ── Background — rises up from below like a curtain lift ── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'perspective(900px) rotateX(0deg) translateY(0) scale(1)'
          : 'perspective(900px) rotateX(8deg) translateY(60px) scale(1.06)',
        transition: `opacity 0.9s ${ease}, transform 1.1s ${ease}`,
        transformOrigin: 'bottom center',
      }}>
        <img
          src="/racing/bg.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Road — slams up from below with 3D tilt ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(160px, 35vh, 320px)',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'perspective(600px) rotateX(0deg) translateY(0)'
          : 'perspective(600px) rotateX(25deg) translateY(180px)',
        transition: `opacity 0.7s ${ease} 0.15s, transform 1s ${ease} 0.15s`,
        transformOrigin: 'bottom center',
      }}>
        <img
          src="/racing/road.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
        />
      </div>

      {/* ── Car — blasts in from left with 3D depth ── */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(120px, 26vh, 260px)',
        left: '50%',
        width: 'clamp(260px, 44vw, 620px)',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? 'perspective(800px) rotateY(0deg) translateX(0) scale(1)'
            : 'perspective(800px) rotateY(-35deg) translateX(-140%) scale(0.7)',
          transition: `opacity 0.6s ${ease} 0.25s, transform 1s ${ease} 0.25s`,
          filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.9))',
        }}>
          <div style={{
            animation: mounted ? 'engineVibrate 0.09s linear infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img
              src="/racing/car.png" alt="Racing Car"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
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
        transform: mounted
          ? 'translateY(0) skewX(0deg)'
          : 'translateY(-40px) skewX(-10deg)',
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1.1s ${ease} 0.3s`,
        zIndex: 20, pointerEvents: 'none',
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

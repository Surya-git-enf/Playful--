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

  const ease  = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0a0608' }}>

      {/* Background — rises with 3D tilt */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'perspective(1000px) rotateX(0deg) translateY(0) scale(1)'
          : 'perspective(1000px) rotateX(6deg) translateY(50px) scale(1.05)',
        transition: `opacity 1s ${ease}, transform 1.2s ${ease}`,
        transformOrigin: 'bottom center',
      }}>
        <img src="/racing/bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Road — slams up from below */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(140px, 32vh, 300px)',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'perspective(600px) rotateX(0deg) translateY(0)'
          : 'perspective(600px) rotateX(22deg) translateY(160px)',
        transition: `opacity 0.8s ${ease} 0.1s, transform 1s ${ease} 0.1s`,
        transformOrigin: 'bottom center',
      }}>
        <img src="/racing/road.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* Car — blasts in from RIGHT with 3D turn */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(110px, 28vh, 270px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(240px, 46vw, 640px)',
        zIndex: 10,
      }}>
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? 'perspective(900px) rotateY(0deg) translateX(0) scale(1)'
            : 'perspective(900px) rotateY(28deg) translateX(160%) scale(0.72)',
          transition: `opacity 0.5s ${ease} 0.2s, transform 1.1s ${ease} 0.2s`,
          filter: 'drop-shadow(0 20px 44px rgba(0,0,0,0.9))',
        }}>
          <img src="/racing/car.png" alt="Racing Car" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

      {/* Top gradient mask */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.88) 0%, rgba(2,2,2,0.2) 22%, transparent 42%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.9s ${ease}`,
      }} />

      {/* Typography */}
      <div style={{
        position: 'absolute',
        top: 'clamp(55px, 11vh, 105px)',
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
          fontSize: 'clamp(0.5rem, 1.1vw, 0.72rem)',
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '10px',
        }}>
          Stage 3 · Racing
        </span>
        <h2 style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: 'clamp(3.8rem, 10vw, 8.5rem)',
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


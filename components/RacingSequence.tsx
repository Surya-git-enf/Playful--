'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RacingSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let mountTimer: NodeJS.Timeout
    if (isActive) {
      mountTimer = setTimeout(() => setMounted(true), 50)
    } else {
      setMounted(false)
    }
    return () => clearTimeout(mountTimer)
  }, [isActive])

  const premiumEase    = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0a0608' }}>
      <style>{`
        @keyframes bgBreath {
          0%,100% { transform: perspective(1200px) rotateX(0deg)   scale(1.02) translateY(0px);  }
          50%      { transform: perspective(1200px) rotateX(1.5deg) scale(1.05) translateY(-8px); }
        }
        @keyframes roadPulse {
          0%,100% { transform: scale(1);     }
          50%      { transform: scale(1.008); }
        }
      `}</style>

      {/* MASTER WRAPPER */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity',
      }}>

        {/* LAYER 1: BACKGROUND — rises with 3D tilt */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? 'perspective(1200px) rotateX(0deg) translateY(0) scale(1)'
            : 'perspective(1200px) rotateX(7deg) translateY(55px) scale(1.06)',
          transition: `opacity 1s ${premiumEase}, transform 1.3s ${premiumEase}`,
          transformOrigin: 'bottom center',
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'bgBreath 18s ease-in-out infinite' : 'none',
          }}>
            <img src="/racing/bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

        {/* LAYER 2: ROAD — slams up from below */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 'clamp(130px, 30dvh, 290px)',
          zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? 'perspective(700px) rotateX(0deg) translateY(0)'
            : 'perspective(700px) rotateX(24deg) translateY(170px)',
          transition: `opacity 0.8s ${aggressiveEase} 0.12s, transform 1.05s ${aggressiveEase} 0.12s`,
          transformOrigin: 'bottom center',
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'roadPulse 8s ease-in-out infinite' : 'none',
          }}>
            <img src="/racing/road.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          </div>
        </div>

        {/* LAYER 3: CAR — blasts in from RIGHT with 3D rotation */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(100px, 27dvh, 265px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(240px, 72vw, 680px)',
          zIndex: 10,
        }}>
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted
              ? 'perspective(900px) rotateY(0deg) translateX(0) scale(1)'
              : 'perspective(900px) rotateY(32deg) translateX(180%) scale(0.65)',
            transition: `opacity 0.5s ${aggressiveEase} 0.22s, transform 1.15s ${aggressiveEase} 0.22s`,
            filter: 'drop-shadow(0 22px 48px rgba(0,0,0,0.92))',
          }}>
            <img src="/racing/car.png" alt="Racing Car" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

      </div>

      {/* OBSIDIAN GRADIENT MASK */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.88) 0%, rgba(2,2,2,0.2) 22%, transparent 42%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 15,
      }} />

      {/* TYPOGRAPHY */}
      <div style={{
        position: 'absolute',
        top: '8dvh',
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? 'translateY(0) skewX(0deg)'
          : 'translateY(-40px) skewX(-10deg)',
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.5rem, 1.1vw, 0.68rem)',
          letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.6)',
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

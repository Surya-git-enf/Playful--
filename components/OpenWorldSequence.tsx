'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function OpenWorldSequence({ isActive }: Props) {
  const moonRef    = useRef<HTMLDivElement>(null)
  const worldRef   = useRef<HTMLDivElement>(null)
  const groundRef  = useRef<HTMLDivElement>(null)
  const heroRef    = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const played     = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // moon — fd + br
    tl.fromTo(moonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    )

    // world — su + br (origin=bottom-center)
    tl.fromTo(worldRef.current,
      { y: 200, opacity: 0, scale: 0.7, transformOrigin: 'bottom center' },
      { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'back.out(1.4)' },
      '-=0.4'
    )

    // ground — heavy su + thud
    tl.fromTo(groundRef.current,
      { y: 250 },
      { y: 0, duration: 0.55, ease: 'back.out(2.2)' },
      '-=0.5'
    )

    // hero — hr + idle br
    tl.fromTo(heroRef.current,
      { y: -240, scaleY: 1.3, scaleX: 0.75, opacity: 0 },
      { y: 0,    scaleY: 1,   scaleX: 1,    opacity: 1,
        duration: 0.6, ease: 'bounce.out' },
      '-=0.2'
    )

    // title — fantasy font soft rotateX reveal
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(12px)', rotateX: 35, perspective: 700, scale: 0.8 },
      { opacity: 1, filter: 'blur(0)',    rotateX: 0,  scale: 1,
        duration: 0.7, ease: 'power3.out' },
      '-=0.1'
    )
  }, [isActive])

  useEffect(() => {
    if (!isActive) played.current = false
  }, [isActive])

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 90% 80% at 50% 20%, #061428 0%, #020813 60%, #010208 100%)',
    }}>

      {/* Star backdrop */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 80 }, (_, i) => (
          <circle key={i}
            cx={(i * 79 + 13) % 100} cy={(i * 53 + 7) % 75}
            r={(i % 5 === 0) ? 0.55 : 0.3}
            fill="#fff" opacity={0.2 + (i % 8) * 0.06}
          />
        ))}
      </svg>

      {/* Aurora */}
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0, height: '35%',
        background: 'linear-gradient(180deg, rgba(0,60,120,0.25) 0%, rgba(0,180,100,0.08) 50%, transparent 100%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Moon (layer 1) */}
      <div ref={moonRef} style={{
        position: 'absolute',
        top: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(80px, 14vw, 160px)',
        height: 'clamp(80px, 14vw, 160px)',
        borderRadius: '50%',
        opacity: 0,
        animation: isActive ? 'moonBreath 5s ease-in-out infinite 0.8s' : 'none',
      }}>
        <MoonSVG />
      </div>

      {/* World orb (layer 2) */}
      <div ref={worldRef} style={{
        position: 'absolute',
        bottom: '26%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(200px, 38vw, 480px)',
        height: 'clamp(200px, 38vw, 480px)',
        opacity: 0,
        animation: isActive ? 'breatheSlow 6s ease-in-out infinite 1s' : 'none',
      }}>
        <WorldOrbSVG />
      </div>

      {/* Ground (layer 3) */}
      <div ref={groundRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '28%',
      }}>
        <svg viewBox="0 0 100 28" preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}>
          {/* Terrain silhouette */}
          <path d="M0 28 L0 16 Q8 8 18 14 Q28 6 38 12 Q50 4 62 11 Q74 5 84 14 Q92 8 100 12 L100 28 Z"
            fill="#040d20"/>
          <path d="M0 28 L0 20 Q15 14 30 18 Q50 12 70 17 Q85 13 100 18 L100 28 Z"
            fill="#020810"/>
          {/* Glow line on horizon */}
          <path d="M0 15 Q25 10 50 13 Q75 8 100 12"
            stroke="rgba(0,180,80,0.3)" strokeWidth="0.6" fill="none"/>
          {/* Trees */}
          {[12,25,38,62,75,88].map((x,i) => (
            <g key={i}>
              <rect x={x-1} y={9+i%3} width="2" height="5" fill="rgba(0,100,40,0.5)"/>
              <polygon points={`${x},${5+i%3} ${x-4},${12+i%3} ${x+4},${12+i%3}`}
                fill={i%2===0?'rgba(0,140,60,0.5)':'rgba(0,100,50,0.45)'}/>
            </g>
          ))}
        </svg>
      </div>

      {/* Hero (layer 4) */}
      <div ref={heroRef} style={{
        position: 'absolute',
        bottom: '27%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(36px, 5vw, 64px)',
        opacity: 0,
        filter: 'drop-shadow(0 0 12px rgba(0,200,80,0.5))',
        animation: isActive ? 'breathe 3s ease-in-out infinite 1s' : 'none',
      }}>
        <HeroSVG />
      </div>

      {/* Title */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '7%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30,
        perspective: '700px',
      }}>
        <div className="scene-eyebrow">Stage 4 · Open World</div>
        <h2 style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
          color: '#fff',
          letterSpacing: '0.04em',
          lineHeight: 1.2,
          textShadow: '0 0 30px rgba(0,200,80,0.4), 0 0 80px rgba(0,100,60,0.2)',
        }}>
          Every Path<br/>Breathes
        </h2>
      </div>
    </div>
  )
}

function MoonSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}>
      {/* Glow */}
      <circle cx="50" cy="50" r="48" fill="rgba(200,220,255,0.08)" filter="blur(6px)"/>
      {/* Moon body */}
      <circle cx="50" cy="50" r="40" fill="url(#moonGrad)"/>
      {/* Craters */}
      <circle cx="36" cy="38" r="7" fill="rgba(150,170,210,0.25)" stroke="rgba(180,200,240,0.3)" strokeWidth="0.8"/>
      <circle cx="62" cy="55" r="5" fill="rgba(150,170,210,0.2)"  stroke="rgba(180,200,240,0.25)" strokeWidth="0.6"/>
      <circle cx="44" cy="64" r="4" fill="rgba(150,170,210,0.18)" stroke="rgba(180,200,240,0.2)" strokeWidth="0.5"/>
      <defs>
        <radialGradient id="moonGrad" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0"   stopColor="#dce8ff"/>
          <stop offset="0.6" stopColor="#b8ccf0"/>
          <stop offset="1"   stopColor="#8aa4d8"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

function WorldOrbSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}>
      {/* Outer glow */}
      <circle cx="100" cy="100" r="98" fill="rgba(0,100,180,0.12)" filter="blur(10px)"/>
      {/* Ocean */}
      <circle cx="100" cy="100" r="92" fill="url(#oceanGrad)"/>
      {/* Continents */}
      <path d="M60 60 Q80 40 110 55 Q130 48 140 70 Q145 90 130 100 Q120 115 100 108 Q80 118 65 100 Q48 85 60 60 Z"
        fill="rgba(30,140,70,0.7)" stroke="rgba(0,200,80,0.3)" strokeWidth="1"/>
      <path d="M55 120 Q70 112 80 125 Q75 140 60 138 Z"
        fill="rgba(30,140,70,0.6)"/>
      <path d="M130 108 Q148 105 150 118 Q145 132 132 126 Z"
        fill="rgba(30,140,70,0.55)"/>
      {/* Atmosphere rim */}
      <circle cx="100" cy="100" r="92"
        fill="none" stroke="rgba(0,180,255,0.25)" strokeWidth="6"
        filter="blur(3px)"/>
      {/* Lat/lon lines */}
      <ellipse cx="100" cy="100" rx="92" ry="30" stroke="rgba(0,200,255,0.08)" strokeWidth="0.8" fill="none"/>
      <ellipse cx="100" cy="100" rx="92" ry="65" stroke="rgba(0,200,255,0.06)" strokeWidth="0.8" fill="none"/>
      <line x1="100" y1="8" x2="100" y2="192" stroke="rgba(0,200,255,0.07)" strokeWidth="0.8"/>
      <defs>
        <radialGradient id="oceanGrad" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0"   stopColor="#0a4080"/>
          <stop offset="0.6" stopColor="#062850"/>
          <stop offset="1"   stopColor="#031528"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

function HeroSVG() {
  return (
    <svg viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto' }}>
      {/* Cloak */}
      <path d="M4 18 L0 42 L14 38 L28 42 L24 18 Z" fill="rgba(0,140,60,0.6)" stroke="rgba(0,200,80,0.3)" strokeWidth="0.8"/>
      {/* Body */}
      <rect x="8" y="14" width="12" height="16" rx="3" fill="#1a5c30" stroke="rgba(0,200,80,0.4)" strokeWidth="0.8"/>
      {/* Head */}
      <circle cx="14" cy="9" r="8" fill="#c8a06a" stroke="rgba(200,160,100,0.4)" strokeWidth="0.8"/>
      {/* Helmet */}
      <path d="M6 9 Q6 0 14 0 Q22 0 22 9" fill="rgba(30,100,50,0.8)" stroke="rgba(0,200,80,0.4)" strokeWidth="0.8"/>
      {/* Eyes */}
      <circle cx="11" cy="9" r="1.5" fill="rgba(0,234,255,0.9)"/>
      <circle cx="17" cy="9" r="1.5" fill="rgba(0,234,255,0.9)"/>
      {/* Staff */}
      <rect x="24" y="6" width="2" height="32" fill="rgba(180,140,60,0.8)"/>
      <circle cx="25" cy="5" r="3" fill="rgba(0,234,255,0.7)" filter="blur(1px)"/>
    </svg>
  )
      }
        

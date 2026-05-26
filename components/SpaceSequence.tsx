'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import PromptPanel from './PromptPanel'

interface Props { isActive: boolean }

export default function SpaceSequence({ isActive }: Props) {
  const earthRef    = useRef<HTMLDivElement>(null)
  const groundRef   = useRef<HTMLDivElement>(null)
  const astroRef    = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)
  const played      = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // earth — fd + sd + br
    tl.fromTo(earthRef.current,
      { opacity: 0, y: -60, scale: 0.85 },
      { opacity: 1, y: 0,   scale: 1, duration: 0.9, ease: 'power3.out' }
    )

    // ground — heavy su
    tl.fromTo(groundRef.current,
      { y: 260 }, { y: 0, duration: 0.6, ease: 'back.out(2)' },
      '-=0.5'
    )

    // astronaut — slideFromRight + slow hover
    tl.fromTo(astroRef.current,
      { x: 340, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    )

    // title — holographic spn
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(16px)', rotateY: -100 },
      { opacity: 1, filter: 'blur(0)',    rotateY: 0,
        duration: 0.75, ease: 'power3.out' },
      '-=0.2'
    )

    // prompt panel — glassmorphism rise
    tl.fromTo(panelRef.current,
      { opacity: 0, y: 60, filter: 'blur(10px)' },
      { opacity: 1, y: 0,  filter: 'blur(0)',
        duration: 0.7, ease: 'power3.out' },
      '-=0.15'
    )
  }, [isActive])

  useEffect(() => {
    if (!isActive) played.current = false
  }, [isActive])

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 100% 80% at 50% 0%, #030820 0%, #010510 50%, #000005 100%)',
    }}>

      {/* Deep space star field */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 100 }, (_, i) => (
          <circle key={i}
            cx={(i * 83 + 17) % 100} cy={(i * 61 + 11) % 100}
            r={i % 7 === 0 ? 0.6 : i % 3 === 0 ? 0.4 : 0.25}
            fill="#fff"
            opacity={0.15 + (i % 9) * 0.06}
          />
        ))}
      </svg>

      {/* Nebula glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%', right: '20%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, rgba(0,100,200,0.05) 50%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Earth (layer 1) — top center */}
      <div ref={earthRef} style={{
        position: 'absolute',
        top: '-6%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(120px, 22vw, 280px)',
        height: 'clamp(120px, 22vw, 280px)',
        opacity: 0,
        animation: isActive ? 'moonBreath 7s ease-in-out infinite 0.9s' : 'none',
      }}>
        <EarthSVG />
      </div>

      {/* Lunar ground (layer 2) */}
      <div ref={groundRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '30%',
      }}>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}>
          <path d="M0 30 L0 18 Q10 14 20 17 Q30 11 42 15 Q55 9 68 14 Q80 10 92 15 Q96 13 100 14 L100 30 Z"
            fill="#0a0c18"/>
          <path d="M0 30 L0 22 Q20 18 40 21 Q60 17 80 20 Q90 18 100 20 L100 30 Z"
            fill="#060810"/>
          {/* Lunar craters */}
          {[[18,18,5],[40,15,4],[65,17,6],[82,14,3]].map(([cx,cy,r],i)=>(
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r*0.4}
              fill="none" stroke="rgba(100,120,200,0.2)" strokeWidth="0.5"/>
          ))}
          {/* Distant flag */}
          <rect x="75" y="9" width="1" height="8" fill="rgba(255,255,255,0.4)"/>
          <rect x="76" y="9" width="5" height="3" fill="rgba(0,180,255,0.6)"/>
        </svg>
      </div>

      {/* Astronaut (layer 3) */}
      <div ref={astroRef} style={{
        position: 'absolute',
        bottom: '28%',
        right: '15%',
        width: 'clamp(60px, 10vw, 130px)',
        opacity: 0,
        filter: 'drop-shadow(0 0 16px rgba(0,234,255,0.35))',
        animation: isActive ? 'astroHover 4s ease-in-out infinite 0.8s' : 'none',
      }}>
        <AstronautSVG />
      </div>

      {/* Title — holographic */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '20%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30, perspective: '800px',
      }}>
        <div className="scene-eyebrow">Stage 5 · Space</div>
        <h2 style={{
          fontFamily: 'var(--font-orbitron)',
          fontWeight: 900,
          fontSize: 'clamp(2rem, 6vw, 5.5rem)',
          letterSpacing: '0.15em',
          background: 'linear-gradient(135deg, #00eaff, #8b5cf6, #e879f9, #00eaff)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'holographic 4s ease infinite',
          filter: 'drop-shadow(0 0 20px rgba(0,234,255,0.3))',
        }}>
          Beyond Orbit
        </h2>
      </div>

      {/* Prompt panel */}
      <div ref={panelRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: 0, zIndex: 50,
      }}>
        <PromptPanel />
      </div>
    </div>
  )
}

function EarthSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}>
      {/* Glow */}
      <circle cx="100" cy="100" r="98" fill="rgba(0,100,200,0.12)" filter="blur(8px)"/>
      {/* Ocean */}
      <circle cx="100" cy="100" r="90" fill="url(#earthOcean)"/>
      {/* Land masses */}
      <path d="M45 55 Q65 35 90 48 Q108 40 120 60 Q132 55 138 75 Q140 95 125 105 Q110 120 88 110 Q68 118 55 100 Q38 82 45 55 Z"
        fill="rgba(30,160,70,0.75)" stroke="rgba(50,200,80,0.3)" strokeWidth="0.8"/>
      <path d="M100 120 Q120 112 130 128 Q122 145 105 140 Z"
        fill="rgba(30,160,70,0.65)"/>
      <path d="M148 80 Q165 76 168 92 Q160 108 148 100 Z"
        fill="rgba(30,160,70,0.6)"/>
      {/* Cloud wisps */}
      <path d="M35 70 Q55 62 75 70" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M110 85 Q130 78 150 84" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Atmosphere */}
      <circle cx="100" cy="100" r="90" fill="none"
        stroke="rgba(0,200,255,0.3)" strokeWidth="8" filter="blur(4px)"/>
      <defs>
        <radialGradient id="earthOcean" cx="0.38" cy="0.35" r="0.72">
          <stop offset="0"   stopColor="#1060b0"/>
          <stop offset="0.6" stopColor="#062860"/>
          <stop offset="1"   stopColor="#021030"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

function AstronautSVG() {
  return (
    <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto' }}>
      {/* Jetpack */}
      <rect x="28" y="50" width="24" height="30" rx="5" fill="#1a1a3a" stroke="rgba(0,234,255,0.3)" strokeWidth="1"/>
      {/* Thruster glow */}
      <ellipse cx="36" cy="82" rx="5" ry="3" fill="rgba(0,234,255,0.6)" filter="blur(3px)"/>
      <ellipse cx="44" cy="82" rx="5" ry="3" fill="rgba(139,92,246,0.6)" filter="blur(3px)"/>
      {/* Suit body */}
      <rect x="20" y="48" width="40" height="38" rx="10"
        fill="#e8e8f0" stroke="rgba(200,210,240,0.6)" strokeWidth="1"/>
      {/* Arm left */}
      <rect x="4" y="52" width="18" height="12" rx="6"
        fill="#d8d8e8" stroke="rgba(200,210,240,0.4)" strokeWidth="0.8"/>
      <circle cx="6" cy="58" r="5" fill="#c0c0d8"/>
      {/* Arm right */}
      <rect x="58" y="52" width="18" height="12" rx="6"
        fill="#d8d8e8" stroke="rgba(200,210,240,0.4)" strokeWidth="0.8"/>
      <circle cx="74" cy="58" r="5" fill="#c0c0d8"/>
      {/* Legs */}
      <rect x="26" y="84" width="12" height="22" rx="6" fill="#d0d0e0" stroke="rgba(200,210,240,0.4)" strokeWidth="0.8"/>
      <rect x="42" y="84" width="12" height="22" rx="6" fill="#d0d0e0" stroke="rgba(200,210,240,0.4)" strokeWidth="0.8"/>
      {/* Boots */}
      <rect x="22" y="102" width="18" height="10" rx="5" fill="#888"/>
      <rect x="40" y="102" width="18" height="10" rx="5" fill="#888"/>
      {/* Helmet */}
      <circle cx="40" cy="32" r="28" fill="#e0e8f8" stroke="rgba(200,220,255,0.6)" strokeWidth="1.5"/>
      {/* Visor */}
      <path d="M18 32 Q18 16 40 16 Q62 16 62 32 Q62 44 40 44 Q18 44 18 32 Z"
        fill="rgba(0,100,180,0.7)" stroke="rgba(0,200,255,0.5)" strokeWidth="1"/>
      {/* Visor reflection */}
      <path d="M24 24 Q30 20 42 22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Helmet decal */}
      <text x="32" y="35" fontFamily="monospace" fontSize="7" fill="rgba(0,234,255,0.8)">🎮</text>
      {/* Collar */}
      <rect x="22" y="52" width="36" height="8" rx="4" fill="#c8c8dc" stroke="rgba(200,210,240,0.5)" strokeWidth="0.8"/>
    </svg>
  )
}


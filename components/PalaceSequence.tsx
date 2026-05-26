'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  isActive: boolean
  palaceFrame: React.MutableRefObject<number>
}

// Star field: pre-computed positions
const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: (Math.sin(i * 137.5) * 0.5 + 0.5) * 100,
  y: (Math.cos(i * 97.3) * 0.5 + 0.5) * 100,
  r: 0.5 + (i % 5) * 0.35,
  o: 0.3 + (i % 7) * 0.1,
}))

// Particles
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: 10 + (i * 47) % 80,
  y: 10 + (i * 61) % 80,
  size: 3 + (i % 4) * 2,
  dur: 3 + (i % 5),
  del: i * 0.4,
}))

export default function PalaceSequence({ isActive, palaceFrame }: Props) {
  const rootRef    = useRef<HTMLDivElement>(null)
  const envRef     = useRef<HTMLDivElement>(null)    // camera target
  const pillar1Ref = useRef<HTMLDivElement>(null)
  const pillar2Ref = useRef<HTMLDivElement>(null)
  const archRef    = useRef<HTMLDivElement>(null)
  const mistRef    = useRef<HTMLDivElement>(null)
  const innerRef   = useRef<HTMLDivElement>(null)    // inner courtyard
  const beamRef    = useRef<HTMLDivElement>(null)    // light beam
  const titleRef   = useRef<HTMLDivElement>(null)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)

  // Build GSAP timeline (once)
  useEffect(() => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

    // --- f0–30: environment reveals ---
    tl.fromTo(mistRef.current,    { opacity: 0.9 },           { opacity: 0.2, duration: 0.25 })
    tl.fromTo(pillar1Ref.current, { y: 80, opacity: 0 },      { y: 0, opacity: 1, ease: 'power2.out', duration: 0.2 }, '<+0.05')
    tl.fromTo(pillar2Ref.current, { y: 80, opacity: 0 },      { y: 0, opacity: 1, ease: 'power2.out', duration: 0.2 }, '<+0.04')

    // --- f30–70: camera push (scale environment) ---
    tl.fromTo(envRef.current, { scale: 1, x: 0 },             { scale: 1.18, x: -20, duration: 0.4, ease: 'power1.inOut' })
    tl.fromTo(archRef.current, { scale: 0.7, opacity: 0 },    { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' }, '<+0.1')

    // --- f70–90: inner courtyard ---
    tl.fromTo(innerRef.current, { opacity: 0, y: 30 },        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
    tl.fromTo(beamRef.current,  { opacity: 0, scaleY: 0 },    { opacity: 0.6, scaleY: 1, duration: 0.15, ease: 'power3.out' }, '<')

    // --- f90–100: title fade + blur → spinReveal (f100-120 per spec) ---
    tl.fromTo(
      titleRef.current,
      { opacity: 0, filter: 'blur(16px)', rotateY: -80 },
      { opacity: 1, filter: 'blur(0px)', rotateY: 0, duration: 0.2, ease: 'power3.out' },
      0.85
    )

    tlRef.current = tl
    return () => { tl.kill() }
  }, [])

  // RAF loop: read palaceFrame ref (no re-renders) → drive timeline progress
  useEffect(() => {
    if (!isActive) return

    let currentP = 0
    let rafId: number

    const tick = () => {
      const targetP = palaceFrame.current / 144
      // Smooth lerp (elastic follow)
      currentP += (targetP - currentP) * 0.08
      if (tlRef.current) {
        tlRef.current.progress(Math.max(0, Math.min(1, currentP)))
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, palaceFrame])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #0d0630 0%, #030118 60%, #010010 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Star field */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.3} fill="#fff" opacity={s.o} />
        ))}
      </svg>

      {/* Ambient particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#00eaff' : '#e879f9',
            boxShadow: `0 0 ${p.size * 3}px currentColor`,
            animation: `particleFloat ${p.dur}s ease-in-out ${p.del}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      {/* Mist layer */}
      <div
        ref={mistRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 60% at 50% 80%, rgba(20,5,50,0.95) 0%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      />

      {/* Camera-driven environment */}
      <div
        ref={envRef}
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 50%',
        }}
      >
        {/* Stone floor lines — perspective grid */}
        <svg
          style={{ position: 'absolute', bottom: '15%', left: 0, width: '100%', height: '50%', opacity: 0.15 }}
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={50} y1={0} x2={i * 15 - 5} y2={50} stroke="#a78bfa" strokeWidth="0.4" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={0} y1={10 + i * 7} x2={100} y2={10 + i * 7} stroke="#a78bfa" strokeWidth="0.2" />
          ))}
        </svg>

        {/* Left pillar */}
        <div
          ref={pillar1Ref}
          style={{
            position: 'absolute',
            left: '8%',
            bottom: '20%',
            width: 'clamp(50px, 8vw, 100px)',
            height: '60vh',
            opacity: 0,
          }}
        >
          <PillarSVG />
        </div>

        {/* Right pillar */}
        <div
          ref={pillar2Ref}
          style={{
            position: 'absolute',
            right: '8%',
            bottom: '20%',
            width: 'clamp(50px, 8vw, 100px)',
            height: '60vh',
            opacity: 0,
            transform: 'scaleX(-1)',
          }}
        >
          <PillarSVG />
        </div>

        {/* Central arch */}
        <div
          ref={archRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '15%',
            transform: 'translateX(-50%)',
            width: 'clamp(200px, 40vw, 480px)',
            opacity: 0,
          }}
        >
          <ArchSVG />
        </div>

        {/* Inner courtyard glow */}
        <div
          ref={innerRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '35%',
            transform: 'translateX(-50%)',
            width: 'clamp(120px, 20vw, 280px)',
            height: 'clamp(80px, 14vh, 180px)',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)',
            borderRadius: '50%',
            opacity: 0,
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* Divine light beam */}
      <div
        ref={beamRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: '2px',
          height: '55vh',
          background: 'linear-gradient(180deg, transparent, rgba(196,181,253,0.6), rgba(139,92,246,0.4), transparent)',
          filter: 'blur(6px)',
          opacity: 0,
          transformOrigin: 'top center',
        }}
      />

      {/* Title — f100–120 */}
      <div
        ref={titleRef}
        className="scene-title-wrap"
        style={{
          opacity: 0,
          perspective: '800px',
        }}
      >
        <div className="scene-eyebrow">✦ Palace ✦</div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
            lineHeight: 1.05,
            color: '#fff',
            letterSpacing: '-0.01em',
            textShadow: '0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(139,92,246,0.15)',
          }}
        >
          Kingdoms Never Sleep
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.65rem, 1.2vw, 0.82rem)',
          color: 'rgba(196,181,253,0.6)',
          marginTop: 14,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Scroll to explore ↓
        </p>
      </div>
    </div>
  )
}

// ─── sub-components (pure SVG, no deps) ───────────────────

function PillarSVG() {
  return (
    <svg viewBox="0 0 60 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Capital */}
      <rect x="2" y="0" width="56" height="18" rx="3" fill="rgba(100,70,180,0.4)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8"/>
      <rect x="8" y="14" width="44" height="8" rx="2" fill="rgba(80,50,160,0.5)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.6"/>
      {/* Shaft flutes */}
      {Array.from({length:5},(_,i)=>(
        <line key={i} x1={13+i*9} y1="22" x2={13+i*9} y2="272" stroke="rgba(139,92,246,0.2)" strokeWidth="1.2"/>
      ))}
      <rect x="10" y="22" width="40" height="250" rx="4" fill="rgba(60,30,120,0.35)" stroke="rgba(100,70,200,0.35)" strokeWidth="0.8"/>
      {/* Base */}
      <rect x="4" y="272" width="52" height="12" rx="3" fill="rgba(80,50,160,0.4)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8"/>
      <rect x="0" y="284" width="60" height="16" rx="2" fill="rgba(60,30,120,0.5)" stroke="rgba(100,70,200,0.3)" strokeWidth="0.6"/>
    </svg>
  )
}

function ArchSVG() {
  return (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {/* Outer arch */}
      <path
        d="M20 320 L20 160 Q20 20 240 20 Q460 20 460 160 L460 320"
        stroke="rgba(139,92,246,0.5)" strokeWidth="3" fill="none"
      />
      {/* Inner arch */}
      <path
        d="M60 320 L60 170 Q60 70 240 70 Q420 70 420 170 L420 320"
        stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" fill="none"
      />
      {/* Keystone */}
      <polygon points="220,10 260,10 252,44 228,44" fill="rgba(139,92,246,0.5)" stroke="rgba(196,181,253,0.5)" strokeWidth="1"/>
      {/* Decorative dots on arch */}
      {Array.from({length:11},(_,i) => {
        const angle = Math.PI + (i/(10)) * Math.PI
        const cx = 240 + 220 * Math.cos(angle)
        const cy = 160 + 140 * Math.sin(angle)
        return <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(196,181,253,0.5)" />
      })}
      {/* Inner glow fill */}
      <path
        d="M60 320 L60 170 Q60 70 240 70 Q420 70 420 170 L420 320 Z"
        fill="rgba(139,92,246,0.04)"
      />
      {/* Ground line */}
      <line x1="0" y1="318" x2="480" y2="318" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
    </svg>
  )
      }
      

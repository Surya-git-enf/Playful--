'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import PromptPanel from './PromptPanel'

interface Props { isActive: boolean }

export default function SpaceSequence({ isActive }: Props) {
  const earthRef   = useRef<HTMLDivElement>(null)
  const groundRef  = useRef<HTMLDivElement>(null)
  const astroRef   = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const played     = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // earth — fd + sd + br
    tl.fromTo(earthRef.current,
      { opacity: 0, y: -60, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' })

    // ground — heavy su
    tl.fromTo(groundRef.current,
      { y: 260 }, { y: 0, duration: 0.6, ease: 'back.out(2)' },
      '-=0.5')

    // astronaut — slideFromRight
    tl.fromTo(astroRef.current,
      { x: 340, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.4')

    // title — holographic spn
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(16px)', rotateY: -100 },
      { opacity: 1, filter: 'blur(0)', rotateY: 0, duration: 0.75, ease: 'power3.out' },
      '-=0.2')

    // prompt panel — glassmorphism rise
    tl.fromTo(panelRef.current,
      { opacity: 0, y: 60, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0)', duration: 0.7, ease: 'power3.out' },
      '-=0.15')
  }, [isActive])

  useEffect(() => { if (!isActive) played.current = false }, [isActive])

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 100% 80% at 50% 0%, #030820 0%, #010510 50%, #000005 100%)',
    }}>

      {/* Earth — layer 1, top center */}
      <div ref={earthRef} style={{
        position: 'absolute', top: '-8%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(140px, 26vw, 320px)',
        opacity: 0,
        animation: isActive ? 'moonBreath 7s ease-in-out infinite 0.9s' : 'none',
        filter: 'drop-shadow(0 0 40px rgba(0,120,255,0.35))',
      }}>
        <img src="/space/earth.png" alt="Earth"
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Lunar ground — layer 2 */}
      <div ref={groundRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '28%',
      }}>
        <img src="/space/lunar-ground.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* Astronaut — layer 3, slideFromRight */}
      <div ref={astroRef} style={{
        position: 'absolute', bottom: '27%', right: '12%',
        width: 'clamp(70px, 11vw, 150px)',
        opacity: 0,
        filter: 'drop-shadow(0 0 18px rgba(0,234,255,0.4))',
        animation: isActive ? 'astroHover 4s ease-in-out infinite 0.8s' : 'none',
      }}>
        <img src="/space/astronaut.png" alt="Astronaut"
          style={{ width: '100%', height: 'auto', display: 'block' }} />
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

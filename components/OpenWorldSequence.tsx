
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function OpenWorldSequence({ isActive }: Props) {
  const moonRef   = useRef<HTMLDivElement>(null)
  const worldRef  = useRef<HTMLDivElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const heroRef   = useRef<HTMLDivElement>(null)
  const titleRef  = useRef<HTMLDivElement>(null)
  const played    = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // moon — fd + br
    tl.fromTo(moonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' })

    // world — su + br origin=bottom-center
    tl.fromTo(worldRef.current,
      { y: 200, opacity: 0, scale: 0.7, transformOrigin: 'bottom center' },
      { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'back.out(1.4)' },
      '-=0.4')

    // ground — heavy su + thud
    tl.fromTo(groundRef.current,
      { y: 250 }, { y: 0, duration: 0.55, ease: 'back.out(2.2)' },
      '-=0.5')

    // hero — heroDrop + idle br
    tl.fromTo(heroRef.current,
      { y: -240, scaleY: 1.3, scaleX: 0.75, opacity: 0 },
      { y: 0, scaleY: 1, scaleX: 1, opacity: 1, duration: 0.6, ease: 'bounce.out' },
      '-=0.2')

    // title — fantasy soft rotateX reveal
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(12px)', rotateX: 35, scale: 0.8 },
      { opacity: 1, filter: 'blur(0)', rotateX: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
      '-=0.1')
  }, [isActive])

  useEffect(() => { if (!isActive) played.current = false }, [isActive])

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 90% 80% at 50% 20%, #061428 0%, #020813 60%, #010208 100%)',
    }}>

      {/* Moon — layer 1 */}
      <div ref={moonRef} style={{
        position: 'absolute', top: '6%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(80px, 14vw, 180px)',
        opacity: 0,
        animation: isActive ? 'moonBreath 5s ease-in-out infinite 0.8s' : 'none',
        filter: 'drop-shadow(0 0 30px rgba(200,220,255,0.4))',
      }}>
        <img src="/openworld/moon.png" alt="Moon"
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* World orb — layer 2 */}
      <div ref={worldRef} style={{
        position: 'absolute', bottom: '24%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(200px, 40vw, 520px)',
        opacity: 0,
        animation: isActive ? 'breatheSlow 6s ease-in-out infinite 1s' : 'none',
        filter: 'drop-shadow(0 0 40px rgba(0,180,80,0.25))',
      }}>
        <img src="/openworld/world.png" alt="World"
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Ground — layer 3 */}
      <div ref={groundRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '26%',
      }}>
        <img src="/openworld/ground.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* Hero — layer 4 */}
      <div ref={heroRef} style={{
        position: 'absolute', bottom: '26%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(40px, 5.5vw, 80px)',
        opacity: 0,
        filter: 'drop-shadow(0 0 14px rgba(0,200,80,0.55))',
        animation: isActive ? 'breathe 3s ease-in-out infinite 1s' : 'none',
      }}>
        <img src="/openworld/hero.png" alt="Hero"
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Title */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '5%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30, perspective: '700px',
      }}>
        <div className="scene-eyebrow">Stage 4 · Open World</div>
        <h2 style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
          color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2,
          textShadow: '0 0 30px rgba(0,200,80,0.4), 0 0 80px rgba(0,100,60,0.2)',
        }}>
          Every Path<br />Breathes
        </h2>
      </div>
    </div>
  )
}

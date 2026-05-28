
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function RetroSequence({ isActive }: Props) {
  const skyRef     = useRef<HTMLDivElement>(null)
  const cloudsRef  = useRef<HTMLDivElement>(null)
  const castleRef  = useRef<HTMLDivElement>(null)
  const hillsRef   = useRef<HTMLDivElement>(null)
  const terrainRef = useRef<HTMLDivElement>(null)
  const charRef    = useRef<HTMLDivElement>(null)
  const coinsRef   = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const played     = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // 1 sky — fd
    tl.fromTo(skyRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 })

    // 2 clouds — fd + sd + CSS handles infinite pan
    tl.fromTo(cloudsRef.current,
      { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.6 }, '<+0.15')

    // 3 castle — su + br origin=bottom-center
    tl.fromTo(castleRef.current,
      { y: '100%', opacity: 0, scaleY: 0.6, transformOrigin: 'bottom center' },
      { y: '0%', opacity: 1, scaleY: 1, duration: 0.75, ease: 'back.out(1.3)' },
      '-=0.2')

    // 4 hills — fast su parallax
    tl.fromTo(hillsRef.current,
      { y: 120 }, { y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.5')

    // 5 terrain — heavy su + thud
    tl.fromTo(terrainRef.current,
      { y: 200 }, { y: 0, duration: 0.55, ease: 'back.out(2)' }, '-=0.3')

    // 6 character — heroDrop squash/stretch
    tl.fromTo(charRef.current,
      { y: -200, scaleY: 1.3, scaleX: 0.7, opacity: 0 },
      { y: 0, scaleY: 1, scaleX: 1, opacity: 1, duration: 0.55, ease: 'bounce.out' },
      '-=0.1')

    // 7 coins — stagger pop
    const coinEls = coinsRef.current?.querySelectorAll('.retro-coin')
    if (coinEls?.length) {
      tl.fromTo(coinEls,
        { scale: 0, rotation: -20, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08 },
        '-=0.2')
    }

    // title — pixel glow + spn
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(12px)', rotateY: -90 },
      { opacity: 1, filter: 'blur(0px)', rotateY: 0, duration: 0.65, ease: 'power3.out' },
      '-=0.1')
  }, [isActive])

  useEffect(() => { if (!isActive) played.current = false }, [isActive])

  const COIN_X = [18, 30, 42, 55, 68, 80]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* 1 — Sky */}
      <div ref={skyRef} style={{
        position: 'absolute', inset: 0, opacity: 0,
      }}>
        <img
          src="/retro/sky.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* 2 — Clouds (infinite pan) */}
      <div ref={cloudsRef} style={{
        position: 'absolute', top: 0, left: 0,
        width: '200%', height: '30%',
        opacity: 0,
        animation: 'panLeft 28s linear infinite',
        pointerEvents: 'none',
      }}>
        {/* doubled for seamless loop */}
        <img src="/retro/clouds.png" alt="" style={{ position: 'absolute', left: '0%',   top: 0, width: '50%', height: '100%', objectFit: 'cover' }} />
        <img src="/retro/clouds.png" alt="" style={{ position: 'absolute', left: '50%',  top: 0, width: '50%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* 3 — Castle */}
      <div ref={castleRef} style={{
        position: 'absolute', bottom: '28%', left: '50%',
        transform: 'translateX(-50%)',
        transformOrigin: 'bottom center',
        width: 'clamp(160px, 30vw, 380px)',
        opacity: 0,
        animation: isActive ? 'breathe 4s ease-in-out infinite 1s' : 'none',
      }}>
        <img src="/retro/castle.png" alt="Castle"
          style={{ width: '100%', height: 'auto', display: 'block',
            filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.4))' }} />
      </div>

      {/* 4 — Hills */}
      <div ref={hillsRef} style={{
        position: 'absolute', bottom: '24%', left: 0, right: 0,
        height: '22%', pointerEvents: 'none',
      }}>
        <img src="/retro/hills.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom', display: 'block' }} />
      </div>

      {/* 5 — Terrain */}
      <div ref={terrainRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '26%', pointerEvents: 'none',
      }}>
        <img src="/retro/terrain.png" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* 6 — Character */}
      <div ref={charRef} style={{
        position: 'absolute', bottom: '26%', left: '48%',
        transform: 'translateX(-50%)',
        width: 'clamp(40px, 5vw, 72px)',
        opacity: 0,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
        animation: isActive ? 'breathe 3s ease-in-out infinite 1s' : 'none',
      }}>
        <img src="/retro/character.png" alt="Character"
          style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }} />
      </div>

      {/* 7 — Coins (stagger pop + hover) */}
      <div ref={coinsRef} style={{
        position: 'absolute',
        bottom: 'calc(26% + clamp(48px, 7vw, 86px))',
        left: 0, right: 0,
        pointerEvents: 'none',
      }}>
        {COIN_X.map((x, i) => (
          <div key={i} className="retro-coin" style={{
            position: 'absolute',
            left: `${x}%`,
            width: 'clamp(16px, 2.2vw, 26px)',
            opacity: 0,
            animation: isActive ? `hoverFloat ${2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite` : 'none',
          }}>
            <img src="/retro/coins.png" alt="Coin"
              style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }} />
          </div>
        ))}
      </div>

      {/* Title */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        textAlign: 'center', opacity: 0, zIndex: 30,
        perspective: '800px',
      }}>
        <div className="scene-eyebrow">Stage 2 · Retro</div>
        <h2 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(1rem, 3.5vw, 2.2rem)',
          color: '#00ff41',
          animation: 'pixelGlow 2s ease-in-out infinite',
          lineHeight: 1.4,
          letterSpacing: '0.05em',
        }}>
          Pixels<br />Never Died
        </h2>
      </div>
    </div>
  )
      }
        

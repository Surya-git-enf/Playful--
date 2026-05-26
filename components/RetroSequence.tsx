'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function RetroSequence({ isActive }: Props) {
  const rootRef   = useRef<HTMLDivElement>(null)
  const skyRef    = useRef<HTMLDivElement>(null)
  const cloudsRef = useRef<HTMLDivElement>(null)
  const castleRef = useRef<HTMLDivElement>(null)
  const hillsRef  = useRef<HTMLDivElement>(null)
  const terrainRef= useRef<HTMLDivElement>(null)
  const charRef   = useRef<HTMLDivElement>(null)
  const coinsRef  = useRef<HTMLDivElement>(null)
  const titleRef  = useRef<HTMLDivElement>(null)
  const played    = useRef(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // 1 sky — fd
    tl.fromTo(skyRef.current,    { opacity: 0 }, { opacity: 1, duration: 0.7 })

    // 2 clouds — fd + sd + infinite pan (CSS handles pan)
    tl.fromTo(cloudsRef.current, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.6 }, '<+0.15')

    // 3 castle — su + br (origin=bottom-center)
    tl.fromTo(castleRef.current,
      { y: '100%', opacity: 0, scaleY: 0.6, transformOrigin: 'bottom center' },
      { y: '0%',   opacity: 1, scaleY: 1, duration: 0.75, ease: 'back.out(1.3)' },
      '-=0.2'
    )

    // 4 hills — fast su parallax
    tl.fromTo(hillsRef.current,
      { y: 120 }, { y: 0, duration: 0.4, ease: 'power3.out' },
      '-=0.5'
    )

    // 5 terrain — heavy su + back.out thud
    tl.fromTo(terrainRef.current,
      { y: 200 }, { y: 0, duration: 0.55, ease: 'back.out(2)' },
      '-=0.3'
    )

    // 6 ch — heroDrop (squash/stretch)
    tl.fromTo(charRef.current,
      { y: -200, scaleY: 1.3, scaleX: 0.7, opacity: 0 },
      { y: 0,    scaleY: 1,   scaleX: 1,   opacity: 1, duration: 0.55,
        ease: 'bounce.out' },
      '-=0.1'
    )

    // 7 coins — stagger pp
    const coinEls = coinsRef.current?.querySelectorAll('.retro-coin')
    if (coinEls) {
      tl.fromTo(coinEls,
        { scale: 0, rotation: -20, opacity: 0 },
        { scale: 1, rotation: 0,   opacity: 1, duration: 0.4,
          ease: 'back.out(2)', stagger: 0.08 },
        '-=0.2'
      )
    }

    // title — pixel glow + spn
    tl.fromTo(titleRef.current,
      { opacity: 0, filter: 'blur(12px)', rotateY: -90, perspective: 800 },
      { opacity: 1, filter: 'blur(0px)',  rotateY: 0,   duration: 0.65,
        ease: 'power3.out' },
      '-=0.1'
    )
  }, [isActive])

  // Reset on leave
  useEffect(() => {
    if (!isActive) played.current = false
  }, [isActive])

  const COIN_POSITIONS = [18, 30, 42, 55, 68, 80]

  return (
    <div ref={rootRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* 1 — Sky */}
      <div ref={skyRef} style={{
        position: 'absolute', inset: 0, opacity: 0,
        background: 'linear-gradient(180deg, #1a0a3e 0%, #2d1065 40%, #1a0832 100%)',
      }}>
        {/* pixel stars */}
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 73 + 11) % 100}%`,
            top:  `${(i * 37 + 7) % 55}%`,
            width: (i % 3 === 0) ? 3 : 2,
            height: (i % 3 === 0) ? 3 : 2,
            background: '#fff',
            imageRendering: 'pixelated',
            opacity: 0.4 + (i % 5) * 0.12,
          }} />
        ))}
      </div>

      {/* 2 — Clouds (infinite pan) */}
      <div ref={cloudsRef} style={{
        position: 'absolute', top: '6%', left: 0, opacity: 0,
        width: '200%', height: '18%',
        animation: 'panLeft 28s linear infinite',
      }}>
        {[8, 30, 52, 74, 96, 108, 130, 152].map((x, i) => (
          <PixelCloud key={i} x={x} y={20 + (i % 3) * 18} w={80 + (i % 4) * 30} />
        ))}
      </div>

      {/* 3 — Castle */}
      <div ref={castleRef} style={{
        position: 'absolute', bottom: '30%', left: '50%',
        transform: 'translateX(-50%)',
        transformOrigin: 'bottom center',
        width: 'clamp(160px, 28vw, 340px)',
        opacity: 0,
        animation: isActive ? 'breathe 4s ease-in-out infinite 1s' : 'none',
      }}>
        <CastleSVG />
      </div>

      {/* 4 — Hills */}
      <div ref={hillsRef} style={{
        position: 'absolute', bottom: '26%', left: 0, right: 0,
        height: '22%',
      }}>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 30 Q15 5 30 20 Q45 8 60 22 Q75 6 90 18 Q95 14 100 20 L100 30 Z"
            fill="#1e0850" stroke="rgba(139,92,246,0.3)" strokeWidth="0.3"/>
          <path d="M0 30 Q20 12 40 24 Q60 10 80 22 Q90 16 100 22 L100 30 Z"
            fill="#170640" stroke="none"/>
        </svg>
      </div>

      {/* 5 — Terrain */}
      <div ref={terrainRef} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '28%',
      }}>
        <svg viewBox="0 0 100 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {/* pixel ground blocks */}
          <rect x="0" y="10" width="100" height="18" fill="#0f0535"/>
          {Array.from({ length: 25 }, (_, i) => (
            <rect key={i} x={i * 4} y={7 + (i % 4 === 0 ? -3 : 0)} width="4" height="6"
              fill={i % 3 === 0 ? '#2d1065' : '#1a0850'}
              stroke="rgba(139,92,246,0.2)" strokeWidth="0.2"/>
          ))}
          {/* pixel grass */}
          {Array.from({ length: 50 }, (_, i) => (
            <rect key={i} x={i * 2} y={6 + (i % 3 === 0 ? -1 : 0)} width="2" height="3"
              fill="#3d1a80" opacity={0.6 + (i % 3) * 0.15}/>
          ))}
        </svg>
      </div>

      {/* 6 — Character */}
      <div ref={charRef} style={{
        position: 'absolute',
        bottom: '28%',
        left: '48%',
        transform: 'translateX(-50%)',
        width: 'clamp(36px, 5vw, 60px)',
        opacity: 0,
      }}>
        <PixelChar />
      </div>

      {/* 7 — Coins (stagger pop + hover) */}
      <div ref={coinsRef} style={{
        position: 'absolute',
        bottom: 'calc(28% + clamp(44px,6vw,72px))',
        left: 0, right: 0,
      }}>
        {COIN_POSITIONS.map((x, i) => (
          <div key={i} className="retro-coin" style={{
            position: 'absolute',
            left: `${x}%`,
            width: 'clamp(14px, 2vw, 22px)',
            height: 'clamp(14px, 2vw, 22px)',
            opacity: 0,
            animation: isActive ? `hoverFloat ${2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite` : 'none',
          }}>
            <CoinSVG />
          </div>
        ))}
      </div>

      {/* Title */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        textAlign: 'center', opacity: 0, zIndex: 30,
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
          Pixels<br/>Never Died
        </h2>
      </div>
    </div>
  )
}

// ── sub-SVG components ─────────────────────────────────────

function PixelCloud({ x, y, w }: { x: number; y: number; w: number }) {
  const h = w * 0.4
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: w, height: h, imageRendering: 'pixelated' }}>
      <rect x="20%" y="50%" width="60%" height="50%" fill="rgba(180,140,255,0.25)" />
      <rect x="10%" y="25%" width="80%" height="75%" fill="rgba(180,140,255,0.2)" />
      <rect x="30%" y="0" width="40%" height="100%" fill="rgba(200,160,255,0.22)" />
    </svg>
  )
}

function CastleSVG() {
  return (
    <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}>
      {/* Battlements */}
      {[20,36,52,68,84,100,116,132,148,164].map((x,i) => (
        <rect key={i} x={x} y={20} width={10} height={18} fill={i%2===0?'#2d1065':'#1a0850'} stroke="rgba(139,92,246,0.4)" strokeWidth="0.8"/>
      ))}
      {/* Main wall */}
      <rect x="14" y="38" width="172" height="180" fill="#1a0850" stroke="rgba(139,92,246,0.5)" strokeWidth="1"/>
      {/* Tower left */}
      <rect x="0"  y="0" width="44" height="230" fill="#170640" stroke="rgba(139,92,246,0.5)" strokeWidth="1"/>
      {/* Tower right */}
      <rect x="156" y="0" width="44" height="230" fill="#170640" stroke="rgba(139,92,246,0.5)" strokeWidth="1"/>
      {/* Tower battlements */}
      {[2,12,22,32].map(x=> <rect key={x} x={x} y={0} width={8} height={14} fill="#2d1065" stroke="rgba(139,92,246,0.4)" strokeWidth="0.6"/>)}
      {[158,168,178,188].map(x=> <rect key={x} x={x} y={0} width={8} height={14} fill="#2d1065" stroke="rgba(139,92,246,0.4)" strokeWidth="0.6"/>)}
      {/* Gate */}
      <rect x="76" y="168" width="48" height="50" rx="24" fill="#0d0325" stroke="rgba(139,92,246,0.6)" strokeWidth="1.2"/>
      {/* Windows */}
      {[[14,60],[160,60],[14,110],[160,110]].map(([x,y],i)=> (
        <rect key={i} x={x} y={y} width={20} height={28} rx={10} fill="rgba(139,92,246,0.2)" stroke="rgba(196,181,253,0.4)" strokeWidth="0.8"/>
      ))}
      {/* Center window */}
      <rect x="84" y="80" width="32" height="44" rx={16} fill="rgba(139,92,246,0.15)" stroke="rgba(196,181,253,0.5)" strokeWidth="1"/>
      {/* Glow within gate */}
      <ellipse cx="100" cy="218" rx="16" ry="8" fill="rgba(139,92,246,0.3)" filter="blur(4px)"/>
    </svg>
  )
}

function PixelChar() {
  return (
    <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}>
      {/* head */}
      <rect x="6" y="0" width="12" height="12" fill="#ffd700"/>
      {/* eyes */}
      <rect x="8" y="3" width="2" height="2" fill="#1a0850"/>
      <rect x="14" y="3" width="2" height="2" fill="#1a0850"/>
      {/* body */}
      <rect x="4" y="12" width="16" height="14" fill="#8b5cf6"/>
      {/* cape */}
      <rect x="0" y="12" width="4" height="18" fill="#6366f1"/>
      <rect x="20" y="12" width="4" height="18" fill="#6366f1"/>
      {/* legs */}
      <rect x="4" y="26" width="6" height="10" fill="#1a0850"/>
      <rect x="14" y="26" width="6" height="10" fill="#1a0850"/>
      {/* sword */}
      <rect x="22" y="8" width="2" height="20" fill="#c4b5fd"/>
      <rect x="19" y="14" width="8" height="2" fill="#a78bfa"/>
    </svg>
  )
}

function CoinSVG() {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}>
      <rect x="6" y="0"  width="10" height="4"  fill="#ffd700"/>
      <rect x="2" y="4"  width="18" height="14" fill="#ffd700"/>
      <rect x="6" y="18" width="10" height="4"  fill="#ffd700"/>
      <rect x="4" y="2"  width="14" height="18" fill="#ffe44d"/>
      <rect x="8" y="6"  width="6"  height="10" fill="#ffb300"/>
    </svg>
  )
}


'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function RacingSequence({ isActive }: Props) {
  const bgRef      = useRef<HTMLDivElement>(null)
  const roadRef    = useRef<HTMLDivElement>(null)
  const carRef     = useRef<HTMLDivElement>(null)
  const layersRef  = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const titleRef   = useRef<HTMLDivElement>(null)
  const played     = useRef(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // 1 bg — fd + slow pan (CSS drives pan via animation)
    tl.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })

    // 2 road — su + ultra-fast pan class added after
    tl.fromTo(roadRef.current,
      { y: 180, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.2'
    )

    // 3 car — x:-300→0 power4.out + engine vb
    tl.fromTo(carRef.current,
      { x: -340, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power4.out' },
      '-=0.2'
    )

    // engine vibration
    tl.to(carRef.current,
      { keyframes: [
          { rotation: 0.6 }, { rotation: -0.6 }, { rotation: 0.4 },
          { rotation: -0.4 }, { rotation: 0 }
        ],
        duration: 0.35, ease: 'none', repeat: 6 },
      '-=0.1'
    )

    // title — metallic 3D spin reveal (spn)
    tl.fromTo(titleRef.current,
      { opacity: 0, rotateY: -110, filter: 'blur(14px)' },
      { opacity: 1, rotateY: 0,    filter: 'blur(0)',   duration: 0.7, ease: 'power3.out' },
      '-=0.2'
    )

    // After reveal: fade layers → show video
    tl.to(layersRef.current,
      { opacity: 0, duration: 0.6, ease: 'power2.inOut',
        onComplete: () => setShowVideo(true) },
      '+=0.5'
    )
  }, [isActive])

  useEffect(() => {
    if (!isActive) {
      played.current = false
      setShowVideo(false)
    }
  }, [isActive])

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [showVideo])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#050210' }}>

      {/* ── Animated layers (fade out after reveal) ── */}
      <div ref={layersRef} style={{ position: 'absolute', inset: 0 }}>

        {/* 1 bg — city silhouette + slow pan */}
        <div ref={bgRef} style={{
          position: 'absolute', inset: 0, opacity: 0,
          background: 'linear-gradient(180deg, #0a0520 0%, #150836 45%, #0d0628 100%)',
        }}>
          {/* Neon city skyline */}
          <div style={{
            position: 'absolute', bottom: '28%', left: 0,
            width: '200%', height: '40%',
            animation: 'panLeft 60s linear infinite',
          }}>
            <CitySkylineSVG />
          </div>
          {/* Speed lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${20 + i * 6}%`,
              left: 0, right: 0,
              height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(0,234,255,${0.05 + i * 0.02}), transparent)`,
              animation: `panLeft ${1.2 + i * 0.2}s linear infinite`,
            }} />
          ))}
        </div>

        {/* 2 road */}
        <div ref={roadRef} style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '32%', opacity: 0,
        }}>
          <svg viewBox="0 0 100 32" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            {/* Road base */}
            <rect x="0" y="0" width="100" height="32" fill="#0a0416"/>
            {/* Center dashes */}
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={i * 9} y="14" width="6" height="3" rx="1"
                fill="rgba(255,230,0,0.7)" />
            ))}
            {/* Lane markings */}
            <rect x="0" y="0"  width="100" height="1.5" fill="rgba(255,255,255,0.1)"/>
            <rect x="0" y="30" width="100" height="1.5" fill="rgba(255,255,255,0.1)"/>
            {/* Road glow */}
            <rect x="0" y="0" width="100" height="32"
              fill="url(#roadGlow)" opacity="0.4"/>
            <defs>
              <linearGradient id="roadGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0"   stopColor="#8b5cf6" stopOpacity="0.15"/>
                <stop offset="0.5" stopColor="#00eaff" stopOpacity="0.05"/>
                <stop offset="1"   stopColor="#8b5cf6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 3 car */}
        <div ref={carRef} style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(160px, 30vw, 360px)',
          opacity: 0,
          filter: 'drop-shadow(0 0 20px rgba(0,234,255,0.5)) drop-shadow(0 0 40px rgba(139,92,246,0.3))',
          animation: isActive && !showVideo ? 'engineVibrate 0.12s ease-in-out infinite' : 'none',
        }}>
          <RacingCarSVG />
        </div>
      </div>

      {/* ── Video (appears after fade) ── */}
      {showVideo && (
        <video
          ref={videoRef}
          src="/racing.mp4"
          loop muted playsInline autoPlay
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: 'blurFadeIn 0.8s ease both',
          }}
        />
      )}

      {/* Title — always on top */}
      <div ref={titleRef} style={{
        position: 'absolute', bottom: '8%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30,
        perspective: '800px',
      }}>
        <div className="scene-eyebrow">Stage 3 · Racing</div>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(3.5rem, 9vw, 8rem)',
          letterSpacing: '0.12em',
          lineHeight: 1,
          background: 'linear-gradient(180deg, #fff 0%, #c4b5fd 40%, #8b5cf6 80%, #00eaff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 20px rgba(0,234,255,0.4))',
        }}>
          Heads Up, Gear
        </h2>
      </div>
    </div>
  )
}

function RacingCarSVG() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {/* Body glow shadow */}
      <ellipse cx="180" cy="148" rx="140" ry="14" fill="rgba(0,234,255,0.18)" filter="blur(8px)"/>
      {/* Underbody */}
      <rect x="20" y="100" width="320" height="36" rx="8" fill="#0a0420"/>
      {/* Main chassis */}
      <path d="M30 108 Q50 72 100 68 L260 68 Q310 72 330 108 Z"
        fill="#1a0850" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5"/>
      {/* Windshield */}
      <path d="M120 68 Q140 40 180 36 Q220 40 240 68 Z"
        fill="rgba(0,234,255,0.18)" stroke="rgba(0,234,255,0.5)" strokeWidth="1.2"/>
      {/* Neon underline */}
      <rect x="28" y="112" width="304" height="3" rx="1.5"
        fill="url(#neonLine)" filter="blur(2px)"/>
      <defs>
        <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"   stopColor="#8b5cf6"/>
          <stop offset="0.5" stopColor="#00eaff"/>
          <stop offset="1"   stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      {/* Wheels */}
      {[[70,130],[290,130]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="28" fill="#0d0630" stroke="rgba(139,92,246,0.7)" strokeWidth="2"/>
          <circle cx={cx} cy={cy} r="18" fill="rgba(139,92,246,0.12)" stroke="rgba(0,234,255,0.4)" strokeWidth="1.5"/>
          <circle cx={cx} cy={cy} r="6"  fill="rgba(0,234,255,0.6)"/>
          {/* Spokes */}
          {Array.from({length:6},(_,s)=>{
            const a = (s/6)*Math.PI*2
            return <line key={s}
              x1={cx + Math.cos(a)*6} y1={cy + Math.sin(a)*6}
              x2={cx + Math.cos(a)*17} y2={cy + Math.sin(a)*17}
              stroke="rgba(139,92,246,0.5)" strokeWidth="1.2"/>
          })}
        </g>
      ))}
      {/* Spoiler */}
      <rect x="288" y="64" width="44" height="5" rx="2"
        fill="rgba(139,92,246,0.8)" stroke="rgba(0,234,255,0.4)" strokeWidth="0.8"/>
      <rect x="304" y="64" width="4" height="20" fill="rgba(139,92,246,0.6)"/>
      <rect x="320" y="64" width="4" height="20" fill="rgba(139,92,246,0.6)"/>
      {/* Headlights */}
      <ellipse cx="38" cy="102" rx="10" ry="6" fill="rgba(0,234,255,0.8)" filter="blur(3px)"/>
      <ellipse cx="322" cy="102" rx="10" ry="6" fill="rgba(255,75,145,0.8)" filter="blur(3px)"/>
    </svg>
  )
}

function CitySkylineSVG() {
  return (
    <svg viewBox="0 0 200 80" preserveAspectRatio="none" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {[
        [5,20,16,60],[25,10,12,70],[42,30,10,50],[55,15,14,65],
        [72,25,10,55],[85,8,18,72],[106,20,12,60],[122,12,16,68],
        [142,28,10,52],[155,5,20,75],[178,18,14,62],[196,22,10,58],
      ].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h}
          fill={`rgba(${i%3===0?'139,92,246':i%3===1?'99,102,241':'0,180,255'},0.18)`}
          stroke={`rgba(${i%2===0?'139,92,246':'0,234,255'},0.25)`} strokeWidth="0.5"/>
      ))}
      {/* neon windows */}
      {Array.from({length:30},(_,i)=>(
        <rect key={i} x={7+(i*6.3)%190} y={15+(i*8.1)%55} width="2" height="3"
          fill={i%3===0?'rgba(0,234,255,0.7)':i%3===1?'rgba(139,92,246,0.7)':'rgba(255,75,145,0.6)'}
          rx="0.5"/>
      ))}
    </svg>
  )
        }


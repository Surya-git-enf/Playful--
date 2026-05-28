'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props { isActive: boolean }

export default function RacingSequence({ isActive }: Props) {
  const bgRef     = useRef<HTMLDivElement>(null)
  const roadRef   = useRef<HTMLDivElement>(null)
  const carRef    = useRef<HTMLDivElement>(null)
  const layersRef = useRef<HTMLDivElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const titleRef  = useRef<HTMLDivElement>(null)
  const played    = useRef(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    if (!isActive || played.current) return
    played.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // 1 bg — fd + slow pan via CSS
    tl.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })

    // 2 road — su + ultra-fast pan
    tl.fromTo(roadRef.current,
      { y: 180, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.2')

    // 3 car — x:-300→0 power4.out
    tl.fromTo(carRef.current,
      { x: -340, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power4.out' },
      '-=0.2')

    // engine vibration
    tl.to(carRef.current, {
      keyframes: [
        { rotation: 0.6 }, { rotation: -0.6 },
        { rotation: 0.4 }, { rotation: -0.4 }, { rotation: 0 }
      ],
      duration: 0.35, ease: 'none', repeat: 6,
    }, '-=0.1')

    // title — metallic 3D spin
    tl.fromTo(titleRef.current,
      { opacity: 0, rotateY: -110, filter: 'blur(14px)' },
      { opacity: 1, rotateY: 0, filter: 'blur(0)', duration: 0.7, ease: 'power3.out' },
      '-=0.2')

    // fade layers → show video
    tl.to(layersRef.current, {
      opacity: 0, duration: 0.6, ease: 'power2.inOut',
      onComplete: () => setShowVideo(true),
    }, '+=0.5')
  }, [isActive])

  useEffect(() => {
    if (!isActive) { played.current = false; setShowVideo(false) }
  }, [isActive])

  useEffect(() => {
    if (showVideo && videoRef.current) videoRef.current.play().catch(() => {})
  }, [showVideo])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#050210' }}>

      {/* Animated layers */}
      <div ref={layersRef} style={{ position: 'absolute', inset: 0 }}>

        {/* 1 — BG */}
        <div ref={bgRef} style={{
          position: 'absolute', inset: 0, opacity: 0,
        }}>
          {/* doubled for seamless pan */}
          <div style={{
            position: 'absolute', inset: 0,
            width: '200%',
            animation: 'panLeft 60s linear infinite',
            display: 'flex',
          }}>
            <img src="/racing/bg.png" alt=""
              style={{ width: '50%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
            <img src="/racing/bg.png" alt=""
              style={{ width: '50%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
          </div>
        </div>

        {/* 2 — Road */}
        <div ref={roadRef} style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '32%', opacity: 0,
        }}>
          <div style={{
            width: '200%', height: '100%',
            animation: 'panLeftFast 2s linear infinite',
            display: 'flex',
          }}>
            <img src="/racing/road.png" alt=""
              style={{ width: '50%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
            <img src="/racing/road.png" alt=""
              style={{ width: '50%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
          </div>
        </div>

        {/* 3 — Car */}
        <div ref={carRef} style={{
          position: 'absolute', bottom: '30%', left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(160px, 32vw, 420px)',
          opacity: 0,
          filter: 'drop-shadow(0 0 24px rgba(0,234,255,0.5)) drop-shadow(0 0 48px rgba(139,92,246,0.3))',
          animation: isActive && !showVideo ? 'engineVibrate 0.12s ease-in-out infinite' : 'none',
        }}>
          <img src="/racing/car.png" alt="Racing car"
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

      {/* Video */}
      {showVideo && (
        <video
          ref={videoRef}
          src="/racing/racing.mp4"
          loop muted playsInline autoPlay
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: 'blurFadeIn 0.8s ease both',
          }}
        />
      )}

      {/* Title */}
      <div ref={titleRef} style={{
        position: 'absolute', bottom: '8%',
        left: 0, right: 0, textAlign: 'center',
        opacity: 0, zIndex: 30, perspective: '800px',
      }}>
        <div className="scene-eyebrow">Stage 3 · Racing</div>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(3.5rem, 9vw, 8rem)',
          letterSpacing: '0.12em', lineHeight: 1,
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

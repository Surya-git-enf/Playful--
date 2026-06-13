
'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function OpenWorldSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (isActive) {
      timer = setTimeout(() => setMounted(true), 50)
    } else {
      setMounted(false)
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [isActive])

  const snap   = 'cubic-bezier(0.19, 1, 0.22, 1)'
  const smooth = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const bounce = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#02050A' }}>
      <style>{`

        /* ── FONT: Cinzel Decorative — Roman-carved, dark fantasy, unique ── */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&display=swap');

        /* CRITICAL GPU FIX: 
           Removed animated CSS filters (drop-shadow, brightness, saturate).
           Animating heavy filters on full-screen PNGs crashes mobile GPUs 
           and causes the "black screen / missing layer" glitch.
           Added translateZ(0) to force hardware acceleration.
        */
        @keyframes worldBreathe {
          0%   { transform: scale(1) translateZ(0); }
          100% { transform: scale(1.06) translateZ(0); }
        }

        @keyframes moonPulse {
          0%, 100% { transform: scale(1) translateZ(0); }
          50%      { transform: scale(1.08) translateZ(0); }
        }

        @keyframes coronaPulse {
          0%,100% { opacity: 0.3;  transform: translate(-50%, -50%) scale(1) translateZ(0); }
          50%     { opacity: 0.75; transform: translate(-50%, -50%) scale(1.25) translateZ(0); }
        }

        @keyframes groundPush {
          0%, 100% { transform: translateY(0px) translateZ(0); }
          50%      { transform: translateY(-5px) translateZ(0); }
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }

        @keyframes fogDrift {
          0%   { transform: translateX(0%) translateZ(0);    opacity: 0.2; }
          50%  { transform: translateX(-3.5%) translateZ(0); opacity: 0.35; }
          100% { transform: translateX(0%) translateZ(0);    opacity: 0.2; }
        }

        /* ── HERO: fully responsive sizing via CSS custom properties ── */
        .hero-wrap {
          position: absolute;
          left: 50%;
          bottom: 13%;
          width:  min(28vw, 55vw);
          height: min(68vh, 85vh);
          z-index: 5;
          will-change: transform, opacity;
        }

        @media (max-width: 640px) {
          .hero-wrap {
            width:  min(72vw, 320px);
            height: min(60vh, 520px);
            bottom: 11%;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-wrap {
            width:  min(38vw, 380px);
            height: min(65vh, 600px);
            bottom: 12%;
          }
        }

        @media (min-width: 1440px) {
          .hero-wrap {
            width:  min(22vw, 520px);
            height: min(72vh, 780px);
            bottom: 13%;
          }
        }

        .moon-img {
          width: clamp(230px, 80vw, 350px);
          height: auto;
          display: block;
          /* Static filter is completely safe for GPUs, only animating it causes crashes */
          filter: drop-shadow(0 0 30px rgba(255,70,40,0.8));
          will-change: transform;
        }
        @media (max-width: 640px) {
          .moon-img { width: clamp(70px, 20vw, 130px); }
        }

        .moon-corona {
          position: absolute;
          top: 50%;
          left: 50%;
          width:  clamp(160px, 20vw, 320px);
          height: clamp(160px, 20vw, 320px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,60,30,0.5) 0%, rgba(200,40,20,0.28) 45%, transparent 70%);
          z-index: -1;
          will-change: transform, opacity;
        }
        @media (max-width: 640px) {
          .moon-corona {
            width:  clamp(120px, 32vw, 200px);
            height: clamp(120px, 32vw, 200px);
          }
        }
      `}</style>

      {/* ── BASE BACKGROUND ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 60%, #0a1a0e 0%, #030d06 55%, #000000 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.6s ${smooth} 0s`,
        animation: mounted ? 'bgPulse 10s ease-in-out infinite 2s' : 'none',
        willChange: 'opacity',
      }} />

      {/* ── WORLD IMAGE ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1) translateZ(0)' : 'scale(0.88) translateZ(0)',
        transition: `opacity 1.8s ${smooth} 0.05s, transform 2s ${smooth} 0.05s`,
        transformOrigin: 'center bottom',
        willChange: 'transform, opacity',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          animation: mounted ? 'worldBreathe 6s ease-in-out infinite alternate 2s' : 'none',
          willChange: 'transform',
        }}>
          <img
            src="/openworld/world.png"
            alt="World"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center bottom',
              display: 'block',
              filter: 'brightness(0.95) saturate(1.1)', // Static filter instead of animated
            }}
          />
        </div>
      </div>

      {/* ── FOG ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,30,10,0.5) 0%, transparent 45%)',
        animation: mounted ? 'fogDrift 14s ease-in-out infinite' : 'none',
        opacity: mounted ? 1 : 0,
        transition: `opacity 2s ${smooth} 0.5s`,
        willChange: 'transform, opacity',
      }} />

      {/* ── MOON — TOP RIGHT ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '8%',
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0px) scale(1) translateZ(0)' : 'translateY(-80px) scale(0.5) translateZ(0)',
        transition: `opacity 1.2s ${smooth} 0.4s, transform 1.4s ${bounce} 0.4s`,
        willChange: 'transform, opacity',
      }}>
        <div
          className="moon-corona"
          style={{
            animation: mounted ? 'coronaPulse 3s ease-in-out infinite' : 'none',
          }}
        />
        <div style={{ 
          animation: mounted ? 'moonPulse 4s ease-in-out infinite' : 'none',
          willChange: 'transform' 
        }}>
          <img
            src="/openworld/moon.png"
            alt="Moon"
            className="moon-img"
          />
        </div>
      </div>

      {/* ── GROUND ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28%',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0%) translateZ(0)' : 'translateY(100%) translateZ(0)',
        transition: `opacity 1s ${snap} 0.1s, transform 1.1s ${snap} 0.1s`,
        animation: mounted ? 'groundPush 9s ease-in-out infinite 1.5s' : 'none',
        willChange: 'transform, opacity',
      }}>
        <img
          src="/openworld/ground.png"
          alt="Ground"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
          }}
        />
      </div>

      {/* ── HERO ── */}
      <div
        className="hero-wrap"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(-50%) translateZ(0)' : 'translateX(80%) translateZ(0)',
          transition: mounted
            ? `opacity 0.6s ${smooth} 0.5s, transform 1.1s ${bounce} 0.5s`
            : `opacity 0.4s ease, transform 0.4s ease`, // Ensures a clean exit before unmounting
        }}
      >
        <img
          src="/openworld/hero.png"
          alt="Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            display: 'block',
            filter: 'drop-shadow(0 0 24px rgba(0,220,90,0.65)) drop-shadow(0 8px 40px rgba(0,0,0,0.98))',
          }}
        />
      </div>

      {/* ── VIGNETTE ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        background: [
          'linear-gradient(to bottom, rgba(2,5,10,0.5) 0%, rgba(2,5,10,0.06) 14%, transparent 30%)',
          'linear-gradient(to top,    rgba(2,5,10,0.65) 0%, transparent 35%)',
          'radial-gradient(ellipse 130% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)',
        ].join(', '),
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.4s ${smooth} 0.2s`,
        willChange: 'opacity',
      }} />

    </div>
  )
}

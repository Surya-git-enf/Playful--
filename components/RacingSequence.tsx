'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RacingSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let mountTimer: ReturnType<typeof setTimeout> | undefined

    if (isActive) {
      mountTimer = setTimeout(() => setMounted(true), 50)
    } else {
      setMounted(false)
    }

    return () => {
      if (mountTimer) clearTimeout(mountTimer)
    }
  }, [isActive])

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div className="racing-sequence">
      <style>{`
        .racing-sequence {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #0a0608;
        }

        @keyframes bgBreath {
          0%,100% { transform: perspective(1200px) rotateX(0deg) scale(1.02) translateY(0%); }
          50%     { transform: perspective(1200px) rotateX(1.5deg) scale(1.05) translateY(-1%); }
        }

        @keyframes roadPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.008); }
        }

        @keyframes carFloat {
          0%,100% { transform: translateY(0%) scale(1); }
          50%     { transform: translateY(-1%) scale(1.01); }
        }

        .master-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: opacity;
        }

        .master-wrapper.mounted {
          opacity: 1;
        }

        .bg-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          transform: perspective(1200px) rotateX(7deg) translateY(5%) scale(1.06);
          transform-origin: bottom center;
          transition: opacity 1s ${premiumEase}, transform 1.3s ${premiumEase};
        }

        .bg-layer.mounted {
          opacity: 1;
          transform: perspective(1200px) rotateX(0deg) translateY(0%) scale(1);
        }

        .bg-layer-inner {
          width: 100%;
          height: 100%;
          animation: ${mounted ? 'bgBreath 18s ease-in-out infinite' : 'none'};
        }

        .road-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0%;
          height: 32%;
          z-index: 2;
          opacity: 0;
          transform: perspective(700px) rotateX(24deg) translateY(18%);
          transform-origin: bottom center;
          transition: opacity 0.8s ${aggressiveEase} 0.12s, transform 1.05s ${aggressiveEase} 0.12s;
        }

        .road-layer.mounted {
          opacity: 1;
          transform: perspective(700px) rotateX(0deg) translateY(0%);
        }

        .road-layer-inner {
          width: 100%;
          height: 100%;
          animation: ${mounted ? 'roadPulse 8s ease-in-out infinite' : 'none'};
        }

        .car-layer {
          position: absolute;
          left: 50%;
          bottom: 1%;
          width: 62%;
          z-index: 10;
          transform: translateX(-50%);
        }

        .car-layer-inner {
          opacity: 0;
          transform: perspective(900px) rotateY(32deg) translateX(180%) scale(0.65);
          transition: opacity 0.5s ${aggressiveEase} 0.22s, transform 1.15s ${aggressiveEase} 0.22s;
          filter: drop-shadow(0 22px 48px rgba(0,0,0,0.92));
          animation: ${mounted ? 'carFloat 7s ease-in-out infinite' : 'none'};
        }

        .car-layer-inner.mounted {
          opacity: 1;
          transform: perspective(900px) rotateY(0deg) translateX(0%) scale(1);
        }

        .mask {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(2,2,2,0.88) 0%, rgba(2,2,2,0.2) 22%, transparent 42%);
          opacity: 0;
          transition: opacity 1s ${premiumEase};
          z-index: 15;
        }

        .mask.mounted {
          opacity: 1;
        }

        .title {
          position: absolute;
          top: 8%;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 20;
          opacity: 0;
          transform: translateY(-4%) skewX(-10deg);
          filter: blur(16px);
          transition: all 1.2s ${aggressiveEase} 0.3s;
          will-change: opacity, transform, filter;
          pointer-events: none;
        }

        .title.mounted {
          opacity: 1;
          transform: translateY(0%) skewX(0deg);
          filter: blur(0px);
        }

        .title h2 {
          font-family: var(--font-bebas, 'Bebas Neue', sans-serif);
          font-size: clamp(3.8rem, 10vw, 8.5rem);
          margin: 0;
          color: #ffffff;
          font-weight: 800;
          line-height: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-shadow: 0 10px 40px rgba(0,0,0,0.9);
          text-align: center;
        }

        @media (max-width: 1024px) {
          .car-layer {
            width: 70%;
            bottom: 3%;
          }

          .road-layer {
            bottom: 0%;
            height: 31%;
          }

          .title {
            top: 7.5%;
          }
        }

        @media (max-width: 768px) {
          .car-layer {
            width: 80%;
            bottom: 3%;
          }

          .road-layer {
            bottom: 0%;
            height: 30%;
          }

          .title {
            top: 7%;
          }

          .title h2 {
            font-size: clamp(2.8rem, 13vw, 5.5rem);
          }
        }

        @media (max-width: 480px) {
          .car-layer {
            width: 88%;
            bottom: 3%;
          }

          .road-layer {
            bottom: 0%;
            height: 28%;
          }

          .title {
            top: 6.5%;
          }

          .title h2 {
            font-size: clamp(2.5rem, 15vw, 4.6rem);
          }
        }
      `}</style>

      <div className={`master-wrapper ${mounted ? 'mounted' : ''}`}>
        {/* BACKGROUND */}
        <div className={`bg-layer ${mounted ? 'mounted' : ''}`}>
          <div className="bg-layer-inner">
            <img
              src="/racing/bg.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* ROAD */}
        <div className={`road-layer ${mounted ? 'mounted' : ''}`}>
          <div className="road-layer-inner">
            <img
              src="/racing/road.png"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* CAR */}
        <div className="car-layer">
          <div className={`car-layer-inner ${mounted ? 'mounted' : ''}`}>
            <img
              src="/racing/car.png"
              alt="Racing Car"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* MASK */}
      <div className={`mask ${mounted ? 'mounted' : ''}`} />

      {/* TITLE */}
      <div className={`title ${mounted ? 'mounted' : ''}`}>
        <h2>Heads Up, Gear</h2>
      </div>
    </div>
  )
}

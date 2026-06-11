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

  const snap = 'cubic-bezier(0.19, 1, 0.22, 1)'
  const smooth = 'cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div className="racing-sequence">
      <style>{`
        .racing-sequence {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #0a0608;
        }

        /* ── IDLE KEYFRAMES ── */

        /* BG: slow horizontal drift + gentle breathe */
        @keyframes bgDrift {
          0%   { transform: scale(1.08) translateX(0%) translateY(0%); }
          33%  { transform: scale(1.1)  translateX(-1.2%) translateY(-0.4%); }
          66%  { transform: scale(1.08) translateX(0.8%) translateY(0.3%); }
          100% { transform: scale(1.08) translateX(0%) translateY(0%); }
        }

        /* ROAD: subtle forward-rush — scale up from center-bottom */
        @keyframes roadRush {
          0%, 100% { transform: perspective(900px) rotateX(0deg) scale(1)    translateY(0%); }
          50%       { transform: perspective(900px) rotateX(1.5deg) scale(1.012) translateY(-0.4%); }
        }

        /* CAR: float up-down + micro-tilt for living feel */
        @keyframes carFloat {
          0%   { transform: translateX(-50%) translateY(0%)    rotate(0deg)   scale(1); }
          25%  { transform: translateX(-50%) translateY(-1.4%) rotate(-0.4deg) scale(1.008); }
          50%  { transform: translateX(-50%) translateY(-0.6%) rotate(0.2deg)  scale(1.005); }
          75%  { transform: translateX(-50%) translateY(-1.8%) rotate(-0.3deg) scale(1.01); }
          100% { transform: translateX(-50%) translateY(0%)    rotate(0deg)   scale(1); }
        }

        /* ── MASTER WRAPPER ── */
        .master-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.6s ${smooth};
          will-change: opacity;
        }
        .master-wrapper.mounted {
          opacity: 1;
        }

        /* ── BACKGROUND ── */
        /* Enter: slides up from below + scale down into place */
        .bg-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          opacity: 0;
          /* start: pushed down + zoomed in */
          transform: translateY(5%) scale(1.12);
          transition:
            opacity  1.1s ${smooth} 0s,
            transform 1.3s ${smooth} 0s;
        }
        .bg-layer.mounted {
          opacity: 1;
          transform: translateY(0%) scale(1.08); /* keep a tiny zoom so drift doesn't show edges */
        }
        .bg-layer-inner {
          width: 100%;
          height: 100%;
          animation: ${mounted ? 'bgDrift 22s ease-in-out infinite' : 'none'};
        }

        /* ── ROAD ── */
        /* Enter: rises up from bottom with perspective slam */
        .road-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0%;
          height: 32%;
          z-index: 2;
          opacity: 0;
          transform: perspective(900px) rotateX(18deg) translateY(55%) scale(1.05);
          transform-origin: bottom center;
          transition:
            opacity   0.85s ${snap} 0.2s,
            transform 1.1s  ${snap} 0.2s;
        }
        .road-layer.mounted {
          opacity: 1;
          transform: perspective(900px) rotateX(0deg) translateY(0%) scale(1);
        }
        .road-layer-inner {
          width: 100%;
          height: 100%;
          animation: ${mounted ? 'roadRush 10s ease-in-out infinite 1.5s' : 'none'};
        }

        /* ── CAR ── */
        /* Enter: pans in from the right (real translateX) + slight drop */
        .car-layer {
          position: absolute;
          left: 50%;
          bottom: -5%;
          width: 62%;
          z-index: 3;
          /* base transform handled by inner for idle anim to stack cleanly */
          transform: translateX(-50%);
        }

        .car-layer-inner {
          opacity: 0;
          /* start: far right + slightly above, natural pan-in */
          transform: translateX(110%) translateY(-3%) scale(0.88);
          transition:
            opacity   0.7s ${snap} 0.4s,
            transform 1.0s ${snap} 0.4s;
          filter: drop-shadow(0 22px 48px rgba(0,0,0,0.92));
          transform-origin: center bottom;
        }
        .car-layer-inner.mounted {
          opacity: 1;
          transform: translateX(0%) translateY(0%) scale(1);
          /* switch to idle float once entrance is done */
          /* float kicks in via animation below after a slight delay */
        }

        /* Apply idle only after entrance settles (1.4s after mount = 0.4s delay + 1s transition) */
        .car-layer-inner.mounted {
          animation: ${mounted ? 'carFloat 6s ease-in-out infinite 1.4s' : 'none'};
        }

        /* ── MASK ── */
        .mask {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(2,2,2,0.9) 0%,
            rgba(2,2,2,0.22) 22%,
            transparent 42%
          );
          opacity: 0;
          transition: opacity 1s ${smooth} 0s;
          z-index: 15;
        }
        .mask.mounted { opacity: 1; }

        /* ── TITLE ── */
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
          transform: translateY(-6%) skewX(-8deg);
          filter: blur(18px);
          transition:
            opacity   1.1s ${snap} 0.6s,
            transform 1.2s ${snap} 0.6s,
            filter    1.0s ${snap} 0.6s;
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

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .car-layer  { width: 68%; }
          .road-layer { height: 31%; }
          .title      { top: 7.5%; }
        }
        @media (max-width: 768px) {
          .car-layer  { width: 76%; }
          .road-layer { height: 30%; }
          .title      { top: 7%; }
          .title h2   { font-size: clamp(2.8rem, 13vw, 5.5rem); }
        }
        @media (max-width: 480px) {
          .car-layer  { width: 86%; }
          .road-layer { height: 28%; }
          .title      { top: 6.5%; }
          .title h2   { font-size: clamp(2.5rem, 15vw, 4.6rem); }
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-layer-inner,
          .road-layer-inner,
          .car-layer-inner { animation: none !important; }
        }
      `}</style>

      <div className={`master-wrapper ${mounted ? 'mounted' : ''}`}>

        {/* BACKGROUND — enters first at 0s */}
        <div className={`bg-layer ${mounted ? 'mounted' : ''}`}>
          <div className="bg-layer-inner">
            <img
              src="/racing/bg.png"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* ROAD — enters at 0.2s */}
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

        {/* CAR — enters at 0.4s, pans from right */}
        <div className="car-layer">
          <div className={`car-layer-inner ${mounted ? 'mounted' : ''}`}>
            <img
              src="/racing/car.png"
              alt="Racing Car"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

      </div>

      {/* MASK */}
      <div className={`mask ${mounted ? 'mounted' : ''}`} />

      {/* TITLE — enters at 0.6s */}
      <div className={`title ${mounted ? 'mounted' : ''}`}>
        <h2>Heads Up, Gear</h2>
      </div>
    </div>
  )
}

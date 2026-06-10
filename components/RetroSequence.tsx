"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  isActive: boolean;
}

export default function RetroSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mountTimer: NodeJS.Timeout;
    if (isActive) {
      mountTimer = setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }
    return () => clearTimeout(mountTimer);
  }, [isActive]);

  const premiumEase    = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

  /*
    GROUND SYSTEM — single source of truth
    ───────────────────────────────────────
    terrain image  = bottom 28vh of the screen
    terrain surface (top edge) = 28vh from bottom

    Character stands ON that surface:
      bottom: 28vh   (feet at terrain top edge)
      no vertical animation — locked to ground

    Coins hover just above ground with arc float only (no ground contact)
  */
  const TERRAIN_H  = '28vh';   // height of terrain layer
  const GROUND     = '28vh';   // bottom value for anything standing on ground

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* Sky slow 3-D parallax */
        @keyframes skyDrift {
          0%,100% { transform: perspective(1400px) rotateX(0deg)    scale(1.03) translateY(0px);  }
          50%      { transform: perspective(1400px) rotateX(1.2deg)  scale(1.06) translateY(-6px); }
        }

        /* Clouds 3-D side pan + rise */
        @keyframes cloudPan3D {
          0%,100% { transform: perspective(900px) rotateY(0deg)   translateX(0px)  translateY(0px); }
          33%     { transform: perspective(900px) rotateY(-2deg)  translateX(16px) translateY(-6px); }
          66%     { transform: perspective(900px) rotateY(1.5deg) translateX(-6px) translateY(-3px); }
        }

        /* Castle breathe in / out */
        @keyframes castleBreathe {
          0%,100% { transform: scaleX(1)    scaleY(1)     translateY(0px);  filter: brightness(1);    }
          40%,60% { transform: scaleX(1.03) scaleY(1.02)  translateY(-5px); filter: brightness(1.07); }
        }

        /* Hills slow 3-D tilt */
        @keyframes hillsRise3D {
          0%,100% { transform: perspective(1000px) rotateX(0deg)     translateY(0px); }
          50%     { transform: perspective(1000px) rotateX(-1deg)     translateY(-4px); }
        }

        /* Terrain forward depth push */
        @keyframes terrainPush {
          0%,100% { transform: perspective(700px) rotateX(0deg)   scale(1);     }
          50%     { transform: perspective(700px) rotateX(0.5deg) scale(1.006); }
        }

        /* Coins 3-D spin + arc float (never touch ground) */
        @keyframes coinSpin3D {
          0%   { transform: perspective(260px) rotateY(0deg)   translateY(0px);  }
          25%  { transform: perspective(260px) rotateY(90deg)  translateY(-10px); }
          50%  { transform: perspective(260px) rotateY(180deg) translateY(-16px); }
          75%  { transform: perspective(260px) rotateY(270deg) translateY(-8px);  }
          100% { transform: perspective(260px) rotateY(360deg) translateY(0px);  }
        }

        /* Character: ONLY side 3-D tilt pan — NO vertical movement */
        @keyframes charTilt3D {
          0%,100% { transform: perspective(600px) rotateY(-4deg) rotateX(1.5deg);  }
          50%     { transform: perspective(600px) rotateY( 4deg) rotateX(-1deg);   }
        }
      `}</style>

      {/* ══════════ MASTER VIEWPORT ══════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.8s ${premiumEase}`,
        willChange: 'opacity',
      }}>

        {/* ── z1 SKY ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(1.05)',
          transition: `all 1.5s ${premiumEase}`,
        }}>
          <div style={{ width: '100%', height: '100%', animation: mounted ? 'skyDrift 20s ease-in-out infinite' : 'none' }}>
            <img src="/retro/sky.png" alt="Sky"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          </div>
        </div>

        {/* ── z2 CLOUDS ── */}
        <div style={{
          position: 'absolute', top: '5vh', left: 0, right: 0, height: '22vh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.1s`,
        }}>
          <div style={{ width: '100%', height: '100%', animation: mounted ? 'cloudPan3D 13s ease-in-out infinite' : 'none' }}>
            <img src="/retro/clouds.png" alt="Clouds"
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
          </div>
        </div>

        {/* ── z3 CASTLE — full width, breathe ── */}
        <div style={{
          position: 'absolute', bottom: `calc(${TERRAIN_H} + 8vh)`, left: 0, right: 0, zIndex: 3,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.5s ${premiumEase} 0.2s`,
        }}>
          <div style={{
            width: '100%',
            animation: mounted ? 'castleBreathe 5s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ── z4 HILLS ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '42vh', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.15s`,
        }}>
          <div style={{ width: '100%', height: '100%', animation: mounted ? 'hillsRise3D 16s ease-in-out infinite' : 'none' }}>
            <img src="/retro/hills.png" alt="Hills"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }} />
          </div>
        </div>

        {/* ── z5 TERRAIN FLOOR ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: TERRAIN_H, zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 1s ${aggressiveEase} 0.25s`,
        }}>
          <div style={{ width: '100%', height: '100%', animation: mounted ? 'terrainPush 12s ease-in-out infinite' : 'none' }}>
            <img src="/retro/terrain.png" alt="Terrain"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
          </div>
        </div>

        {/* ── z6 CHARACTER ──
            bottom: GROUND → feet locked exactly at terrain top surface
            NO vertical animation — only 3-D side tilt
            left adjusted: calc(50vw - 5px) per your request
        ── */}
        <div style={{
          position: 'absolute',
          bottom: GROUND,          /* ← feet ON terrain surface, never floating */
          left: 'calc(50vw - 5px)',
          zIndex: 6,
          width: 'clamp(170px, 12vw, 230px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-100px)',
          transition: `opacity 1s ${aggressiveEase} 0.35s, transform 1.1s ${aggressiveEase} 0.35s`,
        }}>
          {/* Static pixel shadow — no animation, stays under feet */}
          <div style={{
            position: 'absolute', bottom: '-4px', left: '50%',
            width: '60%', height: '8px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            transform: 'translateX(-50%)',
          }} />
          {/* Only 3-D tilt — no Y movement */}
          <div style={{
            filter: 'drop-shadow(6px 8px 0px rgba(0,0,0,0.4))',
            animation: mounted ? 'charTilt3D 4s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/character.png" alt="Character"
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ── z7 COINS — hover above terrain, 3-D spin ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.3s ${premiumEase} 0.4s`,
        }}>
          {[
            { left: '10%',  bottom: `calc(${GROUND} + 2vh)`, delay: '0s'    },
            { left: '60%',  bottom: `calc(${GROUND} + 0vh)`, delay: '0.2s'  },
            { left: '65%',  bottom: `calc(${GROUND} + 0vh)`, delay: '0.4s'  },
            { left: '76%',  bottom: `calc(${GROUND} + 1vh)`, delay: '0s'    },
            { left: '81%',  bottom: `calc(${GROUND} + 1vh)`, delay: '0.3s'  },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: c.left,
              bottom: c.bottom,
              width: 'clamp(40px, 3.5vw, 60px)',
              animation: mounted ? `coinSpin3D 1.7s ease-in-out infinite ${c.delay}` : 'none',
            }}>
              <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
            </div>
          ))}
        </div>

      </div>

      {/* ── TOP SCRIM ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.1) 25%, transparent 45%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10,
      }} />

      {/* ── TYPOGRAPHY ── */}
      <div style={{
        position: 'absolute', top: '8vh', left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-20px) skewX(-4deg)',
        filter: mounted ? 'blur(0px)' : 'blur(8px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Stage 2 · Retro
        </span>
        <h2 style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 'clamp(1.2rem, 5vw, 3.5rem)', margin: 0,
          fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase',
          letterSpacing: '0.04em', textShadow: '0 6px 0px #000',
          display: 'flex', gap: '16px',
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
                }
              

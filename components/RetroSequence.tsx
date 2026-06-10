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

  const premiumEase   = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>

      {/* ─── KEYFRAMES ─── */}
      <style>{`
        /* ── Castle: full inhale / exhale breathing ── */
        @keyframes castleBreathe {
          0%, 100% {
            transform: scaleX(1) scaleY(1) translateY(0px);
            filter: brightness(1);
          }
          40% {
            transform: scaleX(1.04) scaleY(1.025) translateY(-6px);
            filter: brightness(1.06);
          }
          60% {
            transform: scaleX(1.04) scaleY(1.025) translateY(-6px);
            filter: brightness(1.06);
          }
        }

        /* ── Sky: very slow 3-D parallax drift ── */
        @keyframes skyDrift {
          0%, 100% { transform: perspective(1200px) rotateX(0deg)   scale(1.04) translateY(0px); }
          50%       { transform: perspective(1200px) rotateX(1.5deg) scale(1.07) translateY(-8px); }
        }

        /* ── Clouds: 3-D depth pan left→right + gentle rise ── */
        @keyframes cloudPan3D {
          0%   { transform: perspective(800px) rotateY(0deg)    translateX(0px)   translateY(0px); }
          33%  { transform: perspective(800px) rotateY(-2deg)   translateX(18px)  translateY(-7px); }
          66%  { transform: perspective(800px) rotateY(1.5deg)  translateX(-8px)  translateY(-4px); }
          100% { transform: perspective(800px) rotateY(0deg)    translateX(0px)   translateY(0px); }
        }

        /* ── Hills: slow 3-D tilt rise ── */
        @keyframes hillsRise3D {
          0%, 100% { transform: perspective(900px) rotateX(0deg)    translateY(0px); }
          50%       { transform: perspective(900px) rotateX(-1.2deg) translateY(-5px); }
        }

        /* ── Terrain: subtle forward push (parallax depth) ── */
        @keyframes terrainPush {
          0%, 100% { transform: perspective(600px) rotateX(0deg)  scale(1); }
          50%       { transform: perspective(600px) rotateX(0.6deg) scale(1.008); }
        }

        /* ── Coins: 3-D Y-spin + arc float ── */
        @keyframes coinSpin3D {
          0%   { transform: perspective(300px) rotateY(0deg)   translateY(0px)   scale(1); }
          25%  { transform: perspective(300px) rotateY(90deg)  translateY(-12px) scale(1.05); }
          50%  { transform: perspective(300px) rotateY(180deg) translateY(-18px) scale(1.1); }
          75%  { transform: perspective(300px) rotateY(270deg) translateY(-10px) scale(1.05); }
          100% { transform: perspective(300px) rotateY(360deg) translateY(0px)   scale(1); }
        }

        /* ── Character: 3-D tilt + float + side pan ── */
        @keyframes charFloat3D {
          0%   { transform: perspective(600px) rotateY(-6deg) rotateX(2deg)  translateY(0px)   translateX(0px); }
          25%  { transform: perspective(600px) rotateY(-1deg) rotateX(-1deg) translateY(-9px)  translateX(3px); }
          50%  { transform: perspective(600px) rotateY(5deg)  rotateX(1.5deg) translateY(-14px) translateX(6px); }
          75%  { transform: perspective(600px) rotateY(1deg)  rotateX(-0.5deg) translateY(-7px)  translateX(2px); }
          100% { transform: perspective(600px) rotateY(-6deg) rotateX(2deg)  translateY(0px)   translateX(0px); }
        }

        /* ── Character shadow syncs with float ── */
        @keyframes shadowSync {
          0%, 100% { transform: translateX(-50%) scaleX(1);    opacity: 0.4; }
          50%       { transform: translateX(-50%) scaleX(0.6);  opacity: 0.15; }
        }
      `}</style>

      {/* ════════════════════════════════
          MASTER VIEWPORT
      ════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.8s ${premiumEase}`,
        willChange: 'opacity',
      }}>

        {/* ── LAYER 1: SKY — 3-D drift ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(1.05)',
          transition: `all 1.5s ${premiumEase}`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'skyDrift 18s ease-in-out infinite' : 'none',
          }}>
            <img src="/retro/sky.png" alt="Sky"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          </div>
        </div>

        {/* ── LAYER 2: CLOUDS — 3-D pan ── */}
        <div style={{
          position: 'absolute', top: '5dvh', left: 0, right: 0, height: '25dvh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.1s`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'cloudPan3D 12s ease-in-out infinite' : 'none',
          }}>
            <img src="/retro/clouds.png" alt="Clouds"
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
          </div>
        </div>

        {/* ── LAYER 3: CASTLE — FULL WIDTH + breathe ── */}
        <div style={{
          position: 'absolute', bottom: '10dvh', left: 0, right: 0, zIndex: 3,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.5s ${premiumEase} 0.2s`,
        }}>
          <div style={{
            /* Full viewport width — fills edge to edge */
            width: '100%',
            animation: mounted ? 'castleBreathe 5s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/castle.png" alt="Castle"
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ── LAYER 4: HILLS — 3-D rise tilt ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45dvh', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.15s`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'hillsRise3D 14s ease-in-out infinite' : 'none',
          }}>
            <img src="/retro/hills.png" alt="Hills"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }} />
          </div>
        </div>

        {/* ── LAYER 5: TERRAIN FLOOR — depth push ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30dvh', zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 1s ${aggressiveEase} 0.25s`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'terrainPush 10s ease-in-out infinite' : 'none',
          }}>
            <img src="/retro/terrain.png" alt="Terrain"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
          </div>
        </div>

        {/* ── LAYER 6: CHARACTER ──
            Original: bottom '5dvh', left '50vw'
            Adjusted: left = 50vw - 5px  →  left: 'calc(50vw - 5px)'
                       bottom = 5dvh - 1dvh → bottom: '4dvh'
        ── */}
        <div style={{
          position: 'absolute',
          bottom: '4dvh',
          left: 'calc(50vw - 5px)',
          zIndex: 6,
          width: 'clamp(170px, 70vw, 230px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-100px)',
          transition: `all 1.1s ${aggressiveEase} 0.35s`,
        }}>
          {/* Ground shadow */}
          <div style={{
            position: 'absolute', bottom: '-6px', left: '50%',
            width: '55%', height: '10px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
            transformOrigin: 'center',
            animation: mounted ? 'shadowSync 3s ease-in-out infinite' : 'none',
          }} />
          {/* Character 3-D float */}
          <div style={{
            filter: 'drop-shadow(6px 8px 0px rgba(0,0,0,0.4))',
            animation: mounted ? 'charFloat3D 3s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/character.png" alt="Character"
              style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>

        {/* ── LAYER 7: COINS — 3-D spin float ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.3s ${premiumEase} 0.4s`,
        }}>
          {[
            { left: '10%',  bottom: '10dvh', delay: '0s'   },
            { left: '60%',  bottom: '5dvh',  delay: '0.2s' },
            { left: '65%',  bottom: '5dvh',  delay: '0.4s' },
            { left: '76%',  bottom: '8dvh',  delay: '0s'   },
            { left: '81%',  bottom: '8dvh',  delay: '0.3s' },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: c.left, bottom: c.bottom,
              width: 'clamp(40px, 10vw, 65px)',
              animation: mounted ? `coinSpin3D 1.7s ease-in-out infinite ${c.delay}` : 'none',
            }}>
              <img src="/retro/coin.png" style={{ width: '100%' }} alt="" />
            </div>
          ))}
        </div>

      </div>

      {/* ─── OBSIDIAN TEXT GRADIENT ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.1) 25%, transparent 45%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10,
      }} />

      {/* ─── TYPOGRAPHY LAYER ─── */}
      <div style={{
        position: 'absolute', top: '8dvh', left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-20px) skewX(-4deg)',
        filter: mounted ? 'blur(0px)' : 'blur(8px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}} />

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
          letterSpacing: '0.04em',
          textShadow: '0 6px 0px #000',
          display: 'flex', gap: '16px',
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
}

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

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>

      {/* ─── ANIMATIONS ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* Castle subtle breathe */
        @keyframes castleLivePulse {
          0%, 100% { transform: scale(1) translateY(0px); }
          50%       { transform: scale(1.03) translateY(-4px); }
        }

        /* Coin: 3D Y-axis spin + float rise */
        @keyframes coinRiseFloat {
          0%   { transform: perspective(300px) rotateY(0deg)   translateY(0px); }
          25%  { transform: perspective(300px) rotateY(90deg)  translateY(-10px); }
          50%  { transform: perspective(300px) rotateY(180deg) translateY(-16px); }
          75%  { transform: perspective(300px) rotateY(270deg) translateY(-8px); }
          100% { transform: perspective(300px) rotateY(360deg) translateY(0px); }
        }

        /* Character: 3D tilt + breathe + subtle pan side-to-side */
        @keyframes characterRise3D {
          0%   { transform: perspective(500px) rotateY(-4deg) rotateX(2deg) translateY(0px); }
          30%  { transform: perspective(500px) rotateY(2deg)  rotateX(-1deg) translateY(-6px); }
          60%  { transform: perspective(500px) rotateY(4deg)  rotateX(1deg)  translateY(-3px); }
          100% { transform: perspective(500px) rotateY(-4deg) rotateX(2deg) translateY(0px); }
        }

        /* Cloud gentle drift */
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50%       { transform: translateX(12px) translateY(-5px); }
        }

        /* Shadow pulse under character (depth cue) */
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1);   opacity: 0.35; }
          50%       { transform: scaleX(0.8); opacity: 0.18; }
        }
      `}</style>

      {/* ─── MASTER VIEWPORT ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        perspective: '1200px',
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.8s ${premiumEase}`,
        willChange: 'opacity'
      }}>

        {/* ─── LAYER 1: SKY ─── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(1.05)',
          transition: `all 1.5s ${premiumEase}`
        }}>
          <img
            src="/retro/sky.png" alt="Sky"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>

        {/* ─── LAYER 2: CLOUDS (animated drift) ─── */}
        <div style={{
          position: 'absolute', top: '5dvh', left: 0, right: 0, height: '25dvh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.1s`
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'cloudDrift 9s ease-in-out infinite' : 'none'
          }}>
            <img
              src="/retro/clouds.png" alt="Clouds"
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }}
            />
          </div>
        </div>

        {/* ─── LAYER 3: CASTLE (behind hills) ─── */}
        <div style={{
          position: 'absolute', bottom: '10dvh', left: 0, right: 0, zIndex: 3,
          display: 'flex', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.5s ${premiumEase} 0.2s`
        }}>
          <div style={{
            width: 'clamp(200px, 55vw, 750px)',
            animation: mounted ? 'castleLivePulse 7s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (in front of castle) ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45dvh', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.15s`
        }}>
          <img
            src="/retro/hills.png" alt="Hills"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }}
          />
        </div>

        {/* ─── LAYER 5: TERRAIN FLOOR ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30dvh', zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 1s ${aggressiveEase} 0.25s`
        }}>
          <img
            src="/retro/terrain.png" alt="Terrain"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }}
          />
        </div>

        {/* ─── LAYER 6: CHARACTER ─── 
            FIX: uses `left` + `marginLeft` to truly centre-anchor,
            bottom is above the terrain height (30dvh) so it stands ON the floor.
            Size = ~1.5× the coin size.
        ─── */}
        <div style={{
          position: 'absolute',
          /* Stand ON the terrain: terrain is 30dvh tall, character feet sit at its top edge */
          bottom: 'calc(30dvh - 6px)',
          /* Centre on screen with a slight right offset for composition */
          left: '50%',
          transform: mounted
            ? 'translateX(-30%)'
            : 'translateX(-30%) translateX(-80px)',
          zIndex: 8,   /* above terrain (5) and coins (7) */
          /* 
            Coin is clamp(40px, 10vw, 65px).
            Character target ≈ 1.5× coin → clamp(130px, 32vw, 200px) on mobile,
            scales up on desktop via the vw anchor.
          */
          width: 'clamp(130px, 32vw, 200px)',
          opacity: mounted ? 1 : 0,
          transition: `opacity 0.9s ${aggressiveEase} 0.35s, transform 1.1s ${aggressiveEase} 0.35s`
        }}>
          {/* Ground shadow (depth cue) */}
          <div style={{
            position: 'absolute', bottom: '-8px', left: '50%',
            width: '60%', height: '12px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            transform: 'translateX(-50%)',
            transformOrigin: 'center',
            animation: mounted ? 'shadowPulse 3s ease-in-out infinite' : 'none'
          }} />

          {/* Character image with 3D rise + pan */}
          <div style={{
            filter: 'drop-shadow(4px 6px 0px rgba(0,0,0,0.45))',
            animation: mounted ? 'characterRise3D 3s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img
              src="/retro/character.png" alt="Character"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* ─── LAYER 7: COINS ─── 
            Coins sit slightly above terrain top edge.
            Left-side coin cluster + right-side cluster split for visual balance.
        ─── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.3s ${premiumEase} 0.4s`
        }}>
          {/* Left cluster */}
          <div style={{
            position: 'absolute', left: 'clamp(20px, 8vw, 80px)', bottom: 'calc(30dvh + 4px)',
            width: 'clamp(40px, 10vw, 65px)',
            animation: mounted ? 'coinRiseFloat 1.8s ease-in-out infinite' : 'none'
          }}>
            <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
          </div>

          <div style={{
            position: 'absolute', left: 'clamp(70px, 16vw, 150px)', bottom: 'calc(30dvh + 20px)',
            width: 'clamp(40px, 10vw, 65px)',
            animation: mounted ? 'coinRiseFloat 1.6s ease-in-out infinite 0.25s' : 'none'
          }}>
            <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
          </div>

          {/* Right cluster */}
          <div style={{
            position: 'absolute', right: 'clamp(20px, 10vw, 100px)', bottom: 'calc(30dvh + 10px)',
            width: 'clamp(40px, 10vw, 65px)',
            animation: mounted ? 'coinRiseFloat 2s ease-in-out infinite 0.1s' : 'none'
          }}>
            <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
          </div>

          <div style={{
            position: 'absolute', right: 'clamp(70px, 18vw, 160px)', bottom: 'calc(30dvh + 28px)',
            width: 'clamp(40px, 10vw, 65px)',
            animation: mounted ? 'coinRiseFloat 1.7s ease-in-out infinite 0.4s' : 'none'
          }}>
            <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
          </div>

          <div style={{
            position: 'absolute', right: 'clamp(110px, 24vw, 220px)', bottom: 'calc(30dvh + 18px)',
            width: 'clamp(40px, 10vw, 65px)',
            animation: mounted ? 'coinRiseFloat 1.9s ease-in-out infinite 0.6s' : 'none'
          }}>
            <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
          </div>
        </div>

      </div>

      {/* ─── TOP GRADIENT (readable text overlay) ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.8) 0%, rgba(2,2,2,0.08) 30%, transparent 50%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── TYPOGRAPHY ─── */}
      <div style={{
        position: 'absolute', top: '7dvh', left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        padding: '0 20px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-18px) skewX(-3deg)',
        filter: mounted ? 'blur(0px)' : 'blur(6px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter'
      }}>
        {/* Eyebrow — subtle, lowercase */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)',
          letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
        }}>
          retro world
        </span>

        {/* Main headline */}
        <h2 style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 'clamp(1.1rem, 4.5vw, 3.2rem)',
          margin: 0,
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: '0.03em',
          textShadow: '0 5px 0px #000',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(8px, 2vw, 18px)'
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
        }

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
      // Trigger cinematic reveal
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
      
      <style>{`
        @keyframes castleLivePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes coinGlowSpin {
          0% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(180deg) translateY(-6px); }
          100% { transform: rotateY(360deg) translateY(0); }
        }
      `}</style>

      {/* ─── MASTER VIEWPORT ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* ─── LAYER 1: SKY (Locks to top half, fills width) ─── */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '65%', zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: `all 1.2s ${premiumEase}`
        }}>
          <img src="/retro/sky.png" alt="Sky" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 2: CLOUDS (Hovers over the sky) ─── */}
        <div style={{ 
          position: 'absolute', top: '5%', left: 0, right: 0, height: '40%', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.1s`
        }}>
          <img src="/retro/clouds.png" alt="Clouds" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 3: CASTLE (Centered, pulsing, bottom edge hidden by flowers) ─── */}
        <div style={{ 
          position: 'absolute', top: '35%', left: 0, right: 0, zIndex: 3,
          display: 'flex', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.9)',
          transition: `all 1.3s ${premiumEase} 0.15s`
        }}>
          <div style={{
            width: 'clamp(140px, 25vw, 280px)',
            animation: mounted ? 'castleLivePulse 6s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (The Floral bushes overlapping the castle) ─── */}
        <div style={{ 
          position: 'absolute', bottom: '15%', left: 0, right: 0, height: '55%', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.2s`
        }}>
          {/* objectPosition: 'top' ensures the top floral edge is always visible */}
          <img src="/retro/hills.png" alt="Flowers" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 5: TERRAIN (The platformer level locked to the bottom) ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(120px)',
          transition: `all 0.9s ${aggressiveEase} 0.25s`,
          zIndex: 5
        }}>
          {/* objectPosition: 'bottom' ensures the floor is always grounded */}
          <img src="/retro/terrain.png" alt="Level" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
        </div>

        {/* ─── LAYER 6: CHARACTER (Standing firmly on the terrain) ─── */}
        <div style={{
          position: 'absolute', bottom: '18%', left: '15%', 
          width: 'clamp(60px, 12vw, 120px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0) scale(1)' : 'translateX(-100px) scale(0.6)',
          transition: `all 1.1s ${aggressiveEase} 0.35s`,
          zIndex: 6
        }}>
          <div style={{ filter: 'drop-shadow(4px 6px 0px rgba(0,0,0,0.4))' }}>
            <img src="/retro/character.png" alt="Player" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COINS (Hovering dynamically) ─── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.3s ${premiumEase} 0.4s`
        }}>
          <div style={{ position: 'absolute', left: '42%', bottom: '40%', width: '32px', animation: 'coinGlowSpin 1.6s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '48%', bottom: '50%', width: '32px', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.2s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '54%', bottom: '40%', width: '32px', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.4s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

          <div style={{ position: 'absolute', left: '75%', bottom: '35%', width: '32px', animation: 'coinGlowSpin 1.8s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '82%', bottom: '35%', width: '32px', animation: 'coinGlowSpin 1.8s ease-in-out infinite 0.3s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
        </div>

      </div>

      {/* ─── DARK GRADIENT FILTER (To make typography pop) ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.1) 20%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── TYPOGRAPHY LAYER ─── */}
      <div style={{
        position: 'absolute', top: '10%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-20px) skewX(-4deg)',
        filter: mounted ? 'blur(0px)' : 'blur(8px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
        zIndex: 20
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}} />
        
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.4em', 
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '12px' 
        }}>
          Stage 2 · Retro
        </span>
        
        <h2 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          fontSize: 'clamp(1.2rem, 4.5vw, 3rem)', margin: 0,
          fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: '0 6px 0px #000',
          display: 'flex',
          gap: '14px'
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
}

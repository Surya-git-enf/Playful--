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
      
      <style>{`
        @keyframes castleLivePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes coinGlowSpin {
          0% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(180deg) translateY(-4px); }
          100% { transform: rotateY(360deg) translateY(0); }
        }
      `}</style>

      {/* ─── SCENE WRAPPER ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* ─── LAYER 1: SKY (Stays at the very top background) ─── */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '50dvh', zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: `all 1.2s ${premiumEase}`
        }}>
          <img src="/retro/sky.png" alt="Sky" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 2: CLOUDS (Positioned high up across the upper horizon) ─── */}
        <div style={{ 
          position: 'absolute', top: '10dvh', left: 0, right: 0, height: '35dvh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.05s`
        }}>
          <img src="/retro/clouds.png" alt="Clouds" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 3: CASTLE (Centered perfectly along the mountain line) ─── */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.95)',
          transition: `all 1.3s ${premiumEase} 0.1s`
        }}>
          <div style={{
            width: 'clamp(140px, 28vw, 320px)',
            animation: mounted ? 'castleLivePulse 5s ease-in-out infinite' : 'none',
            transformOrigin: 'center center',
            marginTop: '-5dvh' // Shifts up to sit natively on the mountain crest
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (The mid-ground green landscape block) ─── */}
        <div style={{ 
          position: 'absolute', bottom: '15dvh', left: 0, right: 0, height: '55dvh', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 1.2s ${premiumEase} 0.15s`
        }}>
          <img src="/retro/hills.png" alt="Hills" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
        </div>

        {/* ─── LAYER 5: TERRAIN GROUND (Locks solid to the bottom edge) ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '22dvh',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(120px)',
          transition: `all 0.9s ${aggressiveEase} 0.2s`,
          zIndex: 5
        }}>
          <img src="/retro/terrain.png" alt="Terrain Floor" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 6: CHARACTER (Stands firmly on top of the terrain floor) ─── */}
        <div style={{
          position: 'absolute', bottom: '14dvh', left: '15dvh', 
          width: 'clamp(65px, 11vw, 120px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0) scale(1)' : 'translateX(-150px) scale(0.6)',
          transition: `all 1.1s ${aggressiveEase} 0.3s`,
          zIndex: 6
        }}>
          <div style={{ filter: 'drop-shadow(4px 6px 0px rgba(0,0,0,0.3))' }}>
            <img src="/retro/character.png" alt="Player Character" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COINS (Hovering at perfect arcade jump levels) ─── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.3s ${premiumEase} 0.35s`
        }}>
          {/* Left jump arc formation */}
          <div style={{ position: 'absolute', left: '40%', bottom: '34dvh', width: '28px', animation: 'coinGlowSpin 1.4s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '46%', bottom: '44dvh', width: '28px', animation: 'coinGlowSpin 1.4s ease-in-out infinite 0.15s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '52%', bottom: '34dvh', width: '28px', animation: 'coinGlowSpin 1.4s ease-in-out infinite 0.3s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

          {/* Right collection path */}
          <div style={{ position: 'absolute', left: '74%', bottom: '28dvh', width: '28px', animation: 'coinGlowSpin 1.6s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '80%', bottom: '28dvh', width: '28px', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.25s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
        </div>

      </div>

      {/* ─── OBSIDIAN GRADIENT FILTER ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.15) 15%, transparent 32%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── TYPOGRAPHY LAYER ─── */}
      <div style={{
        position: 'absolute', top: '9dvh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-25px) skewX(-4deg)',
        filter: mounted ? 'blur(0px)' : 'blur(10px)',
        transition: `all 1.2s ${aggressiveEase} 0.25s`,
        willChange: 'opacity, transform, filter',
        zIndex: 20
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}} />
        
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.4em', 
          color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '12px' 
        }}>
          Stage 2 · Retro
        </span>
        
        <h2 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          fontSize: 'clamp(1.2rem, 4vw, 2.8rem)', margin: 0,
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

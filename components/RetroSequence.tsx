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
      // Triggers the staggered cinematic arrival
      mountTimer = setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }
    return () => clearTimeout(mountTimer);
  }, [isActive]);

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)';
  const backOut = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // Creates a nice pop/bounce effect

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>
      
      {/* ─── LIVE ANIMATIONS ─── */}
      <style>{`
        @keyframes castleBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes coinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes characterIdle {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.95) translateY(2px); }
        }
      `}</style>

      {/* ─── MASTER VIEWPORT ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* ─── LAYER 1: SKY (z-index 1) ─── */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transition: `opacity 2s ${premiumEase}`
        }}>
          <img src="/retro/sky.png" alt="Sky" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>

        {/* ─── LAYER 2: CLOUDS (z-index 2) ─── 
            ARRIVAL: Drops down gently from the top
        */}
        <div style={{ 
          position: 'absolute', top: '10%', left: 0, right: 0, height: '30%', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.5s ${premiumEase} 0.2s`
        }}>
          <img src="/retro/clouds.png" alt="Clouds" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 3: CASTLE (z-index 3) ─── 
            ARRIVAL: Rises up slowly.
            POSITION: 50% up. Centered. Overlapped by hills to hide bottom edge.
        */}
        <div style={{ 
          position: 'absolute', bottom: '50%', left: '50%', zIndex: 3,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(50px)',
          transition: `all 1.5s ${premiumEase} 0.4s`
        }}>
          <div style={{
            width: 'clamp(180px, 35vw, 400px)', 
            animation: mounted ? 'castleBreathe 6s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (z-index 4) ─── 
            ARRIVAL: Rises up from the ground.
            POSITION: 20% from bottom. Overlapped perfectly by Terrain.
        */}
        <div style={{ 
          position: 'absolute', bottom: '20%', left: 0, right: 0, height: '40%', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.6s`
        }}>
          <img src="/retro/hills.png" alt="Hills" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }} />
        </div>

        {/* ─── LAYER 5: TERRAIN FLOOR (z-index 5) ─── 
            ARRIVAL: Snaps up fast and hard from the absolute bottom.
            POSITION: Exactly bottom: 0. Hides the bottom 20% of the hills.
        */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(120px)',
          transition: `all 1s ${aggressiveEase} 0.8s`
        }}>
          <img src="/retro/terrain.png" alt="Terrain" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>

        {/* ─── LAYER 6: CHARACTER (z-index 6) ─── 
            ARRIVAL: Drops in from slightly above with a heavy bounce.
            POSITION: Dead center.
        */}
        <div style={{
          position: 'absolute', bottom: '25%', left: '50%', zIndex: 6,
          width: 'clamp(80px, 15vw, 150px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-60px)',
          transition: `all 1.2s ${backOut} 1s`
        }}>
          <div style={{ 
            filter: 'drop-shadow(6px 8px 0px rgba(0,0,0,0.4))',
            animation: mounted ? 'characterIdle 2s infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/character.png" alt="Character" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COINS (z-index 7) ─── 
            ARRIVAL: Pops up and expands dynamically.
            POSITION: Grouped perfectly above the center character.
        */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.5)',
          transition: `all 1s ${backOut} 1.2s`
        }}>
          {/* Top Center Coin */}
          <div style={{ position: 'absolute', left: '50%', bottom: '48%', transform: 'translateX(-50%)', width: 'clamp(28px, 5vw, 45px)' }}>
            <img src="/retro/coin.png" style={{ width: '100%', animation: 'coinSpin 1.6s linear infinite' }} alt="" />
          </div>
          {/* Left Coin */}
          <div style={{ position: 'absolute', left: '35%', bottom: '40%', transform: 'translateX(-50%)', width: 'clamp(28px, 5vw, 45px)' }}>
            <img src="/retro/coin.png" style={{ width: '100%', animation: 'coinSpin 1.6s linear infinite 0.2s' }} alt="" />
          </div>
          {/* Right Coin */}
          <div style={{ position: 'absolute', left: '65%', bottom: '40%', transform: 'translateX(-50%)', width: 'clamp(28px, 5vw, 45px)' }}>
            <img src="/retro/coin.png" style={{ width: '100%', animation: 'coinSpin 1.6s linear infinite 0.4s' }} alt="" />
          </div>
        </div>

      </div>

      {/* ─── OBSIDIAN TEXT GRADIENT ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.1) 25%, transparent 45%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── TYPOGRAPHY LAYER ─── */}
      <div style={{
        position: 'absolute', top: '8%', left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-20px) skewX(-4deg)',
        filter: mounted ? 'blur(0px)' : 'blur(8px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}} />
        
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.4em', 
          color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '12px' 
        }}>
          Stage 2 · Retro
        </span>
        
        <h2 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          fontSize: 'clamp(1.2rem, 5vw, 3.5rem)', margin: 0,
          fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: '0 6px 0px #000',
          display: 'flex', gap: '16px'
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
}

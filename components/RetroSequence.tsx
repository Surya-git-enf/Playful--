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
      
      {/* ─── LIVE ANIMATIONS ─── */}
      <style>{`
        @keyframes castleLivePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes coinGlowSpin {
          0% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(180deg) translateY(-8px); }
          100% { transform: rotateY(360deg) translateY(0); }
        }
        @keyframes characterBreathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.96) translateY(2px); }
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
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(1.05)',
          transition: `all 1.5s ${premiumEase}`
        }}>
          <img src="/retro/sky.png" alt="Sky" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>

        {/* ─── LAYER 2: CLOUDS (z-index 2) ─── */}
        <div style={{ 
          position: 'absolute', top: '5dvh', left: 0, right: 0, height: '25dvh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
          transition: `all 1.4s ${premiumEase} 0.1s`
        }}>
          <img src="/retro/clouds.png" alt="Clouds" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
        </div>

        {/* ─── LAYER 3: MASSIVE CASTLE (z-index 3) ─── 
            Tucked BEHIND the hills, massive size!
        */}
        <div style={{ 
          position: 'absolute', bottom: '10dvh', left: 0, right: 0, zIndex: 3,
          display: 'flex', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.5s ${premiumEase} 0.2s`
        }}>
          <div style={{
            /* MASSIVE SIZE SETTING HERE */
            width: 'clamp(250px, 60vw, 800px)', 
            animation: mounted ? 'castleLivePulse 6s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (z-index 4) ─── 
            In FRONT of the castle to hide its bottom edge 
        */}
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45dvh', zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1.2s ${premiumEase} 0.15s`
        }}>
          <img src="/retro/hills.png" alt="Hills" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }} />
        </div>

        {/* ─── LAYER 5: TERRAIN FLOOR (z-index 5) ─── 
            Hard anchored to bottom: 0, objectPosition: bottom ensures no floating!
        */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30dvh', zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 1s ${aggressiveEase} 0.25s`
        }}>
          <img src="/retro/terrain.png" alt="Terrain" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
        </div>

        {/* ─── LAYER 6: CHARACTER (z-index 6) ─── 
            Dropped down to stand exactly on the 30dvh terrain 
        */}
        <div style={{
          position: 'absolute', bottom: '5dvh', left: '15vw', zIndex: 6,
          width: 'clamp(170px, 70vw, 230px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-100px)',
          transition: `all 1.1s ${aggressiveEase} 0.35s`
        }}>
          <div style={{ 
            filter: 'drop-shadow(6px 8px 0px rgba(0,0,0,0.4))',
            animation: mounted ? 'characterBreathe 2s infinite' : 'none',
            transformOrigin: 'bottom center'
          }}>
            <img src="/retro/character.png" alt="Character" style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COINS (z-index 7) ─── 
            Dropped down to hover directly above the terrain/character 
        */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.3s ${premiumEase} 0.4s`
        }}>
          <div style={{ position: 'absolute', left: '10%', bottom: '10dvh', width: 'clamp(40px, 10vw, 65px)', animation: 'coinGlowSpin 1.6s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '60%', bottom: '5dvh', width: 'clamp(40px, 10vw, 65px)', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.2s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '65%', bottom: '5dvh', width: 'clamp(40px, 10vw, 65px)', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.4s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          
          <div style={{ position: 'absolute', left: '76%', bottom: '8dvh', width: 'clamp(40px, 10vw, 65px)', animation: 'coinGlowSpin 1.8s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '81%', bottom: '8dvh', width: 'clamp(40px, 10vw, 65px)', animation: 'coinGlowSpin 1.8s ease-in-out infinite 0.3s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
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
        position: 'absolute', top: '8dvh', left: 0, right: 0, zIndex: 20,
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

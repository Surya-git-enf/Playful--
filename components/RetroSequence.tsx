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
      // Trigger the dramatic structural staging entrance immediately
      mountTimer = setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }

    return () => {
      clearTimeout(mountTimer);
    };
  }, [isActive]);

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#4CA0FF' }}>
      
      <style>{`
        @keyframes castleLivePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @keyframes coinGlowSpin {
          0% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(180deg) translateY(-6px); }
          100% { transform: rotateY(360deg) translateY(0); }
        }
      `}</style>

      {/* ─── MASTER WINDOW STAGING VIEWPORT ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* ─── LAYER 1: SKY (Sits solidly in base z-index) ─── */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(1.05)',
          transition: `all 1.4s ${premiumEase}`
        }}>
          <img src="/retro/sky.png" alt="Sky" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ─── LAYER 2: CLOUDS (Drifts downward into place) ─── */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-50px)',
          transition: `all 1.2s ${premiumEase} 0.1s`
        }}>
          <img src="/retro/clouds.png" alt="Clouds" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ─── LAYER 3: CASTLE (Continuous Infinite Breathing ♾️) ─── */}
        {/* Scaled prominently right in the center center of the layout */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.8)',
          transition: `all 1.5s ${premiumEase} 0.15s`
        }}>
          <div style={{
            width: 'clamp(180px, 30vw, 400px)',
            height: 'auto',
            animation: mounted ? 'castleLivePulse 6s ease-in-out infinite' : 'none',
            transformOrigin: 'center center'
          }}>
            <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (Rises cleanly up from underneath) ─── */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(120px)',
          transition: `all 1.3s ${premiumEase} 0.2s`
        }}>
          <img src="/retro/hills.png" alt="Hills" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ─── LAYER 5: TERRAIN GROUND (Aggressive Slam Rise from Bottom) ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '24%',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(150px)',
          transition: `all 1s ${aggressiveEase} 0.25s`,
          zIndex: 5
        }}>
          <img src="/retro/terrain.png" alt="Terrain Floor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ─── LAYER 6: CHARACTER (Comes sweeping in from the left) ─── */}
        <div style={{
          position: 'absolute', bottom: '15%', left: '20%', 
          width: 'clamp(80px, 14vw, 150px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0) scale(1)' : 'translateX(-200px) scale(0.5)',
          transition: `all 1.2s ${aggressiveEase} 0.35s`,
          zIndex: 6
        }}>
          <div style={{ filter: 'drop-shadow(6px 8px 0px rgba(0,0,0,0.35))' }}>
            <img src="/retro/character.png" alt="Player Character" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COIN ARCHES (Float up into view and spin smoothly) ─── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(60px)',
          transition: `all 1.4s ${premiumEase} 0.4s`
        }}>
          
          {/* Grouped Arc Formations across the screen width */}
          <div style={{ position: 'absolute', left: '42%', bottom: '38%', width: '36px', animation: 'coinGlowSpin 1.6s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '47%', bottom: '48%', width: '36px', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.2s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '52%', bottom: '38%', width: '36px', animation: 'coinGlowSpin 1.6s ease-in-out infinite 0.4s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

          <div style={{ position: 'absolute', left: '72%', bottom: '32%', width: '36px', animation: 'coinGlowSpin 1.8s ease-in-out infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
          <div style={{ position: 'absolute', left: '77%', bottom: '32%', width: '36px', animation: 'coinGlowSpin 1.8s ease-in-out infinite 0.3s' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

        </div>

      </div>

      {/* ─── OBSIDIAN GRADIENT OVERLAY ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.2) 18%, transparent 38%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── MISTRAL-STYLE TYPOGRAPHY LAYER ─── */}
      <div style={{
        position: 'absolute', top: '10vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-30px) skewX(-6deg)',
        filter: mounted ? 'blur(0px)' : 'blur(12px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
        zIndex: 20
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        `}} />
        
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', letterSpacing: '0.4em', 
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '14px' 
        }}>
          Stage 2 · Retro
        </span>
        
        <h2 style={{ 
          fontFamily: "'Press Start 2P', cursive", 
          fontSize: 'clamp(1.4rem, 4.5vw, 3.2rem)', margin: 0,
          fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: '0 8px 0px #000',
          display: 'flex',
          gap: '16px'
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
            }


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
      // Mount the static parallax layers immediately after step snap
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
        @keyframes panSky {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panClouds {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panCastle {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panHills {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panTerrain {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panCoins {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes characterBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes coinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      {/* ─── MASTER CONTAINER FADE IN ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* ─── LAYER 1: SKY (Infinite Slow Pan) ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panSky 60s linear infinite' }}>
            <img src="/retro/sky.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/retro/sky.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* ─── LAYER 2: CLOUDS (Infinite Moderate Pan) ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panClouds 40s linear infinite' }}>
            <img src="/retro/clouds.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/retro/clouds.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* ─── LAYER 3: CASTLE (Mid-Ground Layer) ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panCastle 25s linear infinite' }}>
            <img src="/retro/castle.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/retro/castle.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* ─── LAYER 4: HILLS (Parallax Depth Layer) ─── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panHills 18s linear infinite' }}>
            <img src="/retro/hills.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/retro/hills.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* ─── LAYER 5: TERRAIN GROUND (Fast Run Loop) ─── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '24%',
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 0.8s ${aggressiveEase} 0.1s`,
          zIndex: 5
        }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panTerrain 3.5s linear infinite' }}>
            <img src="/retro/terrain.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/retro/terrain.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* ─── LAYER 6: CHARACTER (Fixed position, bobs vertically) ─── */}
        <div style={{
          position: 'absolute', bottom: '16%', left: '16%', 
          width: 'clamp(70px, 12vw, 130px)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-100px)',
          transition: `all 1s ${aggressiveEase} 0.2s`,
          zIndex: 6
        }}>
          <div style={{
            animation: 'characterBob 0.35s ease-in-out infinite',
            filter: 'drop-shadow(4px 6px 0px rgba(0,0,0,0.3))'
          }}>
            <img src="/retro/character.png" alt="Character" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ─── LAYER 7: COINS (Fast Multi-Cluster Layer Passing Over Player) ─── */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: mounted ? 1 : 0,
          transition: `opacity 0.8s ${premiumEase} 0.3s`,
          zIndex: 7
        }}>
          <div style={{ 
            width: '200%', 
            height: '100%', 
            position: 'relative',
            animation: 'panCoins 3.5s linear infinite' // Perfectly locked to terrain speed
          }}>
            
            {/* Cluster Panel A */}
            <div style={{ position: 'absolute', left: '25%', bottom: '38%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '28%', bottom: '46%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '31%', bottom: '38%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

            <div style={{ position: 'absolute', left: '60%', bottom: '52%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '63%', bottom: '52%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            
            {/* Cluster Panel B (Mirrored for seamless reset loop tracking) */}
            <div style={{ position: 'absolute', left: '125%', bottom: '38%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '128%', bottom: '46%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '131%', bottom: '38%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>

            <div style={{ position: 'absolute', left: '160%', bottom: '52%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            <div style={{ position: 'absolute', left: '163%', bottom: '52%', width: '32px', animation: 'coinSpin 1.2s linear infinite' }}><img src="/retro/coin.png" style={{ width: '100%' }} alt="" /></div>
            
          </div>
        </div>

      </div>

      {/* ─── OBSIDIAN GRADIENT MASK ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.8) 0%, rgba(2,2,2,0.2) 15%, transparent 35%)',
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
        transition: `all 1.2s ${aggressiveEase} 0.25s`,
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

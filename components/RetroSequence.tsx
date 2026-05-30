'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RetroSequence({ isActive }: Props) {
  // We use a slight delay for the entry animations so the crossfade
  // has a split-second to start before the assets fly in.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isActive])

  // Premium easing curve (Apple-style snap)
  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020202' }}>
      
      {/* --- INJECT KEYFRAMES FOR IDLE ANIMATIONS --- */}
      <style>{`
        @keyframes panClouds {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes characterBreathe {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(2px) scaleY(0.98); }
        }
        @keyframes coinHover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* 1. SKY (Fade In) */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
      }}>
        <img src="/retro/sky.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* 2. CLOUDS (Fade in + Infinite Pan) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '40%', width: '200%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: `all 1.2s ${premiumEase} 0.1s`,
        display: 'flex'
      }}>
        <div style={{ width: '100%', height: '100%', animation: 'panClouds 40s linear infinite' }}>
          {/* Double image for seamless panning */}
          <img src="/retro/clouds.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', position: 'absolute', left: '0' }} />
          <img src="/retro/clouds.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', position: 'absolute', left: '50%' }} />
        </div>
      </div>

      {/* 3. CASTLE (Parallax Rise) */}
      <div style={{
        position: 'absolute', bottom: '28%', left: '50%', marginLeft: '-15vw',
        width: 'clamp(160px, 30vw, 380px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
        transition: `all 1.2s ${premiumEase} 0.2s`,
      }}>
        <img src="/retro/castle.png" alt="Castle" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }} />
      </div>

      {/* 4. HILLS (Slide up) */}
      <div style={{
        position: 'absolute', bottom: '24%', left: 0, right: 0, height: '22%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(60px)',
        transition: `all 1s ${premiumEase} 0.15s`,
      }}>
        <img src="/retro/hills.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
      </div>

      {/* 5. TERRAIN (Heavy slide up - forms the ground) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '26%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(100px)',
        transition: `all 0.85s ${premiumEase} 0.1s`,
      }}>
        <img src="/retro/terrain.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>

      {/* 6. CHARACTER (Drop in from top, then breathe) */}
      <div style={{
        position: 'absolute', bottom: '26%', left: '48%', transform: 'translateX(-50%)',
        width: 'clamp(40px, 5vw, 72px)',
        // The container handles the drop-in
        opacity: mounted ? 1 : 0,
        marginTop: mounted ? '0' : '-80px',
        transition: `all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s`, // Custom bounce curve
      }}>
        {/* The inner div handles the continuous idle breathing */}
        <div style={{ animation: mounted ? 'characterBreathe 3s ease-in-out infinite 1.4s' : 'none' }}>
          <img src="/retro/character.png" alt="Hero" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.6))' }} />
        </div>
      </div>

      {/* 7. COINS (Staggered Pop In + Hover) */}
      <div style={{
        position: 'absolute', bottom: 'calc(26% + clamp(48px, 7vw, 86px))', left: 0, right: 0,
        pointerEvents: 'none',
      }}>
        {[18, 30, 42, 55, 68, 80].map((x, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, width: 'clamp(16px, 2.2vw, 26px)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scale(1)' : 'scale(0.5)',
            // Stagger the entry transition
            transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.4 + (i * 0.08)}s`,
          }}>
            <div style={{ animation: mounted ? `coinHover 3s ease-in-out ${i * 0.15}s infinite` : 'none' }}>
              <img src="/retro/coin.png" alt="Coin" style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }} />
            </div>
          </div>
        ))}
      </div>

      {/* --- UI LAYER --- */}

      {/* Obsidian Gradient Mask for Text Legibility */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.2) 20%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
      }} />

      {/* TOP-MIDDLE TYPOGRAPHY (Pixel Font) */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        filter: mounted ? 'blur(0px)' : 'blur(10px)',
        transition: `all 1.2s ${premiumEase} 0.3s`,
      }}>
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em', 
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '8px' 
        }}>
          Stage 2 · Retro
        </span>
        <h2 style={{ 
          fontFamily: "'VT323', monospace", // Premium pixel font
          fontSize: 'clamp(3rem, 7vw, 6rem)', margin: 0, color: '#FFFFFF', 
          fontWeight: 400, lineHeight: 1, letterSpacing: '0.02em',
          textShadow: '0 4px 20px rgba(0,0,0,0.8)' // Clean shadow, no neon glow
        }}>
          Pixels Never Died
        </h2>
      </div>

    </div>
  )
}

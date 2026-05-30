
'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function OpenWorldSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isActive) {
      // Small delay to let the crossfade from Racing complete smoothly
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isActive])

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const bounceEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Apple-style spring physics

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#02050A' }}>
      
      {/* --- INJECT KEYFRAMES FOR IDLE ANIMATIONS --- */}
      <style>{`
        @keyframes moonBreath {
          0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 30px rgba(200,220,255,0.4)); }
          50% { transform: translateX(-50%) scale(1.05); filter: drop-shadow(0 0 50px rgba(200,220,255,0.6)); }
        }
        @keyframes worldFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-15px); }
        }
        @keyframes heroIdle {
          0%, 100% { transform: translateX(-50%) scaleY(1); }
          50% { transform: translateX(-50%) scaleY(0.96) translateY(2px); }
        }
      `}</style>

      {/* 1. DEEP NIGHT SKY (Base Background) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 80% at 50% 20%, #061428 0%, #020813 60%, #000000 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.5s ${premiumEase}`
      }} />

      {/* 2. MOON (Slow pulse) */}
      <div style={{
        position: 'absolute', top: '6%', left: '50%', marginLeft: 0,
        width: 'clamp(80px, 14vw, 180px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-40px)',
        transition: `all 1.5s ${premiumEase} 0.2s`,
        zIndex: 1
      }}>
        {/* Inner div handles the infinite breathing animation */}
        <div style={{ animation: mounted ? 'moonBreath 6s ease-in-out infinite' : 'none' }}>
          <img src="/openworld/moon.png" alt="Moon" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

      {/* 3. WORLD ORB (Rises up massively from behind the ground) */}
      <div style={{
        position: 'absolute', bottom: '24%', left: '50%',
        width: 'clamp(200px, 40vw, 520px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(150px) scale(0.8)',
        transition: `all 1.4s ${premiumEase} 0.3s`,
        zIndex: 2
      }}>
        <div style={{ animation: mounted ? 'worldFloat 8s ease-in-out infinite' : 'none' }}>
          <img src="/openworld/world.png" alt="World" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 0 40px rgba(0,180,80,0.25))' }} />
        </div>
      </div>

      {/* 4. GROUND TERRAIN (Heavy slide up) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '26%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(120px)',
        transition: `all 1.2s ${premiumEase} 0.1s`,
        zIndex: 3
      }}>
        <img src="/openworld/ground.png" alt="Ground" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* 5. HERO (Drops down from above the ground with an Apple-style spring) */}
      <div style={{
        position: 'absolute', bottom: '26%', left: '50%',
        width: 'clamp(40px, 5.5vw, 80px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-80px)',
        transition: `all 1.2s ${bounceEase} 0.5s`,
        zIndex: 4
      }}>
        <div style={{ animation: mounted ? 'heroIdle 3s ease-in-out infinite 1.5s' : 'none' }}>
          <img src="/openworld/hero.png" alt="Hero" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 0 14px rgba(0,200,80,0.55))' }} />
        </div>
      </div>


      {/* ─── UI LAYER ─── */}

      {/* Obsidian Gradient Mask for Text */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,5,10,0.85) 0%, rgba(2,5,10,0.2) 20%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 5
      }} />

      {/* TOP-MIDDLE TYPOGRAPHY (Elegant Serif Font) */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        filter: mounted ? 'blur(0px)' : 'blur(12px)',
        transition: `all 1.2s ${premiumEase} 0.4s`,
        zIndex: 10
      }}>
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em', 
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '8px' 
        }}>
          Stage 4 · Open World
        </span>
        <h2 style={{ 
          // 'Cinzel' or 'Playfair Display' works beautifully here
          fontFamily: "'Cinzel', 'Times New Roman', serif", 
          fontSize: 'clamp(3rem, 7vw, 6rem)', margin: 0, color: '#FFFFFF', 
          fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.02em', 
          textShadow: '0 8px 30px rgba(0,0,0,0.8)', textAlign: 'center'
        }}>
          Every Path<br />Breathes
        </h2>
      </div>

    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RacingSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isActive) {
      // 50ms delay ensures the GSAP crossfade from HeroCanvas 
      // is fully initialized before we fire the internal hardware accelerations.
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isActive])

  // Apple-tier smooth fade for the background
  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
  // Aggressive, fast-snap curve for the racing typography (Expo.easeOut equivalent)
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020202' }}>
      
      {/* 1. CINEMATIC BACKGROUND (High-Speed Tracking Shot) 
        Notice the inset is -20px. This gives us bleed room to slowly translate
        the image horizontally over 12 seconds, simulating a tracking camera.
      */}
      <div style={{
        position: 'absolute', 
        inset: '-20px', 
        backgroundImage: 'url("/1000942499.png")', // Your F1 Sunset image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: mounted ? 1 : 0,
        // Translates from 20px right to 0px, scaling down slightly
        transform: mounted ? 'scale(1) translateX(0px)' : 'scale(1.03) translateX(20px)',
        transition: `opacity 0.8s ${premiumEase}, transform 12s cubic-bezier(0.25, 1, 0.5, 1)`,
        willChange: 'transform, opacity'
      }} />

      {/* 2. OBSIDIAN GRADIENT MASK
        Maintains the grid-locked UI legibility perfectly.
      */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.2) 20%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
      }} />

      {/* 3. TOP-MIDDLE TYPOGRAPHY (Aggressive 'Thunder' Style) */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        // Punches in with a slight skew to simulate motion/velocity
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-40px) skewX(-6deg)',
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1s ${aggressiveEase} 0.15s`,
        willChange: 'opacity, transform, filter'
      }}>
        <span style={{ 
          fontFamily: "'Inter', 'SF Pro Display', sans-serif", 
          fontSize: '0.75rem', 
          letterSpacing: '0.3em', 
          color: 'rgba(255,255,255,0.6)', 
          textTransform: 'uppercase', 
          marginBottom: '8px' 
        }}>
          Stage 3 · Racing
        </span>
        
        {/* The 'Thunder' aesthetic: Tall, condensed, zero tracking, maximum impact.
            We use Bebas Neue/Teko/Oswald as safe fallbacks if Thunder isn't loaded locally yet. */}
        <h2 style={{ 
          fontFamily: "'Thunder', 'Bebas Neue', 'Oswald', sans-serif", 
          fontSize: 'clamp(4.5rem, 11vw, 9rem)', 
          margin: 0, 
          color: '#FFFFFF', 
          fontWeight: 800, 
          lineHeight: 0.85, 
          textTransform: 'uppercase',
          letterSpacing: '0.01em',
          textShadow: '0 12px 40px rgba(0,0,0,0.9)' // Deep, heavy grounding shadow
        }}>
          Heads Up, Gear
        </h2>
      </div>

    </div>
  )
}

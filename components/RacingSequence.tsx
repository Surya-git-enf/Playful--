
'use client'

import React, { useEffect, useState, useRef } from 'react'

interface Props {
  isActive: boolean
}

export default function RacingSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let mountTimer: NodeJS.Timeout
    let videoTimer: NodeJS.Timeout

    if (isActive) {
      // 1. Mount the static parallax layers immediately after snap
      mountTimer = setTimeout(() => setMounted(true), 50)
      
      // 2. Crossfade to the MP4 video after 2.5 seconds of intense parallax
      videoTimer = setTimeout(() => setShowVideo(true), 2500)
    } else {
      setMounted(false)
      setShowVideo(false)
    }

    return () => {
      clearTimeout(mountTimer)
      clearTimeout(videoTimer)
    }
  }, [isActive])

  // Play video automatically when crossfade triggers
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [showVideo])

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const aggressiveEase = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020202' }}>
      
      <style>{`
        @keyframes panBgSlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes panRoadFast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes engineVibrate {
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
          25% { transform: translateX(-50%) translateY(1.5px) rotate(0.5deg); }
          75% { transform: translateX(-50%) translateY(-1px) rotate(-0.5deg); }
        }
      `}</style>

      {/* ─── 1. PARALLAX LAYERS (Fades out when video starts) ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted && !showVideo ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity'
      }}>
        
        {/* A. Background (Slow Pan) */}
        <div style={{ position: 'absolute', inset: 0, opacity: mounted ? 1 : 0, transition: `opacity 0.6s ${premiumEase}` }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panBgSlow 40s linear infinite' }}>
            <img src="/racing/bg.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/racing/bg.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* B. Road (Ultra-Fast Pan) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(100px)',
          transition: `all 0.8s ${aggressiveEase} 0.1s`
        }}>
          <div style={{ width: '200%', height: '100%', display: 'flex', animation: 'panRoadFast 1.5s linear infinite' }}>
            <img src="/racing/road.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            <img src="/racing/road.png" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* C. Car (Slams in, then vibrates) */}
        <div style={{
          position: 'absolute', bottom: '25%', left: '50%', 
          width: 'clamp(280px, 45vw, 600px)',
          // The container handles the aggressive slide-in from the left
          opacity: mounted ? 1 : 0,
          marginLeft: mounted ? '0' : '-300px',
          transition: `all 1s ${aggressiveEase} 0.2s`,
        }}>
          {/* Inner div handles the constant engine vibration */}
          <div style={{
            animation: mounted ? 'engineVibrate 0.1s linear infinite' : 'none',
            transformOrigin: 'bottom center',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))'
          }}>
            <img src="/racing/car.png" alt="F1 Car" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </div>


      {/* ─── 2. VIDEO LAYER (Crossfades in) ─── */}
      <video
        ref={videoRef}
        src="/racing/racing.mp4"
        loop
        muted
        playsInline
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: showVideo ? 1 : 0,
          transition: 'opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1)',
          willChange: 'opacity'
        }}
      />


      {/* ─── 3. OBSIDIAN GRADIENT MASK (Keeps text legible over both layers & video) ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.9) 0%, rgba(2,2,2,0.3) 20%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 5
      }} />


      {/* ─── 4. TOP-MIDDLE TYPOGRAPHY (Aggressive 'Thunder' Entrance) ─── */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        // Aggressive skew-in to simulate high-speed braking into position
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-40px) skewX(-10deg)',
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1.2s ${aggressiveEase} 0.3s`,
        willChange: 'opacity, transform, filter',
        zIndex: 10
      }}>
        <span style={{ 
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em', 
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '8px' 
        }}>
          Stage 3 · Racing
        </span>
        
        <h2 style={{ 
          fontFamily: "'Thunder', 'Bebas Neue', sans-serif", 
          fontSize: 'clamp(4.5rem, 11vw, 9rem)', margin: 0, color: '#FFFFFF', 
          fontWeight: 800, lineHeight: 0.85, textTransform: 'uppercase',
          letterSpacing: '0.02em',
          textShadow: '0 12px 40px rgba(0,0,0,0.9)'
        }}>
          Heads Up, Gear
        </h2>
      </div>

    </div>
  )
}

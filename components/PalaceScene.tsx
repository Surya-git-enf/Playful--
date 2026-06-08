'use client'

import { useEffect, useRef } from 'react'

export default function PalaceScene({ frame = 0, isActive }: { frame?: number; isActive: boolean }) {
  useEffect(() => {
    // Cleanup would go here if needed
  }, [frame, isActive])

  if (!isActive) return null

  // Calculate which frame to display (0-144)
  const currentFrame = Math.min(frame, 144)
  const frameString = currentFrame.toString().padStart(4, '0')
  const imageSrc = `/palace/palace-frame_${frameString}.webp`

  // Text appears during frames 100-144
  const showText = currentFrame >= 100
  const textProgress = showText ? (currentFrame - 100) / 44 : 0 // 0 to 1 over frames 100-144

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      backgroundColor: '#020202'
    }}>
      {/* Palace Frame Scrub */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <img
          src={imageSrc}
          alt="Palace Frame"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      {/* Text Animation (frames 100-144) */}
      {showText && (
        <div style={{
          position: 'absolute',
          bottom: '20vh',
          left: '50%',
          transform: `translateX(-50%) translateY(${20 * (1 - textProgress)}px)`,
          opacity: textProgress,
          fontFamily: "'Cinzel', 'Times New Roman', serif",
          fontSize: 'clamp(3rem,7vw,6rem)',
          color: '#FFFFFF',
          textAlign: 'center',
          pointerEvents: 'none',
          transition: `all 1s cubic-bezier(0.16,1,0.3,1)`
        }}>
          Kingdoms Never Sleep
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState } from 'react'

// 1. THIS IS THE BLUEPRINT THAT FIXES YOUR ERROR
interface PalaceSequenceProps {
  isActive: boolean
  frameRef?: React.RefObject<number>
  palaceFrame?: React.MutableRefObject<number>
}

const PALACE_TOTAL_FRAMES = 144
const padded = (n: number) => String(n).padStart(4, '0')

// Note: Ensure this points to your actual local folder: `/palace/palace-frame_${padded(n)}.webp`
const FRAME_PATH = (n: number) => `https://picsum.photos/id/${(n % 50) + 10}/1920/1080`

// 2. APPLYING THE BLUEPRINT TO THE COMPONENT
export default function PalaceSequence({ isActive, frameRef, palaceFrame }: PalaceSequenceProps) {
  const resolvedFrameRef = (frameRef ?? palaceFrame) as React.RefObject<number>
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const drawnRef = useRef(-1)
  const [loadedPct, setLoadedPct] = useState(0)

  // -- Draw Frame Logic --
  const drawAt = (idx: number) => {
    const c = canvasRef.current
    const img = framesRef.current[idx]
    if (!c || !img?.complete || !img.naturalWidth) return
    
    const ctx = c.getContext('2d')
    if (!ctx) return
    
    const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight)
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const sx = (c.width - sw) / 2
    const sy = (c.height - sh) / 2
    
    ctx.drawImage(img, sx, sy, sw, sh)
    drawnRef.current = idx
  }

  // -- Preload Images --
  useEffect(() => {
    let loaded = 0
    const images = new Array(PALACE_TOTAL_FRAMES + 1)
    framesRef.current = images

    for (let i = 0; i <= PALACE_TOTAL_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        loaded++
        setLoadedPct(Math.round((loaded / (PALACE_TOTAL_FRAMES + 1)) * 100))
        if (i === 0) drawAt(0)
      }
      img.src = FRAME_PATH(i + 1)
      images[i] = img
    }
    return () => { framesRef.current = [] }
  }, [])

  // -- Canvas Resize --
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        if (drawnRef.current >= 0) drawAt(drawnRef.current)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // -- RAF Render Loop --
  useEffect(() => {
    if (!resolvedFrameRef) return
    
    let smoothFrame = resolvedFrameRef.current || 0
    let raf: number

    const tick = () => {
      if (isActive && resolvedFrameRef.current !== undefined) {
        smoothFrame += (resolvedFrameRef.current - smoothFrame) * 0.08
        const currentIdx = Math.min(PALACE_TOTAL_FRAMES, Math.max(0, Math.round(smoothFrame)))
        
        if (currentIdx !== drawnRef.current) {
          drawAt(currentIdx)
        }

        if (titleRef.current) {
          const progress = Math.max(0, Math.min(1, (smoothFrame - 100) / 44))
          titleRef.current.style.opacity = String(progress)
          titleRef.current.style.transform = `translateY(${(1 - progress) * 20}px)`
          titleRef.current.style.filter = `blur(${(1 - progress) * 10}px)`
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isActive, resolvedFrameRef])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          display: 'block', objectFit: 'cover'
        }}
      />
      
      {loadedPct < 100 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ height: '100%', width: `${loadedPct}%`, background: '#FFFFFF', transition: 'width 0.2s ease' }} />
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(2,2,2,0.9) 0%, rgba(2,2,2,0.4) 25%, transparent 60%)'
      }} />

      <div ref={titleRef} style={{
        position: 'absolute', bottom: '12%', left: '0', right: '0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform, filter'
      }}>
        <span className="font-ui" style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
          ✦ Palace ✦
        </span>
        <h2 className="font-display" style={{
          fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 500, margin: 0,
          color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          Kingdoms Never Sleep
        </h2>
      </div>
    </div>
  )
}

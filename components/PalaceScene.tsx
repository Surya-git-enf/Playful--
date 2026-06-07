'use client'

// 1. ADD THESE IMPORTS:
import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

// ============================================================================
// PALACE SCENE (Canvas Scrub)
// ============================================================================
const PALACE_FRAMES = 145

export default function PalaceScene({ isActive, frame }: { isActive: boolean; frame: number }) {
  console.log('PalaceScene rendering:', { isActive, frame, frameType: typeof frame, timestamp: Date.now() })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawnRef = useRef(-1)
  const framesRef = useRef<HTMLImageElement[]>([])

  // Framer Motion smooth values
  const smoothFrame = useSpring(frame, { damping: 20, stiffness: 150 })
  const [opacity, setOpacity] = useState(0)
  const [yPos, setYPos] = useState(20)

  console.log('PalaceScene initialized with frame:', frame)

  // File Path for the frames:
  const FRAME_PATH = (n: number) => `/palace/palace-frame_${String(n).padStart(4, '0')}.webp`

  const drawAt = (idx: number) => {
    const c = canvasRef.current;
    const img = framesRef.current[idx]
    if (!c || !img?.complete || !img.naturalWidth) return
    const ctx = c.getContext('2d');
    if (!ctx) return

    // Apple-style object-cover math for canvas
    const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight)
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale
    ctx.drawImage(img, (c.width - sw) / 2, (c.height - sh) / 2, sw, sh)
    drawnRef.current = idx
  }

  // Preload Images securely
  useEffect(() => {
    const images = new Array(PALACE_FRAMES + 1)
    framesRef.current = images

    for (let i = 1; i <= PALACE_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        console.log(`Image ${i} loaded:`, img.src, img.width, img.height)
        // Draw the very first frame immediately so the screen isn't black
        if (i === 1 && drawnRef.current === -1) {
          console.log('Drawing first frame')
          drawAt(1)
        }
      }
      img.onerror = () => {
        console.error(`Failed to load image ${i}:`, FRAME_PATH(i))
      }
      img.src = FRAME_PATH(i)
      images[i] = img
    }
  }, [])

  // Canvas Resize Handler
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (c) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        drawAt(drawnRef.current > 0 ? drawnRef.current : 1)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Update opacity and position based on smooth frame progress
  useEffect(() => {
    const updateDisplay = () => {
      if (isActive) {
        const currentFrame = smoothFrame.get()
        // Text fades in during the last 45 frames (Apple scroll reveal)
        const progress = Math.max(0, Math.min(1, (currentFrame - 100) / 45))
        setOpacity(progress)
        setYPos(20 * (1 - progress))

        // Draw the current frame
        const frameIdx = Math.min(PALACE_FRAMES, Math.max(1, Math.round(currentFrame)))
        if (frameIdx !== drawnRef.current) {
          drawAt(frameIdx)
        }
      }
    }

    const id = requestAnimationFrame(function loop() {
      updateDisplay()
      return requestAnimationFrame(loop)
    })

    return () => cancelAnimationFrame(id)
  }, [isActive, smoothFrame])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block object-cover" />

      {/* Title */}
      <div
        className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center"
        style={{ opacity, transform: `translateY(${yPos}px)` }}
      >
        <span className="text-white/50 tracking-[0.3em] text-xs uppercase mb-4 font-['Space_Mono']">✦ Palace ✦</span>
        <h2 className="text-white text-[clamp(3rem,7vw,6rem)] leading-none italic drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Kingdoms Never Sleep
        </h2>
      </div>
    </motion.div>
  )
}

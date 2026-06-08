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
const FRAME_PATH = (n: number) => `/palace/palace-frame_${padded(n)}.webp`

// 2. APPLYING THE BLUEPRINT TO THE COMPONENT
export default function PalaceSequence({ isActive, frameRef, palaceFrame }: PalaceSequenceProps) {
  const resolvedFrameRef = (frameRef ?? palaceFrame) as React.RefObject<number>
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const drawnRef = useRef(-1)
  const sectionRef = useRef<HTMLDivElement>(null)
  const frameIndexRef = useRef(0)
  const needsDrawRef = useRef(false)
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
    let loadedCount = 0
    const images = new Array(PALACE_TOTAL_FRAMES + 1)
    framesRef.current = images

    for (let i = 0; i <= PALACE_TOTAL_FRAMES; i++) {
      const img = new Image()
      img.onload = () => {
        loadedCount++
        setLoadedPct(Math.round((loadedCount / (PALACE_TOTAL_FRAMES + 1)) * 100))
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

  // -- Is loaded flag --
  const isLoaded = loadedPct >= 100

  // -- Initial frame draw --
  useEffect(() => {
    if (isLoaded) {
      drawAt(0);
    }
  }, [isLoaded]);

  // -- ScrollTrigger for frame sequencing and text animation --
  useEffect(() => {
    if (!isLoaded || !isActive) return;

    const section = sectionRef.current;
    if (!section) return;

    // Create ScrollTrigger for frame sequencing and text animation
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=400%", // Total scroll distance for the full frame sequence (0-144)
      pin: true,
      pinSpacing: true,
      scrub: true, // Smooth scrolling synchronization
      onUpdate: (self) => {
        const progress = self.progress; // 0 to 1 based on scroll position in the trigger

        // Map scroll progress to full frame range 0-144
        const currentFrame = Math.floor(progress * (PALACE_TOTAL_FRAMES - 1));
        frameIndexRef.current = currentFrame;
        needsDrawRef.current = true;

        // Draw the current frame on canvas
        drawAt(currentFrame);

        // Calculate text animation progress within the 100-120 frame range
        const frameStart = 100;
        const frameEnd = 120;
        const totalFramesInRange = frameEnd - frameStart; // 20 frames

        let textProgress = 0;
        if (currentFrame >= frameStart && currentFrame <= frameEnd) {
          // Map frame 100-120 to text progress 0-1
          textProgress = (currentFrame - frameStart) / totalFramesInRange;
        } else if (currentFrame < frameStart) {
          textProgress = 0; // Before animation range
        } else {
          textProgress = 1; // After animation range
        }

        // Apply animation to the headline
        const headline = document.getElementById("palace-headline");
        if (headline) {
          // Fade in and slide up
          headline.style.opacity = String(textProgress);
          headline.style.transform = `translateY(${(1 - textProgress) * 20}px)`;
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoaded, isActive]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          display: 'block', objectFit: 'cover'
        }}
      />
      
      {/* Progress bar removed - not needed for this effect */}

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(2,2,2,0.9) 0%, rgba(2,2,2,0.4) 25%, transparent 60%)'
      }} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <h2
          id="palace-headline"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            letterSpacing: '0.02em',
            color: '#FFFFFF',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}
        >
          Step Inside the Kingdom
        </h2>
      </div>
    </div>
  )
}

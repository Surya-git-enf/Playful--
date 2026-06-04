
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { PalaceSequence } from './PalaceSequence'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'

const TOTAL_SCENES = 4 // 0: Palace, 1: Retro, 2: Racing, 3: OpenWorld, 4: Space
const PALACE_TOTAL_FRAMES = 144
const PALACE_SCRUB_STEP = 8
const SNAP_LOCK_MS = 1000

export default function HeroCanvas() {
  const [scene, setSceneState] = useState(0)
  const sceneRef = useRef(0)
  const frameRef = useRef(0)
  const snapLocked = useRef(false)
  const [isReleased, setIsReleased] = useState(false) // True when scrolling past Space

  const setScene = (n: number) => {
    sceneRef.current = n
    setSceneState(n)
  }

  // ── Central Snap Engine ──────────────────────────────────────
  const snapTo = (next: number) => {
    if (snapLocked.current || next < 0) return

    // Scroll past Space (Scene 4) -> Release the pin and show bottom cards
    if (next > TOTAL_SCENES) {
      snapLocked.current = true
      setIsReleased(true)
      document.body.style.overflow = 'auto'
      window.scrollTo({ top: 0, behavior: 'instant' })
      setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
      return
    }

    snapLocked.current = true
    setScene(next)
    setTimeout(() => { snapLocked.current = false }, SNAP_LOCK_MS)
  }

  // ── Scroll & Touch Physics ───────────────────────────────────
  useEffect(() => {
    // Lock native scrolling initially
    document.body.style.overflow = 'hidden'

    const handleWheel = (e: WheelEvent) => {
      // If we are released to the bottom content, listen for a scroll-up at the very top to return to Space
      if (isReleased) {
        if (window.scrollY === 0 && e.deltaY < 0) {
          e.preventDefault()
          setIsReleased(false)
          document.body.style.overflow = 'hidden'
          setScene(TOTAL_SCENES) // Back to Space
        }
        return
      }

      e.preventDefault()
      if (snapLocked.current) return

      const isScrollingDown = e.deltaY > 0

      // Scene 0 (Palace) - Scrub logic
      if (sceneRef.current === 0) {
        if (isScrollingDown && frameRef.current < PALACE_TOTAL_FRAMES) {
          frameRef.current = Math.min(PALACE_TOTAL_FRAMES, frameRef.current + PALACE_SCRUB_STEP)
          return
        }
        if (!isScrollingDown && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - PALACE_SCRUB_STEP)
          return
        }
      }

      // If scrub boundary is hit, or we are in another scene, trigger Snap
      snapTo(sceneRef.current + (isScrollingDown ? 1 : -1))
    }

    // Touch logic for mobile precision
    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    
    const handleTouchMove = (e: TouchEvent) => {
      // CRITICAL: Prevent native mobile scroll bleed while pinned
      if (!isReleased) e.preventDefault()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(deltaY) < 40 || snapLocked.current) return
      
      const isSwipingUp = deltaY > 0 // Swiping up means scrolling down the page

      if (isReleased) {
        if (window.scrollY === 0 && !isSwipingUp) {
          setIsReleased(false)
          document.body.style.overflow = 'hidden'
          setScene(TOTAL_SCENES)
        }
        return
      }

      if (sceneRef.current === 0) {
        if (isSwipingUp && frameRef.current < PALACE_TOTAL_FRAMES) {
          frameRef.current = Math.min(PALACE_TOTAL_FRAMES, frameRef.current + PALACE_SCRUB_STEP * 2.5)
          return
        }
        if (!isSwipingUp && frameRef.current > 0) {
          frameRef.current = Math.max(0, frameRef.current - PALACE_SCRUB_STEP * 2.5)
          return
        }
      }
      snapTo(sceneRef.current + (isSwipingUp ? 1 : -1))
    }

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReleased || snapLocked.current) return
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) return
      
      e.preventDefault()
      const isDown = ['ArrowDown', 'PageDown', ' '].includes(e.key)
      
      if (sceneRef.current > 0 || (isDown ? frameRef.current >= PALACE_TOTAL_FRAMES : frameRef.current <= 0)) {
        snapTo(sceneRef.current + (isDown ? 1 : -1))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [isReleased]) 

  // Helper to manage crossfade styling
  const getSceneStyle = (index: number) => ({
    position: 'absolute' as const,
    inset: 0,
    opacity: scene === index ? 1 : 0,
    pointerEvents: (scene === index ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
    transition: 'opacity 0.85s cubic-bezier(0.65, 0, 0.35, 1)', // power3.inOut equivalent
    zIndex: scene === index ? 10 : 0,
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: isReleased ? -1 : 100, // Drops behind the document when released
        overflow: 'hidden',
        background: '#020202', // Deep OLED Obsidian
        pointerEvents: (isReleased ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
      }}
    >
      {/* 0. Palace Canvas Layer */}
      <div style={getSceneStyle(0)}>
        <PalaceSequence isActive={scene === 0} frameRef={frameRef} />
      </div>

      {/* 1. Retro Layer */}
      <div style={getSceneStyle(1)}>
        <RetroSequence isActive={scene === 1} />
      </div>

      {/* 2. Racing Layer */}
      <div style={getSceneStyle(2)}>
        <RacingSequence isActive={scene === 2} />
      </div>

      {/* 3. Open World Layer */}
      <div style={getSceneStyle(3)}>
        <OpenWorldSequence isActive={scene === 3} />
      </div>

      {/* 4. Space & Prompt Layer */}
      <div style={getSceneStyle(4)}>
        <SpaceSequence isActive={scene === 4} />
      </div>

      {/* Minimalist Scene Indicators (Right side) */}
      <div style={{ 
        position: 'absolute', right: '32px', top: '50%', 
        transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 50 
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} onClick={() => snapTo(i)} style={{
            width: '4px',
            height: scene === i ? '24px' : '4px',
            borderRadius: '4px',
            backgroundColor: scene === i ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
          }} />
        ))}
      </div>
    </div>
  )
}

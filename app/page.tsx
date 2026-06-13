'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

// Import constants for the Preloader
import { TOTAL_FRAMES, pad } from '../components/HeroCanvas'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

// ------------------------------------------------------------------
// PRELOADER COMPONENT
// ------------------------------------------------------------------
function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let loaded = 0
    const totalToLoad = TOTAL_FRAMES + 1

    for (let i = 0; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/palace/palace-frame_${pad(i)}.webp`
      
      const handleLoad = () => {
        loaded++
        setProgress(Math.floor((loaded / totalToLoad) * 100))
        if (loaded >= totalToLoad) {
          setTimeout(onComplete, 400) // Small delay so user sees 100%
        }
      }

      img.onload = handleLoad
      img.onerror = handleLoad 
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#02030a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'var(--font-orbitron, "Orbitron", sans-serif)'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ 
          width: 50, height: 50, borderRadius: '50%', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#00c8ff', marginBottom: 24 
        }}
      />
      <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.1em' }}>
        {progress}%
      </div>
      <div style={{ 
        fontSize: '12px', color: 'rgba(255,255,255,0.4)', 
        marginTop: 8, letterSpacing: '0.25em' 
      }}>
        INITIALIZING WORLD
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// MAIN HOME PAGE
// ------------------------------------------------------------------
export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [heroReleased, setHeroReleased] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const heroReleasedRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }, 80)
  }, [])

  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY <= 10) { 
        heroReleasedRef.current = false
        setHeroReleased(false)
        document.body.style.overflow = 'hidden'
        window.scrollTo({ top: 0, behavior: 'instant' }) 
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  const showNavbar = heroReleased || currentScene === 4

  return (
    <main>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
          >
            <Preloader onComplete={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, height: '70px', padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        opacity: showNavbar ? 1 : 0, transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showNavbar ? 'auto' : 'none', transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playful" style={{
            width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)', borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(0,200,255,.3)', boxShadow: '0 0 15px rgba(0,234,255,.2)',
          }} />
          <span style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontWeight: 900, fontSize: 'clamp(.85rem,2vw,1.3rem)', letterSpacing: '.2em', color: '#fff' }}>PLAYFUL</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/auth" className="nbtn signin" style={{ color: '#fff', textDecoration: 'none' }}>Sign in</a>
          <a href="/auth" className="nbtn signup" style={{ color: '#fff', textDecoration: 'none', background: '#00c8ff', padding: '8px 16px', borderRadius: '4px' }}>Try Free</a>
        </div>
      </nav>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        pointerEvents: heroReleased ? 'none' : 'auto',
      }}>
        <HeroCanvas 
          onRelease={handleRelease} 
          onSceneChange={setCurrentScene} 
          isReleased={heroReleased} 
        />
      </div>

      <div style={{ height: '100vh', scrollSnapAlign: 'start' }} aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 200 }}>
        <SnapCards isActive={heroReleased} />
      </div>
    </main>
  )
}

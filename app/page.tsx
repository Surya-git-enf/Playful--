'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const [currentScene, setCurrentScene] = useState(0) // NEW: Track scene
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

  // Smoothed out scroll-back logic
  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY <= 10) { 
        heroReleasedRef.current = false
        setHeroReleased(false)
        document.body.style.overflow = 'hidden'
        // Using 'instant' prevents layout shifting/jumping
        window.scrollTo({ top: 0, behavior: 'instant' }) 
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  // NEW: Show navbar if released OR if we are on Space (Scene 4)
  const showNavbar = heroReleased || currentScene === 4

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 2000, height: '70px',
        padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        opacity: showNavbar ? 1 : 0,
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showNavbar ? 'auto' : 'none',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* ... Keep your existing Logo and Buttons here ... */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playful" style={{
            width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)',
            borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(0,200,255,.3)',
            boxShadow: '0 0 15px rgba(0,234,255,.2)',
          }} />
          <span style={{
            fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)',
            fontWeight: 900, fontSize: 'clamp(.85rem,2vw,1.3rem)',
            letterSpacing: '.2em', color: '#fff',
          }}>PLAYFUL</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/auth" className="nbtn signin">Sign in</a>
          <a href="/auth" className="nbtn signup">Try Free</a>
        </div>
      </nav>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        // FIX: Removed the opacity fade entirely to prevent the black screen flash.
        // By just toggling pointerEvents, the canvas stays visually fixed in the background smoothly.
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
    </>
  )
}

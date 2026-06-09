'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const heroReleasedRef = useRef(false)

  // Lock body on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    // Unlock body — snap scroll takes over
    document.body.style.overflow = 'auto'
    // Jump window scroll to the bottom content start
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }, 60)
  }, [])

  // Re-lock when user scrolls window back to top
  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY < 10) {
        heroReleasedRef.current = false
        document.body.style.overflow = 'hidden'
        window.scrollTo(0, 0)
        setHeroReleased(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  return (
    <>
      {/* Navbar — always visible */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 2000, height: '70px',
        padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}>
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

      {/* Hero — fixed, fades out when released */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        opacity: heroReleased ? 0 : 1,
        pointerEvents: heroReleased ? 'none' : 'auto',
        transition: 'opacity 0.5s ease',
      }}>
        <HeroCanvas onRelease={handleRelease} onHeaderVisibilityChange={() => {}} />
      </div>

      {/* 
        Document flow:
        - First 100vh = spacer (hero sits fixed above it)
        - Then snap sections follow naturally in window scroll
      */}
      <div style={{ height: "100vh", scrollSnapAlign: "start", flexShrink: 0 }} aria-hidden="true" />

      {/* Snap sections — window-level scroll-snap */}
      <div style={{
        /* snap context on the sections themselves */
        position: 'relative', zIndex: 200,
      }}>
        <SnapCards isActive={heroReleased} />
      </div>
    </>
  )
}

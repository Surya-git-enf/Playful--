'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const heroReleasedRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Lock body on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    setHeaderVisible(true)
    // Unlock — the snap container takes over
    document.body.style.overflow = 'auto'
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }, [])

  // Re-lock when user scrolls back to very top
  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY < 4) {
        heroReleasedRef.current = false
        document.body.style.overflow = 'hidden'
        window.scrollTo(0, 0)
        setHeroReleased(false)
        setHeaderVisible(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  return (
    <>
      {/* Navbar — slides down after release */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 2000, height: '70px',
        padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: headerVisible ? 1 : 0,
        transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: headerVisible ? 'auto' : 'none',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playful" style={{
            width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)',
            borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(0,200,255,.3)',
            boxShadow: '0 0 15px rgba(0,234,255,.2)',
          }} />
          <span style={{
            fontFamily: 'var(--font-orbitron), Orbitron, sans-serif',
            fontWeight: 900, fontSize: 'clamp(.85rem,2vw,1.3rem)',
            letterSpacing: '.2em', color: '#fff',
          }}>PLAYFUL</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/auth" className="nbtn signin">Sign in</a>
          <a href="/auth" className="nbtn signup">Try Free</a>
        </div>
      </nav>

      {/* Hero — fixed, always behind navbar */}
      <HeroCanvas
        onRelease={handleRelease}
        onHeaderVisibilityChange={setHeaderVisible}
      />

      {/* 100vh spacer so bottom content starts below fold */}
      <div style={{ height: '100vh', pointerEvents: 'none' }} aria-hidden="true" />

      {/* Snap scroll container — only active after release */}
      <div
        ref={bottomRef}
        style={{
          position: 'relative',
          zIndex: heroReleased ? 200 : -1,
          visibility: heroReleased ? 'visible' : 'hidden',
          /* Snap scroll */
          scrollSnapType: 'y mandatory',
          overflowY: 'scroll',
          height: '100vh',
          /* Stack above the fixed hero */
          isolation: 'isolate',
        }}
      >
        <SnapCards isActive={heroReleased} />
      </div>
    </>
  )
}

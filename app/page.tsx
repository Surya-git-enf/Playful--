'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  return (
    <>
      {/* ── Navbar ── always in DOM, visibility controlled by HeroCanvas */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 2000, height: '70px',
          padding: '0 clamp(16px,4vw,48px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents: headerVisible ? 'auto' : 'none',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png" alt="Playful"
            style={{
              width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)',
              borderRadius: '12px', objectFit: 'cover',
              border: '1px solid rgba(0,200,255,.3)',
              boxShadow: '0 0 15px rgba(0,234,255,.2)',
            }}
          />
          <span style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
            fontSize: 'clamp(.85rem,2vw,1.3rem)', letterSpacing: '.2em', color: '#fff',
          }}>PLAYFUL</span>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/auth" style={{
            padding: 'clamp(6px,1.2vw,8px) clamp(14px,2.5vw,22px)',
            borderRadius: '99px', border: '1px solid rgba(0,180,255,.28)',
            background: 'rgba(0,100,255,.07)', backdropFilter: 'blur(12px)',
            color: 'rgba(0,210,255,.88)', fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(.65rem,1vw,.75rem)', fontWeight: 700, letterSpacing: '.05em',
            cursor: 'pointer', textDecoration: 'none', transition: 'all .26s',
          }}>Sign in</a>
          <a href="/auth" style={{
            padding: 'clamp(6px,1.2vw,8px) clamp(14px,2.5vw,22px)',
            borderRadius: '99px',
            border: '1px solid rgba(0,170,255,.5)',
            background: 'linear-gradient(135deg,rgba(0,70,200,.6),rgba(0,150,255,.4))',
            color: '#fff', fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(.65rem,1vw,.75rem)', fontWeight: 700, letterSpacing: '.05em',
            cursor: 'pointer', textDecoration: 'none', transition: 'all .26s',
          }}>Try Free</a>
        </div>
      </nav>

      {/* ── Hero Canvas (fixed, intercepts scroll) ── */}
      <HeroCanvas
        onRelease={() => setHeroReleased(true)}
        onHeaderVisibilityChange={setHeaderVisible}
      />

      {/* ── SnapCards (below the fold, visible after release) ── */}
      <div style={{
        position: 'relative',
        zIndex: heroReleased ? 200 : -1,
        marginTop: '100vh',
        visibility: heroReleased ? 'visible' : 'hidden',
      }}>
        <SnapCards isActive={heroReleased} />
      </div>
    </>
  )
}

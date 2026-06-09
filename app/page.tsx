'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [heroReleased, setHeroReleased] = useState(false)

  const handleRelease = () => {
    setHeroReleased(true)
  }

  return (
    <>
      {/* Navbar */}
      <nav className={`playful-nav ${headerVisible ? '' : 'nav-hidden'}`}>
        <a href="/" className="nav-brand">
          <div className="nav-logo" aria-hidden="true">🎮</div>
          <span className="nav-name">PLAYFUL</span>
        </a>
        <div className="nav-actions">
          <a href="/auth" className="nbtn signin">Sign in</a>
          <a href="/auth" className="nbtn signup">Try Free</a>
        </div>
      </nav>

      {/* Hero — fixed, intercepts scroll until released */}
      <HeroCanvas
        onRelease={handleRelease}
        onHeaderVisibilityChange={setHeaderVisible}
      />

      {/* Cards — only rendered/scrollable after hero releases */}
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

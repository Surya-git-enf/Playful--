'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(true)

  const handleHeaderVisibility = (visible: boolean) => {
    setHeaderVisible(visible)
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

      {/* Pinned hero — manages its own scroll interception */}
      <HeroCanvas onHeaderVisibilityChange={handleHeaderVisibility} />

      {/* Cards — CSS snap scroll, sits below hero */}
      <div style={{
        position: 'relative', zIndex: 10,
        scrollSnapType: 'y mandatory',
        overflowY: 'scroll',     /* own scroll context */
        height: '100vh',
      }}>
        <SnapCards isActive={true} />
      </div>
    </>
  )
}
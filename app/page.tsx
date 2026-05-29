
'use client'

import dynamic from 'next/dynamic'

// ssr:false — canvas + GSAP touch window/document at import time
const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

export default function Home() {
  return (
    <>
      {/* Navbar — always on top */}
      <nav className="playful-nav">
        <a href="/" className="nav-brand">
          <div className="nav-logo" aria-hidden="true">🎮</div>
          <span className="nav-name">PLAYFUL</span>
        </a>
        <div className="nav-actions">
          <a href="/auth" className="nbtn signin">Sign in</a>
          <a href="/auth" className="nbtn signup">Try Free</a>
        </div>
      </nav>

      {/* Pinned cinematic hero — manages its own scroll */}
      <HeroCanvas />

      {/* Cards section — revealed after hero exits */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SnapCards />
      </div>
    </>
  )
}

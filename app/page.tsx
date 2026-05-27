
'use client'

import dynamic from 'next/dynamic'
import { TOTAL_SNAP, useSnapScroll } from '../hooks/useSnapScroll'

// ssr:false — GSAP and scene components touch window/document at import time.
// Static generation would SIGKILL the worker without this.
const SceneStage = dynamic(() => import('../components/SceneStage'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

const SECTION_LABELS = ['Palace', 'Retro', 'Racing', 'Open World', 'Space']

export default function Home() {
  const { section, palaceFrame } = useSnapScroll()
  const inCinematic = section < TOTAL_SNAP

  return (
    <>
      {/* Navbar */}
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

      {/* Cinematic scene stack — client-only */}
      {inCinematic && (
        <SceneStage section={section} palaceFrame={palaceFrame} />
      )}

      {/* Section progress dots */}
      {inCinematic && (
        <div className="section-dots" role="navigation" aria-label="Scene navigation">
          {SECTION_LABELS.map((label, i) => (
            <div
              key={i}
              className={`section-dot${section === i ? ' active' : ''}`}
              title={label}
              aria-label={label}
            />
          ))}
        </div>
      )}

      {/* Scroll hint arrows */}
      {inCinematic && (
        <div className="scroll-hint" aria-hidden="true">
          <div className="scroll-arrow-item" />
          <div className="scroll-arrow-item" />
          <div className="scroll-arrow-item" />
        </div>
      )}

      {/* Free-scroll cards — client-only */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: inCinematic ? '100vh' : 0,
          transition: 'margin-top 0.9s cubic-bezier(0.77, 0, 0.18, 1)',
        }}
      >
        <SnapCards />
      </div>
    </>
  )
}

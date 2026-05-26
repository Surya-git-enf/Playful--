'use client'

import { TOTAL_SNAP, useSnapScroll } from '@/hooks/useSnapScroll'
import SceneStage from '@/components/SceneStage'
import SnapCards from '@/components/SnapCards'

const SECTION_LABELS = ['Palace', 'Retro', 'Racing', 'Open World', 'Space']

export default function Home() {
  const { section, palaceFrame } = useSnapScroll()
  const inCinematic = section < TOTAL_SNAP

  return (
    <>
      {/* ── Navbar (always visible) ── */}
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

      {/* ── Cinematic scene stack ── */}
      {inCinematic && (
        <SceneStage section={section} palaceFrame={palaceFrame} />
      )}

      {/* ── Section progress dots (hidden after release) ── */}
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

      {/* ── Scroll hint arrows ── */}
      {inCinematic && (
        <div className="scroll-hint" aria-hidden="true">
          <div className="scroll-arrow-item" />
          <div className="scroll-arrow-item" />
          <div className="scroll-arrow-item" />
        </div>
      )}

      {/* ── Free-scroll cards section ── */}
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


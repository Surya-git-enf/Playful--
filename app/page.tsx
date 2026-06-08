'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })
const GlassFooter = dynamic(() => import('../components/GlassFooter'), { ssr: false })

export default function Home() {
  const [released, setReleased] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Lock scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
  }, [])

  const handleRelease = useCallback(() => {
    setReleased(true)
    document.body.style.overflow = 'auto'
    // Scroll to bottom content smoothly
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }, [])

  // Re-lock and remount hero when user scrolls back to very top
  useEffect(() => {
    if (!released) return

    const onScroll = () => {
      if (window.scrollY === 0) {
        document.body.style.overflow = 'hidden'
        setReleased(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [released])

  return (
    <>
      {/* ── Fixed hero — unmounts after release, remounts at top ── */}
      {!released && <HeroCanvas onRelease={handleRelease} />}

      {/* Spacer that fills exactly one viewport so bottom content starts below */}
      <div style={{ height: '100vh', pointerEvents: 'none' }} aria-hidden="true" />

      {/* ── Bottom content ── */}
      <main
        ref={bottomRef}
        style={{
          background: '#020202',
          color: '#fff',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Lego of Logic */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(60px,10vh,120px) clamp(20px,5vw,80px)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), "Instrument Serif", serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(3.5rem,8vw,7.5rem)',
            color: '#fff', textAlign: 'center',
            lineHeight: 1, margin: '0 0 clamp(24px,4vw,48px)',
          }}>
            Lego of Logic
          </h2>
          <video
            src="/lego.mp4"
            autoPlay muted loop playsInline
            style={{
              width: '100%', maxWidth: '900px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            }}
          />
        </section>

        {/* Big Bang */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(60px,10vh,120px) clamp(20px,5vw,80px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), "Instrument Serif", serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(3.5rem,8vw,7.5rem)',
            color: '#fff', textAlign: 'center',
            lineHeight: 1, margin: '0 0 clamp(24px,4vw,48px)',
          }}>
            Big Bang
          </h2>
          <video
            src="/bang.mp4"
            autoPlay muted loop playsInline
            style={{
              width: '100%', maxWidth: '900px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            }}
          />
        </section>

        {/* Snap Cards */}
        <section style={{
          minHeight: '100vh',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <SnapCards isActive={true} />
        </section>

        {/* Footer */}
        <GlassFooter />
      </main>
    </>
  )
}

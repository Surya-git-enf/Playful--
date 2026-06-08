'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })

export default function Home() {
  const [released, setReleased] = useState(false)

  const handleRelease = useCallback(() => {
    setReleased(true)
    document.body.style.overflow = 'auto'
    // Small delay so the state update renders before scroll
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }, 80)
  }, [])

  // Lock scroll on mount until hero releases
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  return (
    <>
      {/* Fixed hero — sits on top until released */}
      {!released && <HeroCanvas onRelease={handleRelease} />}

      {/* Spacer — pushes bottom content below the fold */}
      <div style={{ height: '100vh' }} aria-hidden="true" />

      {/* ── Bottom content — scrolls naturally after release ── */}
      <main style={{ background: '#020202', color: '#fff', position: 'relative', zIndex: 10 }}>

        {/* Lego of Logic section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), "Instrument Serif", serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
            color: '#fff', textAlign: 'center',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
            lineHeight: 1, margin: '0 0 40px',
          }}>
            Lego of Logic
          </h2>
          <video
            src="/lego.mp4"
            autoPlay muted loop playsInline
            style={{
              width: '100%', maxWidth: '900px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
          />
        </section>

        {/* Big Bang section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif), "Instrument Serif", serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
            color: '#fff', textAlign: 'center',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
            lineHeight: 1, margin: '0 0 40px',
          }}>
            Big Bang
          </h2>
          <video
            src="/bang.mp4"
            autoPlay muted loop playsInline
            style={{
              width: '100%', maxWidth: '900px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
          />
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '60px 5% 40px',
          display: 'flex', flexWrap: 'wrap' as const,
          justifyContent: 'space-between', alignItems: 'flex-start',
          gap: '40px',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-orbitron), Orbitron, sans-serif',
              fontWeight: 900, fontSize: '1.1rem',
              letterSpacing: '.2em', color: '#fff', marginBottom: '10px',
            }}>PLAYFUL</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '.8rem', maxWidth: '280px', lineHeight: 1.6 }}>
              Turn your words into worlds. No code required.
            </p>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '.75rem', alignSelf: 'flex-end' }}>
            © 2026 Playful. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  )
}


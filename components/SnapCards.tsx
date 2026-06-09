'use client'

import { useEffect, useRef } from 'react'

const CARDS = [
  { title: 'Lego of Logic', src: '/cards/lego.mp4', loading: 'Generating Assets...' },
  { title: 'Big Bang', src: '/cards/bang.mp4', loading: 'Simulating Physics...' },
  { title: 'Instant Arena', src: '/cards/play.mp4', loading: 'Loading Environment...' },
]

const ARC_CARDS = [
  { n: 'Space Shooter', d: 'Plasma combat, alien waves, bosses', e: '🚀' },
  { n: 'Fantasy RPG', d: 'Procedural quests, open worlds', e: '⚔️' },
  { n: 'Puzzle Worlds', d: 'Physics-based spatial challenges', e: '🧩' },
  { n: 'Neon Racing', d: 'High-speed multiplayer circuits', e: '🏎️' },
  { n: 'City Builder', d: 'Economies and population systems', e: '🏙️' },
  { n: 'Tower Defense', d: 'Waves of enemies, place defenses', e: '🗼' },
  { n: 'Platformer', d: 'Tight mechanics, pixel-perfect', e: '🎮' },
]

interface Props { isActive: boolean }

export default function SnapCards({ isActive }: Props) {
  return (
    <div style={{ background: '#020202', minHeight: '100vh', paddingBottom: '100px' }}>
      {CARDS.map((c, i) => <VideoSection key={i} card={c} />)}
      <ArcSection />
    </div>
  )
}

// ── Single Video Section ──────────────────────────────────────────
function VideoSection({ card }: { card: typeof CARDS[number] }) {
  const secRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const tileRef = useRef<HTMLDivElement>(null)
  const vidRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return

        if (headRef.current) {
          headRef.current.style.opacity = '1'
          headRef.current.style.transform = 'translateY(0)'
        }
        if (tileRef.current) {
          tileRef.current.style.opacity = '1'
          tileRef.current.style.transform = 'scale(1) translateY(0)'
          tileRef.current.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.05)'
        }
        if (vidRef.current) {
          vidRef.current.play().catch(() => {})
          vidRef.current.style.opacity = '1'
          vidRef.current.style.filter = 'blur(0)'
        }

        observer.unobserve(en.target)
      })
    }, { threshold: 0.3 })

    if (secRef.current) observer.observe(secRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={secRef} style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 ref={headRef} style={{
          fontFamily: "'Cinzel', 'Times New Roman', serif",
          fontSize: 'clamp(3rem, 8vw, 6.5rem)',
          lineHeight: 1, color: '#FFF', margin: 0,
          opacity: 0, transform: 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {card.title}
        </h2>
      </div>

      <div ref={tileRef} style={{
        width: '100%', maxWidth: '900px', aspectRatio: '16/9',
        position: 'relative', borderRadius: '16px',
        background: 'rgba(10,11,14,0.6)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        opacity: 0, transform: 'scale(0.95) translateY(40px)',
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        willChange: 'transform, opacity'
      }}>
        <video
          ref={vidRef} src={card.src} loop muted playsInline
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0, filter: 'blur(10px)',
            transition: 'opacity 1.5s ease, filter 1.5s ease'
          }}
        />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)', borderRadius: '16px'
        }} />
      </div>
    </section>
  )
}

// ── Arc Carousel ─────────────────────────────────────────────────
function ArcSection() {
  const secRef = useRef<HTMLElement>(null)
  const centerRef = useRef(0)

  useEffect(() => {
    const update = () => {
      const cards = secRef.current?.querySelectorAll<HTMLDivElement>('.arc-card')
      if (!cards) return
      const total = ARC_CARDS.length
      const center = centerRef.current
      const xStep = window.innerWidth < 600 ? 120 : 180

      cards.forEach((card, i) => {
        let diff = (i - center) % total
        if (diff > Math.floor(total / 2)) diff -= total
        if (diff < -Math.floor(total / 2)) diff += total

        const abs = Math.abs(diff)

        if (abs > 2) {
          card.style.opacity = '0'
          card.style.pointerEvents = 'none'
          return
        }

        card.style.transform = `translate(calc(-50% + ${diff * xStep}px), calc(-50% + ${abs * 30}px)) scale(${1 - abs * 0.15}) rotate(${diff * 6}deg)`
        card.style.zIndex = String(10 - abs)
        card.style.opacity = String(1 - abs * 0.4)
        card.style.pointerEvents = abs === 0 ? 'auto' : 'none'
        card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      })
    }

    update()
    const iv = setInterval(() => {
      centerRef.current = (centerRef.current + 1) % ARC_CARDS.length
      update()
    }, 3000)

    return () => clearInterval(iv)
  }, [])

  return (
    <section ref={secRef} style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginBottom: '80px'
      }}>
        <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))' }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
          letterSpacing: '0.3em', fontWeight: 500
        }}>
          Select Your Universe
        </span>
        <div style={{ width: 60, height: 1, background: 'linear-gradient(-90deg, transparent, rgba(255,255,255,0.3))' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        {ARC_CARDS.map((c, i) => (
          <div key={i} className="arc-card" style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 'clamp(240px, 45vw, 320px)', aspectRatio: '3/4',
            borderRadius: '20px',
            background: 'rgba(15,16,20,0.6)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '30px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            transformOrigin: 'center bottom',
            willChange: 'transform, opacity'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '40px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <span style={{ fontSize: '2.5rem' }}>{c.e}</span>
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: '1.25rem',
              fontWeight: 600, color: '#FFF', marginBottom: '12px'
            }}>{c.n}</div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.6
            }}>{c.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

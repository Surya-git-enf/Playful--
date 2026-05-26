'use client'

import { useEffect, useRef } from 'react'
import GlassFooter from './GlassFooter'

const CARDS = [
  {
    title: 'Lego of Logic',
    src: '/lego.mp4',
    accentColor: '#a855f7',
    loadingText: 'Generating Assets...',
    emoji: '🧩',
  },
  {
    title: 'Big Bang',
    src: '/bang.mp4',
    accentColor: '#00eaff',
    loadingText: 'Simulating Physics...',
    emoji: '💥',
  },
  {
    title: 'Instant Arena',
    src: '/play.mp4',
    accentColor: '#ff4b91',
    loadingText: 'Loading Environment...',
    emoji: '🏟️',
  },
]

const ARC_CARDS = [
  { n: 'Space Shooter', d: 'Plasma combat, alien waves, bosses', e: '🚀', color: 'rgba(168,85,247,0.15)' },
  { n: 'Fantasy RPG',   d: 'Procedural quests, open worlds',    e: '⚔️', color: 'rgba(0,234,255,0.15)' },
  { n: 'Puzzle Worlds', d: 'Physics-based spatial challenges',  e: '🧩', color: 'rgba(255,75,145,0.15)' },
  { n: 'Neon Racing',   d: 'High-speed multiplayer circuits',   e: '🏎️', color: 'rgba(255,122,0,0.15)' },
  { n: 'City Builder',  d: 'Economies and population systems',  e: '🏙️', color: 'rgba(0,180,255,0.15)' },
  { n: 'Tower Defense', d: 'Waves of enemies, place defenses',  e: '🗼', color: 'rgba(255,75,145,0.15)' },
  { n: 'Platformer',    d: 'Tight mechanics, pixel-perfect',    e: '🎮', color: 'rgba(0,234,255,0.15)' },
]

export default function SnapCards() {
  return (
    <div className="cards-root">
      {CARDS.map((card, i) => (
        <VideoSection key={i} card={card} index={i} />
      ))}

      {/* Arc carousel */}
      <ArcCarousel />

      <GlassFooter />
    </div>
  )
}

// ── Video section ──────────────────────────────────────────

function VideoSection({ card, index }: { card: typeof CARDS[number]; index: number }) {
  const sectionRef  = useRef<HTMLElement>(null)
  const headingRef  = useRef<HTMLHeadingElement>(null)
  const tileRef     = useRef<HTMLDivElement>(null)
  const loaderRef   = useRef<HTMLDivElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const observed    = useRef(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(en => {
          if (en.isIntersecting && !observed.current) {
            observed.current = true
            // Heading rise
            headingRef.current?.classList.add('rise')
            // Tile 3D pop
            tileRef.current?.classList.add('pop')

            // Video shimmer → loaded
            const vid = videoRef.current
            const tile = tileRef.current
            if (!vid || !tile) return

            const reveal = () => tile.classList.add('loaded')
            vid.addEventListener('loadeddata', reveal, { once: true })
            if ((vid as HTMLVideoElement).readyState >= 2) reveal()
            setTimeout(reveal, 1500)

            vid.play().catch(() => {})
          }
        })
      },
      { threshold: 0.35 }
    )

    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="vsec">
      <div className="sec-head-band">
        <h2 ref={headingRef} className="sec-heading">{card.title}</h2>
      </div>

      <div ref={tileRef} className="tile-wrapper">
        {/* Shimmer loader */}
        <div ref={loaderRef} className="shimmer-loader">
          <div className="spin-ring" style={{ borderTopColor: card.accentColor }} />
          <div className="loading-text" style={{ color: card.accentColor }}>
            {card.loadingText}
          </div>
        </div>

        {/* Video — gracefully falls back to emoji if missing */}
        <video
          ref={videoRef}
          src={card.src}
          className="tile-video"
          autoPlay muted loop playsInline
          onError={() => tileRef.current?.classList.add('loaded')}
        />

        {/* Fallback placeholder */}
        <noscript>
          <div className="tile-placeholder">
            <div className="tile-placeholder-emoji">{card.emoji}</div>
            <div className="tile-placeholder-label">{card.title}</div>
          </div>
        </noscript>
      </div>
    </section>
  )
}

// ── Arc carousel ───────────────────────────────────────────

function ArcCarousel() {
  const sectionRef = useRef<HTMLElement>(null)
  const centerRef  = useRef(0)

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLDivElement>('.arc-card')
    if (!cards) return

    const total = ARC_CARDS.length

    const update = () => {
      const center = centerRef.current
      const xStep = window.innerWidth < 600 ? 100 : 160

      // Update bg
      if (sectionRef.current) {
        sectionRef.current.style.background =
          `radial-gradient(circle at top, ${ARC_CARDS[center].color} 0%, #020510 70%)`
      }

      cards.forEach((card, i) => {
        let diff = (i - center) % total
        if (diff > Math.floor(total / 2)) diff -= total
        if (diff < -Math.floor(total / 2)) diff += total
        const abs = Math.abs(diff)

        const xOff = diff * xStep
        const yOff = abs * 25
        const scale = 1 - abs * 0.15
        const rot = diff * 8
        let opacity = 1 - abs * 0.3
        if (abs > 2) opacity = 0

        card.style.transform = `translate(calc(-50% + ${xOff}px), calc(-50% + ${yOff}px)) scale(${scale}) rotate(${rot}deg)`
        card.style.zIndex = String(10 - abs)
        card.style.opacity = String(opacity)
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
      })
    }

    update()
    const iv = setInterval(() => {
      centerRef.current = (centerRef.current + 1) % total
      update()
    }, 2500)

    return () => clearInterval(iv)
  }, [])

  return (
    <section ref={sectionRef} style={{
      padding: 'clamp(80px, 12vh, 120px) 0',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      transition: 'background 1s ease-in-out',
      scrollSnapAlign: 'start',
    }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 60 }}>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.16)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: 'rgba(0,200,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700,
        }}>
          Select Your Universe
        </span>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.16)' }} />
      </div>

      {/* Stage */}
      <div style={{ position: 'relative', width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ARC_CARDS.map((c, i) => (
          <div key={i} className="arc-card" style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 'clamp(220px, 45vw, 300px)',
            aspectRatio: '4/5',
            borderRadius: 16,
            background: 'rgba(2,5,16,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: 20,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transformOrigin: 'center bottom',
          }}>
            <div style={{ fontSize: '3.8rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))', marginBottom: 20 }}>
              {c.e}
            </div>
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: '1.05rem',
              fontWeight: 700, marginBottom: 8, color: '#fff',
            }}>{c.n}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              {c.d}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
        }


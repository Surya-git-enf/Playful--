'use client'

import { useEffect, useRef } from 'react'

const CARDS = [
  { title: 'Lego of Logic',  src: '/cards/lego.mp4',  accent: '#a855f7', label: 'Generating Assets...' },
  { title: 'Big Bang',       src: '/cards/bang.mp4',  accent: '#00eaff', label: 'Simulating Physics...' },
  { title: 'Instant Arena',  src: '/cards/play.mp4',  accent: '#ff4b91', label: 'Loading Environment...' },
]

const ARC_CARDS = [
  { n: 'Space Shooter', d: 'Plasma combat, alien waves, bosses', e: '🚀', color: 'rgba(168,85,247,0.15)' },
  { n: 'Fantasy RPG',   d: 'Procedural quests, open worlds',     e: '⚔️', color: 'rgba(0,234,255,0.15)' },
  { n: 'Puzzle Worlds', d: 'Physics-based spatial challenges',   e: '🧩', color: 'rgba(255,75,145,0.15)' },
  { n: 'Neon Racing',   d: 'High-speed multiplayer circuits',    e: '🏎️', color: 'rgba(255,122,0,0.15)' },
  { n: 'City Builder',  d: 'Economies and population systems',   e: '🏙️', color: 'rgba(0,180,255,0.15)' },
  { n: 'Tower Defense', d: 'Waves of enemies, place defenses',   e: '🗼', color: 'rgba(255,75,145,0.15)' },
  { n: 'Platformer',    d: 'Tight mechanics, pixel-perfect',     e: '🎮', color: 'rgba(0,234,255,0.15)' },
]

interface Props { isActive: boolean }

const snapSection: React.CSSProperties = {
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
  minHeight: '100vh',
  flexShrink: 0,
}

export default function SnapCards({ isActive }: Props) {
  return (
    <>
      <style>{`
        @keyframes shimmerLoad { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes spinR { to{transform:rotate(360deg)} }
        .sc-heading { opacity:0; transform:translateY(-30px); transition:all 1s ease; }
        .sc-heading.rise { opacity:1; transform:translateY(0); }
        .sc-tile {
          transform-origin:bottom center;
          transform:perspective(1200px) rotateX(45deg) translateY(150px) scale(0.85);
          opacity:0;
          transition:transform 1.2s cubic-bezier(0.2,0.8,0.2,1),opacity 1s ease;
        }
        .sc-tile.pop {
          transform:perspective(1200px) rotateX(0deg) translateY(0) scale(1);
          opacity:1;
          box-shadow:0 20px 50px rgba(0,0,0,.8),0 0 60px rgba(168,85,247,.2);
        }
        @media (min-width: 1024px) {
          .sc-tile {
            width: 50% !important;
            max-width: 900px !important;
            aspect-ratio: 16/10 !important;
            height: auto !important;
          }
        }
        .arc-card { transition:all 0.6s cubic-bezier(0.25,1,0.5,1); }
        .soc-link:hover { background:rgba(0,234,255,.1)!important; border-color:#00eaff!important; transform:translateY(-3px); }
        .soc-link:hover svg { fill:#fff!important; }
        .foot-link:hover { color:#00eaff!important; }
      `}</style>

      <div style={{ background: '#020510', color: '#fff', fontFamily: 'var(--font-mono,Space Mono,monospace)' }}>

        {CARDS.map((c, i) => <VideoSection key={i} card={c} />)}

        <ArcAndFooterSection />

      </div>
    </>
  )
}

function VideoSection({ card }: { card: typeof CARDS[number] }) {
  const secRef    = useRef<HTMLElement>(null)
  const headRef   = useRef<HTMLHeadingElement>(null)
  const tileRef   = useRef<HTMLDivElement>(null)
  const vidRef    = useRef<HTMLVideoElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return
        headRef.current?.classList.add('rise')
        tileRef.current?.classList.add('pop')
        vidRef.current?.play().catch(() => {})
        io.unobserve(en.target)
      })
    }, { threshold: 0.25 })
    if (secRef.current) io.observe(secRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const vid = vidRef.current
    const loader = loaderRef.current
    if (!vid || !loader) return
    let ready = false, timerDone = false
    const tryReveal = () => {
      if (!ready || !timerDone) return
      loader.style.opacity = '0'
      loader.style.pointerEvents = 'none'
      vid.style.opacity = '1'
      vid.style.filter = 'blur(0)'
      vid.style.transform = 'scale(1)'
    }
    vid.addEventListener('loadeddata', () => { ready = true; tryReveal() })
    if (vid.readyState >= 2) ready = true
    setTimeout(() => { timerDone = true; tryReveal(); if (!ready) { loader.style.opacity = '0' } }, 1500)
  }, [])

  return (
    <section ref={secRef} style={{
      ...snapSection,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 ref={headRef} className="sc-heading" style={{
          fontFamily: 'var(--font-serif,Instrument Serif,serif)',
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(3.5rem,8vw,7.5rem)',
          lineHeight: 1, color: '#fff',
          textShadow: '0 10px 30px rgba(0,0,0,0.8)', margin: 0,
        }}>{card.title}</h2>
      </div>

      <div ref={tileRef} className="sc-tile" style={{
        width: '100%', maxWidth: '1000px', aspectRatio: '7/10' as any,
        position: 'relative', borderRadius: '20px',
        background: 'rgba(2,5,16,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8),0 0 40px rgba(0,234,255,0.4)',
      }}>
        <div ref={loaderRef} style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'linear-gradient(90deg,rgba(2,5,16,1) 0%,rgba(15,35,70,1) 50%,rgba(2,5,16,1) 100%)',
          backgroundSize: '200% 100%', animation: 'shimmerLoad 2s infinite linear',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.8s ease',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid rgba(0,234,255,0.1)', borderTopColor: card.accent,
            animation: 'spinR 1s linear infinite', marginBottom: 12,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono,Space Mono,monospace)', fontSize: '0.65rem',
            color: card.accent, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            animation: 'blink 1.2s step-end infinite',
          }}>{card.label}</span>
        </div>

        <video ref={vidRef} src={card.src} loop muted playsInline style={{
          width: '100%', height: '100%', objectFit: 'cover', zIndex: 2,
          opacity: 0, filter: 'blur(10px)', transform: 'scale(1.05)',
          transition: 'opacity 1s ease, filter 1s ease, transform 1s ease',
        }} />
      </div>
    </section>
  )
}

/* ── Arc Carousel + Footer (combined single snap section) ── */
function ArcAndFooterSection() {
  const stageRef   = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const centerRef  = useRef(0)

  useEffect(() => {
    const update = () => {
      const cards = stageRef.current?.querySelectorAll<HTMLDivElement>('.arc-card')
      if (!cards) return
      const total = ARC_CARDS.length
      const c = centerRef.current
      const xStep = window.innerWidth < 600 ? 100 : 160
      if (sectionRef.current) {
        sectionRef.current.style.background =
          `radial-gradient(circle at top,${ARC_CARDS[c].color} 0%,#020510 70%)`
      }
      cards.forEach((card, i) => {
        let diff = (i - c) % total
        if (diff > Math.floor(total / 2)) diff -= total
        if (diff < -Math.floor(total / 2)) diff += total
        const abs = Math.abs(diff)
        if (abs > 2) { card.style.opacity = '0'; return }
        card.style.transform = `translate(calc(-50% + ${diff * xStep}px),calc(-50% + ${abs * 25}px)) scale(${1 - abs * 0.15}) rotate(${diff * 8}deg)`
        card.style.zIndex    = String(10 - abs)
        card.style.opacity   = String(1 - abs * 0.3)
      })
    }
    update()
    const iv = setInterval(() => { centerRef.current = (centerRef.current + 1) % ARC_CARDS.length; update() }, 2500)
    return () => clearInterval(iv)
  }, [])

  return (
    <section ref={sectionRef} style={{
      ...snapSection,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
      padding: 'clamp(60px,10vh,100px) 0 0',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      transition: 'background 1s ease-in-out',
    }}>
      {/* ── Arc carousel ── */}
      <div>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,.16)' }} />
          <span style={{ fontSize: '.7rem', color: 'rgba(0,200,255,.8)', textTransform: 'uppercase' as const, letterSpacing: '.3em', fontWeight: 700 }}>
            Select Your Universe
          </span>
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,.16)' }} />
        </div>

        <div ref={stageRef} style={{ position: 'relative', width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {ARC_CARDS.map((c, i) => (
            <div key={i} className="arc-card" style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 'clamp(220px,45vw,300px)', aspectRatio: '4/5' as any,
              borderRadius: 16, background: 'rgba(2,5,16,0.6)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center' as const, padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}>
              <div style={{ width: '75%', aspectRatio: '1' as any, borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(255,255,255,0.05),transparent)' }}>
                <span style={{ fontSize: '3.8rem' }}>{c.e}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{c.n}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer (now directly below the carousel, same section) ── */}
      <FooterContent />
    </section>
  )
}

/* ── Footer content (no longer its own snap section) ── */
const SOCIALS = [
  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { label: 'Facebook',  path: 'M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z' },
  { label: 'Discord',   path: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
]

function FooterContent() {
  return (
    <footer style={{
      background: '#040814',
      marginTop: 'auto',
      padding: '60px 5% 40px',
      borderTop: '1px solid rgba(255,255,255,.05)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        display: 'flex', flexWrap: 'wrap' as const,
        justifyContent: 'space-between', gap: 40,
        borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 40,
      }}>
        {/* Brand */}
        <div style={{ maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src="/logo.png" alt="Playful" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' as const }} />
            <span style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '.2em' }}>PLAYFUL</span>
          </div>
          <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 24 }}>
            Turn your words into worlds. Type a prompt, get a playable game in seconds. No code required. Built for creators.
          </p>
          <h4 style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', color: '#fff', fontSize: '.9rem', marginBottom: 12, letterSpacing: '.05em', textTransform: 'uppercase' as const }}>
            Join our society
          </h4>
          <div style={{ display: 'flex', gap: 16 }}>
            {SOCIALS.map(({ label, path }) => (
              <a key={label} href="#" className="soc-link" aria-label={label} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>
                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'rgba(255,255,255,0.6)' }}>
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' as const }}>
          {[
            { h: 'PLATFORM', links: ['About Us', 'Game Showcase'] },
            { h: 'SUPPORT',  links: ['Contact Us', 'Documentation'] },
          ].map(({ h, links }) => (
            <div key={h} style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <h4 style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', color: '#fff', fontSize: '.9rem', marginBottom: 8, letterSpacing: '.05em' }}>{h}</h4>
              {links.map(l => (
                <a key={l} href="#" className="foot-link" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '.85rem', transition: 'color 0.2s' }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '30px auto 0', width: '100%', textAlign: 'center' as const, fontSize: '.75rem', color: 'rgba(255,255,255,0.3)' }}>
        © 2026 Playful. All rights reserved.
      </div>
    </footer>
                
  )
}

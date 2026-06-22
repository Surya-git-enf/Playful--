'use client'

import { useEffect, useRef } from 'react'

const CARDS = [
  { title: 'Lego of Logic',  src: '/cards/lego.mp4',  accent: '#ff7a18', label: 'Generating Assets...' },
  { title: 'Big Bang',       src: '/cards/bang.mp4',  accent: '#ff8f3d', label: 'Simulating Physics...' },
  { title: 'Instant Arena',  src: '/cards/play.mp4',  accent: '#ff5500', label: 'Loading Environment...' },
]

const ARC_CARDS = [
  { n: 'Space Shooter', d: 'Plasma combat, alien waves, bosses', e: '\u{1F680}', color: 'rgba(168,85,247,0.15)' },
  { n: 'Fantasy RPG',   d: 'Procedural quests, open worlds',     e: '\u2694\uFE0F', color: 'rgba(0,234,255,0.15)' },
  { n: 'Puzzle Worlds', d: 'Physics-based spatial challenges',   e: '\u{1F9E9}', color: 'rgba(255,75,145,0.15)' },
  { n: 'Neon Racing',   d: 'High-speed multiplayer circuits',    e: '\u{1F3CE}\uFE0F', color: 'rgba(255,122,0,0.15)' },
  { n: 'City Builder',  d: 'Economies and population systems',   e: '\u{1F3D9}\uFE0F', color: 'rgba(0,180,255,0.15)' },
  { n: 'Tower Defense', d: 'Waves of enemies, place defenses',   e: '\u{1F5FC}', color: 'rgba(255,75,145,0.15)' },
  { n: 'Platformer',    d: 'Tight mechanics, pixel-perfect',     e: '\u{1F3AE}', color: 'rgba(0,234,255,0.15)' },
]

interface Props { isActive: boolean }

const snapSection: React.CSSProperties = {
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
  height: '100dvh',
  minHeight: '100dvh',
  flexShrink: 0,
  overflow: 'hidden',
}

export default function SnapCards({ isActive }: Props) {
  return (
    <>
      <style>{`
        @keyframes shimmerLoad { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes spinR { to{transform:rotate(360deg)} }
        .sc-heading { opacity:0; transform:translateY(-30px); transition:all 0.45s cubic-bezier(.22,1,.36,1); }
        .sc-heading.rise { opacity:1; transform:translateY(0); }
        .sc-tile {
          transform-origin:bottom center;
          transform:perspective(1200px) rotateX(45deg) translateY(150px) scale(0.85);
          opacity:0;
          transition:transform 1.2s cubic-bezier(0.2,0.8,0.2,1),opacity 1s cubic-bezier(.22,1,.36,1);
        }
        .sc-tile.pop {
          transform:perspective(1200px) rotateX(0deg) translateY(0) scale(1);
          opacity:1;
          box-shadow:0 20px 50px rgba(0,0,0,.8),0 0 60px rgba(255,122,0,.2);
        }
        @media (min-width: 1024px) {
          .sc-tile {
            width: 50% !important;
            max-width: 900px !important;
            aspect-ratio: 16/10 !important;
            height: auto !important;
          }
        }
        .arc-card { transition: all 0.45s cubic-bezier(.22,1,.36,1); }
        .soc-link:hover { background:rgba(255,122,24,.1)!important; border-color:var(--orange)!important; transform:translateY(-3px); box-shadow:0 8px 20px rgba(255,122,24,.15); }
        .soc-link:hover svg { fill:#fff!important; }
        .foot-link:hover { color:var(--orange)!important; }
      `}</style>

      <div style={{ background: 'var(--bg)', color: '#fff', fontFamily: 'var(--font-mono)' }}>
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
      padding: 'clamp(60px, 8vh, 100px) clamp(16px, 3vw, 20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 ref={headRef} className="sc-heading" style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(3.5rem,8vw,7.5rem)',
          lineHeight: 1, color: '#fff',
          textShadow: '0 10px 30px rgba(0,0,0,0.8)', margin: 0,
        }}>{card.title}</h2>
      </div>

      <div ref={tileRef} className="sc-tile" style={{
        width: '100%', maxWidth: '1000px', aspectRatio: '7/10' as any,
        position: 'relative', borderRadius: '20px',
        background: 'var(--surface)',
        border: '1px solid rgba(255,122,0,0.2)',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8),0 0 40px rgba(255,122,0,0.15)',
      }}>
        <div ref={loaderRef} style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'linear-gradient(90deg,var(--surface-2) 0%,rgba(40,18,5,1) 50%,var(--surface-2) 100%)',
          backgroundSize: '200% 100%', animation: 'shimmerLoad 2s infinite linear',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.8s cubic-bezier(.22,1,.36,1)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid rgba(255,122,0,0.1)', borderTopColor: card.accent,
            animation: 'spinR 1s linear infinite', marginBottom: 12,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: card.accent, letterSpacing: '0.2em', textTransform: 'uppercase',
            animation: 'blink 1.2s step-end infinite',
          }}>{card.label}</span>
        </div>

        <video ref={vidRef} src={card.src} loop muted playsInline style={{
          width: '100%', height: '100%', objectFit: 'cover', zIndex: 2,
          opacity: 0, filter: 'blur(10px)', transform: 'scale(1.05)',
          transition: 'opacity 1s cubic-bezier(.22,1,.36,1), filter 1s cubic-bezier(.22,1,.36,1), transform 1s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
    </section>
  )
}

/* Arc Carousel + Footer */
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
      const xStep = window.innerWidth < 375 ? 60 : window.innerWidth < 600 ? 90 : window.innerWidth < 1024 ? 120 : 150
      if (sectionRef.current) {
        sectionRef.current.style.background =
          `radial-gradient(circle at top,${ARC_CARDS[c].color} 0%,var(--bg) 60%)`
      }
      cards.forEach((card, i) => {
        let diff = (i - c) % total
        if (diff > Math.floor(total / 2)) diff -= total
        if (diff < -Math.floor(total / 2)) diff += total
        const abs = Math.abs(diff)
        const maxVisible = window.innerWidth < 600 ? 1 : 2
        if (abs > maxVisible) { card.style.opacity = '0'; return }
        card.style.transform = `translate(calc(-50% + ${diff * xStep}px),calc(-50% + ${abs * 20}px)) scale(${1 - abs * 0.15}) rotate(${diff * 8}deg)`
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
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderTop: '1px solid var(--border)',
      transition: 'background 1s cubic-bezier(.22,1,.36,1)',
    }}>

      {/* Carousel block */}
      <div style={{ flex: '0 0 auto', paddingTop: 'clamp(20px,4vh,50px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 'clamp(16px,3vh,40px)' }}>
          <div style={{ width: 40, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '.65rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.3em', fontWeight: 700 }}>
            Select Your Universe
          </span>
          <div style={{ width: 40, height: 1, background: 'var(--border)' }} />
        </div>

        <div ref={stageRef} style={{ position: 'relative', width: '100%', height: 'clamp(200px,30vh,280px)' }}>
          {ARC_CARDS.map((c, i) => (
            <div key={i} className="arc-card" style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 'clamp(160px,30vw,230px)', aspectRatio: '4/5' as any,
              borderRadius: 14, background: 'rgba(17,24,39,0.6)',
              backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center' as const, padding: 14,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}>
              <div style={{ width: '65%', aspectRatio: '1' as any, borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(255,255,255,0.05),transparent)' }}>
                <span style={{ fontSize: '2.8rem' }}>{c.e}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-orbitron)', fontSize: '.9rem', fontWeight: 700, marginBottom: 6 }}>{c.n}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      <FooterContent />
    </section>
  )
}

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/surya3ddev?igsh=bDIzODRjY2E0dG95', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { label: 'Discord',   href: 'https://discord.gg/E78ktCRT', path: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/surya-peddishetti-9113b829b', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
]

function FooterContent() {
  return (
    <footer style={{
      background: 'rgba(13,17,23,0.95)',
      padding: 'clamp(20px,3vh,36px) 5% clamp(16px,2.5vh,28px)',
      borderTop: '1px solid var(--border)',
      flex: '0 0 auto',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        display: 'flex', flexWrap: 'wrap' as const,
        justifyContent: 'space-between', alignItems: 'flex-start', gap: 'clamp(16px,2vw,32px)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'clamp(16px,2.5vh,28px)',
      }}>
        {/* Brand */}
        <div style={{ maxWidth: 340 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <img src="/logo.png" alt="Playful" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' as const }} />
            <span style={{ fontFamily: 'var(--font-orbitron)', fontWeight: 900, fontSize: '1rem', letterSpacing: '.2em' }}>PLAYFUL</span>
          </div>
          <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
            Turn your words into worlds. Type a prompt, get a playable game in seconds.
          </p>
          <h4 style={{ fontFamily: 'var(--font-orbitron)', color: '#fff', fontSize: '.75rem', marginBottom: 10, letterSpacing: '.05em', textTransform: 'uppercase' as const }}>
            Join our society
          </h4>
          <div style={{ display: 'flex', gap: 10 }}>
            {SOCIALS.map(({ label, href, path }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="soc-link" aria-label={label} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)', textDecoration: 'none',
                transition: 'all 0.45s cubic-bezier(.22,1,.36,1)',
              }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'rgba(255,255,255,0.6)' }}>
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 'clamp(24px,4vw,60px)', flexWrap: 'wrap' as const }}>
          {[
            { h: 'PLATFORM', links: ['About Us', 'Game Showcase'] },
            { h: 'SUPPORT',  links: ['Contact Us', 'Documentation'] },
          ].map(({ h, links }) => (
            <div key={h} style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              <h4 style={{ fontFamily: 'var(--font-orbitron)', color: '#fff', fontSize: '.78rem', marginBottom: 4, letterSpacing: '.05em' }}>{h}</h4>
              {links.map(l => (
                <a key={l} href="#" className="foot-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '.78rem', transition: 'color 0.45s cubic-bezier(.22,1,.36,1)' }}>{l}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div style={{ maxWidth: 1200, margin: 'clamp(12px,1.5vh,20px) auto 0', width: '100%', textAlign: 'center' as const, fontSize: '.78rem', color: 'var(--text-muted)' }}>
      </div>
    </footer>
  )
}

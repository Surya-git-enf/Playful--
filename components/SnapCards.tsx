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

export default function SnapCards({ isActive }: Props) {
  return (
    <>
      <style>{`
        @keyframes shimmerLoad { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes spinR { to{transform:rotate(360deg)} }
        .snap-page { width: 100%; background: #020510; color: #fff; font-family: var(--font-mono, Space Mono, monospace); }
        .snap-page section {
          width: 100%; height: 100vh; flex-shrink: 0;
          scroll-snap-align: start;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .snap-heading { opacity:0; transform:translateY(-30px); transition:all 1s ease; }
        .snap-heading.show { opacity:1; transform:translateY(0); }
        .snap-tile {
          transform-origin: bottom center;
          transform: perspective(1200px) rotateX(45deg) translateY(150px) scale(0.85);
          opacity: 0;
          transition: transform 1.2s cubic-bezier(0.2,0.8,0.2,1), opacity 1s ease;
        }
        .snap-tile.show {
          transform: perspective(1200px) rotateX(0deg) translateY(0) scale(1);
          opacity: 1;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,234,255,0.4);
        }
        .arc-card { transition: all 0.6s cubic-bezier(0.25,1,0.5,1); }
        @media (min-width: 1024px) {
          .snap-tile { width: 50% !important; max-width: 900px !important; aspect-ratio: 16/10 !important; height: auto !important; }
          .last-section { flex-direction: row !important; gap: 30px !important; padding: 20px 40px !important; }
          .last-section .carousel-wrap { width: 55% !important; height: 100% !important; }
          .last-section .footer-wrap { width: 40% !important; }
        }
      `}</style>

      <div className="snap-page">
        {CARDS.map((c, i) => <CardSection key={i} card={c} />)}
        <LastSection />
      </div>
    </>
  )
}

function CardSection({ card }: { card: typeof CARDS[number] }) {
  const ref = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const tileRef = useRef<HTMLDivElement>(null)
  const vidRef = useRef<HTMLVideoElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        headRef.current?.classList.add('show')
        tileRef.current?.classList.add('show')
        vidRef.current?.play().catch(() => {})
      }
    }, { threshold: 0.3 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const vid = vidRef.current, loader = loaderRef.current
    if (!vid || !loader) return
    let ready = false, timed = false
    const reveal = () => { if (ready && timed) { loader.style.opacity = '0'; vid.style.opacity = '1'; vid.style.filter = 'none'; vid.style.transform = 'scale(1)' } }
    vid.addEventListener('loadeddata', () => { ready = true; reveal() })
    if (vid.readyState >= 2) ready = true
    const t = setTimeout(() => { timed = true; reveal(); if (!ready) loader.style.opacity = '0' }, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <section ref={ref} style={{ padding: '50px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 ref={headRef} className="snap-heading" style={{
          fontFamily: 'var(--font-serif,Instrument Serif,serif)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(3rem,7vw,7rem)', lineHeight: 1, color: '#fff',
          textShadow: '0 10px 30px rgba(0,0,0,0.8)', margin: 0,
        }}>{card.title}</h2>
      </div>
      <div ref={tileRef} className="snap-tile" style={{
        width: '100%', maxWidth: '1000px', aspectRatio: '7/10',
        position: 'relative', borderRadius: 20, background: 'rgba(2,5,16,0.8)',
        border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,.8), 0 0 60px rgba(168,85,247,.2)',
      }}>
        <div ref={loaderRef} style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'linear-gradient(90deg,rgba(2,5,16,1) 0%,rgba(15,35,70,1) 50%,rgba(2,5,16,1) 100%)',
          backgroundSize: '200% 100%', animation: 'shimmerLoad 2s infinite linear',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.8s ease',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0,234,255,0.1)', borderTopColor: card.accent, animation: 'spinR 1s linear infinite', marginBottom: 12 }} />
          <span style={{ fontFamily: 'var(--font-mono,Space Mono,monospace)', fontSize: '0.65rem', color: card.accent, letterSpacing: '0.2em', textTransform: 'uppercase' as const, animation: 'blink 1.2s step-end infinite' }}>{card.label}</span>
        </div>
        <video ref={vidRef} src={card.src} loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, opacity: 0, filter: 'blur(10px)', transform: 'scale(1.05)', transition: 'opacity 1s ease, filter 1s ease, transform 1s ease' }} />
      </div>
    </section>
  )
}

function LastSection() {
  const stageRef = useRef<HTMLDivElement>(null)
  const secRef = useRef<HTMLElement>(null)
  const centerRef = useRef(0)

  useEffect(() => {
    const update = () => {
      const cards = stageRef.current?.querySelectorAll<HTMLDivElement>('.arc-card')
      if (!cards) return
      const total = ARC_CARDS.length, c = centerRef.current
      const xStep = window.innerWidth < 600 ? 80 : 130
      if (secRef.current) secRef.current.style.background = `radial-gradient(circle at top,${ARC_CARDS[c].color} 0%,#020510 70%)`
      cards.forEach((card, i) => {
        let diff = (i - c) % total
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total
        const abs = Math.abs(diff)
        if (abs > 2) { card.style.opacity = '0'; return }
        card.style.transform = `translate(calc(-50% + ${diff * xStep}px),calc(-50% + ${abs * 15}px)) scale(${1 - abs * 0.12}) rotate(${diff * 6}deg)`
        card.style.zIndex = String(10 - abs)
        card.style.opacity = String(1 - abs * 0.3)
      })
    }
    update()
    const iv = setInterval(() => { centerRef.current = (centerRef.current + 1) % ARC_CARDS.length; update() }, 2500)
    return () => clearInterval(iv)
  }, [])

  return (
    <section ref={secRef} className="last-section" style={{ justifyContent: 'flex-start', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,.16)' }} />
        <span style={{ fontSize: '.6rem', color: 'rgba(0,200,255,.8)', textTransform: 'uppercase' as const, letterSpacing: '.3em', fontWeight: 700 }}>Select Your Universe</span>
        <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,.16)' }} />
      </div>

      <div ref={stageRef} className="carousel-wrap" style={{ position: 'relative', width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {ARC_CARDS.map((c, i) => (
          <div key={i} className="arc-card" style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 'clamp(150px,28vw,220px)', aspectRatio: '4/5' as any,
            borderRadius: 14, background: 'rgba(2,5,16,0.6)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: 12,
            boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
          }}>
            <div style={{ width: '70%', aspectRatio: '1' as any, borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(255,255,255,0.05),transparent)' }}>
              <span style={{ fontSize: '2.2rem' }}>{c.e}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>{c.n}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>{c.d}</div>
          </div>
        ))}
      </div>

      <footer className="footer-wrap" style={{ width: '100%', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', gap: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img src="/logo.png" alt="Playful" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' as const }} />
              <span style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', fontWeight: 900, fontSize: '.85rem', letterSpacing: '.2em' }}>PLAYFUL</span>
            </div>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.4, marginBottom: 12 }}>Turn your words into worlds. Type a prompt, get a playable game.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Instagram', 'Discord'].map(l => (
                <a key={l} href="#" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                  <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,0.5)' }}>{l[0]}</span>
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' as const }}>
            {[{ h: 'PLATFORM', l: ['About', 'Showcase'] }, { h: 'SUPPORT', l: ['Contact', 'Docs'] }].map(({ h, l }) => (
              <div key={h} style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                <h4 style={{ fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)', color: '#fff', fontSize: '.7rem', letterSpacing: '.05em' }}>{h}</h4>
                {l.map(t => <a key={t} href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '.7rem' }}>{t}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '8px auto 0', width: '100%', textAlign: 'center' as const, fontSize: '.6rem', color: 'rgba(255,255,255,0.2)' }}>© 2026 Playful</div>
      </footer>
    </section>
  )
}

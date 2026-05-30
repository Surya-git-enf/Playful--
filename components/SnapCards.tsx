
'use client'

import { useEffect, useRef, useState } from 'react'
import GlassFooter from './GlassFooter'

// ── Video sections ────────────────────────────────────────────
const CARDS = [
  { title: 'Lego of Logic', src: '/cards/lego.mp4',  accent: '#a855f7', loading: 'Generating Assets...' },
  { title: 'Big Bang',      src: '/cards/bang.mp4',  accent: '#00eaff', loading: 'Simulating Physics...' },
  { title: 'Instant Arena', src: '/cards/play.mp4',  accent: '#ff4b91', loading: 'Loading Environment...' },
]

const ARC_CARDS = [
  { n:'Space Shooter',  d:'Plasma combat, alien waves, bosses',  e:'🚀', color:'rgba(168,85,247,0.15)' },
  { n:'Fantasy RPG',    d:'Procedural quests, open worlds',      e:'⚔️', color:'rgba(0,234,255,0.15)'  },
  { n:'Puzzle Worlds',  d:'Physics-based spatial challenges',    e:'🧩', color:'rgba(255,75,145,0.15)' },
  { n:'Neon Racing',    d:'High-speed multiplayer circuits',     e:'🏎️', color:'rgba(255,122,0,0.15)'  },
  { n:'City Builder',   d:'Economies and population systems',    e:'🏙️', color:'rgba(0,180,255,0.15)'  },
  { n:'Tower Defense',  d:'Waves of enemies, place defenses',    e:'🗼', color:'rgba(255,75,145,0.15)' },
  { n:'Platformer',     d:'Tight mechanics, pixel-perfect',      e:'🎮', color:'rgba(0,234,255,0.15)'  },
]

const PROMPTS = [
  'Describe the game you want to build...',
  'A cinematic space shooter with neon plasma trails...',
  'A 3D off-road mountain climbing challenge...',
  'A fast-paced futuristic racing arena...',
  'A physics-based puzzle world in cyan and magenta...',
]

export default function SnapCards() {
  return (
    <>
      {/* ── Hero section — exactly matching your HTML ── */}
      <HeroSection />

      {/* ── 3 video sections ── */}
      {CARDS.map((c, i) => <VideoSection key={i} card={c} />)}

      {/* ── Arc carousel ── */}
      <ArcSection />

      {/* ── Footer ── */}
      <GlassFooter />
    </>
  )
}

// ── Hero section (prompt UI) ────────────────────────────────────
function HeroSection() {
  const [value, setValue]   = useState('')
  const [phIdx, setPhIdx]   = useState(0)
  const taRef               = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const iv = setInterval(() => {
      if (value.trim()) return
      setPhIdx(i => (i + 1) % PROMPTS.length)
    }, 3500)
    return () => clearInterval(iv)
  }, [value])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  return (
    <section style={{
      position: 'relative', width: '100%', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'calc(70px + 20px) clamp(16px,4vw,24px) 60px',
      scrollSnapAlign: 'start',
    }}>
      {/* Logo */}
      <h1 style={{
        fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400,
        fontSize: 'clamp(3.5rem,12vw,9rem)', lineHeight: 1,
        marginBottom: 'clamp(5px,1vh,10px)', textAlign: 'center',
        animation: 'pulseLogo 4s infinite ease-in-out', color: '#00eaff',
      }}>
        PLAYFUL
      </h1>

      <p style={{
        fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
        fontSize: 'clamp(1.1rem,4vw,2.2rem)', color: 'rgba(200,220,255,0.6)',
        letterSpacing: '0.01em', marginBottom: 'clamp(16px,2.8vh,26px)',
        animation: 'blurFadeIn 0.8s ease 0.2s both',
      }}>
        Turn your words into worlds
      </p>

      {/* Prompt box — matching your HTML exactly */}
      <div style={{
        width: 'min(90vw,650px)', borderRadius: 16, padding: '1.5px',
        background: 'linear-gradient(135deg,#ff7a00,#ff4b91,#a855f7,#00eaff)',
        backgroundSize: '280%', animation: 'borderGrad 3s ease infinite',
        boxShadow: '0 0 30px rgba(168,85,247,0.3)', marginBottom: 20,
      }}>
        <div style={{
          borderRadius: 15, padding: 'clamp(12px,2vw,18px) clamp(16px,2.5vw,20px)',
          background: 'rgba(0,5,22,0.95)', backdropFilter: 'blur(32px)',
          display: 'flex', alignItems: 'flex-end', gap: 12, position: 'relative',
        }}>
          {/* Animated placeholder */}
          {!value && (
            <div style={{
              position: 'absolute',
              left: 'clamp(16px,2.5vw,20px)', right: 140,
              top: 'clamp(12px,2vw,18px)',
              pointerEvents: 'none', overflow: 'hidden',
            }}>
              <span key={phIdx} style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 'clamp(0.75rem,1.5vw,1rem)',
                color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
                display: 'block',
                animation: 'blurFadeIn 0.4s ease both',
              }}>
                {PROMPTS[phIdx]}
              </span>
            </div>
          )}
          <textarea
            ref={taRef}
            value={value}
            onChange={handleInput}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'Space Mono, monospace',
              fontSize: 'clamp(0.75rem,1.5vw,1rem)', color: '#fff',
              caretColor: '#00eaff', resize: 'none', overflowY: 'hidden',
              minHeight: 24, maxHeight: 150, lineHeight: 1.5, paddingTop: 2,
            }}
          />
          <button style={{
            flexShrink: 0, padding: '12px 24px', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
            fontSize: '0.85rem', color: '#fff',
            background: 'linear-gradient(135deg,#ff7a00,#ff4b91,#a855f7,#00eaff)',
            backgroundSize: '280%', animation: 'borderGrad 4s ease infinite',
            boxShadow: '0 4px 15px rgba(255,75,145,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            Build Now
          </button>
        </div>
      </div>

      {/* Caps — Build It, Play It, Publish It */}
      <div style={{ display: 'flex', gap: 'clamp(6px,1.5vw,10px)', justifyContent: 'center', flexWrap: 'wrap', animation: 'blurFadeIn 0.8s ease 0.44s both' }}>
        {[
          { label: '⚡ Build It',   bg: 'linear-gradient(135deg,#0ea5e9,#2563eb,#4f46e5)', shadow: 'rgba(14,165,233,0.38)' },
          { label: '🎮 Play It',    bg: 'linear-gradient(135deg,#10b981,#06b6d4,#0ea5e9)', shadow: 'rgba(16,185,129,0.38)' },
          { label: '🚀 Publish It', bg: 'linear-gradient(135deg,#f97316,#ec4899,#a855f7)', shadow: 'rgba(249,115,22,0.38)'  },
        ].map(cap => (
          <button key={cap.label} style={{
            padding: 'clamp(8px,1.5vw,11px) clamp(18px,3.5vw,34px)',
            borderRadius: 99, border: 'none', cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
            fontSize: 'clamp(0.6rem,1.5vw,0.78rem)', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#fff',
            background: cap.bg,
            boxShadow: `0 0 20px ${cap.shadow}`,
            transition: 'transform 0.3s, box-shadow 0.3s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >
            {cap.label}
          </button>
        ))}
      </div>

      {/* Neon yellow scroll arrows — exactly from your HTML */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 28, animation: 'blurFadeIn 0.8s ease 0.6s both' }} aria-hidden="true">
        {[0, 0.28, 0.56].map((delay, i) => (
          <div key={i} style={{
            width: 28, height: 16, position: 'relative',
            animation: `arrowGlow 1.4s ease-in-out infinite ${delay}s`,
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: 0,
              width: 14, height: 2.5, background: '#ffe000', borderRadius: 2,
              transformOrigin: 'right center',
              transform: 'translateY(-50%) rotate(35deg)',
              boxShadow: '0 0 8px #ffe000, 0 0 18px rgba(255,224,0,0.6)',
            }} />
            <div style={{
              position: 'absolute', top: '50%', right: 0,
              width: 14, height: 2.5, background: '#ffe000', borderRadius: 2,
              transformOrigin: 'left center',
              transform: 'translateY(-50%) rotate(-35deg)',
              boxShadow: '0 0 8px #ffe000, 0 0 18px rgba(255,224,0,0.6)',
            }} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Single video section ─────────────────────────────────────────
function VideoSection({ card }: { card: typeof CARDS[number] }) {
  const secRef   = useRef<HTMLElement>(null)
  const headRef  = useRef<HTMLHeadingElement>(null)
  const tileRef  = useRef<HTMLDivElement>(null)
  const vidRef   = useRef<HTMLVideoElement>(null)
  const observed = useRef(false)

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting || observed.current) return
        observed.current = true

        // heading rise
        if (headRef.current) headRef.current.classList.add('rise')
        // tile 3D pop
        if (tileRef.current) tileRef.current.classList.add('pop')

        // video reveal
        const vid  = vidRef.current
        const tile = tileRef.current
        if (!vid || !tile) return
        const reveal = () => tile.classList.add('loaded')
        vid.addEventListener('loadeddata', reveal, { once: true })
        if (vid.readyState >= 2) reveal()
        setTimeout(reveal, 1500)
        vid.play().catch(() => {})
      })
    }, { threshold: 0.35 })

    if (secRef.current) io.observe(secRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={secRef} className="vsec">
      <div className="sec-head-band">
        <h2 ref={headRef} className="sec-heading">{card.title}</h2>
      </div>

      <div ref={tileRef} className="tile-wrapper">
        {/* Shimmer */}
        <div className="shimmer-loader">
          <div className="spin-ring" style={{ borderTopColor: card.accent }} />
          <div className="loading-text" style={{ color: card.accent }}>{card.loading}</div>
        </div>
        {/* Video */}
        <video ref={vidRef} src={card.src} className="tile-video"
          autoPlay muted loop playsInline />
      </div>
    </section>
  )
}

// ── Arc carousel ─────────────────────────────────────────────────
function ArcSection() {
  const secRef    = useRef<HTMLElement>(null)
  const centerRef = useRef(0)

  useEffect(() => {
    const update = () => {
      const cards = secRef.current?.querySelectorAll<HTMLDivElement>('.arc-card')
      if (!cards) return
      const total  = ARC_CARDS.length
      const center = centerRef.current
      const xStep  = window.innerWidth < 600 ? 100 : 160

      if (secRef.current) {
        secRef.current.style.background =
          `radial-gradient(circle at top, ${ARC_CARDS[center].color} 0%, #020510 70%)`
      }

      cards.forEach((card, i) => {
        let diff = (i - center) % total
        if (diff > Math.floor(total / 2)) diff -= total
        if (diff < -Math.floor(total / 2)) diff += total
        const abs = Math.abs(diff)
        if (abs > 2) { card.style.opacity = '0'; return }

        card.style.transform = `translate(calc(-50% + ${diff * xStep}px), calc(-50% + ${abs * 25}px)) scale(${1 - abs * 0.15}) rotate(${diff * 8}deg)`
        card.style.zIndex    = String(10 - abs)
        card.style.opacity   = String(1 - abs * 0.3)
        card.style.transition = 'all 0.6s cubic-bezier(0.25,1,0.5,1)'
      })
    }

    update()
    const iv = setInterval(() => {
      centerRef.current = (centerRef.current + 1) % ARC_CARDS.length
      update()
    }, 2500)
    return () => clearInterval(iv)
  }, [])

  return (
    <section ref={secRef} style={{
      padding: 'clamp(80px,12vh,120px) 0',
      overflow: 'hidden', position: 'relative',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      scrollSnapAlign: 'start',
      transition: 'background 1s ease-in-out',
    }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 60 }}>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.16)' }} />
        <span style={{ fontSize: '0.7rem', color: 'rgba(0,200,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>
          Select Your Universe
        </span>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.16)' }} />
      </div>

      {/* Stage */}
      <div style={{ position: 'relative', width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ARC_CARDS.map((c, i) => (
          <div key={i} className="arc-card" style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 'clamp(220px,45vw,300px)', aspectRatio: '4/5',
            borderRadius: 16, background: 'rgba(2,5,16,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: 20,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transformOrigin: 'center bottom',
          }}>
            <div style={{ width: '75%', aspectRatio: '1', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(255,255,255,0.05),transparent)' }}>
              <span style={{ fontSize: '3.8rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>{c.e}</span>
            </div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{c.n}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{c.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
    }
      

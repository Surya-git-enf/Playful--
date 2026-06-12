'use client'

import React, { useEffect, useState, useRef } from 'react'

interface Props {
  isActive: boolean
}

const PROMPTS = [
  'Describe the game you want to build...',
  'A cinematic space shooter with neon plasma trails...',
  'A 3D off-road mountain climbing challenge...',
  'A fast-paced futuristic racing arena...',
  'A physics-based puzzle world in cyan and magenta...',
]

const HEADLINE = "IMAGINE NEW WORLDS"
const LETTER_DELAY_STEP = 0.05 // 50ms between letters
const HEADLINE_START = 1.6 // seconds - after earth + ground + astronaut settle

export default function SpaceSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)
  const [promptValue, setPromptValue] = useState('')
  const [phIdx, setPhIdx] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isActive])

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setPhIdx((prev) => (prev + 1) % PROMPTS.length)
      }, 3500)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  // Build the headline as words -> letters, tracking global letter index for delay
  const words = HEADLINE.split(' ')
  let globalLetterIndex = 0

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#02030a' }}>

      <style>{`
        @keyframes spaceBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes nebulaDrift {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; }
          50% { transform: translate(2%, -1.5%) scale(1.08); opacity: 0.75; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.85; transform: scale(1.2); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-40px) translateX(8px); opacity: 0; }
        }
        @keyframes earthRise {
          0% {
            transform: translateX(-50%) translateY(70px) scale(0.94);
            opacity: 0;
          }
          55% {
            transform: translateX(-50%) translateY(-8px) scale(1.015);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes earthBreathe {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            filter: drop-shadow(0 0 40px rgba(80, 160, 255, 0.18)) drop-shadow(0 0 80px rgba(60, 120, 255, 0.08));
          }
          50% {
            transform: translateX(-50%) scale(1.03);
            filter: drop-shadow(0 0 65px rgba(90, 175, 255, 0.32)) drop-shadow(0 0 110px rgba(70, 140, 255, 0.14));
          }
        }
        @keyframes earthShimmer {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes groundRise {
          0% { transform: translateY(120px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes astroLand {
          0% { transform: translateY(-100px); opacity: 0; }
          60% { transform: translateY(10px); opacity: 1; }
          80% { transform: translateY(-4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes astroBreathe {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes letterReveal {
          0% {
            opacity: 0.2;
            -webkit-mask-position: 0 100%;
            mask-position: 0 100%;
          }
          100% {
            opacity: 1;
            -webkit-mask-position: 0 0%;
            mask-position: 0 0%;
          }
        }
        @keyframes blurFadeIn {
          from { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        @keyframes panelRise {
          from { opacity: 0; transform: translate(-50%, -42%) scale(0.95); filter: blur(16px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
        }
      `}</style>

      {/* ─── 1. SPACE BACKGROUND (breathing nebula + stars) ─── */}
      <div style={{
        position: 'absolute', inset: '-2%',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.8s ${premiumEase}`,
        animation: mounted ? 'spaceBreathe 20s ease-in-out infinite' : 'none',
        zIndex: 0,
      }}>
        {/* Nebula glows */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '70%', height: '70%',
          background: 'radial-gradient(circle, rgba(40,60,120,0.35) 0%, rgba(20,30,70,0.1) 45%, transparent 70%)',
          filter: 'blur(40px)',
          animation: mounted ? 'nebulaDrift 28s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-15%', width: '80%', height: '80%',
          background: 'radial-gradient(circle, rgba(30,40,90,0.3) 0%, rgba(15,20,50,0.08) 50%, transparent 70%)',
          filter: 'blur(50px)',
          animation: mounted ? 'nebulaDrift 34s ease-in-out infinite reverse' : 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #02030a 0%, #050a18 45%, #060c1e 100%)',
        }} />

        {/* Stars */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: 140 }).map((_, i) => {
            const x = (i * 83 + 17) % 100
            const y = (i * 61 + 11) % 100
            const r = i % 9 === 0 ? 0.22 : i % 4 === 0 ? 0.12 : 0.06
            const delay = (i % 6) * 0.6
            return (
              <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF"
                style={{
                  animation: `starTwinkle ${3 + (i % 5)}s infinite ease-in-out ${delay}s`,
                  opacity: 0.2
                }}
              />
            )
          })}
        </svg>

        {/* Cosmic particles */}
        {Array.from({ length: 14 }).map((_, i) => {
          const left = (i * 137 + 23) % 100
          const top = (i * 211 + 41) % 100
          const size = 1 + (i % 3)
          const dur = 14 + (i % 6) * 2
          const delay = (i % 7) * 1.3
          return (
            <div key={i} style={{
              position: 'absolute', left: `${left}%`, top: `${top}%`,
              width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              background: 'rgba(150, 190, 255, 0.6)',
              boxShadow: '0 0 6px rgba(120,170,255,0.6)',
              animation: mounted ? `particleFloat ${dur}s ease-in-out infinite ${delay}s` : 'none',
            }} />
          )
        })}
      </div>

      {/* ─── 2. HEADLINE (BEHIND Earth) — letter-by-letter upward light scan ─── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 2,
        pointerEvents: 'none',
        padding: '0 4vw',
      }}>
        <h1 style={{
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          fontWeight: 250,
          fontSize: 'clamp(3rem, 8vw, 8rem)',
          letterSpacing: '0.04em',
          color: '#FFFFFF',
          margin: 0,
          lineHeight: 1.05,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 0.35em',
          textShadow: '0 0 40px rgba(140,180,255,0.35), 0 0 90px rgba(100,150,255,0.2)',
        }}>
          {words.map((word, wIdx) => (
            <span key={wIdx} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
              {word.split('').map((char, cIdx) => {
                const idx = globalLetterIndex++
                const delay = HEADLINE_START + idx * LETTER_DELAY_STEP
                return (
                  <span
                    key={cIdx}
                    style={{
                      display: 'inline-block',
                      opacity: mounted ? undefined : 0.2,
                      // Mask gradient: bottom 0.2 -> middle 0.6 -> top 1, animated by sliding mask position
                      WebkitMaskImage: 'linear-gradient(to top, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,1) 100%, rgba(255,255,255,1) 200%)',
                      maskImage: 'linear-gradient(to top, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,1) 100%, rgba(255,255,255,1) 200%)',
                      WebkitMaskSize: '100% 200%',
                      maskSize: '100% 200%',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: '0 100%',
                      maskPosition: '0 100%',
                      animation: mounted
                        ? `letterReveal 0.9s ${premiumEase} ${delay}s both`
                        : 'none',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>
      </div>

      {/* ─── 3. EARTH (foreground, rises + breathes, covers headline) ─── */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '50%',
        width: 'clamp(280px, 46vw, 620px)',
        zIndex: 3,
        transform: 'translateX(-50%)',
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? 'earthRise 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both, earthBreathe 9s ease-in-out infinite 1.95s'
          : 'none',
      }}>
        <div style={{ position: 'relative' }}>
          <img src="/space/earth.png" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          {/* Atmospheric shimmer overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 45%)',
            mixBlendMode: 'screen',
            animation: mounted ? 'earthShimmer 6s ease-in-out infinite 2s' : 'none',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ─── 4. LUNAR GROUND ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'groundRise 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' : 'none',
      }}>
        <img src="/space/lunar-ground.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>

      {/* ─── 5. ASTRONAUT ─── */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '8%',
        width: 'clamp(70px, 12vw, 170px)',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? 'astroLand 1.1s cubic-bezier(0.34, 1.2, 0.4, 1) 0.7s both, astroBreathe 4s ease-in-out infinite 1.85s'
          : 'none',
      }}>
        <img src="/space/astronaut.png" alt="" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 24px rgba(120,180,255,0.25))' }} />
      </div>

      {/* ─── 6. VIGNETTE ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,3,10,0.55) 0%, rgba(2,3,10,0) 32%, rgba(2,3,10,0) 65%, rgba(2,3,10,0.85) 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.2s ${premiumEase}`,
        zIndex: 6,
      }} />

      {/* ─── 7. PROMPT PANEL ─── */}
      <div style={{
        position: 'absolute', top: '78%', left: '50%',
        width: 'min(92vw, 650px)',
        zIndex: 20,
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'panelRise 1s cubic-bezier(0.16, 1, 0.3, 1) 2.3s both' : 'none',
      }}>
        <div style={{
          background: 'rgba(10, 11, 18, 0.45)',
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '12px 12px 12px 20px',
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          position: 'relative'
        }}>

          {!promptValue && (
            <div style={{ position: 'absolute', left: '20px', right: '140px', top: '18px', pointerEvents: 'none', overflow: 'hidden' }}>
              <span key={phIdx} style={{
                fontFamily: "'Space Mono', monospace", fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, display: 'block',
                animation: 'blurFadeIn 0.5s ease both'
              }}>
                {PROMPTS[phIdx]}
              </span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={promptValue}
            onChange={handleInput}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'Space Mono', monospace", fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
              color: '#fff', caretColor: '#FFFFFF', resize: 'none', overflowY: 'hidden',
              minHeight: '24px', maxHeight: '150px', lineHeight: 1.5, paddingTop: '6px', paddingBottom: '6px'
            }}
          />

          <button style={{
            flexShrink: 0, padding: '14px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#000',
            background: '#FFFFFF', transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)'; }}
          >
            Build it
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          {['🎤 Prompt it', '⚡ Build it', '🚀 Publish it'].map((label, i) => (
            <button key={label} style={{
              padding: '8px 20px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#FFF',
              transition: 'background 0.2s',
              animation: mounted ? `blurFadeIn 0.8s ease ${2.6 + (i * 0.1)}s both` : 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
            }

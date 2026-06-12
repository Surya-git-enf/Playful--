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

const TAGLINE = "Playful — An AI Powered Game Engine"

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

  // Per-letter stagger delay base (after earth has risen)
  const TITLE_START_DELAY = 0.9 // seconds, after earth begins rising
  const LETTER_STEP = 0.045

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#010205' }}>

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes earthRise {
          0% {
            transform: translateX(-50%) translateY(40px) scale(0.92);
            opacity: 0;
            filter: drop-shadow(0 0 10px rgba(0,120,255,0)) blur(8px);
          }
          60% {
            transform: translateX(-50%) translateY(-6px) scale(1.01);
            opacity: 1;
            filter: drop-shadow(0 0 50px rgba(0,120,255,0.25)) blur(0px);
          }
          100% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 40px rgba(0,120,255,0.15)) blur(0px);
          }
        }
        @keyframes earthPulse {
          0%, 100% { filter: drop-shadow(0 0 40px rgba(0, 120, 255, 0.15)); }
          50% { filter: drop-shadow(0 0 60px rgba(0, 120, 255, 0.3)); }
        }
        @keyframes astroFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes letterRiseIn {
          0% {
            opacity: 0.2;
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blurFadeIn {
          from { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
      `}</style>

      {/* ─── 1. DYNAMIC STARFIELD (SVG Generated) ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 2s ${premiumEase}`
      }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {Array.from({ length: 100 }).map((_, i) => {
            const x = (i * 83 + 17) % 100
            const y = (i * 61 + 11) % 100
            const r = i % 7 === 0 ? 0.2 : i % 3 === 0 ? 0.1 : 0.05
            const delay = (i % 5) * 0.5
            return (
              <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF"
                style={{
                  animation: `starTwinkle ${3 + (i % 4)}s infinite ease-in-out ${delay}s`,
                  opacity: 0.2
                }}
              />
            )
          })}
        </svg>
      </div>

      {/* ─── 2. EARTH (Background, with RISE animation) ─── */}
      <div style={{
        position: 'absolute', top: '2%', left: '50%',
        width: 'clamp(200px, 35vw, 450px)',
        zIndex: 1,
        // Use a stable resting transform via translateX(-50%); the keyframes
        // handle the rise. We only trigger the animation once mounted.
        transform: 'translateX(-50%)',
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? 'earthRise 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both, earthPulse 8s ease-in-out infinite 1.7s'
          : 'none',
      }}>
        <img src="/space/earth.png" alt="Earth" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* ─── 3. LUNAR GROUND (Bottom anchor) ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(150px)',
        transition: `all 1.2s ${premiumEase} 0.2s`,
        zIndex: 2
      }}>
        <img src="/space/lunar-ground.png" alt="Lunar Ground" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>

      {/* ─── 4. ASTRONAUT (Floating right side) ─── */}
      <div style={{
        position: 'absolute', bottom: '22%', right: '10%',
        width: 'clamp(70px, 12vw, 160px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(60px)',
        transition: `all 1.5s ${premiumEase} 0.4s`,
        zIndex: 3
      }}>
        <div style={{ animation: mounted ? 'astroFloat 5s ease-in-out infinite 1s' : 'none' }}>
          <img src="/space/astronaut.png" alt="Astronaut" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 20px rgba(0, 234, 255, 0.2))' }} />
        </div>
      </div>

      {/* ─── 5. UI LAYER & VIGNETTE ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(1,2,5,0.7) 0%, rgba(1,2,5,0) 30%, rgba(1,2,5,0) 70%, rgba(1,2,5,0.8) 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* ─── Top Title: letter-by-letter rise + opacity reveal ─── */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 11,
        textAlign: 'center',
        padding: '0 5vw'
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '14px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          filter: mounted ? 'blur(0px)' : 'blur(10px)',
          transition: `all 1.2s ${premiumEase} 0.3s`,
        }}>
          Stage 5 · Space
        </span>

        <h2 style={{
          fontFamily: "'Inter', 'SF Pro Display', sans-serif",
          fontSize: 'clamp(2rem, 5.2vw, 4.5rem)',
          margin: 0,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textShadow: '0 4px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          lineHeight: 1.2,
        }}>
          {TAGLINE.split('').map((char, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                opacity: mounted ? 1 : 0.2,
                transform: mounted ? 'translateY(0)' : 'translateY(28px)',
                animation: mounted
                  ? `letterRiseIn 0.7s ${premiumEase} ${TITLE_START_DELAY + i * LETTER_STEP}s both`
                  : 'none',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>

      {/* ─── 6. THE PROMPT PANEL (Glassmorphism UI) ─── */}
      <div style={{
        position: 'absolute', top: '54%', left: '50%',
        transform: mounted ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -40%) scale(0.95)',
        opacity: mounted ? 1 : 0,
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1s ${premiumEase} 1.6s`,
        width: 'min(90vw, 650px)',
        zIndex: 20
      }}>
        <div style={{
          background: 'rgba(10, 11, 14, 0.45)',
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

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {['🎤 Prompt it', '⚡ Build it', '🚀 Publish it'].map((label, i) => (
            <button key={label} style={{
              padding: '8px 20px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#FFF',
              transition: 'background 0.2s',
              animation: mounted ? `blurFadeIn 0.8s ease ${1.8 + (i * 0.1)}s both` : 'none'
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

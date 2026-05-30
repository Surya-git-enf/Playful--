
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

export default function SpaceSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)
  const [promptValue, setPromptValue] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 1. Mount Animation Trigger
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isActive])

  // 2. Rotating Placeholder Logic
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

  // 3. Auto-expanding Textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#010205' }}>
      
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes earthPulse {
          0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 40px rgba(0, 120, 255, 0.15)); }
          50% { transform: translateX(-50%) scale(1.02); filter: drop-shadow(0 0 60px rgba(0, 120, 255, 0.3)); }
        }
        @keyframes astroFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
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

      {/* ─── 2. EARTH (Background glow) ─── */}
      <div style={{
        position: 'absolute', top: '2%', left: '50%',
        width: 'clamp(200px, 35vw, 450px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-60px)',
        transition: `all 1.5s ${premiumEase} 0.1s`,
        zIndex: 1
      }}>
        <div style={{ animation: mounted ? 'earthPulse 8s ease-in-out infinite' : 'none' }}>
          <img src="/space/earth.png" alt="Earth" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
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

      {/* ─── 5. UI LAYER & TYPOGRAPHY ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(1,2,5,0.7) 0%, rgba(1,2,5,0) 30%, rgba(1,2,5,0) 70%, rgba(1,2,5,0.8) 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${premiumEase}`,
        zIndex: 10
      }} />

      {/* Top Title */}
      <div style={{
        position: 'absolute', top: '12vh', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        filter: mounted ? 'blur(0px)' : 'blur(10px)',
        transition: `all 1.2s ${premiumEase} 0.3s`,
        zIndex: 11
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Stage 5 · Space
        </span>
        <h2 style={{ 
          fontFamily: "'Inter', 'SF Pro Display', sans-serif", 
          fontSize: 'clamp(3rem, 7vw, 6rem)', margin: 0, color: '#FFFFFF', 
          fontWeight: 300, letterSpacing: '-0.03em', textShadow: '0 4px 30px rgba(0,0,0,0.8)'
        }}>
          Beyond Orbit
        </h2>
      </div>

      {/* ─── 6. THE PROMPT PANEL (Glassmorphism UI) ─── */}
      <div style={{
        position: 'absolute', top: '52%', left: '50%',
        transform: mounted ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -40%) scale(0.95)',
        opacity: mounted ? 1 : 0,
        filter: mounted ? 'blur(0px)' : 'blur(16px)',
        transition: `all 1s ${premiumEase} 0.6s`, // Delayed entrance
        width: 'min(90vw, 650px)',
        zIndex: 20
      }}>
        {/* Main Input Box */}
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
          
          {/* Animated Placeholder Text */}
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

          {/* Premium Build Button */}
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

        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {['🎤 Prompt it', '⚡ Build it', '🚀 Publish it'].map((label, i) => (
            <button key={label} style={{
              padding: '8px 20px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#FFF',
              transition: 'background 0.2s',
              animation: mounted ? `blurFadeIn 0.8s ease ${0.8 + (i * 0.1)}s both` : 'none'
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

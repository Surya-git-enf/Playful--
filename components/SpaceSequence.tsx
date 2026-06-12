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
  const [focused, setFocused] = useState(false)

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
        @keyframes nebulaDriftReverse {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.4; }
          50% { transform: translate(-2.5%, 1.5%) scale(1.1); opacity: 0.7; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-50px) translateX(10px); opacity: 0; }
        }
        @keyframes earthRise {
          0% { transform: translateX(-50%) translateY(70px) scale(0.94); opacity: 0; }
          55% { transform: translateX(-50%) translateY(-8px) scale(1.015); opacity: 1; }
          100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
        }
        @keyframes earthBreathe {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            filter: drop-shadow(0 0 40px rgba(80, 160, 255, 0.18)) drop-shadow(0 0 80px rgba(60, 120, 255, 0.08));
          }
          50% {
            transform: translateX(-50%) scale(1.045);
            filter: drop-shadow(0 0 70px rgba(90, 175, 255, 0.34)) drop-shadow(0 0 120px rgba(70, 140, 255, 0.16));
          }
        }
        @keyframes earthShimmer {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.32; }
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
          50% { transform: translateY(-14px) rotate(-1.5deg); }
        }
        @keyframes blurFadeIn {
          from { opacity: 0; filter: blur(8px); transform: translateY(10px); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        @keyframes panelRise {
          from { opacity: 0; transform: translate(-50%, -42%) scale(0.96); filter: blur(16px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
        }
        @keyframes buttonShine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>

      {/* ─── 1. SPACE BACKGROUND ─── */}
      <div style={{
        position: 'absolute', inset: '-2%',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.8s ${premiumEase}`,
        animation: mounted ? 'spaceBreathe 20s ease-in-out infinite' : 'none',
        zIndex: 0,
      }}>
        {/* Base gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #02030a 0%, #050a18 45%, #060c1e 100%)',
        }} />

        {/* Nebula glows */}
        <div style={{
          position: 'absolute', top: '-12%', left: '-12%', width: '75%', height: '75%',
          background: 'radial-gradient(circle, rgba(60,80,160,0.32) 0%, rgba(30,40,90,0.1) 45%, transparent 70%)',
          filter: 'blur(50px)',
          animation: mounted ? 'nebulaDrift 30s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-18%', right: '-15%', width: '85%', height: '85%',
          background: 'radial-gradient(circle, rgba(40,55,120,0.28) 0%, rgba(20,28,70,0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
          animation: mounted ? 'nebulaDriftReverse 36s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '10%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(90,70,150,0.18) 0%, transparent 65%)',
          filter: 'blur(70px)',
          animation: mounted ? 'nebulaDrift 42s ease-in-out infinite 4s' : 'none',
        }} />

        {/* Stars */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: 160 }).map((_, i) => {
            const x = (i * 83 + 17) % 100
            const y = (i * 61 + 11) % 100
            const r = i % 9 === 0 ? 0.24 : i % 4 === 0 ? 0.13 : 0.06
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
        {Array.from({ length: 18 }).map((_, i) => {
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

      {/* ─── 2. EARTH (faster continuous breathe in/out) ─── */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '50%',
        width: 'clamp(280px, 46vw, 620px)',
        zIndex: 3,
        transform: 'translateX(-50%)',
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? 'earthRise 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both, earthBreathe 3s ease-in-out infinite 1.95s'
          : 'none',
      }}>
        <div style={{ position: 'relative' }}>
          <img src="/space/earth.png" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 45%)',
            mixBlendMode: 'screen',
            animation: mounted ? 'earthShimmer 3s ease-in-out infinite 2s' : 'none',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ─── 3. LUNAR GROUND ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'groundRise 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' : 'none',
      }}>
        <img src="/space/lunar-ground.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>

      {/* ─── 4. ASTRONAUT — large, repositioned (bottom 20%, left 73%) ─── */}
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '70%',
        width: 'clamp(130px, 22vw, 320px)',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? 'astroLand 1.1s cubic-bezier(0.34, 1.2, 0.4, 1) 0.7s both, astroBreathe 4s ease-in-out infinite 1.85s'
          : 'none',
      }}>
        <img src="/space/astronaut.png" alt="" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 28px rgba(120,180,255,0.28))' }} />
      </div>

      {/* ─── 5. VIGNETTE ─── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,3,10,0.55) 0%, rgba(2,3,10,0) 32%, rgba(2,3,10,0) 65%, rgba(2,3,10,0.85) 100%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1.2s ${premiumEase}`,
        zIndex: 6,
      }} />

      {/* ─── 6. PROMPT PANEL — refined UI/UX ─── */}
      <div style={{
        position: 'absolute', top: '80%', left: '50%',
        width: 'min(92vw, 660px)',
        zIndex: 20,
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'panelRise 1s cubic-bezier(0.16, 1, 0.3, 1) 1.4s both' : 'none',
      }}>
        <div style={{
          background: 'rgba(12, 14, 22, 0.5)',
          backdropFilter: 'blur(36px)', WebkitBackdropFilter: 'blur(36px)',
          border: focused ? '1px solid rgba(140,180,255,0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: focused
            ? '0 30px 70px rgba(0,0,0,0.65), 0 0 0 4px rgba(110,160,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)'
            : '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: '18px',
          padding: '14px 14px 14px 22px',
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          position: 'relative',
          transition: `border 0.3s ${premiumEase}, box-shadow 0.3s ${premiumEase}`,
        }}>

          {!promptValue && (
            <div style={{ position: 'absolute', left: '22px', right: '150px', top: '20px', pointerEvents: 'none', overflow: 'hidden' }}>
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'Space Mono', monospace", fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
              color: '#fff', caretColor: '#9db8ff', resize: 'none', overflowY: 'hidden',
              minHeight: '26px', maxHeight: '150px', lineHeight: 1.5, paddingTop: '7px', paddingBottom: '7px'
            }}
          />

          {/* Primary CTA — gradient, shine sweep */}
          <button style={{
            flexShrink: 0, padding: '14px 30px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#0a0d16',
            background: 'linear-gradient(135deg, #ffffff 0%, #dce6ff 100%)',
            transition: `transform 0.25s ${premiumEase}, box-shadow 0.25s ${premiumEase}`,
            boxShadow: '0 4px 24px rgba(140,180,255,0.25)',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(140,180,255,0.4)'
            const shine = e.currentTarget.querySelector('.shine') as HTMLElement
            if (shine) shine.style.animation = 'buttonShine 0.9s ease'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(140,180,255,0.25)'
          }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>Build it</span>
            <span className="shine" style={{
              position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(120,150,255,0.35), transparent)',
              transform: 'translateX(-100%) skewX(-15deg)',
            }} />
          </button>
        </div>

        {/* Action pills */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '22px', flexWrap: 'wrap' }}>
          {[
            { icon: '🎤', label: 'Prompt it' },
            { icon: '⚡', label: 'Build it' },
            { icon: '🚀', label: 'Publish it' },
          ].map((item, i) => (
            <button key={item.label} style={{
              padding: '10px 22px',
              borderRadius: '99px',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: `background 0.25s ${premiumEase}, border-color 0.25s ${premiumEase}, transform 0.25s ${premiumEase}, box-shadow 0.25s ${premiumEase}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              animation: mounted ? `blurFadeIn 0.8s ease ${1.7 + (i * 0.1)}s both` : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
              e.currentTarget.style.borderColor = 'rgba(150,190,255,0.35)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(100,150,255,0.18)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
            }}
            >
              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
    }

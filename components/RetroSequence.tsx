'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  isActive: boolean
}

export default function RetroSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [isActive])

  const ease  = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const easeA = 'cubic-bezier(0.19, 1, 0.22, 1)'

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>
      <style>{`
        @keyframes cloudDrift {
          0%,100% { transform: translateX(0px);   }
          50%      { transform: translateX(18px);  }
        }
        @keyframes castleBob {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-6px); }
        }
        @keyframes hillsFloat {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-4px); }
        }
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg)   translateY(0px);   }
          25%  { transform: rotateY(90deg)  translateY(-10px); }
          50%  { transform: rotateY(180deg) translateY(-16px); }
          75%  { transform: rotateY(270deg) translateY(-8px);  }
          100% { transform: rotateY(360deg) translateY(0px);   }
        }
        @keyframes charIdle {
          0%,100% { transform: translateY(0px) scaleY(1);    }
          50%      { transform: translateY(-5px) scaleY(1.02); }
        }
      `}</style>

      {/* Sky */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(1.04)',
        transition: `opacity 1.2s ${ease}, transform 1.4s ${ease}`,
      }}>
        <img src="/retro/sky.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Clouds */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        height: 'clamp(80px, 18vw, 200px)',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
        transition: `opacity 1.1s ${ease} 0.1s, transform 1.1s ${ease} 0.1s`,
      }}>
        <div style={{ width: '100%', height: '100%', animation: mounted ? 'cloudDrift 12s ease-in-out infinite' : 'none' }}>
          <img src="/retro/clouds.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Hills */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(220px, 55vh, 520px)',
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(60px)',
        transition: `opacity 1s ${easeA} 0.15s, transform 1s ${easeA} 0.15s`,
      }}>
        <div style={{ width: '100%', height: '100%', animation: mounted ? 'hillsFloat 12s ease-in-out infinite' : 'none' }}>
          <img src="/retro/hills.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom', display: 'block' }} />
        </div>
      </div>

      {/* Terrain floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(120px, 28vh, 280px)',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(80px)',
        transition: `opacity 0.9s ${easeA} 0.2s, transform 0.9s ${easeA} 0.2s`,
      }}>
        <img src="/retro/terrain.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
      </div>

      {/* Castle — centred, sits on terrain */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(110px, 26vh, 265px)',
        left: '50%', transform: 'translateX(-50%)',
        width: 'clamp(90px, 22vw, 220px)',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        marginBottom: mounted ? '0px' : '-20px',
        transition: `opacity 1.2s ${ease} 0.25s, margin-bottom 1.2s ${ease} 0.25s`,
      }}>
        <div style={{ animation: mounted ? 'castleBob 5s ease-in-out infinite' : 'none', transformOrigin: 'bottom center' }}>
          <img src="/retro/castle.png" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

      {/* Character — anchored to terrain, properly sized for mobile */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(112px, 27vh, 272px)',
        /* center on mobile, slight right on desktop */
        left: 'clamp(38%, 48%, 52%)',
        width: 'clamp(72px, 14vw, 130px)',
        zIndex: 6,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(60px)',
        transition: `opacity 0.9s ${easeA} 0.35s, transform 0.9s ${easeA} 0.35s`,
      }}>
        <div style={{
          filter: 'drop-shadow(4px 6px 0px rgba(0,0,0,0.45))',
          animation: mounted ? 'charIdle 1.8s ease-in-out infinite' : 'none',
          transformOrigin: 'bottom center',
        }}>
          <img src="/retro/character.png" alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

      {/* Coins */}
      {mounted && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none',
          opacity: mounted ? 1 : 0, transition: `opacity 0.8s ${ease} 0.4s` }}>
          {[
            { left: '12%',  bottom: 'clamp(130px,31vh,295px)', delay: '0s'    },
            { left: '22%',  bottom: 'clamp(130px,31vh,295px)', delay: '0.2s'  },
            { left: '62%',  bottom: 'clamp(128px,30vh,288px)', delay: '0.15s' },
            { left: '70%',  bottom: 'clamp(128px,30vh,288px)', delay: '0.35s' },
            { left: '78%',  bottom: 'clamp(135px,32vh,305px)', delay: '0.05s' },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', left: c.left, bottom: c.bottom,
              width: 'clamp(28px, 6vw, 52px)',
              animation: `coinSpin 1.6s ease-in-out infinite ${c.delay}`,
            }}>
              <img src="/retro/coin.png" alt="" style={{ width: '100%', display: 'block' }} />
            </div>
          ))}
        </div>
      )}

      {/* Top gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(2,2,2,0.82) 0%, rgba(2,2,2,0.15) 22%, transparent 40%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${ease}`,
      }} />

      {/* Typography */}
      <div style={{
        position: 'absolute', top: 'clamp(50px,9vh,90px)', left: 0, right: 0,
        zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        filter: mounted ? 'blur(0px)' : 'blur(8px)',
        transition: `all 1.1s ${easeA} 0.3s`,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.5rem, 1.1vw, 0.68rem)',
          letterSpacing: '0.35em', color: 'rgba(255,255,255,0.65)',
          marginBottom: '10px',
        }}>
          Stage 2 · Retro
        </span>
        <h2 style={{
          fontFamily: "var(--font-pixel, 'Press Start 2P', monospace)",
          fontSize: 'clamp(1.1rem, 4.5vw, 3.2rem)',
          margin: 0, fontWeight: 400, lineHeight: 1.2,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          textShadow: '0 5px 0px #000',
          display: 'flex', gap: '14px', flexWrap: 'wrap' as const,
          justifyContent: 'center',
        }}>
          <span style={{ color: '#FACC15' }}>Pixels</span>
          <span style={{ color: '#FFFFFF' }}>Never Died</span>
        </h2>
      </div>
    </div>
  )
}

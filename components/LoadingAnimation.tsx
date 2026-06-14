'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Each icon is a realistic-ish SVG matching the emoji feel ──────
const ICONS = [
  // ♟️ Chess pawn — bold, chunky
  {
    label: 'chess',
    svg: (
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="22" r="13" stroke="white" strokeWidth="5" fill="none"/>
        <rect x="37" y="34" width="26" height="8" rx="3" stroke="white" strokeWidth="5" fill="none"/>
        <path d="M34 42 Q30 62 24 72 H76 Q70 62 66 42 Z" stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round"/>
        <rect x="18" y="72" width="64" height="10" rx="4" stroke="white" strokeWidth="5" fill="none"/>
      </svg>
    ),
  },
  // 🏎️ Racing car — side profile, bold
  {
    label: 'car',
    svg: (
      <svg viewBox="0 0 120 60" width="160" height="80">
        <path d="M10 42 L10 30 L30 30 L45 14 L80 14 L95 30 L110 30 L110 42 Z"
          stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round"/>
        <line x1="10" y1="42" x2="110" y2="42" stroke="white" strokeWidth="3"/>
        {/* rear wheel */}
        <circle cx="30" cy="46" r="10" stroke="white" strokeWidth="5" fill="none"/>
        <circle cx="30" cy="46" r="3" stroke="white" strokeWidth="3" fill="none"/>
        {/* front wheel */}
        <circle cx="88" cy="46" r="10" stroke="white" strokeWidth="5" fill="none"/>
        <circle cx="88" cy="46" r="3" stroke="white" strokeWidth="3" fill="none"/>
        {/* cockpit window */}
        <path d="M48 29 L56 17 L76 17 L82 29 Z" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round"/>
        {/* spoiler */}
        <line x1="100" y1="30" x2="115" y2="22" stroke="white" strokeWidth="4"/>
        <line x1="115" y1="22" x2="115" y2="30" stroke="white" strokeWidth="4"/>
      </svg>
    ),
  },
  // ⚽ Football/soccer ball
  {
    label: 'ball',
    svg: (
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r="38" stroke="white" strokeWidth="5" fill="none"/>
        {/* classic football panel pattern */}
        <polygon points="50,18 62,26 58,40 42,40 38,26" stroke="white" strokeWidth="3.5" fill="none"/>
        <polygon points="38,26 26,30 22,44 34,52 42,40" stroke="white" strokeWidth="3.5" fill="none"/>
        <polygon points="62,26 74,30 78,44 66,52 58,40" stroke="white" strokeWidth="3.5" fill="none"/>
        <polygon points="34,52 22,44 18,58 28,68 40,64" stroke="white" strokeWidth="3.5" fill="none"/>
        <polygon points="66,52 78,44 82,58 72,68 60,64" stroke="white" strokeWidth="3.5" fill="none"/>
        <polygon points="40,64 28,68 36,80 50,80 64,80 72,68 60,64 50,70" stroke="white" strokeWidth="3.5" fill="none"/>
      </svg>
    ),
  },
  // 🚀 Rocket — bold, pointy
  {
    label: 'rocket',
    svg: (
      <svg viewBox="0 0 80 120" width="80" height="120">
        {/* body */}
        <path d="M40 8 C26 8 18 28 18 55 L18 80 L62 80 L62 55 C62 28 54 8 40 8 Z"
          stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round"/>
        {/* nose tip */}
        <path d="M40 8 L40 2" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        {/* window */}
        <circle cx="40" cy="42" r="10" stroke="white" strokeWidth="4" fill="none"/>
        {/* left fin */}
        <path d="M18 65 L5 85 L18 80 Z" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round"/>
        {/* right fin */}
        <path d="M62 65 L75 85 L62 80 Z" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round"/>
        {/* exhaust nozzle */}
        <path d="M28 80 L24 92 L40 88 L56 92 L52 80" stroke="white" strokeWidth="4" fill="none" strokeLinejoin="round"/>
        {/* flames */}
        <path d="M32 92 Q36 108 40 102 Q44 108 48 92" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  // 🎮 Game controller — modern gamepad
  {
    label: 'controller',
    svg: (
      <svg viewBox="0 0 130 80" width="160" height="100">
        {/* main body */}
        <path d="M20 30 Q10 30 8 45 Q6 62 18 70 Q28 76 40 68 L50 55 L80 55 L90 68 Q102 76 112 70 Q124 62 122 45 Q120 30 110 30 Z"
          stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round"/>
        {/* left grip bump */}
        <path d="M20 30 Q15 20 22 14 Q30 8 38 14" stroke="white" strokeWidth="4" fill="none"/>
        {/* right grip bump */}
        <path d="M110 30 Q115 20 108 14 Q100 8 92 14" stroke="white" strokeWidth="4" fill="none"/>
        {/* D-pad vertical */}
        <line x1="36" y1="30" x2="36" y2="48" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        {/* D-pad horizontal */}
        <line x1="27" y1="39" x2="45" y2="39" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        {/* face buttons */}
        <circle cx="88" cy="30" r="5" stroke="white" strokeWidth="3.5" fill="none"/>
        <circle cx="100" cy="39" r="5" stroke="white" strokeWidth="3.5" fill="none"/>
        <circle cx="88" cy="48" r="5" stroke="white" strokeWidth="3.5" fill="none"/>
        <circle cx="76" cy="39" r="5" stroke="white" strokeWidth="3.5" fill="none"/>
        {/* left analog stick */}
        <circle cx="52" cy="42" r="8" stroke="white" strokeWidth="3.5" fill="none"/>
        {/* right analog stick */}
        <circle cx="78" cy="42" r="8" stroke="white" strokeWidth="3.5" fill="none"/>
        {/* shoulder hints */}
        <path d="M28 30 Q32 22 48 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M102 30 Q98 22 82 22" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* center button */}
        <circle cx="65" cy="32" r="5" stroke="white" strokeWidth="3" fill="none"/>
      </svg>
    ),
  },
]

// ── Transformer-style explosion shards that appear mid-morph ──────
function Shards({ active }: { active: boolean }) {
  const shards = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2
    const dist = 60 + Math.random() * 40
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rotate: angle * (180 / Math.PI) + 45,
      size: 6 + Math.floor(Math.random() * 8),
    }
  })

  return (
    <AnimatePresence>
      {active && shards.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: s.size, height: s.size,
            marginLeft: -s.size / 2, marginTop: -s.size / 2,
            background: 'white',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            pointerEvents: 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: s.rotate }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2, rotate: s.rotate + 180 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, delay: i * 0.018, ease: [0.2, 0, 0.8, 1] }}
        />
      ))}
    </AnimatePresence>
  )
}

// ── Ground shockwave ring ─────────────────────────────────────────
function ShockRing({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="ring"
          style={{
            position: 'absolute',
            bottom: -20, left: '50%',
            width: 120, height: 30,
            marginLeft: -60,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.8)',
            pointerEvents: 'none',
          }}
          initial={{ scaleX: 0, scaleY: 0, opacity: 0.9 }}
          animate={{ scaleX: 1.4, scaleY: 1.4, opacity: 0 }}
          exit={{}}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.4, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

interface Props {
  progress?: number
}

type Phase =
  | 'falling'   // icon falling from above
  | 'bouncing'  // first contact — squash
  | 'resting'   // settled on ground
  | 'breaking'  // transformer explosion shards
  | 'morphing'  // current exits, next enters simultaneously

export default function LoadingAnimation({ progress }: Props) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('falling')
  const [showRing, setShowRing] = useState(false)
  const [showShards, setShowShards] = useState(false)

  // How long each icon rests before transforming
  const REST_MS = 900
  // How long the transformer shard burst lasts
  const SHARD_MS = 500
  // Morph cross-dissolve duration
  const MORPH_MS = 400

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let t4: ReturnType<typeof setTimeout>

    if (phase === 'falling') {
      // After landing spring settles (~700ms), trigger bounce phase
      t1 = setTimeout(() => setPhase('bouncing'), 680)
    }

    if (phase === 'bouncing') {
      // Flash ring, then go to resting
      setShowRing(true)
      t1 = setTimeout(() => setShowRing(false), 500)
      t2 = setTimeout(() => setPhase('resting'), 220)
    }

    if (phase === 'resting') {
      // Wait, then trigger transformer explosion
      t1 = setTimeout(() => {
        setShowShards(true)
        setPhase('breaking')
      }, REST_MS)
    }

    if (phase === 'breaking') {
      // Shards fly out, then morph (next icon starts entering)
      t1 = setTimeout(() => {
        setShowShards(false)
        setPhase('morphing')
      }, SHARD_MS)
    }

    if (phase === 'morphing') {
      // Advance to next icon and reset to falling
      t1 = setTimeout(() => {
        setIndex(prev => (prev + 1) % ICONS.length)
        setPhase('falling')
      }, MORPH_MS)
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      clearTimeout(t3); clearTimeout(t4)
    }
  }, [phase])

  const icon = ICONS[index]
  const nextIcon = ICONS[(index + 1) % ICONS.length]

  // ── Per-phase animation for the CURRENT icon ─────────────────
  const currentVariant = (() => {
    if (phase === 'falling') {
      return {
        y: 0, scaleX: 1, scaleY: 1, opacity: 1,
        transition: { type: 'spring' as const, stiffness: 280, damping: 18 },
      }
    }
    if (phase === 'bouncing') {
      return {
        y: 0, scaleX: 1.3, scaleY: 0.65, opacity: 1,
        transition: { duration: 0.12, ease: [0.2, 0, 1, 1] },
      }
    }
    if (phase === 'resting') {
      return {
        y: 0, scaleX: 1, scaleY: 1, opacity: 1,
        transition: { type: 'spring' as const, stiffness: 400, damping: 22 },
      }
    }
    if (phase === 'breaking') {
      return {
        y: 0, scaleX: 1, scaleY: 1, opacity: 1,
        transition: { duration: 0.1 },
      }
    }
    // morphing — current exits
    return {
      y: 0, scaleX: 0.1, scaleY: 0.1, opacity: 0,
      transition: { duration: MORPH_MS / 1000, ease: [0.6, 0, 1, 0.4] },
    }
  })()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: '#02030a', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: 40,
    }}>
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.06; }
          90%  { opacity: 0.06; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* Subtle scanline — cinematic feel */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0,
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)',
          animation: 'scanline 3s linear infinite',
        }} />
      </div>

      {/* ── STAGE ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: 220, height: 220,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1,
      }}>

        {/* Ground shockwave ring on bounce */}
        <ShockRing active={showRing} />

        {/* Transformer shard burst */}
        <Shards active={showShards} />

        {/* ── CURRENT ICON ── */}
        <AnimatePresence>
          <motion.div
            key={`icon-${index}`}
            style={{
              position: 'absolute',
              bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.55)) drop-shadow(0 0 28px rgba(255,255,255,0.25))',
            }}
            // Start above, fall in
            initial={{ y: -260, scaleX: 1, scaleY: 1, opacity: 1 }}
            animate={currentVariant}
            exit={{
              scaleX: 0.05, scaleY: 0.05, opacity: 0,
              transition: { duration: MORPH_MS / 1000 * 0.6, ease: [0.8, 0, 1, 0.5] },
            }}
          >
            {icon.svg}
          </motion.div>
        </AnimatePresence>

        {/* ── NEXT ICON (enters during morphing phase only) ── */}
        <AnimatePresence>
          {phase === 'morphing' && (
            <motion.div
              key={`next-${index}`}
              style={{
                position: 'absolute',
                bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transformOrigin: 'bottom center',
                filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.55)) drop-shadow(0 0 28px rgba(255,255,255,0.25))',
              }}
              initial={{ scaleX: 0.05, scaleY: 0.05, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
              transition={{ duration: MORPH_MS / 1000, ease: [0, 0.6, 0.4, 1] }}
            >
              {nextIcon.svg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground line */}
        <div style={{
          position: 'absolute', bottom: -8, left: '10%', right: '10%',
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
          borderRadius: 99,
        }} />
      </div>

      {/* ── PROGRESS BAR ── */}
      {typeof progress === 'number' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 1,
        }}>
          <div style={{
            width: 'min(60vw, 220px)', height: 2, borderRadius: 99,
            background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(120,180,255,0.9), #fff)',
              borderRadius: 99, transition: 'width 0.25s ease-out',
            }} />
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem', letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          }}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  )
          }

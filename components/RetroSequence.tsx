"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  isActive: boolean;
}

/*
  LAYOUT STRATEGY (fixes the mobile screenshot bug):
  ─────────────────────────────────────────────────
  The root cause was using dvh percentages for both terrain height AND
  character/coin positioning. On a tall mobile screen (e.g. 900px tall),
  30dvh = 270px terrain, so character "bottom: calc(30dvh - 6px)" = 264px
  from bottom — which visually floats it in mid-air.

  Fix: switch to a single CSS custom property --ground that ALL
  game elements share. We compute it once from the actual terrain
  image height (terrain fills bottom 32% of viewport, i.e. ~32dvh).
  Character and coins reference the same --ground value so they
  are always locked to the terrain surface regardless of screen size.

  Character size rule:
    Coin = clamp(32px, 8vw, 52px)
    Character = coin × 1.5 = clamp(48px, 12vw, 78px)   ← 50% bigger
    … but that's still tiny. The visual weight of the character
    should feel "hero" on screen, so we boost to clamp(90px, 22vw, 160px)
    which is ~1.5–2× the coin at every breakpoint and reads clearly on mobile.
*/

export default function RetroSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isActive) t = setTimeout(() => setMounted(true), 50);
    else setMounted(false);
    return () => clearTimeout(t);
  }, [isActive]);

  const ease    = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const easeAgg = 'cubic-bezier(0.19, 1, 0.22, 1)';

  // ── Shared ground offset ──────────────────────────────────────────────────
  // terrain image covers the bottom 32dvh of screen.
  // The playfield surface (top edge of terrain) sits ~32dvh from bottom.
  // Everything that "stands on the ground" uses this value.
  const GROUND     = '32dvh';                 // terrain height
  const GROUND_TOP = `calc(${GROUND} + 2px)`; // 2px above terrain surface

  // ── Coin size (single source of truth) ───────────────────────────────────
  const COIN_W = 'clamp(32px, 8vw, 52px)';

  // ── Character size ≈ 1.5× coin (visually dominant, "hero" scale) ─────────
  const CHAR_W = 'clamp(90px, 22vw, 160px)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#59b0ff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* Castle gentle bob */
        @keyframes castleBob {
          0%, 100% { transform: scale(1)    translateY(0px); }
          50%       { transform: scale(1.02) translateY(-5px); }
        }

        /* Coin: 3-D Y-axis spin + arc float */
        @keyframes coinSpin {
          0%   { transform: perspective(200px) rotateY(  0deg) translateY(  0px); }
          25%  { transform: perspective(200px) rotateY( 90deg) translateY(-12px); }
          50%  { transform: perspective(200px) rotateY(180deg) translateY(-18px); }
          75%  { transform: perspective(200px) rotateY(270deg) translateY( -9px); }
          100% { transform: perspective(200px) rotateY(360deg) translateY(  0px); }
        }

        /* Character: 3-D tilt pan + float rise */
        @keyframes charFloat {
          0%   { transform: perspective(600px) rotateY(-5deg) rotateX( 2deg) translateY(  0px); }
          25%  { transform: perspective(600px) rotateY( 0deg) rotateX(-1deg) translateY( -8px); }
          50%  { transform: perspective(600px) rotateY( 5deg) rotateX( 1deg) translateY(-12px); }
          75%  { transform: perspective(600px) rotateY( 2deg) rotateX(-1deg) translateY( -5px); }
          100% { transform: perspective(600px) rotateY(-5deg) rotateX( 2deg) translateY(  0px); }
        }

        /* Shadow under character syncs with float */
        @keyframes shadowSync {
          0%, 100% { transform: translateX(-50%) scaleX(1);    opacity: 0.40; }
          50%       { transform: translateX(-50%) scaleX(0.65); opacity: 0.18; }
        }

        /* Clouds slow drift */
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(  0px) translateY(0px); }
          50%       { transform: translateX( 14px) translateY(-6px); }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          MASTER LAYER STACK
          z1  sky
          z2  clouds
          z3  castle
          z4  hills
          z5  terrain  ← ground surface
          z6  coins    (just above ground)
          z7  character (just above ground, in front of coins)
      ══════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.7s ${ease}`,
      }}>

        {/* ── z1 SKY ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(1.06) translateY(-16px)',
          transition: `all 1.6s ${ease}`,
        }}>
          <img src="/retro/sky.png" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>

        {/* ── z2 CLOUDS ── */}
        <div style={{
          position: 'absolute', top: '4dvh', left: 0, right: 0, height: '28dvh', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
          transition: `all 1.4s ${ease} 0.1s`,
        }}>
          <div style={{
            width: '100%', height: '100%',
            animation: mounted ? 'cloudDrift 10s ease-in-out infinite' : 'none',
          }}>
            <img src="/retro/clouds.png" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top' }} />
          </div>
        </div>

        {/* ── z3 CASTLE (behind hills) ── */}
        <div style={{
          position: 'absolute',
          // Castle top edge sits at ~55% from top, bottom aligns with top of hills
          bottom: `calc(${GROUND} + 10dvh)`,
          left: 0, right: 0, zIndex: 3,
          display: 'flex', justifyContent: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(50px)',
          transition: `all 1.5s ${ease} 0.2s`,
        }}>
          <div style={{
            width: 'clamp(180px, 50vw, 680px)',
            animation: mounted ? 'castleBob 8s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/castle.png" alt="Castle"
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* ── z4 HILLS (covers castle base) ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          // Hills are tall enough to cover castle base AND merge into terrain
          height: `calc(${GROUND} + 18dvh)`,
          zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(60px)',
          transition: `all 1.3s ${ease} 0.15s`,
        }}>
          <img src="/retro/hills.png" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom center' }} />
        </div>

        {/* ── z5 TERRAIN FLOOR ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: GROUND,
          zIndex: 5,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(80px)',
          transition: `all 1s ${easeAgg} 0.25s`,
        }}>
          <img src="/retro/terrain.png" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' }} />
        </div>

        {/* ── z6 COINS ── 
            All coins share bottom: GROUND_TOP so they sit exactly on the terrain surface.
            Heights are staggered via translateY in each animation.
            Horizontal positions are safe insets (never < 8vw from edge → never clipped).
        ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 6,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: `all 1.3s ${ease} 0.38s`,
          pointerEvents: 'none',
        }}>
          {/* Left side: 2 coins */}
          {[
            { left: '8vw',  delay: '0s',     offset: '0px'  },
            { left: '18vw', delay: '0.3s',   offset: '14px' },
          ].map((c, i) => (
            <div key={`cl${i}`} style={{
              position: 'absolute',
              left: c.left,
              bottom: `calc(${GROUND_TOP} + ${c.offset})`,
              width: COIN_W,
              animation: mounted ? `coinSpin 1.8s ease-in-out infinite ${c.delay}` : 'none',
            }}>
              <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
            </div>
          ))}

          {/* Right side: 3 coins */}
          {[
            { right: '8vw',  delay: '0.15s', offset: '0px'  },
            { right: '18vw', delay: '0.45s', offset: '18px' },
            { right: '28vw', delay: '0.7s',  offset: '8px'  },
          ].map((c, i) => (
            <div key={`cr${i}`} style={{
              position: 'absolute',
              right: c.right,
              bottom: `calc(${GROUND_TOP} + ${c.offset})`,
              width: COIN_W,
              animation: mounted ? `coinSpin 1.9s ease-in-out infinite ${c.delay}` : 'none',
            }}>
              <img src="/retro/coin.png" style={{ width: '100%', display: 'block' }} alt="" />
            </div>
          ))}
        </div>

        {/* ── z7 CHARACTER ──
            Anchored to same GROUND_TOP.
            Width = CHAR_W which is visually ~1.5× the coin.
            Centre-right position for cinematic composition (rule of thirds).
            The entrance slides in from the left.
        ── */}
        <div style={{
          position: 'absolute',
          bottom: GROUND_TOP,
          // Rule-of-thirds: 55% from left = slightly right of centre
          left: '50%',
          width: CHAR_W,
          zIndex: 7,
          opacity: mounted ? 1 : 0,
          // Entrance: slide in from left, settle at -50% (centred on anchor point)
          transform: mounted
            ? 'translateX(-50%)'
            : 'translateX(calc(-50% - 120px))',
          transition: `opacity 0.8s ${easeAgg} 0.35s, transform 1.0s ${easeAgg} 0.35s`,
        }}>

          {/* Ground shadow — positional depth cue */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            width: '65%',
            height: '10px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
            transformOrigin: 'center',
            animation: mounted ? 'shadowSync 3s ease-in-out infinite' : 'none',
          }} />

          {/* Character with 3-D float animation */}
          <div style={{
            filter: 'drop-shadow(3px 5px 0px rgba(0,0,0,0.5))',
            animation: mounted ? 'charFloat 3s ease-in-out infinite' : 'none',
            transformOrigin: 'bottom center',
          }}>
            <img src="/retro/character.png" alt="Character"
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

      </div>

      {/* ── TOP SCRIM (keeps text readable) ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.06) 28%, transparent 44%)',
        opacity: mounted ? 1 : 0,
        transition: `opacity 1s ${ease}`,
      }} />

      {/* ── TYPOGRAPHY ── */}
      <div style={{
        position: 'absolute', top: '6dvh', left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        padding: '0 16px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) skewX(0deg)' : 'translateY(-16px) skewX(-3deg)',
        filter: mounted ? 'blur(0px)' : 'blur(6px)',
        transition: `all 1.1s ${easeAgg} 0.3s`,
      }}>
        {/* Eyebrow */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(0.5rem, 1.4vw, 0.68rem)',
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
        }}>
          retro world
        </span>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 'clamp(1.05rem, 4.2vw, 3rem)',
          margin: 0, fontWeight: 400, lineHeight: 1.3,
          textShadow: '0 4px 0px #000',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(6px, 1.8vw, 16px)',
        }}>
          <span style={{ color: '#FACC15' }}>pixels</span>
          <span style={{ color: '#FFFFFF' }}>never died</span>
        </h2>
      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface LoadingAnimationProps {
  progress?: number;
}

/* ═══════════════════════════════════════════════════════════════
   REAL PHYSICS ENGINE
   
   We simulate actual projectile motion:
   - Fall: h = ½gt²  →  t = √(2h/g)
   - Bounce coefficient of restitution e = 0.62
   - Each bounce: v_after = e × v_before
   - Rise height: h = v²/2g
   
   The TRANSFORMATION begins EXACTLY at ground impact and
   completes when the object reaches the TOP of its rise arc.
   pathLength animates from 0→1 over the exact rise duration.
═══════════════════════════════════════════════════════════════ */
const FALL_HEIGHT_PX  = 200;     // pixels from start to ground
const GRAVITY         = 1800;    // px/s²  (felt gravity)
const RESTITUTION     = 0.60;    // bounce energy kept (0–1)
const MIN_BOUNCE_VEL  = 60;      // px/s — below this, settle

// Derived — fall time in seconds
const fallTime = Math.sqrt((2 * FALL_HEIGHT_PX) / GRAVITY);
// Impact velocity
const impactVel = GRAVITY * fallTime;

/* ═══════════════════════════════════════════════════════════════
   SVG HELPERS
═══════════════════════════════════════════════════════════════ */
const C = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1 0 ${r * 2},0 a${r},${r} 0 1 0 ${-r * 2},0`;

const R = (x: number, y: number, w: number, h: number, rx = 0) => {
  const r = Math.min(rx, w / 2, h / 2);
  if (!r) return `M${x},${y}h${w}v${h}h${-w}z`;
  return `M${x+r},${y}h${w-2*r}a${r},${r} 0 0 1 ${r},${r}v${h-2*r}a${r},${r} 0 0 1 ${-r},${r}h${-(w-2*r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h-2*r)}a${r},${r} 0 0 1 ${r},${-r}z`;
};

interface PD {
  d: string;
  sw?: number;
  op?: number;
  fill?: string;
}

interface IconDef {
  id: string;
  label: string;
  paths: PD[];
  // rotation for the falling object (-ve = CCW, +ve = CW)
  fallRotate?: number;
}

/* ═══════════════════════════════════════════════════════════════
   5 DETAILED ICONS — viewBox "-5 -10 110 120"
═══════════════════════════════════════════════════════════════ */
const ICONS: IconDef[] = [

  /* ── 1. CHESS KNIGHT ──────────────────────────────────────── */
  {
    id: 'chess', label: 'CHESS', fallRotate: -8,
    paths: [
      // base thick plate
      { d: R(18,83,64,11,5) },
      // base mid tier
      { d: R(24,75,52,10,3) },
      // body left side
      { d: 'M37 75 C33 64 29 51 31 39 C33 30 38 25 41 20' },
      // body right side
      { d: 'M53 75 C57 64 61 51 59 39 C57 30 52 25 49 20' },
      // chest plate
      { d: 'M32 57 Q45 52 58 57' },
      // belly plate
      { d: 'M31 67 Q45 62 59 67' },
      // neck left
      { d: 'M41 20 C39 15 36 11 36 7 C36 3 38 1 40 1' },
      // neck right
      { d: 'M49 20 C51 15 54 11 54 7 C54 3 52 1 50 1' },
      // top of head join
      { d: 'M40 1 C43 0 47 0 50 1' },
      // left face — horse profile
      { d: 'M36 7 C30 5 24 8 22 15 C20 22 22 30 27 34 C29 36 33 38 33 44' },
      // snout lower
      { d: 'M22 21 C15 21 11 26 13 33 C15 38 22 40 27 38 C30 37 33 36 33 44' },
      // ear
      { d: 'M40 1 C40 -4 45 -5 47 -2 C48 0 47 3 45 4' },
      // nostril
      { d: C(16, 29, 2.2) },
      // eye socket
      { d: C(31, 13, 4) },
      // eye pupil
      { d: C(31, 13, 1.8), fill: 'white' },
      // mane 1
      { d: 'M45 4 C49 10 51 17 49 24', op: 0.7 },
      // mane 2
      { d: 'M48 3 C54 9 56 18 53 27', op: 0.5 },
      // bridle
      { d: 'M27 28 C33 25 40 25 45 28' },
      // neck muscle line
      { d: 'M38 18 C41 20 44 20 47 18', op: 0.6 },
      // shield cross H
      { d: 'M37 44 h16', sw: 2 },
      // shield cross V
      { d: 'M45 36 v16', sw: 2 },
      // rivet left
      { d: C(25, 79, 2), fill: 'white', op: 0.6 },
      // rivet right
      { d: C(65, 79, 2), fill: 'white', op: 0.6 },
    ],
  },

  /* ── 2. F1 RACING CAR ────────────────────────────────────── */
  {
    id: 'car', label: 'RACING', fallRotate: -4,
    paths: [
      // main body
      { d: 'M5 55 L12 37 Q23 21 40 19 L62 19 Q79 19 89 35 L95 50 L97 55 Z' },
      // nose tip
      { d: 'M5 55 L1 57 L0 63 L10 65 L13 55' },
      // cockpit tub
      { d: 'M37 32 Q45 20 53 19 L63 19 Q71 20 77 31 L75 43 L39 43 Z' },
      // cockpit inner glass
      { d: 'M41 34 Q47 24 53 23 L61 23 Q68 24 73 33 L71 39 L43 39 Z', op: 0.45 },
      // halo arch
      { d: 'M47 22 Q55 15 70 20' },
      // halo centre pin
      { d: R(53,14,7,11,3) },
      // left mirror
      { d: 'M39 27 L30 23 L28 27 L39 31' },
      // right mirror
      { d: 'M77 27 L86 23 L88 27 L77 31' },
      // rear wing blade 1
      { d: 'M82 21 L100 16', sw: 3.5 },
      // rear wing blade 2
      { d: 'M82 27 L100 22', sw: 2.2 },
      // rear wing endplate
      { d: 'M99 16 L100 43' },
      // rear wing mount strut
      { d: 'M86 33 L90 33 L92 43 L84 43' },
      // front wing main
      { d: 'M0 63 L-2 69 L22 71 L24 63' },
      // front wing cascade 1
      { d: 'M1 65 L-1 71', op: 0.5 },
      // front wing cascade 2
      { d: 'M8 66 L6 72', op: 0.5 },
      // front wing cascade 3
      { d: 'M15 67 L13 73', op: 0.5 },
      // sidepod L
      { d: 'M25 41 L21 51 L30 53 L34 43', op: 0.75 },
      // sidepod R
      { d: 'M79 39 L84 49 L92 47 L87 37', op: 0.75 },
      // sidepod L vent lines
      { d: 'M22 44 L29 46', op: 0.4, sw: 1.2 },
      { d: 'M22 47 L29 49', op: 0.4, sw: 1.2 },
      // engine cover seam L
      { d: 'M47 43 L49 57', op: 0.4, sw: 1.2 },
      // engine cover seam R
      { d: 'M55 43 L53 57', op: 0.4, sw: 1.2 },
      // diffuser
      { d: 'M83 55 L89 61 L100 61 L96 55' },
      // floor line
      { d: 'M13 55 L83 55', op: 0.35, sw: 1.2 },
      // number board
      { d: R(57,41,23,15,2), op: 0.6 },
      { d: 'M61 46 h13 M61 51 h13', op: 0.3, sw: 1.2 },
      // FRONT WHEEL
      { d: C(20,70,15) },
      { d: C(20,70,9) },
      { d: C(20,70,3.5) },
      { d: 'M20 55 L20 85', op: 0.3, sw: 1.2 },
      { d: 'M5 70 L35 70', op: 0.3, sw: 1.2 },
      // REAR WHEEL
      { d: C(85,72,17) },
      { d: C(85,72,10) },
      { d: C(85,72,4) },
      { d: 'M85 55 L85 89', op: 0.3, sw: 1.2 },
      { d: 'M68 72 L102 72', op: 0.3, sw: 1.2 },
      // speed lines
      { d: 'M0 40 L12 40', op: 0.38 },
      { d: 'M0 46 L8 46', op: 0.25 },
      { d: 'M0 52 L5 52', op: 0.15 },
    ],
  },

  /* ── 3. FOOTBALL ─────────────────────────────────────────── */
  {
    id: 'football', label: 'FOOTBALL', fallRotate: 12,
    paths: [
      // sphere
      { d: C(50,50,40) },
      // top pentagon
      { d: 'M50 18 L63 27 L58 43 L42 43 L37 27 Z' },
      // UL hexagon
      { d: 'M15 37 L28 29 L37 39 L30 53 L14 51 Z' },
      // UR hexagon
      { d: 'M85 37 L72 29 L63 39 L70 53 L86 51 Z' },
      // LL hexagon
      { d: 'M21 69 L23 55 L38 51 L44 63 L36 77 Z' },
      // LR hexagon
      { d: 'M79 69 L77 55 L62 51 L56 63 L64 77 Z' },
      // bottom pentagon
      { d: 'M50 83 L36 74 L38 60 L62 60 L64 74 Z' },
      // seam top
      { d: 'M50 10 L50 18' },
      // seam UL
      { d: 'M37 27 L28 29' },
      // seam UR
      { d: 'M63 27 L72 29' },
      // seam ML
      { d: 'M30 53 L23 55' },
      // seam MR
      { d: 'M70 53 L77 55' },
      // seam inner L-top
      { d: 'M42 43 L38 51' },
      // seam inner R-top
      { d: 'M58 43 L62 51' },
      // seam inner L-bot
      { d: 'M44 63 L38 60' },
      // seam inner R-bot
      { d: 'M56 63 L62 60' },
      // seam BL
      { d: 'M36 77 L34 90' },
      // seam BR
      { d: 'M64 77 L66 90' },
      // seam far L
      { d: 'M14 51 L10 51' },
      // seam far R
      { d: 'M86 51 L90 51' },
      // shine
      { d: 'M26 23 Q34 16 44 18', op: 0.3, sw: 1.5 },
    ],
  },

  /* ── 4. ROCKET — NOSE DOWN ↓ rotating, circle window ─────── */
  {
    id: 'rocket', label: 'SPACE', fallRotate: 360,   // full rotation while falling
    paths: [
      // ── NOSE CONE pointing DOWN ──
      { d: 'M50 95 L30 60 L30 55 L70 55 L70 60 Z' },
      // nose left ridge
      { d: 'M50 95 L30 60', op: 0.4, sw: 1.5 },
      // nose right ridge
      { d: 'M50 95 L70 60', op: 0.4, sw: 1.5 },
      // nose centre spine
      { d: 'M50 55 L50 95', op: 0.25, sw: 1 },

      // ── BODY ──
      { d: R(30,18,40,39,3) },
      // body panel line 1
      { d: 'M30 29 L70 29', op: 0.35, sw: 1.2 },
      // body panel line 2
      { d: 'M30 40 L70 40', op: 0.35, sw: 1.2 },
      // body panel line 3
      { d: 'M30 51 L70 51', op: 0.35, sw: 1.2 },
      // body vertical centre
      { d: 'M50 18 L50 55', op: 0.2, sw: 1 },

      // ── CIRCULAR PORTHOLE WINDOW ──
      { d: C(50, 35, 10) },
      { d: C(50, 35, 7) },
      { d: C(50, 35, 3), fill: 'white', op: 0.6 },
      // window cross-hairs
      { d: 'M40 35 L60 35', op: 0.35, sw: 1 },
      { d: 'M50 25 L50 45', op: 0.35, sw: 1 },
      // window shine
      { d: 'M43 28 Q47 25 52 27', op: 0.4, sw: 1.2 },

      // ── TOP CAP — engine dome (at top since nose is down) ──
      { d: 'M30 18 Q30 5 50 2 Q70 5 70 18' },
      // dome ring 1
      { d: 'M34 14 Q50 8 66 14', op: 0.5, sw: 1.5 },
      // dome ring 2
      { d: 'M38 10 Q50 6 62 10', op: 0.35, sw: 1 },
      // dome ring 3
      { d: 'M43 6 Q50 4 57 6', op: 0.25, sw: 1 },

      // ── ENGINE NOZZLE BELL at very top ──
      { d: 'M32 18 L22 3 Q50 -5 78 3 L68 18' },
      // nozzle throat
      { d: 'M36 14 Q50 9 64 14', op: 0.6, sw: 1.5 },
      // nozzle flare lines
      { d: 'M24 7 L32 16', op: 0.4, sw: 1 },
      { d: 'M76 7 L68 16', op: 0.4, sw: 1 },
      // nozzle interior circle
      { d: C(50, 10, 8), op: 0.4, sw: 1 },

      // ── FLAME firing UPWARD from engine ──
      { d: 'M32 3 Q36 -14 50 -20 Q64 -14 68 3', op: 0.9 },
      { d: 'M36 1 Q40 -12 50 -16 Q60 -12 64 1', op: 0.65 },
      { d: 'M40 -1 Q44 -10 50 -13 Q56 -10 60 -1', op: 0.45 },
      { d: 'M44 -2 Q47 -8 50 -9 Q53 -8 56 -2', op: 0.28 },
      // flame inner core
      { d: 'M46 -3 Q48 -7 50 -8 Q52 -7 54 -3', op: 0.15 },

      // ── FINS — lower body beside nose ──
      // left fin
      { d: 'M30 55 L8 74 L8 85 L30 74 Z' },
      { d: 'M30 59 L12 77', op: 0.4, sw: 1.2 },
      { d: 'M30 64 L16 79', op: 0.25, sw: 1 },
      // right fin
      { d: 'M70 55 L92 74 L92 85 L70 74 Z' },
      { d: 'M70 59 L88 77', op: 0.4, sw: 1.2 },
      { d: 'M70 64 L84 79', op: 0.25, sw: 1 },

      // ── SIDE BOOSTERS ──
      { d: R(12,38,12,20,5), op: 0.7 },
      { d: C(18,58,5), op: 0.55 },
      { d: 'M18 38 L18 33 Q18 29 22 28', op: 0.5, sw: 1.2 },
      { d: R(76,38,12,20,5), op: 0.7 },
      { d: C(82,58,5), op: 0.55 },
      { d: 'M82 38 L82 33 Q82 29 78 28', op: 0.5, sw: 1.2 },
    ],
  },

  /* ── 5. GAME CONTROLLER ──────────────────────────────────── */
  {
    id: 'controller', label: 'GAMING', fallRotate: 5,
    paths: [
      // outer body
      { d: 'M14 36 Q12 20 20 14 L34 11 Q42 9 46 18 L50 22 L54 18 Q58 9 66 11 L80 14 Q88 20 86 36 L84 64 Q80 84 65 90 L58 92 Q52 98 50 87 Q48 98 42 92 L35 90 Q20 84 16 64 Z' },
      // left grip inner
      { d: 'M16 64 Q12 76 16 84 Q20 90 32 92', op: 0.45 },
      // right grip inner
      { d: 'M84 64 Q88 76 84 84 Q80 90 68 92', op: 0.45 },
      // shoulder detail L
      { d: 'M18 20 Q16 13 22 11', op: 0.4, sw: 1.5 },
      // shoulder detail R
      { d: 'M82 20 Q84 13 78 11', op: 0.4, sw: 1.5 },
      // BUMPER L
      { d: 'M19 17 Q17 7 27 5 L40 5 Q48 5 48 13' },
      // BUMPER R
      { d: 'M81 17 Q83 7 73 5 L60 5 Q52 5 52 13' },
      // TRIGGER L
      { d: 'M21 13 Q19 2 27 0 L38 0 Q46 0 46 9', op: 0.65 },
      // TRIGGER R
      { d: 'M79 13 Q81 2 73 0 L62 0 Q54 0 54 9', op: 0.65 },

      // ── D-PAD ──
      { d: R(22,36,8,26,2) },
      { d: R(13,44,26,10,2) },
      // up arrow
      { d: 'M26 38 L23 43 L29 43 Z', fill: 'white', op: 0.8 },
      // down arrow
      { d: 'M26 60 L23 55 L29 55 Z', fill: 'white', op: 0.8 },
      // left arrow
      { d: 'M15 49 L20 46 L20 52 Z', fill: 'white', op: 0.8 },
      // right arrow
      { d: 'M37 49 L32 46 L32 52 Z', fill: 'white', op: 0.8 },

      // ── FACE BUTTONS ──
      // Y top
      { d: C(64,33,6.5) },
      { d: 'M62 29 L64 33 L66 29 M64 33 L64 38', sw: 1.8 },
      // B right
      { d: C(77,44,6.5) },
      { d: 'M74 40 L74 48 M74 40 L77.5 42 Q80 44 74 44 M74 44 L78 46.5 Q80 48 74 48', sw: 1.6 },
      // A bottom
      { d: C(64,55,6.5) },
      { d: 'M61 59 L64 51 L67 59 M62.2 56 L65.8 56', sw: 1.8 },
      // X left
      { d: C(51,44,6.5) },
      { d: 'M48 41 L54 47 M54 41 L48 47', sw: 1.8 },

      // ── LEFT ANALOG STICK ──
      { d: C(35,66,12) },
      { d: C(35,66,7) },
      { d: C(35,66,2.8) },
      { d: C(28,61,1), fill: 'white', op: 0.4 },
      { d: C(42,61,1), fill: 'white', op: 0.4 },
      { d: C(28,71,1), fill: 'white', op: 0.4 },
      { d: C(42,71,1), fill: 'white', op: 0.4 },

      // ── RIGHT ANALOG STICK ──
      { d: C(66,70,12) },
      { d: C(66,70,7) },
      { d: C(66,70,2.8) },
      { d: C(59,65,1), fill: 'white', op: 0.4 },
      { d: C(73,65,1), fill: 'white', op: 0.4 },
      { d: C(59,75,1), fill: 'white', op: 0.4 },
      { d: C(73,75,1), fill: 'white', op: 0.4 },

      // ── CENTRE UI ──
      { d: R(40,31,9,5.5,2.5) },
      { d: R(51,31,9,5.5,2.5) },
      // home button
      { d: C(50,44,7.5) },
      { d: C(50,44,4.5) },
      { d: C(50,44,1.8), fill: 'white', op: 0.7 },
      // touchpad
      { d: R(38,52,24,14,5) },
      { d: 'M50 52 L50 66', op: 0.2, sw: 1 },
      { d: C(50,59,1.8), fill: 'white', op: 0.35 },
      // speaker dots
      { d: C(43,57,1), fill: 'white', op: 0.38 },
      { d: C(43,60.5,1), fill: 'white', op: 0.38 },
      { d: C(43,64,1), fill: 'white', op: 0.38 },
      { d: C(47,57,1), fill: 'white', op: 0.38 },
      { d: C(47,60.5,1), fill: 'white', op: 0.38 },
      { d: C(47,64,1), fill: 'white', op: 0.38 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   PHYSICS: compute exact timing
═══════════════════════════════════════════════════════════════ */
function computePhysics(bounceVel: number) {
  // time to reach apex from bounce velocity: t = v/g
  const riseTime = bounceVel / GRAVITY;
  return { riseTime };
}

/* ═══════════════════════════════════════════════════════════════
   SPARK — metal shard on impact
═══════════════════════════════════════════════════════════════ */
interface Spark { id: number; tx: number; ty: number; w: number; h: number; dur: number; rot: number }

function Sparks({ tick }: { tick: number }) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (tick === 0) return;
    const s: Spark[] = Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist  = 18 + Math.random() * 65;
      return {
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist * 0.38, // flatten to ground plane
        w:  1.2 + Math.random() * 2.5,
        h:  3 + Math.random() * 9,
        dur: 0.32 + Math.random() * 0.26,
        rot: angle * (180 / Math.PI),
      };
    });
    setKey(k => k + 1);
    setSparks(s);
    const t = setTimeout(() => setSparks([]), 700);
    return () => clearTimeout(t);
  }, [tick]);

  return (
    <>
      {sparks.map(sp => (
        <motion.div
          key={`${key}-${sp.id}`}
          initial={{ x: 0, y: 0, opacity: 1, scaleY: 1 }}
          animate={{ x: sp.tx, y: sp.ty, opacity: 0, scaleY: 0.2 }}
          transition={{ duration: sp.dur, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: sp.w, height: sp.h,
            background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.3))',
            borderRadius: 1,
            marginLeft: -sp.w / 2, marginTop: -sp.h / 2,
            rotate: sp.rot + 'deg',
            boxShadow: '0 0 4px 1px rgba(255,255,255,0.9)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IMPACT RING
═══════════════════════════════════════════════════════════════ */
function ImpactRing({ tick }: { tick: number }) {
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!tick) return;
    setKey(k => k + 1); setShow(true);
    const t = setTimeout(() => setShow(false), 750);
    return () => clearTimeout(t);
  }, [tick]);
  if (!show) return null;
  return (
    <>
      {/* Primary ring */}
      <motion.div key={`r1-${key}`}
        initial={{ scaleX: 0.04, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{
          position: 'absolute', bottom: -3, left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 22, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.75)',
          boxShadow: '0 0 14px 4px rgba(255,255,255,0.22)',
          pointerEvents: 'none',
        }}
      />
      {/* Secondary slower ring */}
      <motion.div key={`r2-${key}`}
        initial={{ scaleX: 0.02, opacity: 0.5 }}
        animate={{ scaleX: 1.5, opacity: 0 }}
        transition={{ duration: 0.85, ease: 'easeOut', delay: 0.06 }}
        style={{
          position: 'absolute', bottom: -3, left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 22, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.35)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GROUND GLOW
═══════════════════════════════════════════════════════════════ */
function GroundGlow({ tick }: { tick: number }) {
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!tick) return;
    setKey(k => k + 1); setShow(true);
    const t = setTimeout(() => setShow(false), 1000);
    return () => clearTimeout(t);
  }, [tick]);
  if (!show) return null;
  return (
    <motion.div key={key}
      initial={{ opacity: 0.7, scaleX: 0.15 }}
      animate={{ opacity: 0, scaleX: 2.5 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      style={{
        position: 'absolute', bottom: -10, left: '50%',
        transform: 'translateX(-50%)',
        width: 180, height: 20,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.36) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED ICON — paths draw in during rise
═══════════════════════════════════════════════════════════════ */
function AnimatedIcon({
  icon, riseDuration, drawing,
}: {
  icon: IconDef;
  riseDuration: number;
  drawing: boolean;
}) {
  const n = icon.paths.length;

  return (
    <svg
      viewBox="-8 -28 116 140"
      width={148} height={148}
      style={{
        overflow: 'visible',
        filter:
          'drop-shadow(0 0 18px rgba(255,255,255,0.38)) drop-shadow(0 0 36px rgba(255,255,255,0.12))',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.g key={icon.id}>
          {icon.paths.map((p, i) => {
            // Stagger each path evenly across the rise duration
            const staggerDelay  = drawing ? (i / n) * riseDuration * 0.75 : i * 0.012;
            const pathDuration  = drawing ? riseDuration * 0.5  : 0.42;

            return (
              <motion.path
                key={`${icon.id}-${i}`}
                d={p.d}
                stroke="white"
                strokeWidth={p.sw ?? 2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={p.fill ?? 'none'}
                strokeOpacity={p.op ?? 1}
                fillOpacity={p.fill ? (p.op ?? 1) : 0}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{
                  pathLength: 0, opacity: 0,
                  transition: {
                    duration: 0.15,
                    delay: ((n - i) / n) * 0.12,
                    ease: 'easeIn',
                  },
                }}
                transition={{
                  pathLength: {
                    duration: pathDuration,
                    delay: staggerDelay,
                    ease: drawing ? 'linear' : 'easeInOut',
                  },
                  opacity: { duration: 0.08, delay: staggerDelay },
                }}
              />
            );
          })}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function LoadingAnimation({ progress }: LoadingAnimationProps): React.ReactElement {
  const controls = useAnimation();
  const [idx,       setIdx]       = useState(0);
  const [impactTick, setImpact]   = useState(0);
  const [drawing,   setDrawing]   = useState(false);
  const [riseDur,   setRiseDur]   = useState(0.7);
  const [rotate,    setRotate]    = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const run = async () => {
      let bounceVel = impactVel; // first impact at full drop velocity

      // Start above the bar
      controls.set({ y: -FALL_HEIGHT_PX, scaleX: 1, scaleY: 1, rotate: 0 });
      setRotate(0);

      let currentIconIdx = 0;

      while (mounted.current) {
        const currentIcon = ICONS[currentIconIdx];
        const fallRot = currentIcon.fallRotate ?? 0;

        // ── FALL WITH GRAVITY + ROTATION ──
        const ft = Math.sqrt((2 * FALL_HEIGHT_PX) / GRAVITY);

        await controls.start({
          y: 0,
          scaleX: 0.88,
          scaleY: 1.12,
          rotate: fallRot,
          transition: {
            y:      { duration: ft, ease: [0.5, 0, 1, 0.6] },
            scaleX: { duration: ft, ease: 'easeIn' },
            scaleY: { duration: ft, ease: 'easeIn' },
            rotate: { duration: ft, ease: 'linear' },
          },
        });
        if (!mounted.current) break;

        // ── SQUASH on impact ──
        setImpact(t => t + 1);

        await controls.start({
          y: 4,
          scaleX: 1.6,
          scaleY: 0.4,
          rotate: fallRot,
          transition: { duration: 0.08, ease: 'easeOut' },
        });
        if (!mounted.current) break;

        // ── TRANSFORMATION STARTS NOW — swap icon immediately ──
        const nextIdx = (currentIconIdx + 1) % ICONS.length;
        const { riseTime } = computePhysics(bounceVel);

        setDrawing(true);
        setRiseDur(riseTime);
        setIdx(nextIdx);          // ← icon changes RIGHT at ground hit

        // ── SPRING / PHYSICS RISE ──
        // We use duration-based animation matching real physics rise time
        await controls.start({
          y: -FALL_HEIGHT_PX,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,             // reset rotation as it rises
          transition: {
            y: {
              duration: riseTime,
              ease: [0, 0.8, 0.6, 1],   // ease-out (decelerate = gravity)
            },
            scaleX: { duration: riseTime * 0.3, ease: 'easeOut' },
            scaleY: { duration: riseTime * 0.3, ease: 'easeOut' },
            rotate: { duration: riseTime, ease: 'easeOut' },
          },
        });
        if (!mounted.current) break;

        setDrawing(false);

        // ── Pause at apex — icon is now fully drawn ──
        const apexPause = 380 + Math.random() * 80;
        await new Promise<void>(r => setTimeout(r, apexPause));
        if (!mounted.current) break;

        // ── Update for next cycle ──
        currentIconIdx = nextIdx;
        bounceVel = bounceVel * RESTITUTION;
        if (bounceVel < MIN_BOUNCE_VEL) bounceVel = impactVel; // reset to full drop
      }
    };

    run();
    return () => { mounted.current = false; };
  }, [controls]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#05050a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: "'Orbitron','Share Tech Mono','Space Mono',monospace",
    }}>

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage:
          'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.008) 3px,rgba(255,255,255,0.008) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255,255,255,0.018) 0%, transparent 70%)',
      }} />

      {/* ── CENTRE STAGE ── */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', zIndex: 2,
      }}>

        {/* Bouncing wrapper */}
        <motion.div
          animate={controls}
          style={{ transformOrigin: '50% 92%', position: 'relative' }}
        >
          {/* Stage label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={ICONS[idx].id + '-lbl'}
              initial={{ opacity: 0, y: -8, letterSpacing: '0.7em' }}
              animate={{ opacity: 0.26, y: 0, letterSpacing: '0.44em' }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.38 }}
              style={{
                textAlign: 'center', fontSize: 9,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                marginBottom: 4, userSelect: 'none',
              }}
            >
              {ICONS[idx].label}
            </motion.div>
          </AnimatePresence>

          {/* Icon */}
          <AnimatedIcon icon={ICONS[idx]} riseDuration={riseDur} drawing={drawing} />
        </motion.div>

        {/* Impact effects — sit exactly at the bar */}
        <div style={{
          position: 'relative', width: 1, height: 0,
          display: 'flex', justifyContent: 'center',
        }}>
          <ImpactRing  tick={impactTick} />
          <GroundGlow  tick={impactTick} />
          <Sparks      tick={impactTick} />
        </div>

        {/* ── LOADING BAR — the ground ── */}
        <div style={{ width: 260, marginTop: 0 }}>
          <div style={{
            width: '100%', height: 2,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 2, overflow: 'hidden',
            position: 'relative',
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: progress != null ? `${progress}%` : '0%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%', background: 'white', borderRadius: 2,
                boxShadow: '0 0 12px 3px rgba(255,255,255,0.6)',
              }}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 9, fontSize: 8.5,
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.16em', userSelect: 'none',
          }}>
            <span>LOADING</span>
            {progress != null && <span>{Math.round(progress)}%</span>}
          </div>
        </div>
      </div>

      {/* Stage dots */}
      <div style={{
        position: 'absolute', bottom: '8%',
        display: 'flex', gap: 14, alignItems: 'center', zIndex: 2,
      }}>
        {ICONS.map((ic, i) => (
          <motion.div key={ic.id}
            animate={{
              scale:           i === idx ? 1.9 : 1,
              opacity:         i === idx ? 1 : i < idx ? 0.4 : 0.14,
              backgroundColor: i <= idx  ? 'white' : 'transparent',
            }}
            transition={{ duration: 0.22 }}
            style={{
              width: 5, height: 5, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: idx >= 1 ? 0.18 : 0 }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute', bottom: '13%',
          fontSize: 10, letterSpacing: '0.52em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', fontWeight: 700,
          userSelect: 'none', zIndex: 2,
        }}
      >
        PLAYFUL
      </motion.div>

    </div>
  );
      }

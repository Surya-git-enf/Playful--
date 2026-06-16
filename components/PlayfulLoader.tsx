'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ObjIndex = 0 | 1 | 2 | 3 | 4

const ICON_SIZE = 140
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const RISE_DURATION = 1.4
const FALL_SETTLE_MS = 680
const MORPH_BLUR_MAX = 4

const KING_PATH_1 = "M0 0 C0.75011856 -0.00671722 1.50023712 -0.01343445 2.27308655 -0.02035522 C4.7500778 -0.03933455 7.226798 -0.04325956 9.70385742 -0.04541016 C11.43015147 -0.05183888 13.15644444 -0.0585673 14.88273621 -0.06558228 C18.50160242 -0.0775554 22.12037319 -0.08126314 25.73925781 -0.08007812 C30.36620682 -0.0798751 34.99254045 -0.10715936 39.61934376 -0.14162254 C43.18567184 -0.16391226 46.75185243 -0.16791501 50.31824303 -0.16685867 C52.02341517 -0.1692122 53.72859153 -0.17802174 55.43369484 -0.19352341 C57.82471804 -0.21322301 60.21442218 -0.20733045 62.60546875 -0.1953125 C63.65232849 -0.21217102 63.65232849 -0.21217102 64.72033691 -0.22937012 C70.12442219 -0.1606963 73.13921959 1.31796999 77.49682617 4.29052734 C81.598238 9.84727885 81.0170167 16.33839719 80.14990234 22.92626953 C79.68596943 25.57971836 79.1683453 28.21539424 78.62182617 30.85302734 C78.36079102 32.17463867 78.36079102 32.17463867 78.09448242 33.52294922 C76.97705662 39.13077132 75.75399627 44.71254291 74.49682617 50.29052734 C75.10042969 50.19964844 75.7040332 50.10876953 76.32592773 50.01513672 C107.03256441 45.44952928 107.03256441 45.44952928 114.87573242 50.61083984 C118.90733699 54.78816506 119.87574201 59.25812712 119.93261719 64.90332031 C119.95175674 66.19841522 119.9708963 67.49351013 119.99061584 68.82785034 C119.99520271 70.22946839 119.99854415 71.63109099 120.00073242 73.03271484 C120.01038512 74.48471364 120.02047845 75.93670957 120.0309906 77.38870239 C120.04890911 80.42652139 120.05451606 83.46408505 120.05273438 86.50195312 C120.05242968 90.37810103 120.09338557 94.25259805 120.145051 98.12835503 C120.17855057 101.12602122 120.18448788 104.12329394 120.1829052 107.12112808 C120.18642466 108.54919247 120.19957795 109.97726931 120.2229023 111.40514755 C120.33711665 119.11866396 120.34321429 124.91307019 115.07798767 130.87283325 C110.66269124 134.83165698 107.50866114 134.69125925 101.81323242 134.62646484 C92.63310992 134.10188642 83.50912153 132.02761465 74.49682617 131.89648438 C72.07432066 131.86078979 69.65371736 131.85097157 67.234375 131.96679688 C52.63350831 132.68113832 37.81071073 136.41349862 24.15429688 142.48828125 C18.26754049 145.13454193 12.25706413 147.4384408 6.16699219 149.35253906 C2.05956862 150.64572144 -2.04706524 151.61761475 -6.19140625 152.22265625 C-14.75472723 153.47484875 -14.75472723 153.47484875 -22.0390625 149.1875 C-26.02373948 146.85056259 -29.57222275 143.95970283 -32.875 140.75 C-36.51838693 137.17881133 -39.81861279 133.32971813 -42.71875 129.1875 C-44.63554688 126.42871094 -46.39296875 123.53515625 -48 120.5625 C-49.17509766 118.34753906 -50.21914062 116.07421875 -51.125 113.75 C-52.5578125 110.16796875 -52.5578125 110.16796875 -52.5578125 106.5625 C-52.47407227 104.83120117 -52.39033203 103.09989014 -52.30615234 101.36865234 C-52.15884766 98.26123047 -52.15884766 98.26123047 -52.15884766 95.1875 C-52.15884766 92.82162781 -52.15884766 90.45575562 -52.15884766 88.08984375 C-52.15884766 84.04980469 -52.15884766 80.00976562 -52.15884766 75.96972656 C-52.15884766 69.50443951 -52.15884766 63.03915246 -52.15884766 56.57386398 C-52.15884766 50.3544754 -52.15884766 44.13508683 -52.15884766 37.91569824 C-52.15884766 31.03012644 -52.15884766 24.14455465 -52.15884766 17.25898438 C-52.15884766 10.12997546 -52.15884766 3.00096654 -52.15884766 -4.12805176 C-52.15884766 -7.50170898 -52.15884766 -10.87536621 -52.15884766 -14.24902344 C-52.15884766 -20.9812874 -52.15884766 -27.71355136 -52.15884766 -34.44581532 C-52.15884766 -40.6710279 -52.15884766 -46.89624048 -52.15884766 -53.12145298 C-52.15884766 -58.17362548 -52.15884766 -63.22579798 -52.15884766 -68.27797048 C-52.15884766 -72.61311586 -52.15884766 -76.94826124 -52.15884766 -81.28340662 C-52.15884766 -84.32336426 -52.15884766 -87.36332189 -52.15884766 -90.40327954 C-52.15884766 -93.31974792 -52.15884766 -96.23621631 -52.15884766 -99.15268469 C-52.15884766 -102.06915307 -52.15884766 -104.98562146 -52.15884766 -107.90208984 C-52.15884766 -112.01555969 -52.15884766 -116.12902954 -52.15884766 -120.24249939 C-52.15884766 -123.71337646 -52.15884766 -127.18425354 -52.15884766 -130.65513062 C-52.15884766 -134.01370117 -52.15884766 -137.37227173 -52.15884766 -140.73084229 C-52.15884766 -143.71514282 -52.15884766 -146.69944336 -52.15884766 -149.68374389 C-52.15884766 -152.66804443 -52.15884766 -155.65234497 -52.15884766 -158.63664551 C-52.15884766 -161.62094604 -52.15884766 -164.60524658 -52.15884766 -167.58954712 C-52.15884766 -170.57384766 -52.15884766 -173.55814819 -52.15884766 -176.54244873 C-52.15884766 -179.52674927 -52.15884766 -182.5110498 -52.15884766 -185.49535034 C-52.15884766 -187.68216369 -52.15884766 -189.86897705 -52.15884766 -192.0557904 C-47.46446025 -215.34825652 -36.12162799 -235.23684442 -18.66552734 -249.34082031 C-14.15579489 -252.95374922 -9.74617844 -256.69110248 -5.53320312 -260.59179688 C-2.72480469 -263.19453125 -0.11240234 -265.8984375 0 -268.6875 L0 0 Z"

const KING_PATH_2 = "M0 0 C51.81 0 103.62 0 157 0 C155 6 155 6 154.03515625 8.796875 C146.49265834 31.69698914 145.57600259 56.63672809 145.625 80.5625 C145.62521149 81.53479553 145.62542297 82.50709106 145.62564087 83.5088501 C144.28892103 134.90990966 144.28892103 134.90990966 156 184 C156.29850022 186.20476403 156.56348288 188.41410035 156.8125 190.625 C157.98159564 200.19287868 160.33640161 209.38611163 163.07421875 218.625 C163.89407216 221.61383267 164.41162695 224.43398198 164.8125 227.5 C165.68452787 233.03668489 167.27692408 238.17097961 169.11474609 243.44262695 C170.4061717 247.16410874 171.52938333 250.85503145 172.4375 254.6875 C175.18236287 266.18161325 178.41997888 277.77203738 183.0703125 288.6484375 C184.22691477 291.5739609 185.10569465 294.54681916 186 297.5625 C187.37928522 302.1637093 188.97136977 306.47230024 190.9921875 310.82421875 C194.20708993 317.76491895 196.54575088 324.48637954 198 332 C198.66 332 199.32 332 200 332 C200.31227539 332.68513672 200.62455078 333.37027344 200.94628906 334.07617188 C202.37936979 337.21812977 203.81466801 340.35906995 205.25 343.5 C205.74113281 344.57765625 206.23226563 345.6553125 206.73828125 346.765625 C208.87401584 351.43576463 211.01638468 356.08597259 213.359375 360.65625 C215 364 215 364 215 366 C207.98784999 367.51049983 200.99839528 368.60955003 193.875 369.4375 C192.25718628 369.62590454 192.25718628 369.62590454 190.60668945 369.81811523 C187.07214618 370.22188379 183.53642375 370.61306183 180 371 C178.82131348 371.13051758 177.64262695 371.26103516 176.42822266 371.39550781 C110.07086378 378.5948659 42.20310821 378.59655753 -24.07234192 370.69113159 C-30.72753574 369.90049258 -37.39386273 369.24934748"

const ALL_PATHS: string[][] = [
  [],
  [
    "M28 30 Q50 16 72 30 L80 36 L92 44 L96 56 L92 64 L8 64 L4 56 L0 44 L8 36 Z",
    "M30 30 L38 20 L50 16 L62 20 L70 30",
    "M38 20 L42 14 L50 12 L50 20",
    "M62 20 L58 14 L50 12 L50 20",
    "M16 64 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0",
    "M64 64 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0",
    "M20 64 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0",
    "M68 64 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0",
    "M88 48 L92 48 L92 56 L88 56",
    "M4 48 L8 48 L8 56 L4 56",
    "M50 36 L50 64",
    "M12 40 L88 40",
    "M36 22 L64 22",
  ],
  [
    "M50 6 a44 44 0 1 1 0 88 a44 44 0 1 1 0 -88",
    "M50 24 L42 34 L46 46 L54 46 L58 34 Z",
    "M42 34 L28 30",
    "M58 34 L72 30",
    "M46 46 L38 60",
    "M54 46 L62 60",
    "M28 30 L24 44",
    "M24 44 L32 56",
    "M32 56 L38 60",
    "M72 30 L76 44",
    "M76 44 L68 56",
    "M68 56 L62 60",
    "M38 60 L36 74",
    "M62 60 L64 74",
    "M36 74 L44 82",
    "M64 74 L56 82",
    "M44 82 L56 82",
    "M50 6 L50 18",
    "M14 50 L24 44",
    "M86 50 L76 44",
    "M36 74 L28 80",
    "M64 74 L72 80",
  ],
  [
    "M50 110 Q52 110 54 102 L56 84 L58 60 L60 40 L62 24 L50 4 L38 24 L40 40 L42 60 L44 84 L46 102 Q48 110 50 110",
    "M50 84 a10 10 0 1 1 0 -20 a10 10 0 1 1 0 20",
    "M50 84 a6 6 0 1 1 0 -12 a6 6 0 1 1 0 12",
    "M36 58 L22 50 L20 42 L26 38 L36 44",
    "M64 58 L78 50 L80 42 L74 38 L64 44",
    "M44 28 L50 16 L56 28",
    "M47 22 L50 8 L53 22",
    "M50 14 L46 6",
    "M50 14 L54 6",
    "M50 14 L50 4",
    "M38 78 L46 78",
    "M62 78 L54 78",
  ],
  [
    "M16 48 Q10 36 16 26 Q26 16 40 14 L60 14 Q74 16 84 26 Q90 36 84 48 L82 62 Q78 74 68 80 L60 82 Q50 84 40 82 L32 80 Q22 74 18 62 Z",
    "M34 32 L44 32 M39 27 L39 37",
    "M66 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10",
    "M78 28 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10",
    "M62 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8",
    "M50 42 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8",
    "M22 18 Q28 10 36 8",
    "M78 18 Q72 10 64 8",
    "M30 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6",
    "M38 58 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6",
    "M18 36 L24 42",
    "M82 36 L76 42",
    "M44 14 L44 8 L48 4 L52 4 L56 8 L56 14",
    "M36 32 L42 32",
    "M39 29 L39 35",
  ],
]

const SVG_CONFIGS: { viewBox: string; width: number; height: number }[] = [
  { viewBox: "370 40 520 1170", width: ICON_SIZE, height: ICON_SIZE * 2.2 },
  { viewBox: "0 0 96 80", width: ICON_SIZE, height: ICON_SIZE * 0.83 },
  { viewBox: "0 0 100 92", width: ICON_SIZE, height: ICON_SIZE * 0.92 },
  { viewBox: "0 0 100 114", width: ICON_SIZE, height: ICON_SIZE * 1.14 },
  { viewBox: "0 0 100 88", width: ICON_SIZE, height: ICON_SIZE * 0.88 },
]

const STABLE_PARTICLE_DATA = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 30 + (((i * 7 + 3) % 11) / 11) * 50
  return {
    id: i,
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist - 10,
    dur: 0.35 + (((i * 3 + 5) % 8) / 8) * 0.25,
  }
})

const STABLE_BG_DOTS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1 + ((i * 11 + 3) % 10) / 10 * 2,
  dur: 3 + ((i * 7 + 2) % 10) / 10 * 4,
  delay: ((i * 13 + 1) % 10) / 10 * 3,
}))

function KingSVG() {
  return (
    <svg viewBox="370 40 520 1170" width={ICON_SIZE} height={ICON_SIZE * 2.2}>
      <path d={KING_PATH_1} fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform="translate(595.503173828125,45.70947265625)" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }} />
      <path d={KING_PATH_2} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(595.503173828125,45.70947265625)" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }} />
    </svg>
  )
}

function StaticSVG({ paths, config }: { paths: string[]; config: typeof SVG_CONFIGS[number] }) {
  return (
    <svg viewBox={config.viewBox} width={config.width} height={config.height}>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }} />
      ))}
    </svg>
  )
}

function Shockwave() {
  return (
    <motion.div
      style={{ position: "absolute", bottom: "18%", left: "50%", width: 140, height: 35, marginLeft: -70, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", pointerEvents: "none" }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 1.4, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  )
}

function GroundFlash() {
  return (
    <motion.div
      style={{ position: "absolute", bottom: "16%", left: "50%", width: 160, height: 6, marginLeft: -80, borderRadius: 3, background: "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)", pointerEvents: "none" }}
      initial={{ opacity: 1, scaleX: 0.6 }}
      animate={{ opacity: 0, scaleX: 1.3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    />
  )
}

function BurstParticles() {
  return (
    <>
      {STABLE_PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          style={{ position: "absolute", bottom: "20%", left: "50%", width: 3, height: 3, marginLeft: -1.5, borderRadius: "50%", background: "white", pointerEvents: "none" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: p.dur, ease: "easeOut" }}
        />
      ))}
    </>
  )
}

function EnergyBurst() {
  return (
    <motion.div
      style={{ position: "absolute", bottom: "18%", left: "50%", width: 50, height: 50, marginLeft: -25, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)", pointerEvents: "none" }}
      initial={{ scale: 0.4, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    />
  )
}

function Scanline() {
  return (
    <motion.div
      style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)", height: "100%", pointerEvents: "none" }}
      animate={{ y: ["-100%", "100%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  )
}

function BackgroundParticles() {
  return (
    <>
      {STABLE_BG_DOTS.map((d) => (
        <motion.div
          key={d.id}
          style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, borderRadius: "50%", background: "rgba(255,255,255,0.2)", pointerEvents: "none" }}
          animate={{ opacity: [0.08, 0.35, 0.08], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  )
}

export default function PlayfulLoader({ progress = 0 }: { progress?: number }) {
  const [objIndex, setObjIndex] = useState<ObjIndex>(0)
  const [phase, setPhase] = useState<'falling' | 'rising'>('falling')
  const [showImpact, setShowImpact] = useState(false)
  const [morphProgress, setMorphProgress] = useState(0)
  const [cycle, setCycle] = useState(0)
  const cycleRef = useRef(0)

  const nextIdx = ((objIndex + 1) % 5) as ObjIndex

  useEffect(() => {
    if (phase !== 'rising') return
    const start = Date.now()
    let raf: number
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / (RISE_DURATION * 1000), 1)
      setMorphProgress(t)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setMorphProgress(0)
        setObjIndex(prev => ((prev + 1) % 5) as ObjIndex)
        setPhase('falling')
        cycleRef.current += 1
        setCycle(cycleRef.current)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => { cancelled = true; cancelAnimationFrame(raf) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'falling') return
    let innerTimer: ReturnType<typeof setTimeout>
    const outerTimer = setTimeout(() => {
      setShowImpact(true)
      innerTimer = setTimeout(() => {
        setShowImpact(false)
        setPhase('rising')
      }, 200)
    }, FALL_SETTLE_MS)

    return () => { clearTimeout(outerTimer); clearTimeout(innerTimer) }
  }, [phase, cycle])

  const morphBlur = phase === 'rising'
    ? (morphProgress < 0.5
      ? morphProgress * 2 * MORPH_BLUR_MAX
      : (1 - morphProgress) * 2 * MORPH_BLUR_MAX)
    : 0

  const renderIcon = (idx: ObjIndex) => {
    if (idx === 0) return <KingSVG />
    return <StaticSVG paths={ALL_PATHS[idx]} config={SVG_CONFIGS[idx]} />
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#05060B", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", zIndex: 9999 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 80%, rgba(100,120,255,0.02) 0%, transparent 50%)", pointerEvents: "none" }} />

      <Scanline />
      <BackgroundParticles />

      <div style={{ position: "relative", width: ICON_SIZE, height: ICON_SIZE * 2.2 }}>
        <motion.div
          key={`morph-${cycle}-${phase}`}
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={phase === 'falling' ? { y: '-70vh', opacity: 0 } : { y: 0, opacity: 1 }}
          animate={phase === 'falling' ? { y: 0, opacity: 1 } : { y: '-38vh', opacity: 1 }}
          transition={
            phase === 'falling'
              ? { type: 'spring', stiffness: 300, damping: 26, mass: 0.8, opacity: { duration: 0.15 } }
              : { duration: RISE_DURATION, ease: EASE_OUT }
          }
        >
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase === 'rising' ? 1 - morphProgress : 1,
            filter: morphBlur > 0 ? `blur(${morphBlur}px)` : undefined,
          }}>
            {renderIcon(objIndex)}
          </div>

          {phase === 'rising' && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: morphProgress,
              filter: `blur(${morphBlur}px)`,
            }}>
              {renderIcon(nextIdx)}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showImpact && (
          <>
            <Shockwave />
            <GroundFlash />
            <BurstParticles />
            <EnergyBurst />
          </>
        )}
      </AnimatePresence>

      <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 2, background: "rgba(255,255,255,0.7)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>
          {progress}%
        </span>
      </div>
    </div>
  )
}
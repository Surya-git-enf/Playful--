'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import PalaceSequence    from './PalaceSequence'
import RetroSequence     from './RetroSequence'
import RacingSequence    from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence     from './SpaceSequence'
import { TOTAL_SNAP }    from '../hooks/useSnapScroll'

interface Props {
  section: number
  palaceFrame: React.MutableRefObject<number>
}

const VH = () => (typeof window !== 'undefined' ? window.innerHeight : 800)

export default function SceneStage({ section, palaceFrame }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const tapeRef  = useRef<HTMLDivElement>(null)
  const prevSec  = useRef(0)
  const exited   = useRef(false)

  // ── Slide tape between sections ──
  useEffect(() => {
    if (!tapeRef.current) return
    if (section >= TOTAL_SNAP) return

    gsap.to(tapeRef.current, {
      y: -section * VH(),
      duration: 0.85,
      ease: 'power3.inOut',
      overwrite: true,
    })
    prevSec.current = section
  }, [section])

  // ── Exit upward when reaching cards ──
  useEffect(() => {
    if (section < TOTAL_SNAP || exited.current) return
    exited.current = true

    gsap.to(stageRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => {
        if (stageRef.current) stageRef.current.style.display = 'none'
      },
    })
  }, [section])

  return (
    <div
      ref={stageRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: '#020510',
      }}
    >
      {/* Vertical tape — 5 panels stacked */}
      <div
        ref={tapeRef}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          // tall enough for all panels
          height: `${TOTAL_SNAP * 100}vh`,
          willChange: 'transform',
          transform: 'translateY(0)',   // explicit start so GSAP has a from value
        }}
      >
        {/* 0 — Palace */}
        <div style={{ position: 'absolute', top: '0vh', left: 0, right: 0, height: '100vh' }}>
          <PalaceSequence isActive={section === 0} palaceFrame={palaceFrame} />
        </div>

        {/* 1 — Retro */}
        <div style={{ position: 'absolute', top: '100vh', left: 0, right: 0, height: '100vh' }}>
          <RetroSequence isActive={section === 1} />
        </div>

        {/* 2 — Racing */}
        <div style={{ position: 'absolute', top: '200vh', left: 0, right: 0, height: '100vh' }}>
          <RacingSequence isActive={section === 2} />
        </div>

        {/* 3 — Open World */}
        <div style={{ position: 'absolute', top: '300vh', left: 0, right: 0, height: '100vh' }}>
          <OpenWorldSequence isActive={section === 3} />
        </div>

        {/* 4 — Space */}
        <div style={{ position: 'absolute', top: '400vh', left: 0, right: 0, height: '100vh' }}>
          <SpaceSequence isActive={section === 4} />
        </div>
      </div>
    </div>
  )
}

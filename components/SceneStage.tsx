'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import PalaceSequence from './PalaceSequence'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'
import { TOTAL_SNAP } from '../hooks/useSnapScroll'

interface Props {
  section: number
  palaceFrame: React.MutableRefObject<number>
}

export default function SceneStage({ section, palaceFrame }: Props) {
  const stageRef  = useRef<HTMLDivElement>(null)
  const tapeRef   = useRef<HTMLDivElement>(null)
  const prevSec   = useRef(0)
  const exitedRef = useRef(false)

  // -- inter-section tape slide --
  useEffect(() => {
    if (!tapeRef.current) return
    if (section >= TOTAL_SNAP) return // handled by exit animation

    const prev = prevSec.current
    const direction = section > prev ? 1 : -1

    // Animate tape to show new section
    gsap.to(tapeRef.current, {
      y: -section * window.innerHeight,
      duration: 0.85,
      ease: 'power3.inOut',
    })

    prevSec.current = section
  }, [section])

  // -- exit when reaching cards --
  useEffect(() => {
    if (section < TOTAL_SNAP || exitedRef.current) return
    exitedRef.current = true

    if (stageRef.current) {
      gsap.to(stageRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
          if (stageRef.current) {
            stageRef.current.style.display = 'none'
          }
        },
      })
    }
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
      {/* Vertical tape — 5 × 100vh panels stacked */}
      <div
        ref={tapeRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${TOTAL_SNAP * 100}vh`,
          willChange: 'transform',
        }}
      >
        {/* 0 — Palace */}
        <div className="scene-panel" style={{ top: '0' }}>
          <PalaceSequence
            isActive={section === 0}
            palaceFrame={palaceFrame}
          />
        </div>

        {/* 1 — Retro */}
        <div className="scene-panel" style={{ top: '100vh' }}>
          <RetroSequence isActive={section === 1} />
        </div>

        {/* 2 — Racing */}
        <div className="scene-panel" style={{ top: '200vh' }}>
          <RacingSequence isActive={section === 2} />
        </div>

        {/* 3 — Open World */}
        <div className="scene-panel" style={{ top: '300vh' }}>
          <OpenWorldSequence isActive={section === 3} />
        </div>

        {/* 4 — Space */}
        <div className="scene-panel" style={{ top: '400vh' }}>
          <SpaceSequence isActive={section === 4} />
        </div>
      </div>
    </div>
  )
}

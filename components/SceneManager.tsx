'use client'

import { useSceneManager } from '../hooks/useSceneManager'
import PalaceScene from './PalaceScene'
import RetroSequence from './RetroSequence'
import RacingSequence from './RacingSequence'
import OpenWorldSequence from './OpenWorldSequence'
import SpaceSequence from './SpaceSequence'
import SnapCards from './SnapCards'

export default function SceneManager() {
  const { sceneIndex, isMounted, shouldEnableBodyScroll } = useSceneManager()

  const scenes = [
    <PalaceScene key="palace" isActive={sceneIndex === 0} />,
    <RetroSequence key="retro" isActive={sceneIndex === 1} />,
    <RacingSequence key="racing" isActive={sceneIndex === 2} />,
    <OpenWorldSequence key="openworld" isActive={sceneIndex === 3} />,
    <SpaceSequence key="space" isActive={sceneIndex === 4} />,
    <SnapCards key="snapcards" isActive={sceneIndex === 5} />
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: shouldEnableBodyScroll ? 'auto' : 'hidden',
        height: shouldEnableBodyScroll ? 'auto' : '100vh',
        width: '100%',
        backgroundColor: '#020202',
        zIndex: 50
      }}
    >
      {/* Global top mask */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(2,2,2,.85) 0%, rgba(2,2,2,.2) 20%, transparent 40%)',
          zIndex: 99
        }}
      />

      {/* Current scene */}
      {scenes[sceneIndex]}
    </div>
  )
}

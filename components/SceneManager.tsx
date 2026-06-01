'use client'

import { useSceneManager } from '../hooks/useSceneManager'
import PalaceScene from './PalaceScene'
import RetroScene from './RetroScene'
import RacingScene from './RacingScene'
import OpenWorldScene from './OpenWorldScene'
import SpaceScene from './SpaceScene'
import SnapCards from './SnapCards'

export default function SceneManager() {
  const { sceneIndex, isMounted, palaceFrame, shouldEnableBodyScroll } = useSceneManager()

  // Scene components array matching the flow: Palace → Retro → Racing → Open World → Space → SnapCards
  const scenes = [
    <PalaceScene key="palace" frame={palaceFrame} isActive={sceneIndex === 0} />,
    <RetroScene key="retro" isActive={sceneIndex === 1} />,
    <RacingScene key="racing" isActive={sceneIndex === 2} />,
    <OpenWorldScene key="openworld" isActive={sceneIndex === 3} />,
    <SpaceScene key="space" isActive={sceneIndex === 4} />,
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

      {/* Crossfade overlay - handled within each scene component */}
    </div>
  )
}
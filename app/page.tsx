'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import PlayfulLoader from '../components/PlayfulLoader'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

const pad = (n: number) => String(n).padStart(4, '0')

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

function buildAssetList(): { images: string[]; videos: string[] } {
  const images: string[] = []
  const videos: string[] = []

  for (let i = 0; i <= 144; i++) {
    images.push(`/palace/palace-frame_${pad(i)}.webp`)
  }

  images.push(
    '/retro/sky.png',
    '/retro/clouds.png',
    '/retro/castle.png',
    '/retro/hills.png',
    '/retro/terrain.png',
    '/retro/character.png',
    '/retro/coin.png',
  )

  images.push(
    '/racing/bg.png',
    '/racing/car.png',
    '/racing/road.png',
  )

  images.push(
    '/openworld/ground.png',
    '/openworld/hero.png',
    '/openworld/moon.png',
    '/openworld/world.png',
  )

  images.push(
    '/space/earth.png',
    '/space/lunar-ground.png',
    '/space/astronaut.png',
  )

  images.push('/logo.png')

  videos.push(
    '/cards/play.mp4',
    '/cards/bang.mp4',
    '/cards/lego.mp4',
  )

  return { images, videos }
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.src = src
    const done = () => resolve()
    video.oncanplaythrough = done
    video.onloadeddata = done
    video.onerror = done
    setTimeout(done, 4000)
  })
}

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const heroReleasedRef = useRef(false)

  const [isLoading, setIsLoading] = useState(true)
  const [loadingOut, setLoadingOut] = useState(false)
  const [progress, setProgress] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const scrollRootRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    if (isMobileDevice()) setBlocked(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    const { images, videos } = buildAssetList()
    const total = images.length + videos.length
    let loaded = 0

    const tick = () => {
      loaded += 1
      if (!cancelled) setProgress(Math.round((loaded / total) * 100))
    }

    Promise.all([
      ...images.map((src) => preloadImage(src).then(tick)),
      ...videos.map((src) => preloadVideo(src).then(tick)),
    ]).then(() => {
      if (cancelled) return
      setTimeout(() => {
        setLoadingOut(true)
        setTimeout(() => setIsLoading(false), 600)
      }, 150)
    })

    return () => { cancelled = true }
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = document.getElementById('scroll-root')
        if (root) {
          root.scrollTo({ top: root.clientHeight, behavior: 'smooth' })
        }
      })
    })
  }, [])

  useEffect(() => {
    if (!heroReleased) return
    const root = scrollRootRef.current
    if (!root) return
    const onScroll = () => {
      if (root.scrollTop <= 5) {
        heroReleasedRef.current = false
        setHeroReleased(false)
      }
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  const showNavbar = heroReleased || currentScene === 4

  return (
    <>
      {blocked ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '24px', padding: '32px',
          width: '100vw', height: '100vh',
          boxSizing: 'border-box',
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '.9rem',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '280px',
          }}>
            Level up your experience. Turn on Desktop Mode.
          </p>
        </div>
      ) : (
        <>
          <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            zIndex: 2000, height: '70px',
            padding: '0 clamp(16px,4vw,48px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(to bottom,rgba(13,17,23,.95) 0%,transparent 100%)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            opacity: showNavbar ? 1 : 0,
            transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
            pointerEvents: showNavbar ? 'auto' : 'none',
            transition: 'all 0.45s cubic-bezier(.22,1,.36,1)',
          }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <img src="/logo.png" alt="Playful" style={{
                width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)',
                borderRadius: '12px', objectFit: 'cover',
                border: '1px solid rgba(255,122,24,.35)',
                boxShadow: '0 0 15px rgba(255,122,24,.2)',
              }} />
              <span style={{
                fontFamily: 'var(--font-orbitron)',
                fontWeight: 900, fontSize: 'clamp(.85rem,2vw,1.3rem)',
                letterSpacing: '.2em', color: '#fff',
              }}>PLAYFUL</span>
            </a>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a href="/auth" className="nbtn signin">Sign in</a>
              <a href="/auth" className="nbtn signup">Try Free</a>
            </div>
          </nav>

          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            opacity: heroReleased ? 0 : 1,
            pointerEvents: heroReleased ? 'none' : 'auto',
            transition: 'opacity 0.45s cubic-bezier(.22,1,.36,1)',
          }}>
            <HeroCanvas
              onRelease={handleRelease}
              onSceneChange={setCurrentScene}
              isReleased={heroReleased}
            />
          </div>

          <div
            ref={scrollRootRef}
            id="scroll-root"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 150,
              overflowY: heroReleased ? 'scroll' : 'hidden',
              overflowX: 'hidden',
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              background: heroReleased ? 'var(--bg)' : 'transparent',
              pointerEvents: heroReleased ? 'auto' : 'none',
            }}
          >
            <div style={{ height: '100dvh', flexShrink: 0, scrollSnapAlign: 'start' }} aria-hidden="true" />
            <div style={{ position: 'relative', zIndex: 200, background: 'var(--bg)' }}>
              <SnapCards isActive={heroReleased} />
            </div>
          </div>

          {isLoading && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 5000,
              opacity: loadingOut ? 0 : 1,
              transition: 'opacity 0.6s ease',
              pointerEvents: loadingOut ? 'none' : 'auto',
            }}>
              <PlayfulLoader progress={progress} />
            </div>
          )}
        </>
      )}
    </>
  )
}

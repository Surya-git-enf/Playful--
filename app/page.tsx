'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), { ssr: false })
const SnapCards  = dynamic(() => import('../components/SnapCards'),  { ssr: false })

const pad = (n: number) => String(n).padStart(4, '0')

// --------------------------------------------------------------
// ASSET PRELOAD LIST
// Every image referenced by the scene components, so the loader
// only disappears once everything is actually ready to paint —
// this is what prevents any flash (blue, white, or otherwise)
// when the hero scenes first become visible.
// --------------------------------------------------------------
function buildAssetList(): string[] {
  const assets: string[] = []

  // Palace canvas scrub sequence (0-144)
  for (let i = 0; i <= 144; i++) {
    assets.push(`/palace/palace-frame_${pad(i)}.webp`)
  }

  // Retro scene
  assets.push(
    '/retro/sky.png',
    '/retro/clouds.png',
    '/retro/castle.png',
    '/retro/hills.png',
    '/retro/terrain.png',
    '/retro/character.png',
    '/retro/coin.png',
  )

  // Space scene
  assets.push(
    '/space/earth.png',
    '/space/lunar-ground.png',
    '/space/astronaut.png',
  )

  // Shared UI
  assets.push('/logo.png')

  return assets
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // don't block the whole app on one missing file
    img.src = src
  })
}

export default function Home() {
  const [heroReleased, setHeroReleased] = useState(false)
  const [currentScene, setCurrentScene] = useState(0) // NEW: Track scene
  const heroReleasedRef = useRef(false)

  // ---- Loading state ----
  const [isLoading, setIsLoading] = useState(true)
  const [loadingOut, setLoadingOut] = useState(false) // controls fade-out
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  }, [])

  // Preload every asset before revealing the hero. Both the loader and
  // HeroCanvas use the same #020202 background, so even while loading
  // the canvas can mount underneath with zero visual flash.
  useEffect(() => {
    let cancelled = false
    const assets = buildAssetList()
    let loaded = 0

    Promise.all(
      assets.map((src) =>
        preloadImage(src).then(() => {
          loaded += 1
          if (!cancelled) setProgress(Math.round((loaded / assets.length) * 100))
        })
      )
    ).then(() => {
      if (cancelled) return
      // Tiny delay so the progress bar visibly reaches 100% before fading
      setTimeout(() => {
        setLoadingOut(true)
        // Remove loader from DOM after the fade transition completes
        setTimeout(() => setIsLoading(false), 600)
      }, 150)
    })

    return () => { cancelled = true }
  }, [])

  const handleRelease = useCallback(() => {
    if (heroReleasedRef.current) return
    heroReleasedRef.current = true
    setHeroReleased(true)
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }, 80)
  }, [])

  // Smoothed out scroll-back logic
  useEffect(() => {
    if (!heroReleased) return
    const onScroll = () => {
      if (window.scrollY <= 10) {
        heroReleasedRef.current = false
        setHeroReleased(false)
        document.body.style.overflow = 'hidden'
        // Using 'instant' prevents layout shifting/jumping
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroReleased])

  // NEW: Show navbar if released OR if we are on Space (Scene 4)
  const showNavbar = heroReleased || currentScene === 4

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 2000, height: '70px',
        padding: '0 clamp(16px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom,rgba(2,5,16,.95) 0%,transparent 100%)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        opacity: showNavbar ? 1 : 0,
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showNavbar ? 'auto' : 'none',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* ... Keep your existing Logo and Buttons here ... */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Playful" style={{
            width: 'clamp(36px,4vw,46px)', height: 'clamp(36px,4vw,46px)',
            borderRadius: '12px', objectFit: 'cover',
            border: '1px solid rgba(0,200,255,.3)',
            boxShadow: '0 0 15px rgba(0,234,255,.2)',
          }} />
          <span style={{
            fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)',
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
        // FIX: Removed the opacity fade entirely to prevent the black screen flash.
        // By just toggling pointerEvents, the canvas stays visually fixed in the background smoothly.
        pointerEvents: heroReleased ? 'none' : 'auto',
      }}>
        <HeroCanvas
          onRelease={handleRelease}
          onSceneChange={setCurrentScene}
          isReleased={heroReleased}
        />
      </div>

      <div style={{ height: '100vh', scrollSnapAlign: 'start' }} aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 200 }}>
        <SnapCards isActive={heroReleased} />
      </div>

      {/* ---------------------------------------------------------- */}
      {/* LOADING SCREEN — same #020202 base as HeroCanvas, so it     */}
      {/* never shows as a separate "blue" flash. It sits on top of  */}
      {/* the already-mounted canvas and simply fades out once every */}
      {/* asset in /public used by the scenes has finished loading.  */}
      {/* ---------------------------------------------------------- */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 5000,
          background: '#020202',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '28px',
          opacity: loadingOut ? 0 : 1,
          transition: 'opacity 0.6s ease',
          pointerEvents: loadingOut ? 'none' : 'auto',
        }}>
          <style>{`
            @keyframes loaderPulse {
              0%, 100% { opacity: 0.55; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.04); }
            }
          `}</style>

          <span style={{
            fontFamily: 'var(--font-orbitron,Orbitron,sans-serif)',
            fontWeight: 900,
            fontSize: 'clamp(1.4rem, 5vw, 2.4rem)',
            letterSpacing: '.3em',
            color: '#fff',
            animation: 'loaderPulse 1.6s ease-in-out infinite',
            textShadow: '0 0 24px rgba(255,255,255,0.25)',
          }}>
            PLAYFUL
          </span>

          <div style={{
            width: 'min(60vw, 260px)',
            height: '3px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(120,180,255,0.9), #ffffff)',
              borderRadius: '99px',
              transition: 'width 0.2s ease-out',
            }} />
          </div>

          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}>
            {progress}%
          </span>
        </div>
      )}
    </>
  )
      }
          

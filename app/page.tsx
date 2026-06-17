'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import PlayfulLoader from '../components/PlayfulLoader'

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
function buildAssetList(): { images: string[]; videos: string[] } {
  const images: string[] = []
  const videos: string[] = []

  // Palace canvas scrub sequence (0-144)
  for (let i = 0; i <= 144; i++) {
    images.push(`/palace/palace-frame_${pad(i)}.webp`)
  }

  // Retro scene
  images.push(
    '/retro/sky.png',
    '/retro/clouds.png',
    '/retro/castle.png',
    '/retro/hills.png',
    '/retro/terrain.png',
    '/retro/character.png',
    '/retro/coin.png',
  )

  // Racing scene
  images.push(
    '/racing/bg.png',
    '/racing/car.png',
    '/racing/road.png',
  )

  // Open World scene
  images.push(
    '/openworld/ground.png',
    '/openworld/hero.png',
    '/openworld/moon.png',
    '/openworld/world.png',
  )

  // Space scene
  images.push(
    '/space/earth.png',
    '/space/lunar-ground.png',
    '/space/astronaut.png',
  )

  // Shared UI
  images.push('/logo.png')

  // SnapCards background videos
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
    img.onerror = () => resolve() // don't block the whole app on one missing file
    img.src = src
  })
}

// Videos can't be "preloaded" the same way images can — we just ask the
// browser to fetch enough to start playback (metadata + some buffer) so
// the SnapCards section doesn't show a blank/black frame on first paint.
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
    // Safety timeout — large videos shouldn't hold up the whole loader
    setTimeout(done, 4000)
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
    // Keep body itself non-scrollable at all times — all scrolling
    // is handled by the #scroll-root container above.
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  }, [])

  // Preload every asset before revealing the hero. Both the loader and
  // HeroCanvas use the same #020202 background, so even while loading
  // the canvas can mount underneath with zero visual flash.
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = document.getElementById('scroll-root')
        if (root) {
          root.scrollTo({ top: root.clientHeight, behavior: 'smooth' })
        }
      })
    })
  }, [])

  // Scroll-back: when user scrolls to top, re-lock hero
  useEffect(() => {
    if (!heroReleased) return
    const root = document.getElementById('scroll-root')
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
        opacity: heroReleased ? 0 : 1,
        pointerEvents: heroReleased ? 'none' : 'auto',
        transition: 'opacity 0.5s ease',
      }}>
        <HeroCanvas
          onRelease={handleRelease}
          onSceneChange={setCurrentScene}
          isReleased={heroReleased}
        />
      </div>

      {/* ── SCROLLABLE SNAP CONTAINER ──────────────────────────────
          This wrapper is the scroll-snap root. It only becomes
          scrollable once heroReleased flips to true (overflow hidden
          → scroll). The fixed HeroCanvas sits behind it visually
          because its z-index (100) is below the nav (2000) but the
          container itself is transparent until the placeholder div.
      ─────────────────────────────────────────────────────────── */}
      <div
        id="scroll-root"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          overflowY: heroReleased ? 'scroll' : 'hidden',
          overflowX: 'hidden',
          scrollSnapType: 'y proximity',
          scrollBehavior: 'smooth',
          background: heroReleased ? '#020510' : 'transparent',
          pointerEvents: heroReleased ? 'auto' : 'none',
        }}
      >
        {/* Hero placeholder — same height as the viewport */}
        <div style={{ height: '100vh', flexShrink: 0, scrollSnapAlign: 'start' }} aria-hidden="true" />

        {/* All card sections */}
        <div style={{ position: 'relative', zIndex: 200, background: '#020510' }}>
          <SnapCards isActive={heroReleased} />
        </div>
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
          opacity: loadingOut ? 0 : 1,
          transition: 'opacity 0.6s ease',
          pointerEvents: loadingOut ? 'none' : 'auto',
        }}>
          <PlayfulLoader progress={progress} />
        </div>
      )}
    </>
  )
        }


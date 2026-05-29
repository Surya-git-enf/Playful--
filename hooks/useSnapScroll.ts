
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const TOTAL_SNAP = 5   // sections 0-4 are cinematic; 5+ = free scroll
const LOCK_MS       = 900
const PALACE_FRAMES = 144     // 0..144
const PALACE_STEP   = 8       // frames per wheel tick

export function useSnapScroll() {
  const [section, setSection]     = useState(0)
  const sectionRef                = useRef(0)   // mirror — readable inside closures without stale state
  const locked                    = useRef(false)
  const palaceFrame               = useRef(0)

  // keep ref in sync
  useEffect(() => { sectionRef.current = section }, [section])

  const go = useCallback((dir: 1 | -1) => {
    if (locked.current) return
    const next = sectionRef.current + dir
    if (next < 0 || next > TOTAL_SNAP) return
    locked.current = true
    setTimeout(() => { locked.current = false }, LOCK_MS)
    sectionRef.current = next
    setSection(next)
  }, [])

  // ── single effect, no section dependency ──────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // After cinematic is done let the page scroll naturally
      if (sectionRef.current >= TOTAL_SNAP) return
      e.preventDefault()
      if (locked.current) return

      const down = e.deltaY > 0

      // Palace sub-scroll: consume frames before advancing
      if (sectionRef.current === 0) {
        if (down && palaceFrame.current < PALACE_FRAMES) {
          palaceFrame.current = Math.min(PALACE_FRAMES, palaceFrame.current + PALACE_STEP)
          return
        }
        if (!down && palaceFrame.current > 0) {
          palaceFrame.current = Math.max(0, palaceFrame.current - PALACE_STEP)
          return
        }
      }

      go(down ? 1 : -1)
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent) => {
      if (sectionRef.current >= TOTAL_SNAP) return
      const delta = touchY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 50 || locked.current) return
      const down = delta > 0

      if (sectionRef.current === 0) {
        if (down && palaceFrame.current < PALACE_FRAMES) {
          palaceFrame.current = Math.min(PALACE_FRAMES, palaceFrame.current + PALACE_STEP * 3)
          return
        }
        if (!down && palaceFrame.current > 0) {
          palaceFrame.current = Math.max(0, palaceFrame.current - PALACE_STEP * 3)
          return
        }
      }
      go(down ? 1 : -1)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)) return
      if (sectionRef.current >= TOTAL_SNAP) return
      e.preventDefault()
      go(['ArrowDown','PageDown',' '].includes(e.key) ? 1 : -1)
    }

    // passive:false so we can call preventDefault
    window.addEventListener('wheel',      onWheel,      { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true  })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true  })
    window.addEventListener('keydown',    onKey)

    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('keydown',    onKey)
    }
  }, [go])  // go is stable (useCallback + no deps)

  // body overflow
  useEffect(() => {
    document.body.style.overflow = section >= TOTAL_SNAP ? 'auto' : 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [section])

  return { section, palaceFrame }
}

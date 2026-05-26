'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const TOTAL_SNAP = 5 // 0=pa 1=re 2=ra 3=ow 4=sp → 5=free cards

const LOCK_MS = 950
const PALACE_TOTAL = 144
const PALACE_STEP = 7 // frames advanced per wheel event

export function useSnapScroll() {
  const [section, setSection] = useState(0)
  const locked = useRef(false)
  // Exposed ref — PalaceSequence reads this in its RAF loop
  const palaceFrame = useRef(0)

  // --- transition helper ---
  const go = useCallback(
    (dir: 1 | -1) => {
      if (locked.current) return
      setSection(prev => {
        const next = prev + dir
        if (next < 0 || next > TOTAL_SNAP) return prev
        locked.current = true
        setTimeout(() => {
          locked.current = false
        }, LOCK_MS)
        return next
      })
    },
    []
  )

  // --- wheel / touch / keyboard ---
  useEffect(() => {
    // After section 5 body overflow is unlocked; stop intercepting
    if (section > TOTAL_SNAP) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (locked.current) return

      const down = e.deltaY > 0

      // Palace sub-scroll: advance frames before releasing section
      if (section === 0) {
        if (down && palaceFrame.current < PALACE_TOTAL) {
          palaceFrame.current = Math.min(PALACE_TOTAL, palaceFrame.current + PALACE_STEP)
          return // consume event, don't advance section yet
        }
        if (!down && palaceFrame.current > 0) {
          palaceFrame.current = Math.max(0, palaceFrame.current - PALACE_STEP)
          return
        }
      }

      go(down ? 1 : -1)
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 45 || locked.current) return
      const down = delta > 0

      if (section === 0) {
        if (down && palaceFrame.current < PALACE_TOTAL) {
          palaceFrame.current = Math.min(PALACE_TOTAL, palaceFrame.current + PALACE_STEP * 2)
          return
        }
        if (!down && palaceFrame.current > 0) {
          palaceFrame.current = Math.max(0, palaceFrame.current - PALACE_STEP * 2)
          return
        }
      }

      go(down ? 1 : -1)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) return
      e.preventDefault()
      if (locked.current) return
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key)
      go(down ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [section, go])

  // --- body overflow control ---
  useEffect(() => {
    document.body.style.overflow = section >= TOTAL_SNAP ? 'auto' : 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [section])

  return { section, palaceFrame }
}


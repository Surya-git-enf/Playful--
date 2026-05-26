'use client'

import { useRef, useState } from 'react'

const PROMPTS = [
  'Describe the game you want to build...',
  'A cinematic space shooter with neon plasma trails...',
  'A 3D off-road mountain climbing challenge...',
  'A fast-paced futuristic racing arena...',
  'A physics-based puzzle world in cyan and magenta...',
]

export default function PromptPanel() {
  const [value, setValue] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotate placeholder
  const startRotate = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (value.trim() !== '') return
      setPhIdx(i => (i + 1) % PROMPTS.length)
    }, 3200)
  }
  const stopRotate = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  // Start on mount
  if (typeof window !== 'undefined' && !intervalRef.current) startRotate()

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="prompt-panel">
      {/* Glass card */}
      <div className="prompt-glass">
        <div className="prompt-inner">
          <textarea
            ref={textareaRef}
            className="prompt-input"
            value={value}
            onChange={handleInput}
            placeholder={PROMPTS[phIdx]}
            rows={1}
            aria-label="Game description prompt"
          />
          <button className="prompt-btn" aria-label="Build game">
            Build it
          </button>
        </div>
      </div>

      {/* Action caps */}
      <div className="prompt-caps">
        <button className="prompt-cap cap-prompt">
          🎤&nbsp; Prompt it
        </button>
        <button className="prompt-cap cap-build">
          ⚡&nbsp; Build it
        </button>
        <button className="prompt-cap cap-pub">
          🚀&nbsp; Publish it
        </button>
      </div>
    </div>
  )
}


'use client'

const pad = (n: number) => String(n).padStart(4, '0')

export default function PalaceScene({ frame = 0, isActive }: { frame?: number; isActive: boolean }) {
  const currentFrame = Math.min(Math.max(0, frame), 144)
  const imageSrc = `/palace/palace-frame_${pad(currentFrame)}.webp`

  const showText = currentFrame >= 100
  const textProgress = showText ? Math.min(1, (currentFrame - 100) / 44) : 0

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      backgroundColor: '#020202',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <img
        src={imageSrc}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', display: 'block',
        }}
      />

      {/* Headline fades in at frame 100 */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '50%',
        transform: `translateX(-50%) translateY(${(1 - textProgress) * 24}px)`,
        opacity: textProgress,
        textAlign: 'center', pointerEvents: 'none', zIndex: 10,
        willChange: 'opacity, transform',
      }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
          color: '#fff',
          textShadow: '0 4px 40px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap', lineHeight: 1,
          margin: 0,
        }}>
          Kingdoms Never Sleep
        </h2>
      </div>
    </div>
  )
}

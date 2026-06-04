'use client'

interface Props {
  isActive: boolean
}

export default function RetroSequence({ isActive }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at center, #1a0a2e 0%, #020202 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '15vh',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.85s cubic-bezier(0.65, 0, 0.35, 1)',
    }}>
      <div style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(20px)',
        filter: isActive ? 'blur(0)' : 'blur(10px)',
        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        textAlign: 'center',
        color: '#F5F5F7',
        fontFamily: "'Inter', sans-serif",
      }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const }}>
          Stage 2 · Retro
        </span>
        <h2 style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', fontWeight: 400, margin: '8px 0 0 0' }}>
          Pixels Never Died
        </h2>
      </div>
    </div>
  )
}
</div>
  )
}

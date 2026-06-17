'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#030305' }} />}>
      <AuthContent />
    </Suspense>
  )
}

function AuthContent() {
  const searchParams = useSearchParams()
  const promptFromUrl = searchParams.get('prompt') || ''
  const [promptFromStorage, setPromptFromStorage] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('playful_prompt')
    if (stored) {
      setPromptFromStorage(stored)
    }
  }, [])

  const prompt = promptFromUrl || promptFromStorage

  const [isSignUp, setIsSignUp] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signUpUsername, setSignUpUsername] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successAction, setSuccessAction] = useState('')
  const [siShowPass, setSiShowPass] = useState(false)
  const [suShowPass, setSuShowPass] = useState(false)

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')
    if (!signInEmail || !signInPassword) {
      setSignInError('Please fill in all fields.')
      return
    }
    setSignInLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSignInLoading(false)
    localStorage.removeItem('playful_prompt')
    setSuccessAction('signed in')
    setShowSuccess(true)
  }, [signInEmail, signInPassword])

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')
    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      setSignUpError('Please fill in all fields.')
      return
    }
    setSignUpLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSignUpLoading(false)
    localStorage.removeItem('playful_prompt')
    setSuccessAction('signed up')
    setShowSuccess(true)
  }, [signUpUsername, signUpEmail, signUpPassword])

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div style={{
      minHeight: '100vh', background: '#030305',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '110px 24px 32px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background layers */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: '900px', height: '900px',
          background: 'radial-gradient(circle, rgba(0,234,255,0.06) 0%, transparent 65%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          animation: 'breathe 7s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(255,122,0,0.055) 0%, transparent 65%)',
          top: '20%', right: '10%',
          animation: 'drift 11s ease-in-out infinite alternate',
        }} />
      </div>

      {/* Floating orbs */}
      {[
        { w: 340, h: 340, bg: '#00eaff', top: -80, left: -80, anim: 'orbFloat1 14s ease-in-out infinite alternate' },
        { w: 260, h: 260, bg: '#ff7a00', bottom: -60, right: -60, bottom2: undefined, anim: 'orbFloat2 18s ease-in-out infinite alternate' },
        { w: 180, h: 180, bg: '#ff4d8d', bottom: '30%', left: '5%', anim: 'orbFloat1 22s ease-in-out infinite alternate-reverse', opacity: 0.1 },
      ].map((o, i) => (
        <div key={i} style={{
          position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          filter: 'blur(60px)', opacity: o.opacity ?? 0.18,
          width: o.w, height: o.h, background: o.bg,
          top: o.top, left: o.left, bottom: o.bottom,
          right: (o as any).right,
          animation: o.anim,
        }} />
      ))}

      {/* Grid lines */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,234,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,234,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 80%)',
      }} />

      {/* Keyframes */}
      <style>{`
        @keyframes breathe {
          from { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
          to   { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-40px, 30px) scale(1.12); }
        }
        @keyframes orbFloat1 { from { transform: translate(0, 0); } to { transform: translate(40px, 60px); } }
        @keyframes orbFloat2 { from { transform: translate(0, 0); } to { transform: translate(-50px, -40px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes liquidFlow { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
        @keyframes shineSweep { 0% { left: -100%; } 22% { left: 200%; } 100% { left: 200%; } }
        @keyframes modalPop { from { transform: scale(0.82) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes iconBounce { from { transform: scale(0.3) rotate(-15deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(108vh) rotate(720deg) scale(0.7); opacity: 0; }
        }
      `}</style>

      {/* Brand */}
      <Link href="/" style={{
        position: 'fixed', top: 28, left: 28,
        display: 'flex', alignItems: 'center', gap: 12,
        textDecoration: 'none', zIndex: 10,
      }}>
        <img
          src="/logo.png" alt="Playful"
          style={{
            width: 45, height: 45, borderRadius: 12, objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 0 20px rgba(0,234,255,0.15)',
          }}
        />
        <span style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2.2rem',
          color: '#fff', letterSpacing: '0.05em',
        }}>Playful</span>
      </Link>

      {/* Auth card with flip */}
      <div style={{
        width: 'min(90vw, 440px)', perspective: '1400px',
        position: 'relative', zIndex: 5, marginTop: 6,
      }}>
        <div style={{
          width: '100%', minHeight: 640, position: 'relative',
          transformStyle: 'preserve-3d' as any,
          transition: `transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)`,
          transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front — Sign In */}
          <div style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(10, 12, 22, 0.95)',
            backdropFilter: 'blur(32px) saturate(180%)',
            borderRadius: 28, padding: '44px 40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.80), inset 0 1px 1px rgba(255,255,255,0.10)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            {/* Border gradient */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28, padding: '1.5px',
              background: 'linear-gradient(160deg, rgba(0,234,255,0.55) 0%, rgba(255,255,255,0.18) 18%, transparent 42%, rgba(255,122,0,0.20) 72%, rgba(255,255,255,0.14) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor' as any,
              maskComposite: 'exclude' as any,
              pointerEvents: 'none', zIndex: 0,
            }} />
            {/* Top glow */}
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(0,234,255,0.6), transparent)',
              borderRadius: '0 0 40px 40px', pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2.9rem',
                marginBottom: 6, textAlign: 'center', fontWeight: 400, letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(0,234,255,0.85) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Welcome Back</h2>
              <div style={{
                width: 48, height: 2, margin: '0 auto 26px', borderRadius: 2,
                background: 'linear-gradient(90deg, transparent, #00eaff, transparent)',
              }} />
              <p style={{
                textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.48)',
                marginBottom: 28, letterSpacing: '0.06em', textTransform: 'uppercase' as any,
              }}>Resume your Adventure.</p>

              {signInError && (
                <div style={{
                  background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.28)',
                  color: '#ff3366', padding: '10px 14px', borderRadius: 10, fontSize: '0.74rem',
                  marginBottom: 18, textAlign: 'center',
                  animation: 'slideDown 0.3s ease',
                }}>{signInError}</div>
              )}

              <form onSubmit={handleSignIn} noValidate>
                <InputField
                  type="email" value={signInEmail} onChange={setSignInEmail}
                  label="Email address" id="si-email"
                />
                <PasswordInput
                  value={signInPassword} onChange={setSignInPassword}
                  show={siShowPass} onToggle={() => setSiShowPass(!siShowPass)}
                  id="si-password" label="Password"
                />
                <button type="submit" disabled={signInLoading} style={{
                  width: '100%', padding: 17, marginTop: 8, border: 'none', borderRadius: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  fontSize: '0.88rem', textTransform: 'uppercase' as any, letterSpacing: '0.08em',
                  color: '#0a0a0a', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
                  backgroundSize: '400% 100%',
                  animation: 'liquidFlow 5s linear infinite',
                  boxShadow: '0 4px 24px rgba(0,234,255,0.18)',
                  opacity: signInLoading ? 0.7 : 1,
                  transition: 'transform 0.2s, opacity 0.2s',
                }}>
                  <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {signInLoading && <span style={{
                      width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.18)',
                      borderTopColor: 'rgba(0,0,0,0.9)', animation: 'spin 0.75s linear infinite',
                      display: 'inline-block',
                    }} />}
                    Sign In
                  </span>
                  <span style={{
                    position: 'absolute', top: 0, left: '-100%', width: '45%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
                    transform: 'skewX(-22deg)', animation: 'shineSweep 3.5s infinite ease-in-out',
                  }} />
                </button>
              </form>

              <p style={{ marginTop: 22, textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                No account?{' '}
                <button onClick={() => { setIsSignUp(true); setSignUpError('') }} style={{
                  background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 'inherit',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                }}>Sign up for free</button>
              </p>
            </div>
          </div>

          {/* Back — Sign Up */}
          <div style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'rgba(10, 12, 22, 0.95)',
            backdropFilter: 'blur(32px) saturate(180%)',
            borderRadius: 28, padding: '44px 40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.80), inset 0 1px 1px rgba(255,255,255,0.10)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28, padding: '1.5px',
              background: 'linear-gradient(160deg, rgba(255,122,0,0.55) 0%, rgba(255,255,255,0.18) 18%, transparent 42%, rgba(0,234,255,0.20) 72%, rgba(255,255,255,0.14) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor' as any,
              maskComposite: 'exclude' as any,
              pointerEvents: 'none', zIndex: 0,
            }} />
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,122,0,0.6), transparent)',
              borderRadius: '0 0 40px 40px', pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2.9rem',
                marginBottom: 6, textAlign: 'center', fontWeight: 400, letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,122,0,0.85) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Be a Creator</h2>
              <div style={{
                width: 48, height: 2, margin: '0 auto 26px', borderRadius: 2,
                background: 'linear-gradient(90deg, transparent, #ff7a00, transparent)',
              }} />
              <p style={{
                textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.48)',
                marginBottom: 28, letterSpacing: '0.06em', textTransform: 'uppercase' as any,
              }}>Stop Playing. Start Creating.</p>

              {signUpError && (
                <div style={{
                  background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.28)',
                  color: '#ff3366', padding: '10px 14px', borderRadius: 10, fontSize: '0.74rem',
                  marginBottom: 18, textAlign: 'center',
                  animation: 'slideDown 0.3s ease',
                }}>{signUpError}</div>
              )}

              {prompt && (
                <div style={{
                  background: 'rgba(0,234,255,0.06)', border: '1px solid rgba(0,234,255,0.18)',
                  borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  <span style={{ color: '#00eaff', fontWeight: 700 }}>Your prompt:</span>{' '}
                  <span style={{ color: '#fff' }}>{prompt}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} noValidate>
                <InputField
                  type="text" value={signUpUsername} onChange={setSignUpUsername}
                  label="Username" id="su-username"
                />
                <InputField
                  type="email" value={signUpEmail} onChange={setSignUpEmail}
                  label="Email address" id="su-email"
                />
                <PasswordInput
                  value={signUpPassword} onChange={setSignUpPassword}
                  show={suShowPass} onToggle={() => setSuShowPass(!suShowPass)}
                  id="su-password" label="Password"
                />
                <button type="submit" disabled={signUpLoading} style={{
                  width: '100%', padding: 17, marginTop: 8, border: 'none', borderRadius: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  fontSize: '0.88rem', textTransform: 'uppercase' as any, letterSpacing: '0.08em',
                  color: '#0a0a0a', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
                  backgroundSize: '400% 100%',
                  animation: 'liquidFlow 5s linear infinite',
                  boxShadow: '0 4px 24px rgba(0,234,255,0.18)',
                  opacity: signUpLoading ? 0.7 : 1,
                  transition: 'transform 0.2s, opacity 0.2s',
                }}>
                  <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {signUpLoading && <span style={{
                      width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.18)',
                      borderTopColor: 'rgba(0,0,0,0.9)', animation: 'spin 0.75s linear infinite',
                      display: 'inline-block',
                    }} />}
                    Create Account
                  </span>
                  <span style={{
                    position: 'absolute', top: 0, left: '-100%', width: '45%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
                    transform: 'skewX(-22deg)', animation: 'shineSweep 3.5s infinite ease-in-out',
                  }} />
                </button>
              </form>

              <p style={{ marginTop: 22, textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                Already have an account?{' '}
                <button onClick={() => { setIsSignUp(false); setSignInError('') }} style={{
                  background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 'inherit',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                }}>Sign in</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', zIndex: 9999, padding: 24,
          backdropFilter: 'blur(12px)', animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: 'min(92vw, 480px)', background: 'rgba(10,12,22,0.97)',
            borderRadius: 28, padding: '44px 32px 36px', textAlign: 'center',
            boxShadow: '0 40px 100px rgba(0,0,0,0.90), 0 0 0 1px rgba(0,234,255,0.18)',
            position: 'relative', overflow: 'hidden',
            animation: 'modalPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at top, rgba(0,234,255,0.12) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 1.5,
              background: 'linear-gradient(90deg, transparent, rgba(0,234,255,0.7), transparent)',
            }} />
            <div style={{ fontSize: '3.8rem', marginBottom: 12, position: 'relative', zIndex: 1,
              animation: 'iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            }}>🎉</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2.3rem',
              marginBottom: 12, letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #fff 0%, rgba(0,234,255,0.9) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              position: 'relative', zIndex: 1,
            }}>You&apos;re In!</h2>
            <p style={{
              color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, fontSize: '0.95rem',
              position: 'relative', zIndex: 1, marginBottom: 28,
            }}>
              You&apos;ve successfully <strong>{successAction}</strong> to <strong>Playful</strong>.<br />
              {prompt && <>Your game prompt is saved and ready to go.</>}
              {!prompt && <>Start building something amazing.</>}
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
              textTransform: 'uppercase' as any, letterSpacing: '0.08em', color: '#0a0a0a',
              background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
              backgroundSize: '400% 100%', animation: 'liquidFlow 5s linear infinite',
              boxShadow: '0 4px 24px rgba(0,234,255,0.18)',
            }}>
              {prompt ? 'Go Build' : 'Back to Home'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reusable input components ──

function InputField({ type, value, onChange, label, id }: {
  type: string; value: string; onChange: (v: string) => void; label: string; id: string
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 18 }}>
      <input
        type={type} id={id} placeholder=" " required
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.14)',
          padding: '17px 16px', borderRadius: 14, color: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none',
          transition: 'all 0.3s ease',
        }}
        onFocus={e => {
          e.currentTarget.style.background = 'rgba(0,234,255,0.04)'
          e.currentTarget.style.borderColor = '#00eaff'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,234,255,0.07), 0 0 20px rgba(0,234,255,0.06)'
        }}
        onBlur={e => {
          if (!e.currentTarget.value) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />
      <label htmlFor={id} style={{
        position: 'absolute', left: 16, top: value ? 0 : '50%',
        transform: value ? 'translateY(-50%)' : 'translateY(-50%)',
        color: value ? '#00eaff' : 'rgba(255,255,255,0.38)',
        fontSize: value ? '0.68rem' : '0.82rem',
        pointerEvents: 'none', transition: '0.22s cubic-bezier(0.4, 0, 0.2, 1) all',
        background: value ? 'rgba(10,12,22,0.98)' : 'transparent',
        padding: '0 4px', letterSpacing: value ? '0.05em' : '0',
      }}>{label}</label>
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, id, label }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; id: string; label: string
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 18 }}>
      <input
        type={show ? 'text' : 'password'} id={id} placeholder=" " required
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.14)',
          padding: '17px 52px 17px 16px', borderRadius: 14, color: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none',
          transition: 'all 0.3s ease',
        }}
        onFocus={e => {
          e.currentTarget.style.background = 'rgba(0,234,255,0.04)'
          e.currentTarget.style.borderColor = '#00eaff'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,234,255,0.07), 0 0 20px rgba(0,234,255,0.06)'
        }}
        onBlur={e => {
          if (!e.currentTarget.value) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />
      <label htmlFor={id} style={{
        position: 'absolute', left: 16, top: value ? 0 : '50%',
        transform: value ? 'translateY(-50%)' : 'translateY(-50%)',
        color: value ? '#00eaff' : 'rgba(255,255,255,0.38)',
        fontSize: value ? '0.68rem' : '0.82rem',
        pointerEvents: 'none', transition: '0.22s cubic-bezier(0.4, 0, 0.2, 1) all',
        background: value ? 'rgba(10,12,22,0.98)' : 'transparent',
        padding: '0 4px', letterSpacing: value ? '0.05em' : '0',
      }}>{label}</label>
      <button type="button" onClick={onToggle} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        width: 34, height: 34, border: 'none', background: 'transparent',
        color: 'rgba(255,255,255,0.65)', cursor: 'pointer', display: 'grid',
        placeItems: 'center', borderRadius: 10,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  )
}

'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#030305' }} />}>
      <AuthContent />
    </Suspense>
  )
}

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const promptFromUrl = searchParams.get('prompt') || ''
  const [promptFromStorage, setPromptFromStorage] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [isSignUp, setIsSignUp] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signUpUsername, setSignUpUsername] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirm, setSignUpConfirm] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [siShowPass, setSiShowPass] = useState(false)
  const [suShowPass, setSuShowPass] = useState(false)
  const [suConfirmShowPass, setSuConfirmShowPass] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<any[]>([])

  const prompt = promptFromUrl || promptFromStorage

  useEffect(() => {
    const stored = localStorage.getItem('playful_prompt')
    if (stored) setPromptFromStorage(stored)
  }, [])

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const { data } = await supabase.auth.getSession()
        if (mounted && data?.session) {
          router.replace('/dashboard')
          return
        }
      } catch {}
      if (mounted) setCheckingAuth(false)
    }
    check()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/dashboard')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [router])

  function launchConfetti() {
    const colors = ['#00eaff', '#ff7a00', '#ffffff', '#ff4d8d', '#ffe066', '#b388ff', '#69ff47']
    const pieces: any[] = []
    for (let i = 0; i < 72; i++) {
      const color = colors[i % colors.length]
      const size = 7 + Math.random() * 11
      const isCircle = Math.random() > 0.25
      pieces.push({
        id: i,
        left: 50 + (Math.random() - 0.5) * 90,
        width: size,
        height: isCircle ? size : size * 0.55,
        background: color,
        borderRadius: isCircle ? '50%' : '3px',
        duration: 2.2 + Math.random() * 2.2,
        delay: Math.random() * 0.5,
        shadow: `0 0 ${isCircle ? 6 : 2}px ${color}66`,
      })
    }
    setConfettiPieces(pieces)
    setTimeout(() => setConfettiPieces([]), 5000)
  }

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')
    let hasError = false
    if (!signInEmail) hasError = true
    if (!signInPassword) hasError = true
    if (hasError) { setSignInError('Please fill out all highlighted fields.'); return }

    setSignInLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      })
      if (error) {
        setSignInError(error.message)
      } else {
        setShowToast(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1400)
      }
    } catch {
      setSignInError('Something went wrong. Please try again.')
    } finally {
      setSignInLoading(false)
    }
  }, [signInEmail, signInPassword, router])

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')
    let hasError = false
    if (!signUpUsername) hasError = true
    if (!signUpEmail) hasError = true
    if (!signUpPassword) hasError = true
    if (!signUpConfirm) hasError = true
    if (hasError) { setSignUpError('Please fill out all highlighted fields.'); return }

    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match.')
      return
    }

    setSignUpLoading(true)
    try {
      setSignUpLoading(true)
      const { data: isTaken, error: checkError } = await supabase.rpc('check_username_taken', { uname: signUpUsername.trim() })
      if (isTaken) {
        setSignUpError('Username already exists. Please choose another.')
        setSignUpLoading(false)
        return
      }

      setSignUpLoading(true)
      const { error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: { data: { username: signUpUsername.trim() } },
      })
      if (error) {
        setSignUpError(error.message)
        setSignUpLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('playful_new', '1')
      }
      // Redirect to dashboard after successful sign up
      router.push('/dashboard')
      setSignUpLoading(false)
    } catch {
      setSignUpError('Something went wrong. Please try again.')
      setSignUpLoading(false)
    }
  }, [signUpUsername, signUpEmail, signUpPassword, signUpConfirm, router])

  if (checkingAuth) {
    return <div style={{ minHeight: '100vh', background: '#030305' }} />
  }

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div style={{
      minHeight: '100vh', background: '#030305',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px 32px', position: 'relative', overflow: 'hidden',
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
        { w: 260, h: 260, bg: '#ff7a00', bottom: -60, right: -60, anim: 'orbFloat2 18s ease-in-out infinite alternate' },
        { w: 180, h: 180, bg: '#ff4d8d', bottom: '30%', left: '5%', anim: 'orbFloat1 22s ease-in-out infinite alternate-reverse', opacity: 0.1 },
      ].map((o, i) => (
        <div key={i} style={{
          position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          filter: 'blur(60px)', opacity: o.opacity ?? 0.18,
          width: o.w, height: o.h, background: o.bg,
          top: o.top, left: o.left, bottom: o.bottom, right: (o as any).right,
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
        @keyframes breathe { from { transform: translate(-50%,-50%) scale(0.9); opacity: 0.6; } to { transform: translate(-50%,-50%) scale(1.1); opacity: 1; } }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,30px) scale(1.12); } }
        @keyframes orbFloat1 { from { transform: translate(0,0); } to { transform: translate(40px,60px); } }
        @keyframes orbFloat2 { from { transform: translate(0,0); } to { transform: translate(-50px,-40px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes liquidFlow { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
        @keyframes shineSweep { 0% { left: -100%; } 22% { left: 200%; } 100% { left: 200%; } }
        @keyframes modalPop { from { transform: scale(0.82) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes iconBounce { from { transform: scale(0.3) rotate(-15deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(108vh) rotate(720deg) scale(0.7); opacity: 0; } }
        @keyframes toastSlide { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Brand */}
      <Link href="/" style={{
        position: 'fixed', top: 28, left: 28,
        display: 'flex', alignItems: 'center', gap: 12,
        textDecoration: 'none', zIndex: 10,
      }}>
        <img src="/logo.png" alt="Playful" style={{
          width: 45, height: 45, borderRadius: 12, objectFit: 'cover',
          border: '1px solid rgba(255,122,24,.35)',
          boxShadow: '0 0 20px rgba(0,234,255,.15)',
        }} />
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
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: 'rgba(10, 12, 22, 0.95)',
          backdropFilter: 'blur(32px) saturate(180%)',
          borderRadius: 28, padding: '44px 40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.80), inset 0 1px 1px rgba(255,255,255,0.10)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Front — Sign In */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 28, padding: '1.5px',
            background: 'linear-gradient(160deg, rgba(0,234,255,0.55) 0%, rgba(255,255,255,0.18) 18%, transparent 42%, rgba(255,122,0,0.20) 72%, rgba(255,255,255,0.14) 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor' as any,
            maskComposite: 'exclude' as any,
            pointerEvents: 'none', zIndex: 0,
          }} />
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
              textAlign: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
              maxWidth: '260px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.5,
            }}>
              Enter your credentials to continue your journey
            }}
            </p>
            <p style={{
              textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.48)',
              marginBottom: 28, letterSpacing: '0.06em', textTransform: 'uppercase' as any,
            }}>Resume your Adventure.</p>
            <p style={{
              textAlign: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
              marginBottom: 24, maxWidth: '260px',
            }}>Sign in to continue your journey into limitless creativity.</p>

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
                clearError={() => setSignInError('')}
              />
              <PasswordInput
                value={signInPassword} onChange={setSignInPassword}
                show={siShowPass} onToggle={() => setSiShowPass(!siShowPass)}
                id="si-password" label="Password"
                clearError={() => setSignInError('')}
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
              <button onClick={() => { setIsSignUp(true); setSignUpError(''); setSignUpUsername(''); setSignUpEmail(''); setSignUpPassword(''); setSignUpConfirm('') }} style={{
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
              textAlign: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
              maxWidth: '260px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.5,
            }}>
              Turn your imagination into playable games, no coding required
            }}
            <p style={{
              textAlign: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
              marginBottom: 24, maxWidth: '260px',
            }}>Bring your wildest game ideas to life with just a few words.</p>

            {signUpError && (
              <div style={{
                background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.28)',
                color: '#ff3366', padding: '10px 14px', borderRadius: 10, fontSize: '0.74rem',
                marginBottom: 18, textAlign: 'center',
                animation: 'slideDown 0.3s ease',
              }}>{signUpError}</div>
            )}

            <form onSubmit={handleSignUp} noValidate>
              <InputField
                type="text" value={signUpUsername} onChange={setSignUpUsername}
                label="Username" id="su-username"
                clearError={() => setSignUpError('')}
              />
              <InputField
                type="email" value={signUpEmail} onChange={setSignUpEmail}
                label="Email address" id="su-email"
                clearError={() => setSignUpError('')}
              />
              <PasswordInput
                value={signUpPassword} onChange={setSignUpPassword}
                show={suShowPass} onToggle={() => setSuShowPass(!suShowPass)}
                id="su-password" label="Password"
                clearError={() => setSignUpError('')}
              />
              <PasswordInput
                value={signUpConfirm} onChange={setSignUpConfirm}
                show={suConfirmShowPass} onToggle={() => setSuConfirmShowPass(!suConfirmShowPass)}
                id="su-confirm" label="Confirm Password"
                clearError={() => setSignUpError('')}
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
                  Sign Up for Free
                </span>
                <span style={{
                  position: 'absolute', top: 0, left: '-100%', width: '45%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
                  transform: 'skewX(-22deg)', animation: 'shineSweep 3.5s infinite ease-in-out',
                }} />
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
              Already on the list?{' '}
              <button onClick={() => { setIsSignUp(false); setSignInError(''); setSignInEmail(''); setSignInPassword('') }} style={{
                background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 'inherit',
                color: '#fff', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
              }}>Sign in</button>
            </p>
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
            <span style={{
              fontSize: '3.8rem', marginBottom: 12, position: 'relative', zIndex: 1, display: 'block',
              animation: 'iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            }}>&#127881;</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2.3rem',
              marginBottom: 12, letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #fff 0%, rgba(0,234,255,0.9) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              position: 'relative', zIndex: 1,
            }}>Congratulations!</h2>
            <p style={{
              color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, fontSize: '0.95rem',
              position: 'relative', zIndex: 1, marginBottom: 28,
            }}>
              You won a mystery scratch card! We&apos;ve sent a magic link to your email.<br /><br />
              <strong>Check your inbox (and spam folder) to verify your account and reveal your reward.</strong>
            </p>
            <button onClick={() => setShowSuccess(false)} style={{
              display: 'inline-block', padding: '17px 32px', borderRadius: 14, border: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem',
              textTransform: 'uppercase' as any, letterSpacing: '0.08em', color: '#0a0a0a',
              background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
              backgroundSize: '400% 100%', animation: 'liquidFlow 5s linear infinite',
              boxShadow: '0 4px 24px rgba(0,234,255,0.18)',
              cursor: 'pointer', position: 'relative', overflow: 'hidden', marginTop: 10,
            }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Got It!</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign-in toast */}
      {showToast && (
        <div style={{
          position: 'fixed', top: 28, right: 28, zIndex: 9999,
          background: 'rgba(10,12,22,0.97)',
          border: '1px solid rgba(0,234,255,0.25)',
          borderRadius: 16, padding: '16px 22px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,234,255,0.1)',
          maxWidth: 320,
          animation: 'toastSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>&#128150;</span>
          <div>
            <div style={{ display: 'block', color: '#fff', fontSize: '0.85rem', marginBottom: 3, letterSpacing: '0.02em', fontWeight: 700 }}>Welcome back!</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>We haven&apos;t built Playful yet. Please come back later &#128150;</div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confettiPieces.map((p) => (
        <div key={p.id} style={{
          position: 'fixed', top: -20, left: `${p.left}%`,
          width: p.width, height: p.height,
          background: p.background, borderRadius: p.borderRadius,
          boxShadow: p.shadow, pointerEvents: 'none', zIndex: 10000,
          animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  )
}

// ── Reusable input components ──

function InputField({ type, value, onChange, label, id, clearError }: {
  type: string; value: string; onChange: (v: string) => void; label: string; id: string; clearError?: () => void
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    clearError?.()
  }

  return (
    <div style={{ position: 'relative', marginBottom: 18 }}>
      <input
        type={type} id={id} placeholder=" " required
        value={value} onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: focused || filled ? 'rgba(0,234,255,0.04)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? '#00eaff' : 'rgba(255,255,255,0.14)'}`,
          padding: '17px 16px', borderRadius: 14, color: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none',
          transition: 'all 0.3s ease',
          boxShadow: focused ? '0 0 0 3px rgba(0,234,255,0.07), 0 0 20px rgba(0,234,255,0.06)' : 'none',
        }}
      />
      <label htmlFor={id} style={{
        position: 'absolute', left: 16, top: filled || focused ? 0 : '50%',
        transform: !filled && !focused ? 'translateY(-50%)' : 'translateY(-50%)',
        color: filled || focused ? '#00eaff' : 'rgba(255,255,255,0.38)',
        fontSize: filled || focused ? '0.68rem' : '0.82rem',
        pointerEvents: 'none', transition: '0.22s cubic-bezier(0.4, 0, 0.2, 1) all',
        background: filled || focused ? 'rgba(10,12,22,0.98)' : 'transparent',
        padding: '0 4px', letterSpacing: filled || focused ? '0.05em' : '0',
      }}>{label}</label>
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, id, label, clearError }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; id: string; label: string; clearError?: () => void
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: 18 }}>
      <input
        type={show ? 'text' : 'password'} id={id} placeholder=" " required
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: focused || filled ? 'rgba(0,234,255,0.04)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? '#00eaff' : 'rgba(255,255,255,0.14)'}`,
          padding: '17px 52px 17px 16px', borderRadius: 14, color: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none',
          transition: 'all 0.3s ease',
          boxShadow: focused ? '0 0 0 3px rgba(0,234,255,0.07), 0 0 20px rgba(0,234,255,0.06)' : 'none',
        }}
      />
      <label htmlFor={id} style={{
        position: 'absolute', left: 16, top: filled || focused ? 0 : '50%',
        transform: !filled && !focused ? 'translateY(-50%)' : 'translateY(-50%)',
        color: filled || focused ? '#00eaff' : 'rgba(255,255,255,0.38)',
        fontSize: filled || focused ? '0.68rem' : '0.82rem',
        pointerEvents: 'none', transition: '0.22s cubic-bezier(0.4, 0, 0.2, 1) all',
        background: filled || focused ? 'rgba(10,12,22,0.98)' : 'transparent',
        padding: '0 4px', letterSpacing: filled || focused ? '0.05em' : '0',
      }}>{label}</label>
      <button type="button" onClick={onToggle} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        width: 34, height: 34, border: 'none', background: 'transparent',
          color: 'rgba(255,255,255,0.65)', cursor: 'pointer', display: 'grid',
          placeItems: 'center', borderRadius: 10, zIndex: 2,
        }}>
        {show ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a3 3 0 0 0 2.8 2.8" />
            <path d="M6.2 6.2C3.8 7.9 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.4 5.1-1.1" />
            <path d="M9.9 4.1C10.6 4 11.3 4 12 4c6.5 0 10 8 10 8s-.9 2.1-2.7 4.1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
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

// Shared visual language for both fields: icon prefix, glass background,
// a focus ring that only appears on focus (no static border glow), and
// space reserved on the right for a suffix control (password toggle).
const fieldBoxStyle = (focused: boolean, hasError: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10,
  borderRadius: 13, padding: '2px 14px',
  background: 'rgba(255,255,255,0.045)',
  border: `1px solid ${hasError ? 'rgba(255,51,102,0.5)' : focused ? 'rgba(0,234,255,0.55)' : 'rgba(255,255,255,0.10)'}`,
  boxShadow: focused ? '0 0 0 4px rgba(0,234,255,0.08)' : 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
})

const iconStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.35)', flexShrink: 0 }

const inputResetStyle: React.CSSProperties = {
  flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
  color: '#fff', fontSize: '0.94rem', padding: '13px 0', fontFamily: 'inherit',
}

function InputField({
  type, value, onChange, label, id, clearError, icon, hasError,
}: {
  type: string; value: string; onChange: (v: string) => void; label: string; id: string
  clearError: () => void; icon: React.ReactNode; hasError?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 7, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={fieldBoxStyle(focused, !!hasError)}>
        <span style={iconStyle}>{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={type === 'email' ? 'email' : 'off'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => { onChange(e.target.value); clearError() }}
          style={inputResetStyle}
        />
      </div>
    </div>
  )
}

function PasswordInput({
  value, onChange, show, onToggle, id, label, clearError, hasError,
}: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void
  id: string; label: string; clearError: () => void; hasError?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginBottom: 7, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={fieldBoxStyle(focused, !!hasError)}>
        <span style={iconStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete="current-password"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => { onChange(e.target.value); clearError() }}
          style={inputResetStyle}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', padding: 4, flexShrink: 0 }}
        >
          {show ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
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
    if (!signInEmail || !signInPassword) {
      setSignInError('Please fill out all highlighted fields.')
      return
    }

    setSignInLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      })
      if (error) {
        setSignInError(error.message)
        setSignInLoading(false)
      } else {
        setShowToast(true)
        setTimeout(() => router.push('/dashboard'), 1400)
      }
    } catch {
      setSignInError('Something went wrong. Please try again.')
      setSignInLoading(false)
    }
  }, [signInEmail, signInPassword, router])

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')
    if (!signUpUsername || !signUpEmail || !signUpPassword || !signUpConfirm) {
      setSignUpError('Please fill out all highlighted fields.')
      return
    }
    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match.')
      return
    }

    setSignUpLoading(true)
    try {
      const { data: isTaken } = await supabase.rpc('check_username_taken', { uname: signUpUsername.trim() })
      if (isTaken) {
        setSignUpError('Username already exists. Please choose another.')
        setSignUpLoading(false)
        return
      }

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
      launchConfetti()
      setShowToast(true)
      setTimeout(() => router.push('/dashboard'), 1400)
    } catch {
      setSignUpError('Something went wrong. Please try again.')
      setSignUpLoading(false)
    }
  }, [signUpUsername, signUpEmail, signUpPassword, signUpConfirm, router])

  if (checkingAuth) {
    return <div style={{ minHeight: '100vh', background: '#030305' }} />
  }

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

      <style>{`
        @keyframes breathe { from { transform: translate(-50%,-50%) scale(0.9); opacity: 0.6; } to { transform: translate(-50%,-50%) scale(1.1); opacity: 1; } }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,30px) scale(1.12); } }
        @keyframes orbFloat1 { from { transform: translate(0,0); } to { transform: translate(40px,60px); } }
        @keyframes orbFloat2 { from { transform: translate(0,0); } to { transform: translate(-50px,-40px); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes liquidFlow { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
        @keyframes shineSweep { 0% { left: -100%; } 22% { left: 200%; } 100% { left: 200%; } }
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

      {/* Confetti */}
      {confettiPieces.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none', overflow: 'hidden' }}>
          {confettiPieces.map((p) => (
            <div key={p.id} style={{
              position: 'absolute', top: -20, left: `${p.left}%`,
              width: p.width, height: p.height, background: p.background,
              borderRadius: p.borderRadius, boxShadow: p.shadow,
              animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            }} />
          ))}
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed', top: 28, right: 28, zIndex: 50,
          background: 'rgba(10,12,22,0.95)', border: '1px solid rgba(0,234,255,0.3)',
          borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: '0.88rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          animation: 'toastSlide 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
          Welcome back! Redirecting to your dashboard…
        </div>
      )}

      {/* Auth card with flip */}
      <div style={{ width: 'min(90vw, 440px)', perspective: '1400px', position: 'relative', zIndex: 5, marginTop: 6 }}>
        <div style={{
          position: 'relative', width: '100%', transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front — Sign In */}
          <div style={{
            position: isSignUp ? 'absolute' : 'relative', inset: 0, width: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(10, 12, 22, 0.95)',
            backdropFilter: 'blur(32px) saturate(180%)',
            borderRadius: 28, padding: '44px 40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.80), inset 0 1px 1px rgba(255,255,255,0.10)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28, padding: '1.5px',
              background: 'linear-gradient(160deg, rgba(0,234,255,0.55) 0%, rgba(255,255,255,0.18) 18%, transparent 42%, rgba(255,122,0,0.20) 72%, rgba(255,255,255,0.14) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor' as any, maskComposite: 'exclude' as any,
              pointerEvents: 'none', zIndex: 0,
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
                marginBottom: 28, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5,
              }}>
                Sign in to continue your journey into limitless creativity.
              </p>

              {signInError && (
                <div style={{
                  background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.28)',
                  color: '#ff3366', padding: '10px 14px', borderRadius: 10, fontSize: '0.74rem',
                  marginBottom: 18, textAlign: 'center', animation: 'slideDown 0.3s ease',
                }}>{signInError}</div>
              )}

              <form onSubmit={handleSignIn} noValidate>
                <InputField
                  type="email" value={signInEmail} onChange={setSignInEmail} label="Email address" id="si-email"
                  clearError={() => setSignInError('')} hasError={!!signInError && !signInEmail}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></svg>}
                />
                <PasswordInput
                  value={signInPassword} onChange={setSignInPassword} show={siShowPass} onToggle={() => setSiShowPass(!siShowPass)}
                  id="si-password" label="Password" clearError={() => setSignInError('')} hasError={!!signInError && !signInPassword}
                />
                <button type="submit" disabled={signInLoading} style={{
                  width: '100%', padding: 17, marginTop: 8, border: 'none', borderRadius: 14,
                  cursor: signInLoading ? 'default' : 'pointer', fontWeight: 700,
                  fontSize: '0.88rem', textTransform: 'uppercase' as any, letterSpacing: '0.08em',
                  color: '#0a0a0a', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
                  backgroundSize: '400% 100%', animation: 'liquidFlow 5s linear infinite',
                  boxShadow: '0 4px 24px rgba(0,234,255,0.18)',
                  opacity: signInLoading ? 0.7 : 1,
                }}>
                  <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {signInLoading && <span style={{
                      width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.18)',
                      borderTopColor: 'rgba(0,0,0,0.9)', animation: 'spin 0.75s linear infinite', display: 'inline-block',
                    }} />}
                    {signInLoading ? 'Signing in…' : 'Sign In'}
                  </span>
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
            position: isSignUp ? 'relative' : 'absolute', inset: 0, width: '100%',
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
              WebkitMaskComposite: 'xor' as any, maskComposite: 'exclude' as any,
              pointerEvents: 'none', zIndex: 0,
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
                marginBottom: 24, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5,
              }}>
                Bring your wildest game ideas to life with just a few words — no coding required.
              </p>

              {signUpError && (
                <div style={{
                  background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.28)',
                  color: '#ff3366', padding: '10px 14px', borderRadius: 10, fontSize: '0.74rem',
                  marginBottom: 18, textAlign: 'center', animation: 'slideDown 0.3s ease',
                }}>{signUpError}</div>
              )}

              <form onSubmit={handleSignUp} noValidate>
                <InputField
                  type="text" value={signUpUsername} onChange={setSignUpUsername} label="Username" id="su-username"
                  clearError={() => setSignUpError('')} hasError={!!signUpError && !signUpUsername}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>}
                />
                <InputField
                  type="email" value={signUpEmail} onChange={setSignUpEmail} label="Email address" id="su-email"
                  clearError={() => setSignUpError('')} hasError={!!signUpError && !signUpEmail}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></svg>}
                />
                <PasswordInput
                  value={signUpPassword} onChange={setSignUpPassword} show={suShowPass} onToggle={() => setSuShowPass(!suShowPass)}
                  id="su-password" label="Password" clearError={() => setSignUpError('')} hasError={!!signUpError && !signUpPassword}
                />
                <PasswordInput
                  value={signUpConfirm} onChange={setSignUpConfirm} show={suConfirmShowPass} onToggle={() => setSuConfirmShowPass(!suConfirmShowPass)}
                  id="su-confirm" label="Confirm password" clearError={() => setSignUpError('')} hasError={!!signUpError && signUpPassword !== signUpConfirm}
                />
                <button type="submit" disabled={signUpLoading} style={{
                  width: '100%', padding: 17, marginTop: 8, border: 'none', borderRadius: 14,
                  cursor: signUpLoading ? 'default' : 'pointer', fontWeight: 700,
                  fontSize: '0.88rem', textTransform: 'uppercase' as any, letterSpacing: '0.08em',
                  color: '#0a0a0a', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(90deg, #ff7a00, #ffe066, #ffffff, #00eaff, #ff7a00)',
                  backgroundSize: '400% 100%', animation: 'liquidFlow 5s linear infinite',
                  boxShadow: '0 4px 24px rgba(255,122,0,0.18)',
                  opacity: signUpLoading ? 0.7 : 1,
                }}>
                  <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {signUpLoading && <span style={{
                      width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.18)',
                      borderTopColor: 'rgba(0,0,0,0.9)', animation: 'spin 0.75s linear infinite', display: 'inline-block',
                    }} />}
                    {signUpLoading ? 'Creating account…' : 'Create Account'}
                  </span>
                </button>
              </form>

              <p style={{ marginTop: 22, textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                Already a creator?{' '}
                <button onClick={() => { setIsSignUp(false); setSignInError('') }} style={{
                  background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 'inherit',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                }}>Sign in</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
      }

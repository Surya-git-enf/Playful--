'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  return <DashboardContent />
}

function DashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [queuePos, setQueuePos] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [usersList, setUsersList] = useState<any[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [showScratchCard, setShowScratchCard] = useState(false)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [promoCode, setPromoCode] = useState('PLAYMAN')
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (!session) {
        router.replace('/auth')
        return
      }
      setUser(session.user)
      await fetchUserData(session.user)
      setLoading(false)
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/auth')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [router])

  async function fetchUserData(u: any) {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })

      if (users) {
        setUsersList(users)
        setTotalUsers(users.length)
        const pos = users.findIndex((x: any) => x.id === u.id)
        setQueuePos(pos >= 0 ? pos + 1 : users.length + 1)

        const me = users.find((x: any) => x.id === u.id)
        if (me) {
          setProfile(me)
          const uname = (me.username || 'PLAYMAN').toUpperCase().replace(/[^A-Z0-9]/g, '')
          setPromoCode(uname)

          const createdAt = new Date(me.created_at)
          const now = new Date()
          const diffMs = now.getTime() - createdAt.getTime()
          const diffMin = diffMs / (1000 * 60)
          if (diffMin <= 1 && !sessionStorage.getItem('playful_scratched')) {
            setShowScratchCard(true)
          }
        }
      }
    } catch {}
  }

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }, [router])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#06040f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Creator'
  const displayEmail = user?.email || '—'
  const plan = profile?.plan || 'Free'
  const buildsLeft = profile?.builds_left ?? 3
  const credits = profile?.credits ?? 5
  const maxCredits = plan === 'Studio' ? 50 : plan === 'Creator' ? 30 : 5
  const creditsPct = Math.min(100, (credits / maxCredits) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#06040f', color: '#f0eaff', fontFamily: "'Space Mono', monospace", overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' }}>
      <style>{globalCSS}</style>

      {/* Background layers */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 45% at 8% 12%, rgba(255,122,0,0.06) 0%,transparent 60%), radial-gradient(ellipse 45% 40% at 92% 82%, rgba(255,222,102,0.04) 0%,transparent 55%)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 85%)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 200, height: 70,
          padding: '0 clamp(16px,4vw,40px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(6,4,15,0.82)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Playful" style={{
              width: 'clamp(34px,4vw,44px)', height: 'clamp(34px,4vw,44px)',
              borderRadius: 11, objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 0 14px rgba(255,122,0,0.15)',
            }} />
            <span style={{
              fontFamily: "'Orbitron',sans-serif", fontWeight: 900,
              fontSize: 'clamp(0.85rem,2vw,1.25rem)', letterSpacing: '0.18em',
              color: '#fff', animation: 'pulseBrand 6s ease-in-out infinite',
            }}>PLAYFUL</span>
          </a>

          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'grid', placeItems: 'center', cursor: 'pointer', transition: '0.2s ease',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.8-3.5 5-5 7-5s5.2 1.5 7 5"/></svg>
            </button>

            {showProfileMenu && (
              <div style={{
                position: 'absolute', top: 54, right: 0, width: 'min(300px,88vw)',
                background: 'linear-gradient(160deg,rgba(18,9,40,0.97),rgba(8,4,20,0.97))',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 20,
                boxShadow: '0 24px 80px rgba(0,0,0,0.75)', backdropFilter: 'blur(30px)',
                zIndex: 300, animation: 'menuIn 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', color: '#fff' }}>PROFILE</div>
                    <div style={{ color: 'rgba(240,234,255,0.5)', fontSize: '0.66rem', marginTop: 3 }}>Waitlist access</div>
                  </div>
                  <button onClick={() => setShowProfileMenu(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,234,255,0.52)', cursor: 'pointer', fontSize: '1.15rem', lineHeight: 1, padding: '2px 6px', borderRadius: 6 }}>×</button>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', color: '#fff', marginBottom: 3 }}>{displayName}</div>
                <div style={{ color: 'rgba(240,234,255,0.55)', fontSize: '0.67rem', wordBreak: 'break-all' }}>{displayEmail}</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 }}>
                  <span style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Plan</span>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', color: '#fff' }}>{plan}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                  <span style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Builds left</span>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', color: '#fff' }}>{buildsLeft}</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Credits</span>
                    <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', color: '#fff' }}>{credits}/{maxCredits}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(232,121,249,0.1)', border: '1px solid rgba(232,121,249,0.14)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#e879f9,#f472b6)', boxShadow: '0 0 10px rgba(232,121,249,0.4)', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)', width: `${creditsPct}%` }} />
                  </div>
                </div>

                <button onClick={handleLogout} style={{
                  width: '100%', marginTop: 14, padding: 11, borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(240,234,255,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.05em', transition: '0.2s ease',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"/><path d="M14 7l5 5-5 5"/><path d="M19 12H9"/></svg>
                  SIGN OUT
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ── GREETING ── */}
        <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <div style={{ padding: 'clamp(60px,10vh,100px) 0 clamp(40px,6vh,64px)', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(240,234,255,0.6)', fontSize: '0.67rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 24, animation: 'fadeUp 0.6s ease both',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff7a00', boxShadow: '0 0 8px #ff7a00', animation: 'blink 2s ease infinite' }} />
              You&apos;re on the list
            </div>
            <h1 style={{
              fontFamily: "'Instrument Serif',serif", fontStyle: 'italic',
              fontSize: 'clamp(2.4rem,6vw,4.4rem)', lineHeight: 1.06, color: '#fff', marginBottom: 14,
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}>
              Hey, <em style={{
                fontStyle: 'normal',
                background: 'linear-gradient(135deg,#ff7a00,#ffe066)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{displayName}</em> 👋
            </h1>
            <p style={{
              fontSize: '0.82rem', lineHeight: 1.9, color: 'rgba(240,234,255,0.52)',
              maxWidth: '46ch', margin: '0 auto 32px', animation: 'fadeUp 0.6s ease 0.18s both',
            }}>
              We&apos;re still building Playful — your spot is locked in.
              When the engine fires up, you&apos;ll be first to know.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.6s ease 0.25s both' }}>
              <button onClick={() => setShowPricing(true)} style={{
                padding: '13px 28px', border: 'none', borderRadius: 12, cursor: 'pointer',
                fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em',
                background: 'linear-gradient(135deg,#ff7a00,#ff4d00)', color: '#fff',
                boxShadow: '0 8px 28px rgba(255,122,0,0.3),0 0 0 1px rgba(255,122,0,0.2)',
                transition: '0.22s ease',
              }}>Explore Pricing</button>
              <button onClick={() => fetchUserData(user)} style={{
                padding: '13px 22px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, cursor: 'pointer',
                fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em',
                background: 'rgba(255,255,255,0.04)', color: '#fff', transition: '0.22s ease',
              }}>Refresh</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />

        {/* ── STATUS ── */}
        <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <div style={{ padding: 'clamp(40px,6vh,60px) 0' }}>
            <SectionLabel>Your status</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <StatCard label="Queue position" value={queuePos ?? '—'} meta="On the waitlist" gradient />
              <StatCard label="Status" value="Waitlisted" meta="Access coming soon" />
            </div>
          </div>
        </div>

        {/* ── VERTICAL USER SCROLL ── */}
        <UserScroll users={usersList} totalUsers={totalUsers} />

        <div style={{ maxWidth: 860, margin: '0 auto', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '22px clamp(16px,4vw,40px)', textAlign: 'center', marginTop: 'auto',
        }}>
          <p style={{ color: 'rgba(240,234,255,0.26)', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
            Built with 💜 by <strong style={{ color: '#ff7a00', fontFamily: "'Orbitron',sans-serif", fontSize: '0.63rem' }}>PLAYFUL</strong> · Turns words into worlds · © 2025
          </p>
        </footer>
      </div>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showScratchCard && (
        <ScratchCardModal
          onClose={() => { setShowScratchCard(false); sessionStorage.setItem('playful_scratched', '1') }}
          revealed={scratchRevealed}
          onReveal={() => setScratchRevealed(true)}
          copied={copied}
          onCopy={() => { navigator.clipboard.writeText(promoCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          promoCode={promoCode}
        />
      )}
    </div>
  )
}

/* ── SHARED CSS ── */
const globalCSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pulseBrand{0%,100%{color:#fff;text-shadow:none}33%{color:#ff7a00;text-shadow:0 0 20px rgba(255,122,0,0.5)}66%{color:#ffe066;text-shadow:0 0 20px rgba(255,222,102,0.4)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}
@keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(0.98)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scrollUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}
@keyframes scrollDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}
@keyframes scBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes scGlow{0%,100%{box-shadow:0 0 30px rgba(255,122,0,0.3),0 0 60px rgba(255,122,0,0.15)}50%{box-shadow:0 0 50px rgba(255,122,0,0.55),0 0 100px rgba(255,122,0,0.28)}}
@keyframes scHint{0%,100%{opacity:0.4}50%{opacity:1}}
@keyframes toastSlide{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#06040f}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#ffe066,#ff7a00,#00eaff);border-radius:99px}
`

/* ── SMALL COMPONENTS ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.12em',
      color: 'rgba(240,234,255,0.8)', fontWeight: 700, marginBottom: 20,
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

function StatCard({ label, value, meta, gradient }: { label: string; value: any; meta: string; gradient?: boolean }) {
  return (
    <div style={{
      padding: '24px 22px', borderRadius: 18,
      background: 'rgba(14,8,30,0.78)', border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 50% 0%,rgba(255,255,255,0.03),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
      <div style={{
        fontFamily: "'Orbitron',sans-serif", fontWeight: 900,
        fontSize: 'clamp(1.8rem,4vw,2.6rem)', lineHeight: 1, letterSpacing: '-0.02em',
        ...(gradient
          ? { background: 'linear-gradient(135deg,#ff7a00,#ffe066)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
          : { color: '#fff' }),
      }}>{value}</div>
      <div style={{ color: 'rgba(240,234,255,0.26)', fontSize: '0.66rem', marginTop: 6 }}>{meta}</div>
    </div>
  )
}

/* ── USER SCROLL ── */
function UserScroll({ users, totalUsers }: { users: any[]; totalUsers: number }) {
  const colA = users.filter((_: any, i: number) => i % 2 === 0)
  const colB = users.filter((_: any, i: number) => i % 2 === 1)

  const renderChip = (u: any, idx: number) => (
    <div key={`${u.id || idx}`} style={{
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.76rem', color: 'rgba(200,185,255,0.75)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: 'linear-gradient(135deg,#ff7a00,#ffe066)',
        display: 'grid', placeItems: 'center',
        fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#0a0a0a',
      }}>
        {(u.username || '?')[0]?.toUpperCase()}
      </div>
      {u.username || 'Anonymous'}
    </div>
  )

  if (users.length === 0) return null

  return (
    <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
      <div style={{ padding: '0 0 clamp(40px,6vh,60px)' }}>
        <SectionLabel>Creators waiting <span style={{ color: 'rgba(240,234,255,0.8)', fontSize: '0.63rem', textTransform: 'none', letterSpacing: 0, marginLeft: 2, fontWeight: 700 }}>({totalUsers})</span></SectionLabel>
        <div style={{
          borderRadius: 18, background: 'rgba(14,8,30,0.78)',
          border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', maxHeight: 260,
        }}>
          {[colA, colB].map((col, ci) => (
            <div key={ci} style={{ overflow: 'hidden', position: 'relative', borderRight: ci === 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to bottom,rgba(14,8,30,0.95),transparent)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 44, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to top,rgba(14,8,30,0.95),transparent)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', animation: `${ci === 0 ? 'scrollUp 20s' : 'scrollDown 24s'} linear infinite` }}>
                {[...col, ...col].map((u, i) => renderChip(u, i))}
              </div>
            </div>
          ))}
          <div style={{
            gridColumn: '1/-1', padding: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
            fontSize: '0.66rem', color: 'rgba(240,234,255,0.26)', letterSpacing: '0.05em',
          }}>
            <span style={{ color: '#fff', fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.7rem' }}>{totalUsers}</span> creators in the queue
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PRICING MODAL ── */
function PricingModal({ onClose }: { onClose: () => void }) {
  const plans = [
    { tag: 'Free forever', price: '$0', sub: '/mo', name: 'STARTER', desc: 'The survival kit. Perfect for testing the engine.', feats: ['5 Survival Credits (top-up only)', '3 APK Builds / month'], dimFeats: ['Custom AdMob (0% revenue)', 'Playful watermark required'], vibe: '"Booting up the Playful Engine"', btn: 'Current Plan', btnDisabled: true },
    { tag: 'Sweet spot', price: '$15', sub: '/mo', name: 'CREATOR', desc: 'Strip the branding, keep your cash, build faster.', feats: ['30 AI Credits / day', '15 APK Builds / month', 'Custom AdMob (100% revenue)', 'No watermarks'], dimFeats: [], vibe: '"Verifying Pro License"', btn: 'Be Creator', featured: true },
    { tag: 'Maximum power', price: '$49', sub: '/mo', name: 'STUDIO', desc: 'For developers pushing serious games at full volume.', feats: ['50 AI Credits / day', 'Unlimited APK Builds', 'Custom AdMob (100% revenue)', 'No watermarks'], dimFeats: [], vibe: '"Masterpiece Complete!"', btn: 'Own Studio' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.2s ease' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(14px)' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: 'min(1080px,96vw)', maxHeight: '92vh',
        overflowY: 'auto', borderRadius: 24,
        background: 'linear-gradient(160deg,rgba(14,8,30,0.98),rgba(6,3,16,0.98))',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.85)', padding: 'clamp(20px,3vw,28px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 26 }}>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', fontSize: 'clamp(1.6rem,3vw,2.3rem)', color: '#fff', marginBottom: 6 }}>Playful Pricing</h2>
            <p style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.82rem', lineHeight: 1.65, maxWidth: '52ch' }}>Simple, transparent plans. Upgrade any time once Playful launches.</p>
          </div>
          <button onClick={onClose} style={{
            width: 38, height: 38, minWidth: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(240,234,255,0.52)', cursor: 'pointer', fontSize: '1.05rem',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignItems: 'start' }}>
          {plans.map((p) => (
            <div key={p.name} style={{
              borderRadius: 18, padding: '22px 18px 18px',
              background: p.featured ? 'linear-gradient(160deg,rgba(20,10,44,0.9),rgba(10,5,24,0.9))' : 'rgba(10,5,22,0.7)',
              border: `1px solid ${p.featured ? 'rgba(255,122,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              boxShadow: p.featured ? '0 0 0 1px rgba(255,122,0,0.15),0 18px 50px rgba(255,122,0,0.08)' : 'none',
            }}>
              {p.featured && <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 11px', borderRadius: 999, background: 'linear-gradient(90deg,#ff7a00,#ff4d00)', color: '#fff', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Orbitron',sans-serif" }}>Popular</div>}
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: p.featured ? '#fff' : 'rgba(240,234,255,0.52)', marginBottom: 12 }}>{p.tag}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,3vw,2.4rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 3 }}>{p.price}<sub style={{ fontSize: '0.82rem', fontWeight: 400, color: 'rgba(240,234,255,0.52)', verticalAlign: 'baseline', letterSpacing: 0 }}>{p.sub}</sub></div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.12em', color: '#fff', marginBottom: 7 }}>{p.name}</div>
              <div style={{ color: 'rgba(240,234,255,0.52)', fontSize: '0.76rem', lineHeight: 1.65, marginBottom: 16, minHeight: 42 }}>{p.desc}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 16 }}>
                {p.feats.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'rgba(200,185,255,0.8)', lineHeight: 1.45 }}>
                    <span style={{ width: 16, height: 16, minWidth: 16, marginTop: 1, borderRadius: 5, background: p.featured ? 'rgba(255,122,0,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${p.featured ? 'rgba(255,122,0,0.25)' : 'rgba(255,255,255,0.08)'}`, display: 'grid', placeItems: 'center', fontSize: '0.58rem' }}>✓</span>
                    {f}
                  </div>
                ))}
                {p.dimFeats.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'rgba(200,185,255,0.8)', lineHeight: 1.45, opacity: 0.36, textDecoration: 'line-through' }}>
                    <span style={{ width: 16, height: 16, minWidth: 16, marginTop: 1, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', fontSize: '0.58rem' }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'rgba(240,234,255,0.26)', fontStyle: 'italic', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 13 }}>{p.vibe}</div>
              <button disabled={p.btnDisabled} style={{
                border: p.btnDisabled ? '1px solid rgba(255,255,255,0.08)' : 'none',
                borderRadius: 11, padding: '12px 14px',
                cursor: p.btnDisabled ? 'not-allowed' : 'pointer',
                fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.08em',
                background: p.btnDisabled ? 'rgba(255,255,255,0.04)' : p.featured ? 'linear-gradient(135deg,#ff7a00,#ff4d00)' : 'linear-gradient(135deg,#ffe066,#ff7a00)',
                color: p.btnDisabled ? 'rgba(240,234,255,0.52)' : p.featured ? '#fff' : '#0a0a0a',
                boxShadow: p.btnDisabled ? 'none' : p.featured ? '0 8px 24px rgba(255,122,0,0.28)' : '0 8px 24px rgba(255,222,102,0.18)',
              }}>{p.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── SCRATCH CARD MODAL ── */
function ScratchCardModal({ onClose, revealed, onReveal, copied, onCopy, promoCode }: {
  onClose: () => void; revealed: boolean; onReveal: () => void; copied: boolean; onCopy: () => void; promoCode: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratching = useRef(false)
  const lastCheck = useRef(0)
  const revealedRef = useRef(revealed)

  useEffect(() => { revealedRef.current = revealed }, [revealed])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const rect = cv.getBoundingClientRect()
    cv.width = rect.width * 2
    cv.height = rect.height * 2
    ctx.scale(2, 2)

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, rect.width, rect.height)

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.font = `bold ${rect.width * 0.08}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH HERE', rect.width / 2, rect.height / 2 - 10)
    ctx.font = `${rect.width * 0.05}px Space Mono, monospace`
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillText('✦ ✦ ✦', rect.width / 2, rect.height / 2 + 25)

    function xy(e: MouseEvent | TouchEvent) {
      const r = cv!.getBoundingClientRect()
      const t = 'touches' in e ? e.touches[0] : e
      return { x: t.clientX - r.left, y: t.clientY - r.top }
    }

    function scratch(x: number, y: number) {
      if (!ctx) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 40, 0, Math.PI * 2)
      ctx.fill()
    }

    function pctScratched() {
      if (!ctx || !cv) return 0
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data
      let cleared = 0
      const total = data.length / 4
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) cleared++
      }
      return (cleared / (total / 4)) * 100
    }

    function eraseAll() {
      if (!ctx || !cv) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
      ctx.fillRect(0, 0, cv.width, cv.height)
    }

    function onDown(e: MouseEvent | TouchEvent) {
      if (revealedRef.current) return
      scratching.current = true
      const p = xy(e)
      scratch(p.x, p.y)
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!scratching.current || revealedRef.current) return
      e.preventDefault()
      const p = xy(e)
      scratch(p.x, p.y)

      const now = Date.now()
      if (now - lastCheck.current > 60) {
        lastCheck.current = now
        if (pctScratched() >= 25 && !revealedRef.current) {
          onReveal()
          setTimeout(eraseAll, 200)
        }
      }
    }

    function onUp() { scratching.current = false }

    cv.addEventListener('mousedown', onDown)
    cv.addEventListener('mousemove', onMove)
    cv.addEventListener('mouseup', onUp)
    cv.addEventListener('mouseleave', onUp)
    cv.addEventListener('touchstart', onDown, { passive: false })
    cv.addEventListener('touchmove', onMove, { passive: false })
    cv.addEventListener('touchend', onUp)

    return () => {
      cv.removeEventListener('mousedown', onDown)
      cv.removeEventListener('mousemove', onMove)
      cv.removeEventListener('mouseup', onUp)
      cv.removeEventListener('mouseleave', onUp)
      cv.removeEventListener('touchstart', onDown)
      cv.removeEventListener('touchmove', onMove)
      cv.removeEventListener('touchend', onUp)
    }
  }, [onReveal])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
      <button onClick={onClose} style={{
        position: 'fixed', top: 16, left: 16, zIndex: 920, width: 38, height: 38,
        borderRadius: '50%', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)',
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem',
      }}>✕</button>

      <div style={{ position: 'relative', width: 'min(86vw,380px)', aspectRatio: '4/3' }}>
        {/* Reward layer underneath */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'linear-gradient(155deg,#0a0618 0%,#12082a 50%,#0a0518 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '18px 22px', overflow: 'hidden',
          animation: 'scGlow 3s ease-in-out infinite',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit', background: 'radial-gradient(ellipse 70% 50% at 50% -4%,rgba(255,255,255,0.06),transparent 58%)' }} />

          <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', background: '#06040f', border: '1.5px solid rgba(255,255,255,0.2)', boxShadow: '0 0 14px rgba(255,255,255,0.1)', flexShrink: 0, position: 'relative', zIndex: 1, animation: 'scBob 3s ease-in-out infinite' }}>
            <img src="/logo.png" alt="Playful" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', display: 'block' }} />
          </div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,6.5vw,2.8rem)', lineHeight: 1, letterSpacing: '0.02em', background: 'linear-gradient(135deg,#ff7a00 0%,#ffe066 50%,#fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 14px rgba(255,122,0,0.5))', position: 'relative', zIndex: 1, marginTop: 2 }}>50% OFF</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(200,185,255,0.62)', position: 'relative', zIndex: 1, marginTop: -4 }}>On your first subscription</div>
          <div style={{ position: 'relative', zIndex: 1, background: '#000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '8px 44px 8px 13px', display: 'flex', alignItems: 'center', minWidth: 170, boxShadow: '0 0 16px rgba(255,255,255,0.06)' }}>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', color: '#fff', flex: 1 }}>{promoCode}</span>
            <button onClick={onCopy} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#86efac' : 'rgba(255,255,255,0.4)', padding: 2 }}>
              {copied ? '✓' : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
            </button>
          </div>
          <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.09em', textTransform: 'uppercase', position: 'relative', zIndex: 1, textAlign: 'center', lineHeight: 1.7 }}>Valid <b style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>30 days</b> · One use · Apply at checkout</div>
        </div>

        {/* Scratch canvas overlay */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, borderRadius: 18, touchAction: 'none', display: 'block', cursor: 'crosshair', zIndex: 10 }} />

        {!revealed && (
          <div style={{ position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)', fontSize: '0.54rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.17em', textTransform: 'uppercase', whiteSpace: 'nowrap', animation: 'scHint 1.6s ease-in-out infinite', pointerEvents: 'none', zIndex: 11 }}>
            ✦ Scratch to reveal your reward ✦
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signUp } from '../lib/auth'
import { useFleetStore } from '../store/useFleetStore'
import { Spinner } from '../components/ui/Spinner'

type AuthTab = 'login' | 'signup'

// ─── Shared input style helpers ───────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-surface-border)',
  color: 'var(--color-text-primary)',
}

function InputField({
  label, type, value, onChange, placeholder, autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <input
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{
          ...inputBase,
          borderColor: focused ? 'var(--color-brand)' : 'var(--color-surface-border)',
          transition: 'border-color 0.15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-sm flex items-center gap-2"
      style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  )
}

// ─── Success banner ───────────────────────────────────────────────────────────
function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-sm flex items-center gap-2"
      style={{ background: 'var(--color-ok-bg)', color: 'var(--color-ok)' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate()
  const setAuth  = useFleetStore((s) => s.setAuth)

  const [tab,    setTab]    = useState<AuthTab>('login')
  const [email,  setEmail]  = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  // Signup-only fields
  const [fullName,         setFullName]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')

  function switchTab(next: AuthTab) {
    setTab(next)
    setError(null)
    setSuccess(null)
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { user, profile } = await login({ email: email.trim(), password })

      setAuth({ user: { id: user.id, email: user.email ?? '' }, profile })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      setError(
        raw.toLowerCase().includes('invalid login credentials') ||
        raw.toLowerCase().includes('invalid credentials')
          ? 'Incorrect email or password.'
          : raw.toLowerCase().includes('email not confirmed')
          ? 'Please verify your email before signing in.'
          : raw || 'Unable to sign in. Check your connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Sign up ────────────────────────────────────────────────────────────────
  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim() })

      // Signup succeeded — Supabase sent a verification email.
      // Show success message; do NOT navigate or touch auth store yet.
      setSuccess('Verification email sent! Check your inbox and click the link to activate your account.')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      setError(
        raw.toLowerCase().includes('already registered')
          ? 'This email is already registered. Try signing in instead.'
          : raw || 'Sign up failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-surface-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-surface-border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.3,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--color-brand)', color: '#fff' }}
          >
            F
          </span>
          <span className="text-xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            FleetPulse
          </span>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
          >
            Ops
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border p-8"
          style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-surface-border)' }}
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="pb-3 text-sm font-medium transition-colors"
                style={{
                  color: tab === t ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  borderBottom: tab === t ? '2px solid var(--color-brand)' : '2px solid transparent',
                  background: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* ── Sign in ── */}
          {tab === 'login' && (
            <>
              <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Sign in
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Fleet operations dashboard
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <InputField label="Email" type="email" value={email} onChange={setEmail}
                  placeholder="ops@fleetpulse.io" autoComplete="email" />
                <InputField label="Password" type="password" value={password} onChange={setPassword}
                  placeholder="••••••••" autoComplete="current-password" />

                {error   && <ErrorBanner   message={error} />}
                {success && <SuccessBanner message={success} />}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-1"
                  style={{
                    background: 'var(--color-brand)',
                    color: '#fff',
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: 'none',
                  }}
                >
                  {loading && <Spinner size={14} color="#fff" />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </>
          )}

          {/* ── Sign up ── */}
          {tab === 'signup' && (
            <>
              <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Create account
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Join FleetPulse operations
              </p>

              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <InputField label="Full Name" type="text" value={fullName} onChange={setFullName}
                  placeholder="Sarthak" autoComplete="name" />
                <InputField label="Email" type="email" value={email} onChange={setEmail}
                  placeholder="you@example.com" autoComplete="email" />
                <InputField label="Password" type="password" value={password} onChange={setPassword}
                  placeholder="••••••••" autoComplete="new-password" />
                <InputField label="Confirm Password" type="password" value={confirmPassword}
                  onChange={setConfirmPassword} placeholder="••••••••" autoComplete="new-password" />

                {error   && <ErrorBanner   message={error} />}
                {success && <SuccessBanner message={success} />}

                {/* After success, offer to switch to sign-in tab */}
                {success && (
                  <button
                    type="button"
                    onClick={() => { switchTab('login'); setEmail('') }}
                    className="w-full rounded-lg py-2 text-sm font-medium"
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-surface-border)',
                      cursor: 'pointer',
                    }}
                  >
                    Go to Sign in
                  </button>
                )}

                {!success && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-1"
                    style={{
                      background: 'var(--color-brand)',
                      color: '#fff',
                      opacity: loading ? 0.75 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border: 'none',
                    }}
                  >
                    {loading && <Spinner size={14} color="#fff" />}
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Internal tool · Bytebeam Fleet Operations
        </p>
      </div>
    </div>
  )
}

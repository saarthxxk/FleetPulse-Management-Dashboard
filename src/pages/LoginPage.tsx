import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signUp } from '../lib/auth'
import { useFleetStore } from '../store/useFleetStore'
import { Spinner } from '../components/ui/Spinner'

type AuthTab = 'login' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useFleetStore((s) => s.setAuth)
  const [tab, setTab] = useState<AuthTab>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Signup fields
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, profile } = await login({
        email: email.trim(),
        password,
      })

      setAuth({
        user: { id: user.id, email: user.email ?? '' },
        profile,
      })

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : err.message
          : 'Unable to sign in. Check your connection.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      })

      setTab('login')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setError(null)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.includes('already registered')
            ? 'Email is already registered'
            : err.message
          : 'Sign up failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      {/* Subtle background grid */}
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
          style={{
            background: 'var(--color-surface-1)',
            borderColor: 'var(--color-surface-border)',
          }}
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
            <button
              onClick={() => {
                setTab('login')
                setError(null)
              }}
              className="pb-3 text-sm font-medium transition-colors"
              style={{
                color: tab === 'login' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                borderBottom: tab === 'login' ? '2px solid var(--color-brand)' : 'none',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setTab('signup')
                setError(null)
              }}
              className="pb-3 text-sm font-medium transition-colors"
              style={{
                color: tab === 'signup' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                borderBottom: tab === 'signup' ? '2px solid var(--color-brand)' : 'none',
              }}
            >
              Sign up
            </button>
          </div>

          {tab === 'login' && (
            <>
              <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Sign in
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Fleet operations dashboard
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ops@fleetpulse.io"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="rounded-lg px-3 py-2.5 text-sm flex items-center gap-2"
                    style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity flex items-center justify-center gap-2 mt-1"
                  style={{
                    background: loading ? 'var(--color-brand-dim)' : 'var(--color-brand)',
                    color: '#fff',
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading && <Spinner size={14} color="#fff" />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </>
          )}

          {tab === 'signup' && (
            <>
              <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Create account
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Join FleetPulse operations
              </p>

              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-surface-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="rounded-lg px-3 py-2.5 text-sm flex items-center gap-2"
                    style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity flex items-center justify-center gap-2 mt-1"
                  style={{
                    background: loading ? 'var(--color-brand-dim)' : 'var(--color-brand)',
                    color: '#fff',
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading && <Spinner size={14} color="#fff" />}
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
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
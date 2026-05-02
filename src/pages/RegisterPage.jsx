import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PERKS = [
  'Save jobs and apply with one click',
  'Get email alerts for new local jobs',
  'Track your applications in one place',
  'Free forever — no credit card needed',
]

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/jobs'

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (error) setError('')
  }

  function validate() {
    if (!form.fullName.trim()) return 'Please enter your full name.'
    if (!form.email) return 'Please enter your email address.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const data = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName.trim(),
      })
      // If email confirmation is disabled in Supabase, user is signed in immediately.
      // If it's enabled, data.user exists but session is null until email is confirmed.
      if (data.session) {
        navigate(from, { replace: true })
      } else {
        setConfirmed(true)
      }
    } catch (err) {
      setError(err.message ?? 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 text-sm mb-2">
            We sent a confirmation link to <span className="font-semibold text-slate-700">{form.email}</span>.
          </p>
          <p className="text-slate-400 text-sm mb-8">Click the link in the email to activate your account, then sign in.</p>
          <Link
            to="/login"
            className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-green-800 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl text-slate-900">
            Northern<span className="text-green-700">Hires</span>
          </span>
        </Link>

        {/* Perks banner */}
        <div className="bg-green-900 text-white rounded-2xl p-5 mb-5">
          <p className="font-bold text-sm mb-3">Free for job seekers. Always.</p>
          <ul className="space-y-1.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-xs text-green-100">
                <CheckCircle size={13} className="text-green-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-7">Join thousands of Northern BC job seekers.</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Full name">
              <input
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              />
            </Field>

            <Field label="Email address">
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              />
            </Field>

            <Field label="Password" hint="Minimum 8 characters">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <PasswordStrength password={form.password} />
              )}
            </Field>

            <Field label="Confirm password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 transition-colors ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-green-500 focus:ring-green-100'
                  }`}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </Field>

            <p className="text-xs text-slate-400">
              By creating an account you agree to our{' '}
              <Link to="/privacy" className="text-green-700 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="font-semibold text-green-700 hover:text-green-800 transition-colors">
            Sign in
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/jobs" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Continue browsing without signing in →
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colours = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500']
  const textColours = ['', 'text-red-500', 'text-amber-500', 'text-blue-600', 'text-green-600']

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colours[score] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs font-medium ${textColours[score]}`}>{labels[score]}</p>
      )}
    </div>
  )
}

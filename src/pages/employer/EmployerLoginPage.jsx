import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Eye, EyeOff, AlertCircle, Loader2, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function EmployerLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/employers/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await signIn({ email: form.email, password: form.password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-green-800 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl text-slate-900">
            Northern<span className="text-green-700">Hires</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Employer sign in</h1>
              <p className="text-slate-400 text-xs mt-0.5">Manage your job listings</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          No employer account?{' '}
          <Link to="/employers/register" className="font-semibold text-green-700 hover:text-green-800 transition-colors">
            Create one now
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Looking for a job? Sign in as a job seeker →
          </Link>
        </p>
      </div>
    </div>
  )
}

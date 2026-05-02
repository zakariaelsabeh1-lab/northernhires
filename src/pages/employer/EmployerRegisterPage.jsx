import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const CITIES = [
  'Prince George', 'Vanderhoof', 'Fort St. James', 'Burns Lake',
  'Houston', 'Smithers', 'Fort St. John', 'Dawson Creek', 'Terrace', 'Mackenzie',
]

export default function EmployerRegisterPage() {
  const { signUpEmployer } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '', email: '', password: '', confirm: '',
    city: 'Prince George', phone: '', website: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (error) setError('')
  }

  function validate() {
    if (!form.companyName.trim()) return 'Please enter your company name.'
    if (!form.email) return 'Please enter your email address.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const data = await signUpEmployer({
        email: form.email,
        password: form.password,
        companyName: form.companyName.trim(),
        city: form.city,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
      })
      if (data.session) navigate('/employers/dashboard', { replace: true })
      else setConfirmed(true)
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
          <p className="text-slate-500 text-sm mb-8">
            We sent a confirmation link to <span className="font-semibold text-slate-700">{form.email}</span>.
            Click it to activate your employer account.
          </p>
          <Link to="/employers/login" className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-lg mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-green-800 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl text-slate-900">
            Northern<span className="text-green-700">Hires</span>
          </span>
        </Link>

        {/* Pricing callout */}
        <div className="bg-green-900 text-white rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-3">
            <Building2 size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Reach Northern BC candidates directly</p>
              <p className="text-green-200 text-xs leading-relaxed">
                Post jobs seen only by people who live and work here.
                From $49 per listing — no subscriptions, no per-applicant fees.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create employer account</h1>
          <p className="text-slate-500 text-sm mb-7">Set up your company profile to start posting jobs.</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Company name" required>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="Acme Logging Ltd."
                className={INPUT}
              />
            </FormField>

            <FormField label="Work email" required>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="hiring@yourcompany.com"
                className={INPUT}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Password" required hint="Min. 8 characters">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="••••••••"
                    className={INPUT + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm password" required>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                    placeholder="••••••••"
                    className={`${INPUT} pr-8 ${form.confirm && form.confirm !== form.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  {form.confirm && form.confirm === form.password && (
                    <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </FormField>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Company details <span className="font-normal text-slate-400">(optional)</span></p>
              <div className="space-y-4">
                <FormField label="City / Base location">
                  <select value={form.city} onChange={(e) => set('city', e.target.value)} className={INPUT}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Phone">
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="250-555-0100" className={INPUT} />
                  </FormField>
                  <FormField label="Website">
                    <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)}
                      placeholder="https://…" className={INPUT} />
                  </FormField>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              By creating an account you agree to our{' '}
              <Link to="/privacy" className="text-green-700 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create employer account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/employers/login" className="font-semibold text-green-700 hover:text-green-800 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors bg-white'

function FormField({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {required && <span className="text-red-400 text-xs">*</span>}
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

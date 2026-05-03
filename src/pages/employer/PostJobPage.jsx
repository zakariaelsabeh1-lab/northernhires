import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Info, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CATEGORIES, REGIONS, JOB_TYPES } from '../../hooks/useJobs'

const NORTHERN_BC_CITIES = [
  'Prince George', 'Vanderhoof', 'Fort St. James', 'Burns Lake', 'Smithers',
  'Terrace', 'Prince Rupert', 'Kitimat', 'Houston', 'Mackenzie', 'Fort Nelson',
  'Dawson Creek', 'Chetwynd', 'Tumbler Ridge', 'McBride', 'Valemount',
]

const APPLY_METHODS = [
  { value: 'site', label: 'On NorthernHires', desc: 'Applicants apply through this site' },
  { value: 'url', label: 'External link', desc: 'Redirect to your own application page' },
  { value: 'email', label: 'Email', desc: 'Applicants email you directly' },
]

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors bg-white'
const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5'

export default function PostJobPage() {
  const { employerProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    category: '',
    jobType: 'full-time',
    description: '',
    salaryType: 'hourly',
    salaryMin: '',
    salaryMax: '',
    city: employerProfile?.city ?? 'Prince George',
    region: employerProfile?.city ?? 'Prince George',
    applyMethod: 'site',
    applyUrl: '',
    applyEmail: '',
    expiresAt: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [matchedCount, setMatchedCount] = useState(null)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
    if (submitError) setSubmitError('')
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.category) e.category = 'Required'
    if (!form.description.trim() || form.description.trim().length < 50) e.description = 'Please write at least 50 characters'
    if (form.salaryType !== 'negotiable') {
      if (!form.salaryMin) e.salaryMin = 'Required'
      if (!form.salaryMax) e.salaryMax = 'Required'
      if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
        e.salaryMax = 'Must be ≥ minimum'
      }
    }
    if (form.applyMethod === 'url' && !form.applyUrl.trim()) e.applyUrl = 'Required'
    if (form.applyMethod === 'email' && !form.applyEmail.trim()) e.applyEmail = 'Required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        employer_id: employerProfile.id,
        title: form.title.trim(),
        category: form.category,
        job_type: form.jobType,
        description: form.description.trim(),
        salary_type: form.salaryType,
        salary_min: form.salaryType !== 'negotiable' && form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryType !== 'negotiable' && form.salaryMax ? Number(form.salaryMax) : null,
        city: form.city,
        province: 'BC',
        region: form.region,
        apply_url: form.applyMethod === 'url' ? form.applyUrl.trim() : null,
        apply_email: form.applyMethod === 'email' ? form.applyEmail.trim() : null,
        expires_at: form.expiresAt || null,
        is_active: true,
        is_featured: false,
        views: 0,
      }

      const { error } = await supabase.from('jobs').insert(payload)
      if (error) throw error

      navigate('/employers/dashboard', { state: { posted: true } })
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to post job. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!form.category || !form.region) { setMatchedCount(null); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('count_matched_seekers', {
        p_category: form.category,
        p_job_type: form.jobType,
        p_region:   form.region,
      })
      setMatchedCount(data ?? 0)
    }, 600)
    return () => clearTimeout(t)
  }, [form.category, form.jobType, form.region])

  const salaryPrefix = form.salaryType === 'hourly' ? '$/hr' : form.salaryType === 'annual' ? '$/yr' : ''

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/employers/dashboard" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Post a New Job</h1>
              <p className="text-xs text-slate-400 mt-0.5">{employerProfile?.company_name}</p>
            </div>
          </div>
          <Link to="/employers/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {submitError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Section 1 — Role */}
          <Section title="Role details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={LABEL}>Job title <Required /></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Heavy Equipment Operator"
                  className={INPUT + (errors.title ? ' border-red-300' : '')}
                />
                {errors.title && <FieldError msg={errors.title} />}
              </div>

              <div>
                <label className={LABEL}>Category <Required /></label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  className={INPUT + (errors.category ? ' border-red-300' : '')}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <FieldError msg={errors.category} />}
              </div>

              <div>
                <label className={LABEL}>Job type <Required /></label>
                <select value={form.jobType} onChange={(e) => set('jobType', e.target.value)} className={INPUT}>
                  {JOB_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>

            {matchedCount !== null && (
              <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-3.5 mt-2">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Users size={14} className="text-green-700" />
                </div>
                <span>
                  <strong>{matchedCount}</strong> job seeker{matchedCount !== 1 ? 's' : ''} {matchedCount === 1 ? 'has' : 'have'} preferences matching this role.
                </span>
              </div>
            )}
          </Section>

          {/* Section 2 — Compensation */}
          <Section title="Compensation">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Pay type <Required /></label>
                <select value={form.salaryType} onChange={(e) => set('salaryType', e.target.value)} className={INPUT}>
                  <option value="hourly">Hourly ($)</option>
                  <option value="annual">Annual salary</option>
                  <option value="negotiable">Negotiable / TBD</option>
                </select>
              </div>

              {form.salaryType !== 'negotiable' && (
                <>
                  <div>
                    <label className={LABEL}>Min {salaryPrefix} <Required /></label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.salaryMin}
                      onChange={(e) => set('salaryMin', e.target.value)}
                      placeholder={form.salaryType === 'hourly' ? '22' : '50000'}
                      className={INPUT + (errors.salaryMin ? ' border-red-300' : '')}
                    />
                    {errors.salaryMin && <FieldError msg={errors.salaryMin} />}
                  </div>
                  <div>
                    <label className={LABEL}>Max {salaryPrefix} <Required /></label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.salaryMax}
                      onChange={(e) => set('salaryMax', e.target.value)}
                      placeholder={form.salaryType === 'hourly' ? '32' : '70000'}
                      className={INPUT + (errors.salaryMax ? ' border-red-300' : '')}
                    />
                    {errors.salaryMax && <FieldError msg={errors.salaryMax} />}
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Section 3 — Location */}
          <Section title="Location">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>City <Required /></label>
                <select
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className={INPUT}
                >
                  {NORTHERN_BC_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Region <Required /></label>
                <select value={form.region} onChange={(e) => set('region', e.target.value)} className={INPUT}>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* Section 4 — Description */}
          <Section title="Job description">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-4 text-xs text-blue-700">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>Include responsibilities, required qualifications, and any certifications. More detail = better applicants.</span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={10}
              placeholder="Describe the role, day-to-day responsibilities, required experience, certifications, and any perks or benefits..."
              className={INPUT + ' resize-y leading-relaxed ' + (errors.description ? 'border-red-300' : '')}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.description
                ? <FieldError msg={errors.description} />
                : <span className="text-xs text-slate-400">Minimum 50 characters</span>
              }
              <span className={`text-xs ${form.description.length < 50 ? 'text-slate-300' : 'text-green-600'}`}>
                {form.description.length} chars
              </span>
            </div>
          </Section>

          {/* Section 5 — How to apply */}
          <Section title="How to apply">
            <div className="space-y-2 mb-4">
              {APPLY_METHODS.map(({ value, label, desc }) => (
                <label key={value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    form.applyMethod === value
                      ? 'border-green-400 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input type="radio" name="applyMethod" value={value}
                    checked={form.applyMethod === value}
                    onChange={() => set('applyMethod', value)}
                    className="accent-green-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {form.applyMethod === 'url' && (
              <div>
                <label className={LABEL}>Application URL <Required /></label>
                <input type="url" value={form.applyUrl} onChange={(e) => set('applyUrl', e.target.value)}
                  placeholder="https://yourcompany.com/apply"
                  className={INPUT + (errors.applyUrl ? ' border-red-300' : '')} />
                {errors.applyUrl && <FieldError msg={errors.applyUrl} />}
              </div>
            )}

            {form.applyMethod === 'email' && (
              <div>
                <label className={LABEL}>Application email <Required /></label>
                <input type="email" value={form.applyEmail} onChange={(e) => set('applyEmail', e.target.value)}
                  placeholder="hiring@yourcompany.com"
                  className={INPUT + (errors.applyEmail ? ' border-red-300' : '')} />
                {errors.applyEmail && <FieldError msg={errors.applyEmail} />}
              </div>
            )}
          </Section>

          {/* Section 6 — Options */}
          <Section title="Listing options">
            <div className="max-w-xs">
              <label className={LABEL}>Listing expiry <span className="font-normal text-slate-400 text-xs">(optional)</span></label>
              <input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={INPUT} />
              <p className="text-xs text-slate-400 mt-1.5">Leave blank to keep active until manually closed.</p>
            </div>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-none bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Posting…' : 'Post job listing'}
            </button>
            <Link to="/employers/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Required() {
  return <span className="text-red-400 text-xs ml-0.5">*</span>
}

function FieldError({ msg }) {
  return <p className="text-xs text-red-500 mt-1">{msg}</p>
}

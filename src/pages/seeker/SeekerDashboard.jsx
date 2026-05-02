import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark, Bell, MapPin, Building2, Briefcase,
  Loader2, AlertCircle, Trash2, ArrowRight, User,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useSavedJobs } from '../../context/SavedJobsContext'

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'contract': 'Contract',
  'casual': 'Casual', 'seasonal': 'Seasonal', 'apprenticeship': 'Apprenticeship',
}

function formatSalary(min, max, type) {
  if (type === 'negotiable' || (!min && !max)) return 'Salary negotiable'
  const fmt = (n) => type === 'hourly' ? `$${n}/hr` : `$${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (d < 1) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}

const TABS = [
  { key: 'saved', label: 'Saved Jobs', icon: Bookmark },
  { key: 'alerts', label: 'Job Alerts', icon: Bell },
]

export default function SeekerDashboard({ defaultTab = 'saved' }) {
  const { user, profile } = useAuth()
  const { toggleSave } = useSavedJobs()
  const [tab, setTab] = useState(defaultTab)

  const firstName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-100 -mb-px">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === key
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'saved' && <SavedJobsTab profile={profile} toggleSave={toggleSave} />}
        {tab === 'alerts' && <AlertsTab user={user} profile={profile} />}
      </div>
    </div>
  )
}

/* ── Saved Jobs tab ───────────────────────────────────────── */
function SavedJobsTab({ profile, toggleSave }) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('saved_jobs')
      .select(`
        id, created_at,
        jobs (
          id, title, category, job_type, salary_min, salary_max, salary_type,
          city, region, is_active, created_at,
          employers ( company_name, logo_url, verified )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setJobs(data?.filter((r) => r.jobs) ?? [])
        setLoading(false)
      })
  }, [user])

  async function handleUnsave(savedRowId, jobId) {
    setJobs((prev) => prev.filter((r) => r.id !== savedRowId))
    await toggleSave(jobId)
  }

  if (!user) return (
    <div className="text-center py-16">
      <p className="text-slate-500 text-sm mb-4">Sign in to view your saved jobs.</p>
      <Link to="/login" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Sign In <ArrowRight size={15} />
      </Link>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
      <Loader2 size={20} className="animate-spin text-green-600" />
      <span className="text-sm">Loading saved jobs…</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
      <AlertCircle size={16} className="shrink-0" />{error}
    </div>
  )

  if (jobs.length === 0) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Bookmark size={24} className="text-slate-300" />
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">No saved jobs yet</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
        Hit the bookmark icon on any job listing to save it here.
      </p>
      <Link to="/jobs" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Browse Jobs <ArrowRight size={15} />
      </Link>
    </div>
  )

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        <span className="font-semibold text-slate-800">{jobs.length}</span> saved job{jobs.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-3">
        {jobs.map(({ id: savedId, created_at: savedAt, jobs: job }) => (
          <div key={savedId} className={`bg-white rounded-xl border shadow-sm p-5 flex gap-4 items-start transition-opacity ${!job.is_active ? 'opacity-60' : ''}`}>
            {/* Logo */}
            <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {job.employers?.logo_url
                ? <img src={job.employers.logo_url} alt="" className="w-full h-full object-contain p-1" />
                : <Building2 size={18} className="text-slate-400" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/jobs/${job.id}`}
                    className="font-semibold text-slate-900 hover:text-green-700 text-sm transition-colors block truncate">
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                    {job.employers && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} />{job.employers.company_name}
                        {job.employers.verified && <span className="text-green-600">✓</span>}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.region || job.city}, BC</span>
                    <span>{job.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleUnsave(savedId, job.id)}
                  title="Remove from saved"
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                  {TYPE_LABELS[job.job_type] || job.job_type}
                </span>
                <span className="text-xs text-slate-500">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {!job.is_active ? '⚠ Listing closed' : `Saved ${timeAgo(savedAt)}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Alerts tab ───────────────────────────────────────────── */
import { CATEGORIES, REGIONS } from '../../hooks/useJobs'

function AlertsTab({ user, profile }) {
  const [existing, setExisting] = useState(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [email, setEmail] = useState(user?.email ?? '')
  const [selectedCats, setSelectedCats] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.email) { setLoadingExisting(false); return }
    supabase
      .from('job_alerts')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExisting(data)
          setSelectedCats(data.categories ?? [])
          setSelectedRegions(data.regions ?? [])
        }
        setLoadingExisting(false)
      })
  }, [user])

  function toggleCat(cat) {
    setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])
    setSaved(false)
  }

  function toggleRegion(r) {
    setSelectedRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (selectedCats.length === 0) { setError('Select at least one job category.'); return }
    setError('')
    setSaving(true)
    const payload = {
      email: email.trim().toLowerCase(),
      categories: selectedCats,
      regions: selectedRegions,
      job_seeker_id: profile?.id ?? null,
      active: true,
    }
    const { error: dbErr } = existing
      ? await supabase.from('job_alerts').update(payload).eq('id', existing.id)
      : await supabase.from('job_alerts').upsert(payload, { onConflict: 'email' })
    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    setSaved(true)
    setSaving(false)
  }

  if (loadingExisting) return (
    <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
      <Loader2 size={20} className="animate-spin text-green-600" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-green-700" />
          </div>
          <h2 className="font-bold text-slate-900">Job Alerts</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          Get an email when new matching jobs are posted in Northern BC.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5 mb-4">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSaved(false) }}
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Job categories <span className="text-red-400 text-xs">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label key={cat}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-sm transition-colors ${
                    selectedCats.includes(cat)
                      ? 'border-green-400 bg-green-50 text-green-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat)}
                    onChange={() => toggleCat(cat)}
                    className="accent-green-700 shrink-0"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 mt-1">
              Regions <span className="text-slate-400 font-normal text-xs">(optional — leave blank for all)</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selectedRegions.includes(r)
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Saving…' : existing ? 'Update alerts' : 'Subscribe to alerts'}
          </button>

          {saved && (
            <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
              <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
              {existing ? 'Alert preferences updated.' : 'You\'re subscribed! We\'ll email you when matching jobs are posted.'}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

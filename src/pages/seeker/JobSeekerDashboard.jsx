import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bookmark, Bell, User, MapPin, Briefcase, Building2,
  Loader2, AlertCircle, Trash2, ArrowRight, Pencil, Check,
  X, Phone, FileText, CheckCircle2, Upload, ExternalLink, Trash,
  Star, DollarSign, ClipboardList, Sparkles, Download,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useSavedJobs } from '../../context/SavedJobsContext'
import { CATEGORIES, REGIONS, JOB_TYPES } from '../../hooks/useJobs'

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

const NAV = [
  { key: 'recommended',  label: 'Recommended',    icon: Star },
  { key: 'saved',        label: 'Saved Jobs',      icon: Bookmark },
  { key: 'applications', label: 'My Applications', icon: ClipboardList },
  { key: 'profile',      label: 'My Profile',      icon: User },
  { key: 'resume',       label: 'Resume',          icon: FileText },
  { key: 'alerts',       label: 'Job Alerts',      icon: Bell },
]

export default function JobSeekerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { savedIds } = useSavedJobs()
  const [section, setSection] = useState(searchParams.get('tab') ?? 'recommended')

  const firstName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  function goTo(key) {
    setSection(key)
    setSearchParams({ tab: key }, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight">Welcome back, {firstName}</h1>
              <p className="text-green-300 text-sm mt-0.5 truncate">{user?.email}</p>
            </div>
            <div className="flex gap-4 sm:gap-6 mt-1 sm:mt-0">
              <Stat label="Saved Jobs" value={savedIds.size} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {NAV.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => goTo(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-slate-100 last:border-0 ${
                    section === key
                      ? 'bg-green-50 text-green-800 border-l-2 border-l-green-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} className={section === key ? 'text-green-600' : 'text-slate-400'} />
                  {label}
                  {key === 'saved' && savedIds.size > 0 && (
                    <span className="ml-auto text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      {savedIds.size}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <Link
              to="/resume-builder"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-t border-slate-100"
            >
              <Sparkles size={16} className="text-slate-400" />
              AI Resume Builder
              <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">New</span>
            </Link>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <CheckCircle2 size={18} className="text-green-600 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-green-800 mb-0.5">Always free</p>
              <p className="text-xs text-green-600">NorthernHires never charges job seekers.</p>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {section === 'recommended'  && <RecommendedSection user={user} onSetPrefs={() => goTo('profile')} />}
            {section === 'saved'        && <SavedSection />}
            {section === 'applications' && <ApplicationsSection user={user} profile={profile} />}
            {section === 'profile'      && <ProfileSection profile={profile} user={user} />}
            {section === 'resume'       && <ResumeSection profile={profile} user={user} />}
            {section === 'alerts'       && <AlertsSection user={user} profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-green-300 text-xs">{label}</p>
    </div>
  )
}

/* ── Recommended Jobs ──────────────────────────────────────── */
function RecommendedSection({ user, onSetPrefs }) {
  const [prefs, setPrefs] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    async function load() {
      const { data: seeker } = await supabase
        .from('job_seekers')
        .select('preferred_categories, preferred_job_type, preferred_region')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!seeker) { setLoading(false); return }
      setPrefs(seeker)

      const cats    = seeker.preferred_categories ?? []
      const jobType = seeker.preferred_job_type   ?? ''
      const region  = seeker.preferred_region     ?? ''

      if (cats.length === 0 && !jobType && !region) {
        setLoading(false)
        return
      }

      let q = supabase
        .from('jobs')
        .select(`id, title, category, job_type, salary_min, salary_max, salary_type,
                 city, region, created_at,
                 employers ( company_name, logo_url, verified )`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12)

      if (cats.length > 0) q = q.in('category', cats)
      if (jobType)          q = q.eq('job_type', jobType)
      if (region)           q = q.eq('region', region)

      const { data, error: err } = await q
      if (err) setError(err.message)
      else setJobs(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} />

  const noPrefs = !prefs || (
    (prefs.preferred_categories?.length ?? 0) === 0 &&
    !prefs.preferred_job_type &&
    !prefs.preferred_region
  )

  if (noPrefs) return (
    <div>
      <SectionHeader icon={Star} title="Recommended Jobs" sub="Jobs matched to your preferences" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-green-100 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star size={24} className="text-green-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">Set your job preferences</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          Tell us what kind of work you're looking for and we'll show you matching jobs.
        </p>
        <button
          onClick={onSetPrefs}
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Set preferences in My Profile <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )

  if (jobs.length === 0) return (
    <div>
      <SectionHeader icon={Star} title="Recommended Jobs" sub="Jobs matched to your preferences" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-slate-300" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">No matches right now</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          There are no active jobs matching your preferences at the moment. Check back soon or browse all jobs.
        </p>
        <Link to="/jobs"
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Browse all jobs <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )

  return (
    <div>
      <SectionHeader icon={Star} title="Recommended Jobs" sub={`${jobs.length} job${jobs.length !== 1 ? 's' : ''} matching your preferences`} />
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="flex gap-4 items-start">
              <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {job.employers?.logo_url
                  ? <img src={job.employers.logo_url} alt="" className="w-full h-full object-contain p-1" />
                  : <Building2 size={18} className="text-slate-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{job.title}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      {job.employers && (
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} />{job.employers.company_name}
                          {job.employers.verified && <span className="text-green-600">✓</span>}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><MapPin size={11} />{job.region || job.city}, BC</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(job.created_at)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[job.job_type] || job.job_type}
                  </span>
                  <span className="text-xs text-slate-400">{job.category}</span>
                  <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                    <DollarSign size={11} />{formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-5 text-center">
        <Link to="/jobs" className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
          Browse all jobs →
        </Link>
      </div>
    </div>
  )
}

/* ── Saved Jobs ────────────────────────────────────────────── */
function SavedSection() {
  const { user } = useAuth()
  const { toggleSave } = useSavedJobs()
  const [rows, setRows] = useState([])
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
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setRows(data?.filter((r) => r.jobs) ?? [])
        setLoading(false)
      })
  }, [user])

  async function handleUnsave(rowId, jobId) {
    setRows((prev) => prev.filter((r) => r.id !== rowId))
    await toggleSave(jobId)
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBanner msg={error} />

  if (rows.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Bookmark size={24} className="text-slate-300" />
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">No saved jobs yet</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
        Tap the bookmark icon on any listing to save it here.
      </p>
      <Link to="/jobs"
        className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Browse Jobs <ArrowRight size={15} />
      </Link>
    </div>
  )

  return (
    <div>
      <SectionHeader icon={Bookmark} title="Saved Jobs" sub={`${rows.length} saved job${rows.length !== 1 ? 's' : ''}`} />
      <div className="space-y-3">
        {rows.map(({ id: rowId, created_at: savedAt, jobs: job }) => (
          <div
            key={rowId}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex gap-4 items-start transition-opacity ${!job.is_active ? 'opacity-55' : ''}`}
          >
            <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {job.employers?.logo_url
                ? <img src={job.employers.logo_url} alt="" className="w-full h-full object-contain p-1" />
                : <Building2 size={18} className="text-slate-400" />
              }
            </div>
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
                    <span className="text-slate-400">{job.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsave(rowId, job.id)}
                  title="Remove"
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

/* ── Profile ───────────────────────────────────────────────── */
function ProfileSection({ profile, user }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name:            profile?.full_name            ?? '',
    phone:                profile?.phone                ?? '',
    city:                 profile?.city                 ?? '',
    bio:                  profile?.bio                  ?? '',
    preferred_categories: profile?.preferred_categories ?? [],
    preferred_job_type:   profile?.preferred_job_type   ?? '',
    preferred_region:     profile?.preferred_region     ?? '',
    skills:               profile?.skills               ?? [],
  })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (profile) setForm({
      full_name:            profile.full_name            ?? '',
      phone:                profile.phone                ?? '',
      city:                 profile.city                 ?? '',
      bio:                  profile.bio                  ?? '',
      preferred_categories: profile.preferred_categories ?? [],
      preferred_job_type:   profile.preferred_job_type   ?? '',
      preferred_region:     profile.preferred_region     ?? '',
      skills:               profile.skills               ?? [],
    })
  }, [profile])

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); setSaved(false) }

  function toggleArr(field, val) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }))
    setSaved(false)
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Full name is required.'); return }
    setError(''); setSaving(true)
    const { error: dbErr } = await supabase
      .from('job_seekers')
      .update({
        full_name:            form.full_name.trim(),
        phone:                form.phone.trim() || null,
        city:                 form.city.trim() || null,
        bio:                  form.bio.trim() || null,
        preferred_categories: form.preferred_categories,
        preferred_job_type:   form.preferred_job_type || null,
        preferred_region:     form.preferred_region || null,
        skills:               form.skills,
      })
      .eq('user_id', user.id)
    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleCancel() {
    setEditing(false); setError('')
    setForm({
      full_name:            profile?.full_name            ?? '',
      phone:                profile?.phone                ?? '',
      city:                 profile?.city                 ?? '',
      bio:                  profile?.bio                  ?? '',
      preferred_categories: profile?.preferred_categories ?? [],
      preferred_job_type:   profile?.preferred_job_type   ?? '',
      preferred_region:     profile?.preferred_region     ?? '',
      skills:               profile?.skills               ?? [],
    })
  }

  const hasPrefs =
    form.preferred_categories.length > 0 || !!form.preferred_job_type || !!form.preferred_region || form.skills.length > 0

  return (
    <div>
      <SectionHeader icon={User} title="My Profile" sub="Your personal details and job preferences" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
              <User size={18} className="text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{profile?.full_name ?? '—'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {error && <ErrorBanner msg={error} />}
          {editing ? (
            <>
              {/* Basic details */}
              <Field label="Full name" required>
                <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={INPUT} placeholder="Your full name" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone">
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`${INPUT} pl-9`} placeholder="+1 (250) 555-0100" />
                  </div>
                </Field>
                <Field label="City">
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.city} onChange={(e) => set('city', e.target.value)} className={`${INPUT} pl-9`} placeholder="Prince George" />
                  </div>
                </Field>
              </div>
              <Field label="Bio">
                <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} className={INPUT} placeholder="Tell employers a bit about yourself…" />
              </Field>

              {/* Job preferences */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Star size={14} className="text-green-600" /> Job Preferences
                </p>
                <p className="text-xs text-slate-400 mb-4">Used to match you with relevant job listings.</p>

                <Field label="Preferred categories">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {CATEGORIES.map((cat) => {
                      const on = form.preferred_categories.includes(cat)
                      return (
                        <label key={cat}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-sm transition-colors select-none ${
                            on ? 'border-green-400 bg-green-50 text-green-800' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}>
                          <input type="checkbox" checked={on} onChange={() => toggleArr('preferred_categories', cat)} className="accent-green-700 shrink-0" />
                          {cat}
                        </label>
                      )
                    })}
                  </div>
                </Field>

                <Field label="Preferred job type">
                  <select value={form.preferred_job_type} onChange={(e) => set('preferred_job_type', e.target.value)} className={INPUT}>
                    <option value="">Any job type</option>
                    {JOB_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>

                <Field label="Preferred region">
                  <select value={form.preferred_region} onChange={(e) => set('preferred_region', e.target.value)} className={INPUT}>
                    <option value="">All of Northern BC</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                <Field label="Skills">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => set('skills', form.skills.filter((x) => x !== s))} className="text-green-500 hover:text-green-800">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                        e.preventDefault()
                        const s = skillInput.trim().replace(/,$/, '')
                        if (s && !form.skills.includes(s)) set('skills', [...form.skills, s])
                        setSkillInput('')
                      }
                    }}
                    className={INPUT}
                    placeholder="Type a skill and press Enter"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Press Enter or comma to add each skill.</p>
                </Field>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={handleCancel}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <X size={14} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <ProfileRow icon={User}     label="Full name" value={profile?.full_name} />
              <ProfileRow icon={Phone}    label="Phone"     value={profile?.phone} />
              <ProfileRow icon={MapPin}   label="City"      value={profile?.city ? `${profile.city}, BC` : null} />
              <ProfileRow icon={FileText} label="Bio"       value={profile?.bio} multiline />

              {/* Job preferences view */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Star size={12} className="text-green-600" /> Job Preferences
                </p>
                {hasPrefs ? (
                  <div className="space-y-3">
                    {form.preferred_categories.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {form.preferred_categories.map((c) => (
                            <span key={c} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {form.preferred_job_type && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">Job type</p>
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{TYPE_LABELS[form.preferred_job_type] ?? form.preferred_job_type}</span>
                      </div>
                    )}
                    {form.preferred_region && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">Region</p>
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{form.preferred_region}</span>
                      </div>
                    )}
                    {form.skills?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {form.skills.map((s) => (
                            <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No preferences set — click Edit to add them.</p>
                )}
              </div>

              {saved && (
                <p className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} className="shrink-0" /> Profile updated successfully.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <AiResumeCard user={user} />
    </div>
  )
}

function AiResumeCard({ user }) {
  const [aiResume, setAiResume] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('job_seekers')
      .select('ai_resume')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { setAiResume(data?.ai_resume ?? null); setLoading(false) })
  }, [user])

  function handlePrint() {
    const style = document.createElement('style')
    style.id = 'ai-resume-print-style'
    style.textContent = `
      @media print {
        * { visibility: hidden !important; }
        #ai-resume-preview, #ai-resume-preview * { visibility: visible !important; }
        #ai-resume-preview { position: fixed !important; top: 0; left: 0; width: 100%; background: white; }
      }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => { document.getElementById('ai-resume-print-style')?.remove() }, 500)
  }

  async function handleDelete() {
    if (!window.confirm('Delete your saved AI resume? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('job_seekers').update({ ai_resume: null }).eq('user_id', user.id)
    setAiResume(null)
    setDeleting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-5">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Sparkles size={15} className="text-green-600" />
          <div>
            <p className="font-semibold text-slate-900 text-sm">AI-Generated Resume</p>
            <p className="text-xs text-slate-400">Built with the AI Resume Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiResume ? (
            <>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                <Download size={12} /> Download PDF
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
              </button>
              <Link to="/resume-builder"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                Rebuild
              </Link>
            </>
          ) : (
            <Link to="/resume-builder"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
              Build Resume
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
          <Loader2 size={15} className="animate-spin text-green-600" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : aiResume ? (
        <div id="ai-resume-preview" className="overflow-auto max-h-[600px]" dangerouslySetInnerHTML={{ __html: aiResume }} />
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
          <Sparkles size={22} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">No AI resume yet</p>
          <p className="text-xs text-slate-400 max-w-xs">Use the AI Resume Builder to generate a professionally formatted resume in seconds.</p>
        </div>
      )}
    </div>
  )
}

function ProfileRow({ icon: Icon, label, value, multiline }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        {value
          ? <p className={`text-sm text-slate-800 ${multiline ? 'whitespace-pre-line' : 'truncate'}`}>{value}</p>
          : <p className="text-sm text-slate-400 italic">Not set</p>
        }
      </div>
    </div>
  )
}

/* ── Resume ────────────────────────────────────────────────── */
function ResumeSection({ profile, user }) {
  const fileRef = useRef(null)
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [aiResume, setAiResume] = useState(null)
  const [aiResumeLoading, setAiResumeLoading] = useState(true)

  useEffect(() => {
    if (!user) { setAiResumeLoading(false); return }
    supabase
      .from('job_seekers')
      .select('ai_resume')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAiResume(data?.ai_resume ?? null)
        setAiResumeLoading(false)
      })
  }, [user])

  const storagePath = `${user?.id}/resume.pdf`

  async function uploadFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB.'); return }
    setError(''); setSuccess(''); setUploading(true); setProgress(10)
    const { error: upErr } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, { upsert: true, contentType: 'application/pdf' })
    if (upErr) { setError(upErr.message); setUploading(false); setProgress(0); return }
    setProgress(70)
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(storagePath)
    const { error: dbErr } = await supabase.from('job_seekers').update({ resume_url: publicUrl }).eq('user_id', user.id)
    if (dbErr) { setError(dbErr.message); setUploading(false); setProgress(0); return }
    setResumeUrl(publicUrl); setProgress(100); setUploading(false)
    setSuccess('Resume uploaded successfully.')
    setTimeout(() => { setSuccess(''); setProgress(0) }, 3000)
  }

  async function handleDelete() {
    setDeleting(true); setError(''); setSuccess('')
    await supabase.storage.from('resumes').remove([storagePath])
    const { error: dbErr } = await supabase.from('job_seekers').update({ resume_url: null }).eq('user_id', user.id)
    if (dbErr) { setError(dbErr.message); setDeleting(false); return }
    setResumeUrl(null); setDeleting(false)
    setSuccess('Resume removed.')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <SectionHeader icon={FileText} title="Resume" sub="Upload a PDF — visible to employers when you apply" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {error   && <ErrorBanner msg={error} />}
        {success && (
          <p className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={15} className="shrink-0" /> {success}
          </p>
        )}
        {resumeUrl && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={16} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">resume.pdf</p>
              <p className="text-xs text-slate-400">PDF document</p>
            </div>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors shrink-0">
              <ExternalLink size={12} /> View
            </a>
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50">
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash size={15} />}
            </button>
          </div>
        )}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadFile(e.target.files[0])} />
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {uploading ? <Loader2 size={22} className="text-green-600 animate-spin" /> : <Upload size={22} className="text-green-600" />}
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            {uploading ? 'Uploading…' : resumeUrl ? 'Replace resume' : 'Upload your resume'}
          </p>
          <p className="text-xs text-slate-400">{uploading ? '' : 'Drag & drop or click to browse · PDF only · Max 5 MB'}</p>
          {uploading && progress > 0 && (
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          For best experience viewing resumes please use a desktop browser.
        </p>
        <p className="text-xs text-slate-400">Your resume is stored securely and only shared when you choose to apply for a job.</p>
      </div>

      {/* AI-generated resume */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-green-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">AI-Generated Resume</p>
              <p className="text-xs text-slate-400">Created with the AI Resume Builder</p>
            </div>
          </div>
          <Link
            to="/resume-builder"
            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            {aiResume ? 'Rebuild' : 'Build Resume'}
          </Link>
        </div>
        {aiResumeLoading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
            <Loader2 size={16} className="animate-spin text-green-600" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : aiResume ? (
          <div className="overflow-auto" dangerouslySetInnerHTML={{ __html: aiResume }} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <Sparkles size={22} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">No AI resume yet</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Use the AI Resume Builder to generate a professionally formatted resume in seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── My Applications ─────────────────────────────────────────── */
const APP_STATUS_STYLES = {
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  reviewed:    'bg-blue-100 text-blue-700 border-blue-100',
  shortlisted: 'bg-green-100 text-green-700 border-green-200',
  rejected:    'bg-red-100 text-red-600 border-red-200',
}
const APP_STATUS_LABELS = {
  pending: 'Pending', reviewed: 'Reviewed', shortlisted: 'Shortlisted', rejected: 'Rejected',
}

function ApplicationsSection({ user, profile }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !profile) { setLoading(false); return }
    supabase
      .from('job_applications')
      .select('id, created_at, status, jobs ( id, title, employers ( company_name ) )')
      .eq('job_seeker_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setApps(data ?? [])
        setLoading(false)
      })
  }, [user, profile])

  if (loading) return <Spinner />
  if (error) return <ErrorBanner msg={error} />

  if (apps.length === 0) return (
    <div>
      <SectionHeader icon={ClipboardList} title="My Applications" sub="Jobs you've applied to" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={24} className="text-slate-300" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">No applications yet</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          Once you apply for jobs, they'll appear here so you can track your progress.
        </p>
        <Link to="/jobs"
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Browse Jobs <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )

  return (
    <div>
      <SectionHeader icon={ClipboardList} title="My Applications" sub={`${apps.length} application${apps.length !== 1 ? 's' : ''}`} />
      <div className="space-y-3">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${app.jobs?.id}`}
                  className="font-semibold text-slate-900 hover:text-green-700 text-sm transition-colors block truncate">
                  {app.jobs?.title ?? 'Job listing'}
                </Link>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                  {app.jobs?.employers?.company_name && (
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />{app.jobs.employers.company_name}
                    </span>
                  )}
                  <span className="text-slate-400">Applied {timeAgo(app.created_at)}</span>
                </div>
              </div>
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${APP_STATUS_STYLES[app.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {APP_STATUS_LABELS[app.status] ?? app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Job Alerts ────────────────────────────────────────────── */
function AlertsSection({ user, profile }) {
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
    supabase.from('job_alerts').select('*').eq('email', user.email).maybeSingle()
      .then(({ data }) => {
        if (data) { setExisting(data); setSelectedCats(data.categories ?? []); setSelectedRegions(data.regions ?? []) }
        setLoadingExisting(false)
      })
  }, [user])

  function toggleCat(cat) { setSelectedCats((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]); setSaved(false) }
  function toggleRegion(r) { setSelectedRegions((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]); setSaved(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (selectedCats.length === 0) { setError('Select at least one job category.'); return }
    setError(''); setSaving(true)
    const payload = { email: email.trim().toLowerCase(), categories: selectedCats, regions: selectedRegions, job_seeker_id: profile?.id ?? null, active: true }
    const { error: dbErr } = existing
      ? await supabase.from('job_alerts').update(payload).eq('id', existing.id)
      : await supabase.from('job_alerts').upsert(payload, { onConflict: 'user_id' })
    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    if (!existing) setExisting(payload)
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 4000)
  }

  if (loadingExisting) return <Spinner />

  return (
    <div>
      <SectionHeader icon={Bell} title="Job Alerts" sub="Get emailed when new matching jobs are posted" />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {error && <ErrorBanner msg={error} className="mb-4" />}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Field label="Email address">
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false) }}
              placeholder="you@example.com" className={INPUT} />
          </Field>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Job categories <span className="text-red-400 text-xs">*</span>
              {selectedCats.length > 0 && (
                <span className="ml-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                  {selectedCats.length} selected
                </span>
              )}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const on = selectedCats.includes(cat)
                return (
                  <label key={cat}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-sm transition-colors select-none ${
                      on ? 'border-green-400 bg-green-50 text-green-800' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <input type="checkbox" checked={on} onChange={() => toggleCat(cat)} className="accent-green-700 shrink-0" />
                    {cat}
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Regions <span className="ml-1 text-slate-400 font-normal text-xs">optional — leave blank for all of Northern BC</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {REGIONS.map((r) => {
                const on = selectedRegions.includes(r)
                return (
                  <button key={r} type="button" onClick={() => toggleRegion(r)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      on ? 'bg-green-700 text-white border-green-700' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-700'
                    }`}>
                    {r}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : existing ? 'Update alerts' : 'Subscribe to alerts'}
            </button>
            {saved && (
              <p className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                <CheckCircle2 size={15} />
                {existing ? 'Alert preferences updated.' : 'Subscribed!'}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Shared ────────────────────────────────────────────────── */
const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors'

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={16} className="text-green-700" />
      </div>
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
      <Loader2 size={20} className="animate-spin text-green-600" />
      <span className="text-sm">Loading…</span>
    </div>
  )
}

function ErrorBanner({ msg, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5 ${className}`}>
      <AlertCircle size={15} className="shrink-0" />{msg}
    </div>
  )
}

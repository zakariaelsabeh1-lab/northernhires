import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Plus, Eye, Users, Briefcase, TrendingUp, CheckCircle,
  Clock, XCircle, MoreVertical, MapPin, Loader2, AlertCircle, Building2,
  FileText, ChevronDown, ChevronUp, Mail, Phone,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'contract': 'Contract',
  'casual': 'Casual', 'seasonal': 'Seasonal', 'apprenticeship': 'Apprenticeship',
}

const STATUS_LABELS = { pending: 'Pending', reviewed: 'Reviewed', shortlisted: 'Shortlisted', rejected: 'Rejected' }
const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-100',
  shortlisted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-600 border-red-200',
}

function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (d < 1) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

function isExpired(expiresAt) {
  return expiresAt && new Date(expiresAt) < new Date()
}

export default function EmployerDashboard() {
  const { employerProfile } = useAuth()
  const location = useLocation()
  const justPosted = location.state?.posted

  const [activeTab, setActiveTab] = useState('listings')

  // Listings state
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('active')
  const [actionJob, setActionJob] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [qualifiedCounts, setQualifiedCounts] = useState({})

  // Qualified candidates tab state
  const [qualifiedTabJobId, setQualifiedTabJobId] = useState(null)
  const [qualifiedSeekers, setQualifiedSeekers] = useState([])
  const [qualifiedLoading, setQualifiedLoading] = useState(false)
  const [qualifiedError, setQualifiedError] = useState(null)

  // Applications state
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appsError, setAppsError] = useState(null)
  const [expandedApps, setExpandedApps] = useState({})

  useEffect(() => { fetchJobs() }, [employerProfile])

  useEffect(() => {
    if (activeTab === 'applications' && employerProfile) fetchApplications()
  }, [activeTab, employerProfile])

  async function fetchJobs() {
    if (!employerProfile) return
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, category, job_type, city, region, is_active, is_featured, views, created_at, expires_at')
      .eq('employer_id', employerProfile.id)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setJobs(data ?? [])
      fetchQualifiedCounts(data ?? [])
    }
    setLoading(false)
  }

  async function fetchQualifiedSeekers(job) {
    setQualifiedTabJobId(job.id)
    setActiveTab('qualified')
    setQualifiedLoading(true)
    setQualifiedError(null)
    const { data, error } = await supabase
      .from('job_seekers')
      .select('id, full_name, email, preferred_categories, preferred_region, city')
      .contains('preferred_categories', [job.category])
    if (error) { setQualifiedError(error.message); setQualifiedLoading(false); return }
    setQualifiedSeekers((data ?? []).filter(s => !s.preferred_region || s.preferred_region === job.region))
    setQualifiedLoading(false)
  }

  async function fetchQualifiedCounts(jobList) {
    if (!jobList.length) return
    const { data: seekers } = await supabase
      .from('job_seekers')
      .select('preferred_categories, preferred_region')
    if (!seekers) return
    const counts = {}
    for (const job of jobList) {
      counts[job.id] = seekers.filter((s) => {
        const catMatch = Array.isArray(s.preferred_categories) && s.preferred_categories.includes(job.category)
        const regionMatch = !s.preferred_region || s.preferred_region === job.region
        return catMatch && regionMatch
      }).length
    }
    setQualifiedCounts(counts)
  }

  async function fetchApplications() {
    setAppsLoading(true)
    setAppsError(null)
    const { data, error } = await supabase
      .from('job_applications')
      .select('id, full_name, email, phone, years_of_experience, cover_letter, resume_url, status, created_at, jobs(id, title)')
      .eq('employer_id', employerProfile.id)
      .order('created_at', { ascending: false })
    if (error) setAppsError(error.message)
    else setApplications(data ?? [])
    setAppsLoading(false)
  }

  async function toggleActive(job) {
    setTogglingId(job.id)
    const { error } = await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id)
    if (!error) setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_active: !j.is_active } : j))
    setTogglingId(null)
    setActionJob(null)
  }

  async function updateAppStatus(appId, status) {
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', appId)
    if (!error) setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
  }

  const displayed = jobs.filter((j) => {
    if (filter === 'active') return j.is_active && !isExpired(j.expires_at)
    if (filter === 'inactive') return !j.is_active
    if (filter === 'expired') return j.is_active && isExpired(j.expires_at)
    return true
  })

  const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0)
  const activeCount = jobs.filter((j) => j.is_active && !isExpired(j.expires_at)).length

  // Group applications by job
  const appsByJob = applications.reduce((acc, app) => {
    const jobId = app.jobs?.id || 'unknown'
    if (!acc[jobId]) acc[jobId] = { title: app.jobs?.title || 'Unknown Job', apps: [] }
    acc[jobId].apps.push(app)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-green-700" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {employerProfile?.company_name}
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {employerProfile?.city}, BC
                </p>
              </div>
            </div>
            <Link
              to="/employers/post-job"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <Plus size={16} /> Post New Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Success toast */}
        {justPosted && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-4 mb-6">
            <CheckCircle size={16} className="text-green-600 shrink-0" />
            Your job listing is live and visible to Northern BC job seekers.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Briefcase} label="Active listings" value={activeCount} color="green" />
          <StatCard icon={Eye} label="Total views" value={totalViews.toLocaleString()} color="blue" />
          <StatCard icon={TrendingUp} label="Total listings" value={jobs.length} color="slate" />
          <StatCard icon={Users} label="Applications" value={applications.length || '—'} color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'listings',     label: 'Listings' },
            { key: 'applications', label: `Applications${applications.length ? ` (${applications.length})` : ''}` },
            { key: 'qualified',    label: 'Qualified Candidates' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
                activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Listings Tab ── */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Your Job Listings</h2>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                {[
                  { key: 'active', label: 'Active' },
                  { key: 'inactive', label: 'Inactive' },
                  { key: 'all', label: 'All' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      filter === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-green-600" />
                <span className="text-sm">Loading listings…</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 m-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {!loading && !error && displayed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase size={22} className="text-slate-400" />
                </div>
                {jobs.length === 0 ? (
                  <>
                    <h3 className="font-bold text-slate-800 mb-2">No listings yet</h3>
                    <p className="text-slate-400 text-sm mb-5 max-w-xs">
                      Post your first job and reach Northern BC candidates today.
                    </p>
                    <Link to="/employers/post-job"
                      className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                      <Plus size={15} /> Post your first job
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 mb-2">No {filter} listings</h3>
                    <button onClick={() => setFilter('all')} className="text-sm text-green-700 hover:text-green-800 font-medium mt-1 transition-colors">
                      View all listings
                    </button>
                  </>
                )}
              </div>
            )}

            {!loading && !error && displayed.length > 0 && (
              <>
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span>Job</span>
                  <span className="text-center w-20">Views</span>
                  <span className="text-center w-24">Qualified</span>
                  <span className="text-center w-20">Type</span>
                  <span className="text-center w-20">Posted</span>
                  <span className="w-20">Status</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {displayed.map((job) => {
                    const expired = isExpired(job.expires_at)
                    const status = !job.is_active ? 'inactive' : expired ? 'expired' : 'active'
                    return (
                      <div key={job.id} className="relative group">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={`/jobs/${job.id}`} target="_blank"
                                className="font-semibold text-slate-900 hover:text-green-700 transition-colors text-sm truncate">
                                {job.title}
                              </Link>
                              {job.is_featured && (
                                <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{job.category}</span><span>·</span>
                              <span className="flex items-center gap-0.5"><MapPin size={10} />{job.region || job.city}</span>
                            </p>
                          </div>
                          <div className="flex items-center justify-start sm:justify-center gap-1.5 w-full sm:w-20">
                            <Eye size={14} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-700">{(job.views ?? 0).toLocaleString()}</span>
                            <span className="text-xs text-slate-400 sm:hidden">views</span>
                          </div>
                          <div className="hidden sm:flex justify-center w-24">
                            <button
                              onClick={() => fetchQualifiedSeekers(job)}
                              title="View qualified candidates"
                              className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors"
                            >
                              <Users size={13} className="text-green-500" />
                              {qualifiedCounts[job.id] ?? '—'}
                            </button>
                          </div>
                          <div className="hidden sm:flex justify-center w-20">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {TYPE_LABELS[job.job_type] ?? job.job_type}
                            </span>
                          </div>
                          <div className="hidden sm:flex justify-center w-20">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={11} /> {timeAgo(job.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-20">
                            <StatusBadge status={status} />
                            <div className="relative ml-auto">
                              <button
                                onClick={() => setActionJob(actionJob === job.id ? null : job.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <MoreVertical size={15} />
                              </button>
                              {actionJob === job.id && (
                                <div className="absolute right-0 top-8 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-20">
                                  <Link to={`/jobs/${job.id}`} target="_blank"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setActionJob(null)}>
                                    <Eye size={14} className="text-slate-400" /> View listing
                                  </Link>
                                  <button
                                    onClick={() => toggleActive(job)}
                                    disabled={togglingId === job.id}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                                  >
                                    {togglingId === job.id
                                      ? <Loader2 size={14} className="animate-spin text-slate-400" />
                                      : job.is_active
                                        ? <XCircle size={14} className="text-red-400" />
                                        : <CheckCircle size={14} className="text-green-500" />
                                    }
                                    <span className={job.is_active ? 'text-red-600' : 'text-green-700'}>
                                      {job.is_active ? 'Deactivate' : 'Reactivate'}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div>
            {appsLoading && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-green-600" />
                <span className="text-sm">Loading applications…</span>
              </div>
            )}

            {appsError && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
                <AlertCircle size={16} className="shrink-0" /> {appsError}
              </div>
            )}

            {!appsLoading && !appsError && applications.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users size={22} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">No applications yet</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Applications will appear here when job seekers apply to your listings.
                </p>
              </div>
            )}

            {!appsLoading && !appsError && Object.entries(appsByJob).map(([jobId, { title, apps }]) => (
              <div key={jobId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{apps.length} applicant{apps.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Link
                    to={`/jobs/${jobId}`}
                    target="_blank"
                    className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                  >
                    View listing →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {apps.map((app) => (
                    <ApplicantRow
                      key={app.id}
                      app={app}
                      expanded={!!expandedApps[app.id]}
                      onToggle={() => setExpandedApps(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                      onStatusChange={(status) => updateAppStatus(app.id, status)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Qualified Candidates Tab ── */}
        {activeTab === 'qualified' && (
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select a job to view qualified candidates</label>
              <select
                value={qualifiedTabJobId ?? ''}
                onChange={(e) => {
                  const job = jobs.find(j => j.id === e.target.value)
                  if (job) fetchQualifiedSeekers(job)
                }}
                className="w-full sm:max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              >
                <option value="">— Select a job listing —</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} · {j.region} ({qualifiedCounts[j.id] ?? 0} qualified)
                  </option>
                ))}
              </select>
            </div>

            {qualifiedLoading && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-green-600" />
                <span className="text-sm">Loading candidates…</span>
              </div>
            )}

            {qualifiedError && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
                <AlertCircle size={16} className="shrink-0" /> {qualifiedError}
              </div>
            )}

            {!qualifiedLoading && !qualifiedError && qualifiedTabJobId && qualifiedSeekers.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users size={22} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">No matching candidates</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  No job seekers have preferences matching this listing's category and region.
                </p>
              </div>
            )}

            {!qualifiedLoading && !qualifiedError && qualifiedSeekers.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800">
                    {qualifiedSeekers.length} Qualified Candidate{qualifiedSeekers.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Job seekers whose preferred categories and region match this listing
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {qualifiedSeekers.map((s) => (
                    <div key={s.id} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
                            {(s.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm">{s.full_name || '—'}</p>
                            <a href={`mailto:${s.email}`}
                              className="text-xs text-slate-500 hover:text-green-700 flex items-center gap-1 transition-colors">
                              <Mail size={11} /> {s.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-12 sm:ml-0">
                          {(s.preferred_categories ?? []).map(cat => (
                            <span key={cat} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                              {cat}
                            </span>
                          ))}
                          {s.preferred_region && (
                            <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <MapPin size={10} />{s.preferred_region}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {actionJob && (
        <div className="fixed inset-0 z-10" onClick={() => setActionJob(null)} />
      )}
    </div>
  )
}

function ApplicantRow({ app, expanded, onToggle, onStatusChange }) {
  return (
    <div className="px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Avatar + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
            {app.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm">{app.full_name}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <a href={`mailto:${app.email}`} className="text-xs text-slate-500 hover:text-green-700 flex items-center gap-1 transition-colors">
                <Mail size={11} /> {app.email}
              </a>
              {app.phone && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone size={11} /> {app.phone}
                </span>
              )}
              {app.years_of_experience != null && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {app.years_of_experience} yr{app.years_of_experience !== 1 ? 's' : ''} exp.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: applied time + status + expand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{timeAgo(app.created_at)}</span>

          {/* Status dropdown */}
          <select
            value={app.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 ${STATUS_STYLES[app.status]}`}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          {/* Resume link */}
          {app.resume_url && (
            <a
              href={app.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="View resume"
            >
              <FileText size={15} />
            </a>
          )}

          {/* Expand toggle */}
          {app.cover_letter && (
            <button
              onClick={onToggle}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={expanded ? 'Hide cover letter' : 'Show cover letter'}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded cover letter */}
      {expanded && app.cover_letter && (
        <div className="mt-3 ml-12 bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cover Letter</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{app.cover_letter}</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, className = '' }) {
  const colours = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  const iconColours = {
    green: 'text-green-600', blue: 'text-blue-500', slate: 'text-slate-400', purple: 'text-purple-500',
  }
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${colours[color]}`}>
        <Icon size={17} className={iconColours[color]} />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    expired: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  const icons = {
    active: <CheckCircle size={11} />,
    inactive: <XCircle size={11} />,
    expired: <Clock size={11} />,
  }
  const labels = { active: 'Active', inactive: 'Inactive', expired: 'Expired' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  )
}

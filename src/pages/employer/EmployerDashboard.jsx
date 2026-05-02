import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Plus, Eye, Users, Briefcase, TrendingUp, CheckCircle,
  Clock, XCircle, MoreVertical, MapPin, Loader2, AlertCircle, Building2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const TYPE_LABELS = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'contract': 'Contract',
  'casual': 'Casual', 'seasonal': 'Seasonal', 'apprenticeship': 'Apprenticeship',
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

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('active')
  const [actionJob, setActionJob] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => { fetchJobs() }, [employerProfile])

  async function fetchJobs() {
    if (!employerProfile) return
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, category, job_type, city, region, is_active, is_featured, views, created_at, expires_at')
      .eq('employer_id', employerProfile.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setJobs(data ?? [])
    setLoading(false)
  }

  async function toggleActive(job) {
    setTogglingId(job.id)
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !job.is_active })
      .eq('id', job.id)
    if (!error) setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, is_active: !j.is_active } : j))
    setTogglingId(null)
    setActionJob(null)
  }

  const displayed = jobs.filter((j) => {
    if (filter === 'active') return j.is_active && !isExpired(j.expires_at)
    if (filter === 'inactive') return !j.is_active
    if (filter === 'expired') return j.is_active && isExpired(j.expires_at)
    return true
  })

  const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0)
  const activeCount = jobs.filter((j) => j.is_active && !isExpired(j.expires_at)).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
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

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Briefcase} label="Active listings" value={activeCount} color="green" />
          <StatCard icon={Eye} label="Total views" value={totalViews.toLocaleString()} color="blue" />
          <StatCard icon={TrendingUp} label="Total listings" value={jobs.length} color="slate" className="col-span-2 sm:col-span-1" />
        </div>

        {/* ── Listings ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
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

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin text-green-600" />
              <span className="text-sm">Loading listings…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 m-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Empty state */}
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

          {/* Job rows */}
          {!loading && !error && displayed.length > 0 && (
            <>
              {/* Column headers — desktop */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span>Job</span>
                <span className="text-center w-20">Views</span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors">

                        {/* Title + meta */}
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
                            <span>{job.category}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><MapPin size={10} />{job.region || job.city}</span>
                          </p>
                        </div>

                        {/* Views */}
                        <div className="flex items-center justify-start sm:justify-center gap-1.5 w-full sm:w-20">
                          <Eye size={14} className="text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-700">{(job.views ?? 0).toLocaleString()}</span>
                          <span className="text-xs text-slate-400 sm:hidden">views</span>
                        </div>

                        {/* Type */}
                        <div className="hidden sm:flex justify-center w-20">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {TYPE_LABELS[job.job_type] ?? job.job_type}
                          </span>
                        </div>

                        {/* Posted */}
                        <div className="hidden sm:flex justify-center w-20">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {timeAgo(job.created_at)}
                          </span>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 w-full sm:w-20">
                          <StatusBadge status={status} />
                          <div className="relative ml-auto">
                            <button
                              onClick={() => setActionJob(actionJob === job.id ? null : job.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              aria-label="Job actions"
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
      </div>

      {/* Close action menu on outside click */}
      {actionJob && (
        <div className="fixed inset-0 z-10" onClick={() => setActionJob(null)} />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, className = '' }) {
  const colours = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  }
  const iconColours = {
    green: 'text-green-600',
    blue: 'text-blue-500',
    slate: 'text-slate-400',
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

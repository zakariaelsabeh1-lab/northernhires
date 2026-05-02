import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Briefcase, Building2, Clock, DollarSign,
  ExternalLink, ArrowLeft, CheckCircle, AlertCircle, Loader2, Share2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import SaveButton from '../components/SaveButton'
import ApplicationForm from '../components/ApplicationForm'
import { useAuth } from '../context/AuthContext'

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'casual': 'Casual',
  'seasonal': 'Seasonal',
  'apprenticeship': 'Apprenticeship',
}

function formatSalary(min, max, type) {
  if (type === 'negotiable' || (!min && !max)) return 'Salary negotiable'
  const fmt = (n) => type === 'hourly' ? `$${n}/hr` : `$${n.toLocaleString()}/yr`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d < 1) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { employerProfile } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, employer_id, title, description, category, job_type,
          salary_min, salary_max, salary_type,
          city, region, is_active, is_featured,
          apply_url, apply_email, created_at,
          employers ( company_name, description, website, logo_url, city, province, verified, phone )
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        setError(error.message)
      } else if (!data) {
        setError('This job listing could not be found.')
      } else {
        setJob(data)
        try { await supabase.rpc('increment_job_views', { job_id: id }) } catch (_) {}
      }
      setLoading(false)
    }
    fetchJob()
  }, [id])

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-green-600" />
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 text-lg mb-2">Job not found</h2>
        <p className="text-slate-500 text-sm mb-5">{error || 'This job listing may have expired or been removed.'}</p>
        <Link to="/jobs" className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors">
          <ArrowLeft size={15} /> Browse All Jobs
        </Link>
      </div>
    </div>
  )

  const { title, description, category, job_type, salary_min, salary_max, salary_type, city, region, created_at, apply_url, apply_email, employers } = job

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-green-700 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/jobs" className="hover:text-green-700 transition-colors">Jobs</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate">{title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-7">
          {/* ── Main ── */}
          <div className="flex-1 min-w-0">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {employers?.logo_url
                    ? <img src={employers.logo_url} alt={employers.company_name} className="w-full h-full object-contain p-1" />
                    : <Building2 size={22} className="text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 leading-tight">{title}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    {employers && (
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        {employers.company_name}
                        {employers.verified && <CheckCircle size={13} className="text-green-500" />}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="shrink-0" />
                      {region || city}, BC
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="shrink-0" />
                      Posted {timeAgo(created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                <Pill icon={Briefcase} label={TYPE_LABELS[job_type] || job_type} color="green" />
                <Pill icon={DollarSign} label={formatSalary(salary_min, salary_max, salary_type)} color="slate" />
                <Pill icon={MapPin} label={category} color="slate" />
              </div>

              {/* Apply buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-100">
                {employerProfile ? (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-semibold text-sm px-6 py-3 rounded-xl cursor-not-allowed select-none">
                    Employer account — cannot apply
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm px-5 py-3 rounded-xl transition-colors"
                >
                  {copied ? <><CheckCircle size={15} className="text-green-600" /> Copied!</> : <><Share2 size={15} /> Share</>}
                </button>
                <SaveButton jobId={id} size="lg" />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">Job Description</h2>
              <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700 transition-colors"
              >
                <ArrowLeft size={15} /> Back to all jobs
              </Link>
            </div>
          </div>

          {/* ── Application form modal ── */}
          {showApplyForm && (
            <ApplicationForm job={job} onClose={() => setShowApplyForm(false)} />
          )}

          {/* ── Sidebar ── */}
          <aside className="lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-24 self-start">
            {/* Company card */}
            {employers && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">About the Employer</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {employers.logo_url
                      ? <img src={employers.logo_url} alt="" className="w-full h-full object-contain p-1" />
                      : <Building2 size={16} className="text-slate-400" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                      {employers.company_name}
                      {employers.verified && <CheckCircle size={13} className="text-green-500" />}
                    </p>
                    <p className="text-xs text-slate-400">{employers.city}, {employers.province}</p>
                  </div>
                </div>
                {employers.description && (
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{employers.description}</p>
                )}
                {employers.website && (
                  <a
                    href={employers.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 font-medium transition-colors"
                  >
                    Visit website <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}

            {/* Job summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Job Summary</h3>
              <dl className="space-y-3">
                <Detail label="Category" value={category} />
                <Detail label="Type" value={TYPE_LABELS[job_type] || job_type} />
                <Detail label="Location" value={`${region || city}, BC`} />
                <Detail label="Compensation" value={formatSalary(salary_min, salary_max, salary_type)} />
                <Detail label="Posted" value={timeAgo(created_at)} />
              </dl>
            </div>

            {/* Free for seekers reminder */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle size={20} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-800 mb-1">Always free to apply</p>
              <p className="text-xs text-green-600">NorthernHires never charges job seekers.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Pill({ icon: Icon, label, color }) {
  const styles = color === 'green'
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-slate-100 border-slate-200 text-slate-700'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${styles}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700 text-right">{value}</dd>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Building2, Star } from 'lucide-react'
import SaveButton from './SaveButton'

const TYPE_STYLES = {
  'full-time':      'bg-green-50 text-green-800 border-green-200',
  'part-time':      'bg-blue-50 text-blue-800 border-blue-200',
  'contract':       'bg-purple-50 text-purple-800 border-purple-200',
  'casual':         'bg-orange-50 text-orange-800 border-orange-200',
  'seasonal':       'bg-amber-50 text-amber-800 border-amber-200',
  'apprenticeship': 'bg-teal-50 text-teal-800 border-teal-200',
}

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
  const fmt = (n) => type === 'hourly' ? `$${n}/hr` : `$${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just posted'
  if (h < 24) return `${h}h ago`
  if (d === 1) return '1 day ago'
  return `${d} days ago`
}

export default function JobCard({ job }) {
  const { id, title, category, job_type, salary_min, salary_max, salary_type, city, region, is_featured, created_at, employers } = job

  return (
    <div className={`relative group bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
      is_featured
        ? 'border-amber-300 ring-1 ring-amber-100 hover:border-amber-400'
        : 'border-slate-200 hover:border-green-300 hover:bg-green-50/30'
    }`}>
      <Link to={`/jobs/${id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 pr-14 sm:pr-16">
        {/* Company avatar */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
          {employers?.logo_url
            ? <img src={employers.logo_url} alt={employers.company_name} className="w-full h-full object-contain p-1" />
            : <Building2 size={20} className="text-slate-400" />
          }
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            {is_featured && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
              </span>
            )}
            <h3 className="font-semibold text-slate-900 group-hover:text-green-800 text-base transition-colors">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
            {employers && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Briefcase size={13} className="shrink-0" />
                {employers.company_name}
                {employers.verified && <span className="ml-0.5 text-green-600 text-xs">✓</span>}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={13} className="shrink-0" />
              {region || city}, BC
            </span>
            <span className="text-slate-400">{category}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_STYLES[job_type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {TYPE_LABELS[job_type] || job_type}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {formatSalary(salary_min, salary_max, salary_type)}
          </span>
          <span className="text-xs text-slate-400">{timeAgo(created_at)}</span>
        </div>
      </Link>

      {/* Save button — floated top-right, outside the Link */}
      <div className="absolute top-4 right-4">
        <SaveButton jobId={id} size="sm" />
      </div>
    </div>
  )
}

import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES, REGIONS, JOB_TYPES } from '../hooks/useJobs'

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function JobFilters({ filters, onChange, totalActive }) {
  const { category, jobType, region } = filters

  const activeCount = [category, jobType, region].filter(Boolean).length

  function clear() {
    onChange({ category: '', jobType: '', region: '' })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-500" />
          <span className="font-semibold text-slate-800 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="bg-green-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Category"
          value={category}
          onChange={(v) => onChange({ ...filters, category: v })}
          options={CATEGORIES}
          placeholder="All categories"
        />
        <Select
          label="Job Type"
          value={jobType}
          onChange={(v) => onChange({ ...filters, jobType: v })}
          options={JOB_TYPES}
          placeholder="All types"
        />
        <Select
          label="Region"
          value={region}
          onChange={(v) => onChange({ ...filters, region: v })}
          options={REGIONS}
          placeholder="All Northern BC"
        />
      </div>

      {totalActive != null && (
        <p className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          {totalActive.toLocaleString()} job{totalActive !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  )
}

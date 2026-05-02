import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, AlertCircle, Loader2, X } from 'lucide-react'
import JobCard from '../components/JobCard'
import JobFilters from '../components/JobFilters'
import Pagination from '../components/Pagination'
import { useJobs } from '../hooks/useJobs'

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ?? '',
    jobType: searchParams.get('type') ?? '',
    region: searchParams.get('region') ?? '',
  })
  const [page, setPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const { jobs, total, loading, error, pageSize } = useJobs({ search, ...filters, page })

  // Sync URL params
  useEffect(() => {
    const params = {}
    if (search) params.q = search
    if (filters.category) params.category = filters.category
    if (filters.jobType) params.type = filters.jobType
    if (filters.region) params.region = filters.region
    if (page > 1) params.page = page
    setSearchParams(params, { replace: true })
  }, [search, filters, page, setSearchParams])

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  function handleFiltersChange(newFilters) {
    setFilters(newFilters)
    setPage(1)
  }

  const activeFilterCount = [filters.category, filters.jobType, filters.region].filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Search header ── */}
      <div className="bg-green-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
            Jobs in Northern BC
          </h1>
          <p className="text-green-200 text-sm mb-6">
            {total > 0 ? `${total} local job${total !== 1 ? 's' : ''} available right now` : 'Searching Northern BC…'}
          </p>

          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="flex items-center flex-1 gap-2 bg-white rounded-lg px-4 py-2.5">
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Job title, keyword, or company..."
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-lg px-4 py-2.5 sm:w-48">
                <MapPin size={17} className="text-green-200 shrink-0" />
                <span className="text-sm text-white">Northern BC</span>
              </div>
              <button
                type="submit"
                className="bg-white text-green-900 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-green-50 transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-7">
          {/* ── Sidebar filters (desktop) ── */}
          <aside className="hidden lg:block w-60 shrink-0 sticky top-24 self-start">
            <JobFilters filters={filters} onChange={handleFiltersChange} totalActive={total} />
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter bar */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{total}</span> jobs
              </p>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-green-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile filters drawer */}
            {showMobileFilters && (
              <div className="lg:hidden mb-5">
                <JobFilters filters={filters} onChange={(f) => { handleFiltersChange(f); setShowMobileFilters(false) }} totalActive={total} />
              </div>
            )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.category && (
                  <FilterChip label={filters.category} onRemove={() => handleFiltersChange({ ...filters, category: '' })} />
                )}
                {filters.jobType && (
                  <FilterChip label={filters.jobType} onRemove={() => handleFiltersChange({ ...filters, jobType: '' })} />
                )}
                {filters.region && (
                  <FilterChip label={`${filters.region}, BC`} onRemove={() => handleFiltersChange({ ...filters, region: '' })} />
                )}
              </div>
            )}

            {/* Results */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 size={28} className="animate-spin text-green-600" />
                <span className="text-sm">Loading jobs…</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-800 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Could not load jobs</p>
                  <p className="text-red-600">{error}</p>
                  <p className="text-red-500 text-xs mt-2">
                    Make sure your Supabase credentials are set in <code className="bg-red-100 px-1 rounded">.env.local</code> and the schema has been applied.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">No jobs found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Try broadening your search or clearing some filters. New jobs are posted daily.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => handleFiltersChange({ category: '', jobType: '', region: '' })}
                    className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && jobs.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">
                    Showing{' '}
                    <span className="font-semibold text-slate-800">
                      {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
                    </span>{' '}
                    of <span className="font-semibold text-slate-800">{total}</span> jobs
                  </p>
                </div>

                <div className="space-y-3">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                <Pagination page={page} total={total} pageSize={pageSize} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
      {label}
      <button onClick={onRemove} className="hover:text-red-600 transition-colors" aria-label={`Remove ${label} filter`}>
        <X size={12} />
      </button>
    </span>
  )
}

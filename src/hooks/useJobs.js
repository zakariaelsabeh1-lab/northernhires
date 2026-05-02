import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const CATEGORIES = [
  'Trades & Construction',
  'Healthcare',
  'Trucking & Logistics',
  'Forestry & Natural Resources',
  'Education',
  'Maintenance & Repair',
  'Hospitality & Food Service',
  'Office & Admin',
]

export const REGIONS = [
  'Prince George',
  'Vanderhoof',
  'Fort St. James',
  'Burns Lake',
  'Houston',
  'Smithers',
  'Fort St. John',
  'Dawson Creek',
  'Terrace',
  'Mackenzie',
]

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'casual', label: 'Casual' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
]

export function useJobs(filters = {}) {
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { search = '', category = '', jobType = '', region = '', page = 1 } = filters
  const PAGE_SIZE = 10

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('jobs')
        .select(`
          id, title, category, job_type, salary_min, salary_max, salary_type,
          city, region, is_featured, created_at,
          employers ( company_name, logo_url, verified )
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (search.trim()) {
        query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
      }
      if (category) query = query.eq('category', category)
      if (jobType) query = query.eq('job_type', jobType)
      if (region) query = query.eq('region', region)

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError
      setJobs(data ?? [])
      setTotal(count ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, category, jobType, region, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return { jobs, total, loading, error, refetch: fetchJobs, pageSize: PAGE_SIZE }
}

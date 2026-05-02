import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SavedJobsContext = createContext(null)

export function SavedJobsProvider({ children }) {
  const { user, profile } = useAuth()
  const [savedIds, setSavedIds] = useState(new Set())
  const [pending, setPending] = useState(new Set())

  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return }
    supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)
      .then(({ data }) => setSavedIds(new Set(data?.map((r) => r.job_id) ?? [])))
  }, [user])

  // Returns true = now saved, false = now unsaved, null = error
  const toggleSave = useCallback(async (jobId) => {
    if (!user) return null

    setPending((p) => new Set([...p, jobId]))

    const isSaved = savedIds.has(jobId)

    if (isSaved) {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)

      if (!error) {
        setSavedIds((prev) => { const next = new Set(prev); next.delete(jobId); return next })
      }
      setPending((p) => { const next = new Set(p); next.delete(jobId); return next })
      return error ? null : false
    } else {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_seeker_id: profile?.id ?? null, job_id: jobId })

      if (!error) {
        setSavedIds((prev) => { const next = new Set(prev); next.add(jobId); return next })
      }
      setPending((p) => { const next = new Set(p); next.delete(jobId); return next })
      return error ? null : true
    }
  }, [user, profile, savedIds])

  return (
    <SavedJobsContext.Provider value={{ savedIds, toggleSave, pending }}>
      {children}
    </SavedJobsContext.Provider>
  )
}

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext)
  if (!ctx) throw new Error('useSavedJobs must be inside SavedJobsProvider')
  return ctx
}

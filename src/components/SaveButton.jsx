import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bookmark, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSavedJobs } from '../context/SavedJobsContext'

export default function SaveButton({ jobId, size = 'md', className = '' }) {
  const { user, profile } = useAuth()
  const { savedIds, toggleSave, pending } = useSavedJobs()
  const navigate = useNavigate()
  const location = useLocation()
  const [justSaved, setJustSaved] = useState(false)

  const isSaved = savedIds.has(jobId)
  const isLoading = pending.has(jobId)

  const sizeClasses = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-10 h-10' }
  const iconSize = { sm: 14, md: 16, lg: 18 }

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!user || !profile) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    const result = await toggleSave(jobId)
    if (result === true) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  if (justSaved) {
    return (
      <button
        onClick={handleClick}
        title="Saved!"
        aria-label="Job saved"
        className={`
          ${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0
          border bg-green-600 border-green-600 text-white transition-all duration-150
          ${className}
        `}
      >
        <Check size={iconSize[size]} strokeWidth={3} />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={!user ? 'Sign in to save job' : isSaved ? 'Remove from saved' : 'Save job'}
      aria-label={isSaved ? 'Unsave job' : 'Save job'}
      className={`
        ${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0
        border transition-all duration-150 disabled:opacity-50
        ${isSaved
          ? 'bg-green-100 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-500'
          : 'bg-white border-slate-200 text-slate-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
        }
        ${className}
      `}
    >
      <Bookmark
        size={iconSize[size]}
        className={`transition-all ${isLoading ? 'opacity-40' : ''}`}
        fill={isSaved ? 'currentColor' : 'none'}
      />
    </button>
  )
}

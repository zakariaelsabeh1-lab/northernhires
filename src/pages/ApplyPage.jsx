import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, FileText, Building2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ApplyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, employerProfile } = useAuth()

  const [job, setJob] = useState(null)
  const [jobLoading, setJobLoading] = useState(true)
  const [jobError, setJobError] = useState(null)

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', years_of_experience: '', cover_letter: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [useProfileResume, setUseProfileResume] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, employer_id, title, employers ( company_name, logo_url )')
        .eq('id', id)
        .maybeSingle()
      if (error || !data) setJobError('Job not found.')
      else setJob(data)
      setJobLoading(false)
    }
    fetchJob()
  }, [id])

  useEffect(() => {
    if (profile) {
      setForm(prev => ({ ...prev, full_name: profile.full_name || '', phone: profile.phone || '' }))
      if (profile.resume_url) setUseProfileResume(true)
    }
    if (user) setForm(prev => ({ ...prev, email: user.email || '' }))
  }, [profile, user])

  useEffect(() => {
    if (!user || !profile || !job) return
    supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', job.id)
      .eq('job_seeker_id', profile.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setAlreadyApplied(true) })
  }, [user, profile, job])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user || !profile) return
    setSubmitting(true)
    setError(null)

    try {
      let resumeUrl = useProfileResume ? (profile.resume_url || null) : null

      if (resumeFile && !useProfileResume) {
        const ext = resumeFile.name.split('.').pop()
        const path = `${user.id}/${job.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('application-resumes')
          .upload(path, resumeFile, { upsert: true })
        if (uploadError) throw new Error('Resume upload failed: ' + uploadError.message)
        const { data: urlData } = supabase.storage.from('application-resumes').getPublicUrl(path)
        resumeUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          job_seeker_id: profile.id,
          employer_id: job.employer_id,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : null,
          cover_letter: form.cover_letter || null,
          resume_url: resumeUrl,
          status: 'pending',
        })

      if (insertError) {
        if (insertError.code === '23505') { setAlreadyApplied(true); return }
        throw new Error(insertError.message)
      }

      supabase.functions.invoke('notify-employer', {
        body: {
          jobTitle: job.title,
          applicantName: form.full_name,
          applicantEmail: form.email,
          employerId: job.employer_id,
        },
      }).catch(() => {})

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (jobLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-green-600" />
    </div>
  )

  if (jobError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 font-semibold mb-4">{jobError}</p>
        <Link to="/jobs" className="text-sm text-green-700 hover:text-green-800 font-medium">Browse all jobs</Link>
      </div>
    </div>
  )

  if (employerProfile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <AlertCircle size={32} className="text-amber-400 mx-auto mb-3" />
        <p className="text-slate-700 font-semibold mb-4">Employer accounts cannot apply to jobs.</p>
        <Link to={`/jobs/${id}`} className="text-sm text-green-700 hover:text-green-800 font-medium">← Back to listing</Link>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Application submitted!</h2>
        <p className="text-slate-500 text-sm mb-8">
          {job.employers?.company_name} has been notified and will review your application soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse more jobs
          </Link>
          <Link
            to={`/jobs/${id}`}
            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Back to listing
          </Link>
        </div>
      </div>
    </div>
  )

  if (alreadyApplied) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Already applied</h2>
        <p className="text-slate-500 text-sm mb-8">You've already submitted an application for this position.</p>
        <Link
          to={`/jobs/${id}`}
          className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          Back to listing
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          to={`/jobs/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to listing
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {job.employers?.logo_url
                ? <img src={job.employers.logo_url} alt="" className="w-full h-full object-contain p-1" />
                : <Building2 size={20} className="text-slate-400" />
              }
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{job.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{job.employers?.company_name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 text-lg mb-5">Your application</h2>

          {/* Not logged in */}
          {!user && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-5">
              Please{' '}
              <Link to={`/login?redirect=/jobs/${id}/apply`} className="font-semibold underline">log in</Link>
              {' '}or{' '}
              <Link to="/register" className="font-semibold underline">create an account</Link>
              {' '}to apply.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="full_name" value={form.full_name} onChange={handleChange}
                required disabled={!user} placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                required disabled={!user} placeholder="jane@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  disabled={!user} placeholder="250-555-0100"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
                <input
                  type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange}
                  min="0" max="50" disabled={!user} placeholder="3"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Letter</label>
              <textarea
                name="cover_letter" value={form.cover_letter} onChange={handleChange}
                rows={6} disabled={!user}
                placeholder="Tell the employer why you're a great fit for this role…"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resume</label>
              {profile?.resume_url && (
                <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                  <input
                    type="checkbox" checked={useProfileResume}
                    onChange={(e) => { setUseProfileResume(e.target.checked); if (e.target.checked) setResumeFile(null) }}
                    className="w-4 h-4 accent-green-600"
                  />
                  <FileText size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">Use resume from my profile</span>
                </label>
              )}
              {!useProfileResume && (
                <>
                  <input
                    ref={fileInputRef} type="file" accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden" disabled={!user}
                  />
                  <button
                    type="button" onClick={() => fileInputRef.current?.click()} disabled={!user}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-green-400 rounded-xl py-5 text-sm text-slate-500 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {resumeFile ? resumeFile.name : 'Upload PDF, DOC, or DOCX'}
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Your information is stored securely and never shared without your consent.{' '}
              <a href="/privacy" className="text-green-700 hover:text-green-800 underline underline-offset-2">Privacy Policy</a>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to={`/jobs/${id}`}
                className="flex-1 flex items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit" disabled={submitting || !user || !profile}
                className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                  : 'Submit Application'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

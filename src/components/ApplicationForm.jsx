import { useState, useEffect, useRef } from 'react'
import { X, Upload, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ApplicationForm({ job, onClose }) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', years_of_experience: '', cover_letter: '' })
  const [resumeFile, setResumeFile] = useState(null)
  const [useProfileResume, setUseProfileResume] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef(null)

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
        body: { jobTitle: job.title, applicantName: form.full_name, applicantEmail: form.email, employerId: job.employer_id },
      }).catch(() => {})

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg leading-tight">Apply for this position</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{job.title} · {job.employers?.company_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-3">
            <X size={18} />
          </button>
        </div>

        {/* Submitted */}
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <p className="font-extrabold text-slate-900 text-xl mb-2">Application submitted!</p>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              The employer has been notified and will review your application soon.
            </p>
            <button
              onClick={onClose}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-8 py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : alreadyApplied ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <p className="font-extrabold text-slate-900 text-xl mb-2">Already applied</p>
            <p className="text-sm text-slate-500 mb-6">You've already submitted an application for this position.</p>
            <button onClick={onClose} className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Not logged in */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4">
                Please{' '}
                <Link to="/login" className="font-semibold underline" onClick={onClose}>log in</Link>
                {' '}or{' '}
                <Link to="/register" className="font-semibold underline" onClick={onClose}>create an account</Link>
                {' '}to apply.
              </div>
            )}

            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="full_name" value={form.full_name} onChange={handleChange}
                required disabled={!user}
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                required disabled={!user}
                placeholder="jane@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Phone + Years */}
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

            {/* Cover letter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Letter</label>
              <textarea
                name="cover_letter" value={form.cover_letter} onChange={handleChange}
                rows={5} disabled={!user}
                placeholder="Tell the employer why you're a great fit for this role…"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* Resume */}
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
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-green-400 rounded-xl py-4 text-sm text-slate-500 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {resumeFile ? resumeFile.name : 'Upload PDF, DOC, or DOCX'}
                  </button>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
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
        )}
      </div>
    </div>
  )
}

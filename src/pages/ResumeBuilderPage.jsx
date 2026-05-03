import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Loader2, Download, ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors'
const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5'

const EMPTY_EXP = () => ({ title: '', company: '', duration: '', description: '' })
const EMPTY_EDU = () => ({ school: '', degree: '', year: '' })

function stripMarkdown(text) {
  return text
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
}

export default function ResumeBuilderPage() {
  const { user } = useAuth()

  const ACCESS_CODE = 'NHHBETA2026'
  const LS_KEY = 'nh_resume_access'
  const [codeUnlocked, setCodeUnlocked] = useState(() => localStorage.getItem(LS_KEY) === ACCESS_CODE)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')

  function handleCodeSubmit(e) {
    e.preventDefault()
    if (codeInput.trim().toUpperCase() === ACCESS_CODE) {
      localStorage.setItem(LS_KEY, ACCESS_CODE)
      setCodeUnlocked(true)
    } else {
      setCodeError('Invalid access code. Please try again.')
    }
  }

  const [genCount, setGenCount] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.from('job_seekers').select('ai_resume_generations').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setGenCount(data?.ai_resume_generations ?? 0))
  }, [user])

  const LIMIT = 2
  const limitReached = genCount !== null && genCount >= LIMIT

  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    phone:       '',
    city:        '',
    targetTitle: '',
    summary:     '',
    experience:  [EMPTY_EXP()],
    education:   [EMPTY_EDU()],
    skills:      '',
  })
  const [skillsFirst, setSkillsFirst] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [resume, setResume]         = useState('')
  const [error, setError]           = useState('')
  const [saved, setSaved]           = useState(false)

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function setExp(idx, field, val) {
    setForm(f => ({ ...f, experience: f.experience.map((e, i) => i === idx ? { ...e, [field]: val } : e) }))
  }
  function addExp()       { setForm(f => ({ ...f, experience: [...f.experience, EMPTY_EXP()] })) }
  function removeExp(idx) { setForm(f => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) })) }

  function setEdu(idx, field, val) {
    setForm(f => ({ ...f, education: f.education.map((e, i) => i === idx ? { ...e, [field]: val } : e) }))
  }
  function addEdu()       { setForm(f => ({ ...f, education: [...f.education, EMPTY_EDU()] })) }
  function removeEdu(idx) { setForm(f => ({ ...f, education: f.education.filter((_, i) => i !== idx) })) }

  function handlePrint() {
    if (!resume) return
    const slug = form.fullName.trim().replace(/\s+/g, '_') || 'Resume'
    const prev = document.title
    document.title = `${slug}_Resume`

    const printArea = document.createElement('div')
    printArea.id = 'resume-print-area'
    printArea.innerHTML = resume
    document.body.appendChild(printArea)

    const style = document.createElement('style')
    style.id = 'resume-print-style'
    style.textContent = `
      @page { margin: 0; size: A4; }
      @media print {
        body > *:not(#resume-print-area) { display: none !important; }
        #resume-print-area {
          display: block !important;
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          background: white;
        }
      }
      #resume-print-area { display: none; }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => {
      document.getElementById('resume-print-style')?.remove()
      document.getElementById('resume-print-area')?.remove()
      document.title = prev
    }, 500)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (limitReached) return
    if (!form.fullName.trim() || !form.targetTitle.trim()) {
      setError('Please fill in at least your full name and target job title.')
      return
    }
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!key) {
      setError('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env.local file.')
      return
    }
    setError('')
    setGenerating(true)
    setResume('')
    setSaved(false)

    const expText = form.experience
      .filter(e => e.title || e.company)
      .map(e => `${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ''}${e.description ? ` — ${e.description}` : ''}`)
      .join('\n')

    const eduText = form.education
      .filter(e => e.school || e.degree)
      .map(e => `${e.degree}${e.school ? ` — ${e.school}` : ''}${e.year ? ` (${e.year})` : ''}`)
      .join('\n')

    const prompt = `You are a professional resume writer. Return ONLY raw HTML with inline styles — absolutely no markdown, no backticks, no code fences, no explanation. The very first character must be < and the last must be >.

Create a resume using EXACTLY this HTML structure (fill in the candidate's info):

<div style="font-family: Arial, Helvetica, sans-serif; max-width: 750px; margin: 0 auto; padding: 48px 56px; color: #1a1a1a; font-size: 14px; line-height: 1.6; background: #ffffff;">

  <!-- HEADER -->
  <div style="text-align: center; margin-bottom: 4px;">
    <h1 style="font-size: 34px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; margin: 0 0 10px 0;">[FULL NAME]</h1>
    <p style="font-size: 13px; color: #475569; margin: 0;">[EMAIL] &nbsp;|&nbsp; [PHONE] &nbsp;|&nbsp; [CITY], BC</p>
  </div>
  <hr style="border: none; border-top: 2px solid #16a34a; margin: 18px 0 28px 0;" />

  <!-- PROFESSIONAL SUMMARY -->
  <div style="margin-bottom: 26px;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0;">PROFESSIONAL SUMMARY</h2>
    <p style="margin: 0; color: #334155;">[2-3 sentence professional summary]</p>
  </div>

${skillsFirst ? `  <!-- SKILLS -->
  <div style="margin-bottom: 26px;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0;">SKILLS</h2>
    <p style="margin: 0; color: #334155; line-height: 1.8;">[comma-separated skills]</p>
  </div>

` : ''}  <!-- PROFESSIONAL EXPERIENCE -->
  <div style="margin-bottom: 26px;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin: 0 0 14px 0; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0;">PROFESSIONAL EXPERIENCE</h2>
    [For each job:]
    <div style="margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
        <span style="font-size: 15px; font-weight: 700; color: #0f172a;">[JOB TITLE]</span>
        <span style="font-size: 12px; color: #64748b; font-weight: 400;">[DURATION]</span>
      </div>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; font-style: italic;">[COMPANY NAME]</p>
      <ul style="margin: 0; padding-left: 18px; color: #334155;">
        <li style="margin-bottom: 4px;">[achievement bullet]</li>
      </ul>
    </div>
  </div>

  <!-- EDUCATION -->
  <div style="margin-bottom: 26px;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin: 0 0 14px 0; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0;">EDUCATION</h2>
    [For each entry:]
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
      <span style="font-weight: 600; color: #0f172a;">[DEGREE / CERTIFICATE]</span>
      <span style="font-size: 12px; color: #64748b;">[YEAR]</span>
    </div>
    <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">[SCHOOL]</p>
  </div>

${skillsFirst ? '' : `  <!-- SKILLS -->
  <div>
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0;">SKILLS</h2>
    <p style="margin: 0; color: #334155; line-height: 1.8;">[comma-separated skills]</p>
  </div>

`}</div>

CANDIDATE DATA:
Name: ${form.fullName}
${form.email ? `Email: ${form.email}` : ''}
${form.phone ? `Phone: ${form.phone}` : ''}
${form.city ? `City: ${form.city}` : ''}
Target role: ${form.targetTitle}
${form.summary ? `Notes: ${form.summary}` : ''}

WORK EXPERIENCE:
${expText || 'None provided'}

EDUCATION:
${eduText || 'None provided'}

SKILLS:
${form.skills || 'None provided'}

Write 3–4 achievement-focused bullet points per job. Write a strong 2–3 sentence summary. Return ONLY the HTML — no text before or after.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message ?? `API error ${response.status}`)
      }

      const data = await response.json()
      const raw  = data.content[0]?.text ?? ''
      const html = stripMarkdown(raw)
      setResume(html)

      if (user) {
        const newCount = (genCount ?? 0) + 1
        const { error: dbErr } = await supabase
          .from('job_seekers')
          .update({ ai_resume: html, ai_resume_generations: newCount })
          .eq('user_id', user.id)
        if (!dbErr) {
          setSaved(true)
          setGenCount(newCount)
        }
      }
    } catch (err) {
      setError(err.message ?? 'Failed to generate resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <Link to="/dashboard/jobseeker" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-green-600" /> AI Resume Builder
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Fill in your details — AI generates a professional resume instantly</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!codeUnlocked ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={22} className="text-green-700" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Enter your access code</h2>
              <p className="text-slate-500 text-sm mb-6">The AI Resume Builder is in early access. Enter your beta code to continue.</p>
              <form onSubmit={handleCodeSubmit} className="space-y-3">
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => { setCodeInput(e.target.value); setCodeError('') }}
                  placeholder="e.g. NHHBETA2026"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors text-center tracking-widest font-mono uppercase"
                />
                {codeError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">
                    <AlertCircle size={14} className="shrink-0" /> {codeError}
                  </div>
                )}
                <button type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors">
                  Unlock Resume Builder
                </button>
              </form>
            </div>
          </div>
        ) : limitReached ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Resume limit reached</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              You have reached your resume generation limit for the beta period.
            </p>
            <Link to="/dashboard/jobseeker"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-5 py-2.5 rounded-xl transition-colors">
              Back to dashboard
            </Link>
          </div>
        ) : !resume ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <FormSection title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={LABEL}>Full name <span className="text-red-400">*</span></label>
                  <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className={INPUT} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className={LABEL}>Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={INPUT} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className={LABEL}>Phone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} className={INPUT} placeholder="+1 (250) 555-0100" />
                </div>
                <div>
                  <label className={LABEL}>City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} className={INPUT} placeholder="Prince George" />
                </div>
                <div>
                  <label className={LABEL}>Target job title <span className="text-red-400">*</span></label>
                  <input value={form.targetTitle} onChange={e => set('targetTitle', e.target.value)} className={INPUT} placeholder="Heavy Equipment Operator" />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL}>
                    Brief summary <span className="text-slate-400 font-normal text-xs">optional — AI will write one if blank</span>
                  </label>
                  <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={2} className={INPUT}
                    placeholder="A sentence or two about yourself and your career goals…" />
                </div>
              </div>
            </FormSection>

            <FormSection title="Work Experience">
              <div className="space-y-4">
                {form.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position {idx + 1}</p>
                      {form.experience.length > 1 && (
                        <button type="button" onClick={() => removeExp(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Job title</label>
                        <input value={exp.title} onChange={e => setExp(idx, 'title', e.target.value)} className={INPUT} placeholder="Forklift Operator" />
                      </div>
                      <div>
                        <label className={LABEL}>Company</label>
                        <input value={exp.company} onChange={e => setExp(idx, 'company', e.target.value)} className={INPUT} placeholder="Northland Timber Co." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={LABEL}>Duration</label>
                        <input value={exp.duration} onChange={e => setExp(idx, 'duration', e.target.value)} className={INPUT} placeholder="Jan 2020 – Present" />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Responsibilities & achievements</label>
                      <textarea value={exp.description} onChange={e => setExp(idx, 'description', e.target.value)} rows={3} className={INPUT}
                        placeholder="Describe your key responsibilities and notable achievements…" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addExp}
                  className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-xl transition-colors w-full justify-center">
                  <Plus size={15} /> Add another position
                </button>
              </div>
            </FormSection>

            <FormSection title="Education">
              <div className="space-y-4">
                {form.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Education {idx + 1}</p>
                      {form.education.length > 1 && (
                        <button type="button" onClick={() => removeEdu(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className={LABEL}>School / Institution</label>
                        <input value={edu.school} onChange={e => setEdu(idx, 'school', e.target.value)} className={INPUT} placeholder="College of New Caledonia" />
                      </div>
                      <div>
                        <label className={LABEL}>Year</label>
                        <input value={edu.year} onChange={e => setEdu(idx, 'year', e.target.value)} className={INPUT} placeholder="2019" />
                      </div>
                      <div className="sm:col-span-3">
                        <label className={LABEL}>Degree / Certificate / Diploma</label>
                        <input value={edu.degree} onChange={e => setEdu(idx, 'degree', e.target.value)} className={INPUT} placeholder="Diploma in Heavy Equipment Operations" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addEdu}
                  className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2.5 rounded-xl transition-colors w-full justify-center">
                  <Plus size={15} /> Add education
                </button>
              </div>
            </FormSection>

            <FormSection title="Skills">
              <label className={LABEL}>
                Skills <span className="text-slate-400 font-normal text-xs">separate with commas</span>
              </label>
              <textarea value={form.skills} onChange={e => set('skills', e.target.value)} rows={3} className={INPUT}
                placeholder="Forklift operation, WHMIS certification, First aid, Equipment maintenance, Class 1 licence…" />
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skillsFirst}
                  onChange={e => setSkillsFirst(e.target.checked)}
                  className="accent-green-700 w-4 h-4"
                />
                <span className="text-sm text-slate-600">
                  Show Skills <strong>before</strong> Experience
                  <span className="text-slate-400 font-normal ml-1">(default: after)</span>
                </span>
              </label>
            </FormSection>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Your information is stored securely and never shared without your consent.{' '}
              <a href="/privacy" className="text-green-700 hover:text-green-800 underline underline-offset-2">Privacy Policy</a>
            </div>

            <button type="submit" disabled={generating}
              className="w-full flex items-center justify-center gap-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base px-8 py-4 rounded-xl transition-colors">
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generating ? 'Generating your resume…' : 'Generate Resume with AI'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Your Resume</h2>
                {saved && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-green-700 mt-0.5">
                    <CheckCircle2 size={13} /> Saved to your dashboard
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setResume(''); setError(''); setSaved(false) }}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-colors">
                  <ArrowLeft size={15} /> Edit
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 text-sm font-semibold bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition-colors">
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>

            <div id="resume-output" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: resume }} />
            </div>

            <p className="text-xs text-slate-400 text-center">
              Click <strong>Download PDF</strong> → select <em>Save as PDF</em> in your browser's print dialog.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-5">{title}</h2>
      {children}
    </div>
  )
}

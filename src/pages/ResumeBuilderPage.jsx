import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Loader2, Download, ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors'
const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5'

const EMPTY_EXP = () => ({ title: '', company: '', duration: '', description: '' })
const EMPTY_EDU = () => ({ school: '', degree: '', year: '' })

export default function ResumeBuilderPage() {
  const { user } = useAuth()
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
  const [generating, setGenerating] = useState(false)
  const [resume, setResume]         = useState('')
  const [error, setError]           = useState('')
  const [saved, setSaved]           = useState(false)

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function setExp(idx, field, val) {
    setForm(f => ({ ...f, experience: f.experience.map((e, i) => i === idx ? { ...e, [field]: val } : e) }))
  }
  function addExp()         { setForm(f => ({ ...f, experience: [...f.experience, EMPTY_EXP()] })) }
  function removeExp(idx)   { setForm(f => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) })) }

  function setEdu(idx, field, val) {
    setForm(f => ({ ...f, education: f.education.map((e, i) => i === idx ? { ...e, [field]: val } : e) }))
  }
  function addEdu()         { setForm(f => ({ ...f, education: [...f.education, EMPTY_EDU()] })) }
  function removeEdu(idx)   { setForm(f => ({ ...f, education: f.education.filter((_, i) => i !== idx) })) }

  async function handleGenerate(e) {
    e.preventDefault()
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
      .map(e => `${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ''}${e.description ? `: ${e.description}` : ''}`)
      .join('\n')

    const eduText = form.education
      .filter(e => e.school || e.degree)
      .map(e => `${e.degree}${e.school ? ` — ${e.school}` : ''}${e.year ? ` (${e.year})` : ''}`)
      .join('\n')

    const prompt = `You are a professional resume writer. Create a beautifully formatted resume as HTML with inline styles only.

CRITICAL: Return ONLY the raw HTML — no explanation, no markdown, no code fences, no backticks. Start directly with <div.

Use this exact structure and styling approach:

- Outer wrapper: font-family Arial/Helvetica/sans-serif, max-width 760px, margin 0 auto, padding 48px, color #1a1a1a, line-height 1.6, font-size 14px, background white
- Header block: centered text, padding-bottom 24px, margin-bottom 28px, border-bottom 3px solid #16a34a
  - Name: font-size 32px, font-weight 800, margin 0 0 8px 0, color #0f172a, letter-spacing -0.5px
  - Contact line: font-size 13px, color #475569, margin 0
- Each section: margin-bottom 28px
- Section title (h2): font-size 11px, font-weight 700, text-transform uppercase, letter-spacing 1.5px, color #16a34a, border-bottom 1.5px solid #dcfce7, padding-bottom 7px, margin 0 0 14px 0
- Work experience entries: margin-bottom 18px
  - Top row: display flex, justify-content space-between, align-items baseline, margin-bottom 3px
    - Job title: font-size 15px, font-weight 700, color #0f172a
    - Duration: font-size 12px, color #64748b
  - Company name: margin 0 0 8px 0, font-size 13px, color #475569, font-style italic
  - Bullet list: margin 0, padding-left 18px, color #334155
    - Each li: margin-bottom 5px, line-height 1.5
- Education entries: display flex, justify-content space-between, align-items baseline
  - Degree bold color #0f172a
  - School/year in gray
- Skills section: color #334155, line-height 1.8

CANDIDATE INFORMATION:
Name: ${form.fullName}
${form.email ? `Email: ${form.email}` : ''}
${form.phone ? `Phone: ${form.phone}` : ''}
${form.city ? `Location: ${form.city}, BC` : ''}
Target Role: ${form.targetTitle}
${form.summary ? `Candidate notes: ${form.summary}` : ''}

WORK EXPERIENCE:
${expText || 'No experience provided'}

EDUCATION:
${eduText || 'No education provided'}

SKILLS:
${form.skills || 'Not provided'}

Write a strong 2–3 sentence professional summary tailored to the target role. For each work experience entry write 3–4 bullet points highlighting achievements and impact. Keep total content to one page.`

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
      const html = data.content[0]?.text ?? ''
      setResume(html)

      if (user) {
        await supabase.from('job_seekers').update({ ai_resume: html }).eq('user_id', user.id)
        setSaved(true)
      }
    } catch (err) {
      setError(err.message ?? 'Failed to generate resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @media print {
          body > * { display: none !important; }
          #resume-print-root {
            display: block !important;
            position: fixed; inset: 0;
            background: white;
            overflow: auto;
          }
        }
        #resume-print-root { display: none; }
      `}</style>

      {resume && (
        <div id="resume-print-root" dangerouslySetInnerHTML={{ __html: resume }} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 print:hidden">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:hidden">
        {!resume ? (
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
            </FormSection>

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
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 text-sm font-semibold bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition-colors">
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: resume }} />
            </div>

            <p className="text-xs text-slate-400 text-center">
              Click <strong>Download PDF</strong> to open the print dialog. Select <em>Save as PDF</em> as the destination.
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

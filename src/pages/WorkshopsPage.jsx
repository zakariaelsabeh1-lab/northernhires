import { ExternalLink, Clock, BookOpen, CheckCircle } from 'lucide-react'

const WORKSHOPS = [
  {
    title: 'Job Interview Skills',
    description: 'Learn how to prepare for interviews with confidence. Covers common interview questions, the STAR method for behavioural responses, how to research employers, and what to do before, during, and after your interview.',
    duration: '45 min',
    url: 'https://upskillsforwork.ca/resources/',
  },
  {
    title: 'Resume and Cover Letter Writing',
    description: 'Build a resume that gets noticed. This workshop walks you through formatting, tailoring your resume to job postings, writing a compelling cover letter, and avoiding the most common mistakes that cost candidates interviews.',
    duration: '60 min',
    url: 'https://www.jobbank.gc.ca/findajob/resume-builder',
  },
  {
    title: 'Life Skills for the Workplace',
    description: 'Develop the foundational skills employers look for beyond technical ability. Topics include time management, professional boundaries, personal responsibility, self-advocacy, and navigating workplace expectations in Northern BC.',
    duration: '50 min',
    url: 'https://upskillsforwork.ca/resources/',
  },
  {
    title: 'Workplace Communication',
    description: 'Communicate clearly and professionally on the job. Covers verbal and written communication, giving and receiving feedback, resolving conflict respectfully, and adapting your communication style in diverse work environments.',
    duration: '40 min',
    url: 'https://upskillsforwork.ca/resources/',
  },
  {
    title: 'Financial Literacy for Job Seekers',
    description: 'Understand your pay, benefits, and finances when starting or changing jobs. Topics include reading your pay stub, understanding deductions and taxes, budgeting on a variable income, and accessing financial support programs.',
    duration: '55 min',
    url: 'https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/pages/introduction-introduction.aspx',
  },
]

const CANADA_RESOURCES = [
  {
    label: 'Skills for Success Self-Assessment',
    description: 'Assess your essential workplace skills and find learning resources tailored to your results.',
    url: 'https://www.canada.ca/en/employment-social-development/programs/skills-success.html',
    host: 'canada.ca',
  },
  {
    label: 'Job Bank Skills Matching',
    description: 'Match your skills to in-demand occupations and explore career pathways across Canada.',
    url: 'https://www.jobbank.gc.ca/skillsmatch',
    host: 'jobbank.gc.ca',
  },
  {
    label: 'Career Navigator',
    description: 'Plan your career path with guided tools, labour market information, and training resources.',
    url: 'https://www.canada.ca/en/employment-social-development/programs/careers.html',
    host: 'canada.ca',
  },
]

export default function WorkshopsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <CheckCircle size={13} /> Free · Online · No registration required
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
              Workshops for Job Seekers
            </h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              Free online workshops to help you land a job and thrive in the Northern BC workforce.
              Work through them at your own pace, anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Workshop grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {WORKSHOPS.map((w) => (
            <div key={w.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 flex-1">
                <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen size={18} className="text-green-700" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2 leading-snug">{w.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{w.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock size={13} className="shrink-0" />
                  {w.duration}
                </div>
              </div>
              <div className="px-6 pb-6">
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Launch Workshop <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Canada.ca Resources */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-slate-200" />
            <h2 className="text-lg font-extrabold text-slate-800 shrink-0">Canada.ca Resources</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-sm text-slate-500 text-center mb-8 max-w-xl mx-auto">
            Government of Canada tools and self-assessments to help you explore careers, match your skills, and find training.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CANADA_RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-slate-200 hover:border-green-300 shadow-sm hover:shadow-md p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-green-700 transition-colors leading-snug">
                    {r.label}
                  </p>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-green-500 shrink-0 mt-0.5 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{r.description}</p>
                <span className="inline-block text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  {r.host}
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-12 max-w-2xl mx-auto leading-relaxed">
          Some resources on this page are provided by third-party organizations. NorthernHires is not affiliated with these organizations and is not responsible for their content.
        </p>
      </div>
    </div>
  )
}

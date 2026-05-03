import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  MapPin,
  Search,
  CheckCircle,
  Star,
  Users,
  Briefcase,
  Bell,
  ArrowRight,
  Building2,
  TreePine,
  Truck,
  Stethoscope,
  HardHat,
  UtensilsCrossed,
  GraduationCap,
  Wrench,
} from 'lucide-react'

const JOB_CATEGORIES = [
  { icon: HardHat, label: 'Trades & Construction', count: 48 },
  { icon: Stethoscope, label: 'Healthcare', count: 31 },
  { icon: Truck, label: 'Trucking & Logistics', count: 27 },
  { icon: TreePine, label: 'Forestry & Natural Resources', count: 22 },
  { icon: GraduationCap, label: 'Education', count: 19 },
  { icon: Wrench, label: 'Maintenance & Repair', count: 17 },
  { icon: UtensilsCrossed, label: 'Hospitality & Food Service', count: 15 },
  { icon: Building2, label: 'Office & Admin', count: 14 },
]



const TAG_COLORS = {
  Trades: 'bg-amber-100 text-amber-800',
  Healthcare: 'bg-blue-100 text-blue-800',
  Trucking: 'bg-slate-100 text-slate-700',
  Education: 'bg-purple-100 text-purple-800',
  Hospitality: 'bg-pink-100 text-pink-800',
  Forestry: 'bg-green-100 text-green-800',
}

export default function HomePage() {
  const [recentJobs, setRecentJobs] = useState([])

  useEffect(() => {
    const fetchRecentJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, city, job_type, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)
      if (!error && data) setRecentJobs(data)
    }
    fetchRecentJobs()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-green-600/50 border border-green-500/50 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
              <MapPin size={12} />
              Prince George &amp; Northern BC Only
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center leading-tight mb-5">
            Find Jobs That Are<br />
            <span className="text-green-300">Actually Near You</span>
          </h1>

          <p className="text-center text-green-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            NorthernHires is the only job board built exclusively for Prince George and Northern BC.
            No relocations from Vancouver. No remote jobs from Toronto.{' '}
            <span className="font-semibold text-white">Real local jobs. Always free for job seekers.</span>
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-2 shadow-xl">
              <div className="flex items-center flex-1 gap-2 px-3">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company..."
                  className="w-full py-2 text-slate-800 placeholder-slate-400 text-sm outline-none bg-transparent"
                />
              </div>
              <div className="hidden sm:block w-px bg-slate-200 my-1" />
              <div className="flex items-center gap-2 px-3 sm:w-44">
                <MapPin size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  defaultValue="Prince George, BC"
                  className="w-full py-2 text-slate-800 text-sm outline-none bg-transparent"
                />
              </div>
              <Link
                to="/jobs"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors text-center shrink-0"
              >
                Search Jobs
              </Link>
            </div>
            <p className="text-center text-green-200 text-xs mt-3">
              193 jobs available right now in Northern BC
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-10 bg-slate-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle size={17} className="text-green-600 shrink-0" />
              <span><strong className="text-slate-800">Free forever</strong> for job seekers</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-green-600 shrink-0" />
              <span>Jobs <strong className="text-slate-800">only in Northern BC</strong> — no Vancouver noise</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Bell size={17} className="text-green-600 shrink-0" />
              <span>Get alerts for <strong className="text-slate-800">new local jobs</strong> instantly</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why NorthernHires ── */}
      <section className="py-18 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Why NorthernHires Instead of Indeed or LinkedIn?
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Big job boards are built for big cities. We are built for here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                <MapPin size={22} className="text-green-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">100% Local Jobs</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Every single job on NorthernHires is located in Prince George or Northern BC. No remote
                positions for companies in Toronto. No "relocate to Vancouver." Just jobs you can
                actually commute to.
              </p>
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                  Indeed: search "Prince George" → get results from Kamloops, Surrey, and remote jobs.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-7 border border-green-200 shadow-sm ring-1 ring-green-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
                <Star size={22} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Free for Job Seekers. Always.</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We will never charge job seekers to apply, view listings, or create a profile. No
                premium tiers, no "Easy Apply" paywalls. It costs nothing to find your next job in
                Northern BC.
              </p>
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                  LinkedIn: charges for InMail credits, premium features, and "Open to Work" boosts.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Users size={22} className="text-blue-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Built for Northern BC Workers</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Categories built around Northern BC industries: forestry, mining, trades, healthcare,
                and more. No irrelevant categories like "Web3" or "FinTech" cluttering your search.
              </p>
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                  Indeed: 80% of "local" jobs require experience with tools or markets irrelevant to
                  Northern BC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Job Categories ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse by Category
            </h2>
            <Link
              to="/jobs"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              All categories <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {JOB_CATEGORIES.map(({ icon: Icon, label, count }) => (
              <Link
                key={label}
                to="/jobs"
                className="group bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-xl p-5 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white group-hover:bg-green-100 border border-slate-200 group-hover:border-green-200 rounded-lg flex items-center justify-center mb-3 transition-colors">
                  <Icon size={18} className="text-slate-600 group-hover:text-green-700 transition-colors" />
                </div>
                <p className="font-semibold text-slate-800 group-hover:text-green-800 text-sm leading-snug mb-1 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-slate-400">{count} open roles</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Jobs ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Latest Jobs in Northern BC
            </h2>
            <Link
              to="/jobs"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              View all jobs <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 transition-all duration-200 shadow-sm"
              >
                {/* Company avatar */}
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-slate-500" />
                </div>

                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 group-hover:text-green-800 transition-colors text-base">
                      {job.title}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[job.tag] || 'bg-slate-100 text-slate-600'}`}>
                      {job.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
  <span>Northern BC Employer</span>
  <span className="flex items-center gap-1">
    <MapPin size={12} className="shrink-0" />
    {job.city}, BC
  </span>
</div>

                {/* Meta */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                  <span className="bg-green-50 border border-green-200 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {job.job_type}
                  </span>
                  <span className="text-xs text-slate-400">{'Today'}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              View All 193 Jobs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              Getting Hired is Simple
            </h2>
            <p className="text-slate-500">No account required to browse. No fees. Ever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines on desktop */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-slate-200" />

            {[
              {
                step: '1',
                icon: Search,
                title: 'Search Local Jobs',
                desc: 'Browse hundreds of jobs across Prince George, Vanderhoof, Fort St. James, Burns Lake, and all of Northern BC.',
              },
              {
                step: '2',
                icon: CheckCircle,
                title: 'Apply Directly',
                desc: 'Apply right on NorthernHires or get redirected to the employer. No sign-up required to read listings.',
              },
              {
                step: '3',
                icon: Bell,
                title: 'Get Job Alerts',
                desc: 'Create a free account and get email alerts the moment a matching job is posted in your area.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-center mb-5 relative z-10">
                  <Icon size={28} className="text-green-700" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Employer CTA ── */}
      <section className="py-16 bg-green-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Hiring in Northern BC?
              </h2>
              <p className="text-green-200 text-lg leading-relaxed mb-2">
                Reach the people who actually live and work here. NorthernHires puts your job in
                front of local candidates — not applicants from across the country who will never
                show up.
              </p>
              <ul className="space-y-2 text-green-100 text-sm mt-5">
                {[
                  'Post a job in under 5 minutes',
                  'Reaches candidates already living in Northern BC',
                  'No algorithm hiding your listing',
                  'Affordable flat-rate pricing for local businesses',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                to="/post-job"
                className="bg-white hover:bg-slate-100 text-green-900 font-bold text-base px-8 py-4 rounded-xl transition-colors text-center"
              >
                Post a Job — From $49
              </Link>
              <Link
                to="/employers"
                className="border border-green-600 hover:border-green-400 text-green-200 hover:text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community proof ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-12">
            Trusted by Northern BC Employers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { value: '193', label: 'Active Jobs' },
              { value: '80+', label: 'Local Employers' },
              { value: '2,400+', label: 'Job Seekers' },
              { value: '$0', label: 'Cost to Apply' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-4xl font-extrabold text-green-700 mb-1">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
      quote:
        'Simple to post and easy to manage. Great way to reach local candidates without the noise of the big job boards.',
      name: 'Test Employer A',
      role: 'Hiring Manager, Prince George',
    },
    {
      quote:
        'All the jobs are actually local. No relocations, no out-of-province postings. Exactly what I was looking for.',
      name: 'Test User B',
      role: 'Job Seeker, Prince George',
    },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm text-left">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Ready to Find Your Next Job in Northern BC?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Free for job seekers. Local listings only. No spam.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/jobs"
              className="bg-green-700 hover:bg-green-800 text-white font-bold text-base px-8 py-4 rounded-xl transition-colors"
            >
              Browse Jobs Now
            </Link>
            <Link
              to="/register"
              className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-base px-8 py-4 rounded-xl transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

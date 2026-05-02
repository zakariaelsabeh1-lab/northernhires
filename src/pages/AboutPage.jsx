import { Link } from 'react-router-dom'
import { MapPin, Users, Briefcase, CheckCircle, Heart, Building2, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <MapPin size={13} /> Prince George & Northern BC
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              Connecting Northern BC<br />communities with local jobs
            </h1>
            <p className="text-green-200 text-lg leading-relaxed max-w-2xl">
              NorthernHires is a free job board built specifically for workers and employers in Northern British Columbia. We believe local people deserve a local job board.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* Mission */}
        <section>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                National job boards serve Canada's big cities. Northern BC workers — in trades, forestry, healthcare, trucking, and more — deserve something built for them.
              </p>
              <p className="text-slate-600 leading-relaxed">
                NorthernHires exists to make it easier for people in Prince George, Vanderhoof, Smithers, Fort St. James, and communities across the North to find good work close to home — and for local employers to find qualified candidates without competing against national noise.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: CheckCircle, label: 'Free for job seekers', desc: 'Always free. No premium tiers.' },
                { icon: MapPin,      label: '100% local jobs',      desc: 'Only Northern BC postings.' },
                { icon: Users,       label: 'Built for communities', desc: 'Not another national board.' },
                { icon: Briefcase,   label: 'Local industries',      desc: 'Trades, forestry, healthcare & more.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="w-9 h-9 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={16} className="text-green-700" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-0.5">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Who It&apos;s For</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            NorthernHires serves two groups of people who both matter deeply to Northern BC&apos;s economy.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="w-12 h-12 bg-green-100 border border-green-200 rounded-2xl flex items-center justify-center mb-5">
                <Users size={22} className="text-green-700" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Job Seekers</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Whether you&apos;re entering the workforce, changing careers, or returning after time away — NorthernHires helps you find local opportunities without wading through irrelevant listings from across the country.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Browse jobs by region, category, and type',
                  'Get matched to jobs based on your preferences',
                  'Upload your resume and apply in minutes',
                  'Set up email alerts for new listings',
                  'Access free skill-building workshops',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="inline-flex items-center gap-2 mt-6 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Create Free Account <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="w-12 h-12 bg-green-100 border border-green-200 rounded-2xl flex items-center justify-center mb-5">
                <Building2 size={22} className="text-green-700" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Employers</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Small businesses, large operations, and everyone in between. If you&apos;re hiring in Northern BC, NorthernHires puts your listing in front of local candidates who are actively looking in your area.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Post jobs in minutes with no account fees',
                  'Reach candidates in specific Northern BC regions',
                  'Track views and manage applications in one place',
                  'See how many job seekers match your posting',
                  'Get verified employer status to build trust',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/employers"
                className="inline-flex items-center gap-2 mt-6 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Post a Job <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">How It Works</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">Simple, local, and free.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Create your account',   desc: 'Sign up as a job seeker or employer. Free for job seekers, always.' },
              { step: '2', title: 'Set your preferences',  desc: 'Tell us your region, industry, and job type so we can surface the right matches.' },
              { step: '3', title: 'Connect locally',       desc: 'Browse, apply, post, and hire — all within Northern BC communities.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-extrabold text-lg">{step}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commitment */}
        <section className="bg-green-800 rounded-3xl p-10 sm:p-14 text-white text-center">
          <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={26} className="text-green-300" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Our Commitment to Northern BC</h2>
          <p className="text-green-200 leading-relaxed max-w-2xl mx-auto text-lg">
            NorthernHires is dedicated to the communities of Northern British Columbia. We will never list jobs outside the region, never charge job seekers, and always put local workers and employers first.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Prince George', 'Vanderhoof', 'Fort St. James', 'Burns Lake', 'Houston', 'Smithers', 'Terrace', 'Fort St. John', 'Dawson Creek', 'Mackenzie'].map((c) => (
              <span key={c} className="text-sm bg-white/10 border border-white/20 text-green-100 px-3 py-1.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

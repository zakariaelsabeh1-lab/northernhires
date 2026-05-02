import { Link } from 'react-router-dom'
import {
  MapPin, CheckCircle, Building2, Users, Eye, Zap,
  ArrowRight, Star, Clock, DollarSign,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const STEPS = [
  { n: '1', title: 'Create your employer account', body: 'Sign up with your company email in under two minutes. No credit card required to register.' },
  { n: '2', title: 'Post your job listing', body: 'Fill in the role details, compensation, and how to apply. Your listing goes live immediately.' },
  { n: '3', title: 'Receive local applicants', body: 'Northern BC job seekers apply directly. You get their contact details — no middleman.' },
]

const FEATURES = [
  { icon: MapPin,       title: 'Only Northern BC candidates', body: 'Every job seeker on NorthernHires lives or works in Northern BC. Zero out-of-province applicants who won\'t relocate.' },
  { icon: Eye,          title: 'Real-time view counts', body: 'See exactly how many people have viewed each listing from your employer dashboard.' },
  { icon: Zap,          title: 'Live in minutes', body: 'Post a job and it\'s instantly visible to thousands of active Northern BC job seekers. No review delays.' },
  { icon: Users,        title: 'Qualified local talent', body: 'Candidates already know the region, the industries, and the conditions. Less time explaining, more time hiring.' },
  { icon: DollarSign,   title: 'Flat-rate pricing', body: 'No per-click fees, no subscription required. Pay a simple flat rate per listing and know exactly what you\'re spending.' },
  { icon: Clock,        title: 'Simple dashboard', body: 'Manage all your active and past listings in one place. Activate, deactivate, or repost with one click.' },
]

const TESTIMONIALS = [
  {
    quote: 'We posted a millwright position and had 8 qualified local applicants within three days. Couldn\'t do that on Indeed without paying for sponsored posts.',
    name: 'Sarah K.', role: 'HR Manager, Northland Forest Products',
  },
  {
    quote: 'The view counts alone are worth it. I can see which listings are getting traction and which ones need a new title before wasting the full 30-day window.',
    name: 'Greg M.', role: 'Operations Manager, Pacific Aggregate',
  },
]

export default function EmployersLandingPage() {
  const { user, employerProfile } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-1.5 bg-green-600/50 border border-green-500/50 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-6">
            <Building2 size={12} /> For Employers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Hire Local.<br />
            <span className="text-green-300">Hire Northern BC.</span>
          </h1>
          <p className="text-green-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            NorthernHires puts your job listing in front of candidates who already live in Prince George
            and Northern BC — not applicants who will never show up for an interview.
          </p>

          {employerProfile ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/employers/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-green-50 transition-colors">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
              <Link to="/employers/post-job"
                className="inline-flex items-center justify-center gap-2 border border-green-500 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-green-300 transition-colors">
                Post a New Job
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/employers/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-green-50 transition-colors">
                Post Your First Job <ArrowRight size={18} />
              </Link>
              <Link to="/employers/login"
                className="inline-flex items-center justify-center gap-2 border border-green-500 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-green-300 transition-colors">
                Sign in to dashboard
              </Link>
            </div>
          )}

          <p className="text-green-300 text-sm mt-5">From $49 per listing · No subscription required</p>
        </div>
        <div className="h-10 bg-slate-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '2,400+', label: 'Active job seekers' },
              { value: '193',    label: 'Jobs posted this month' },
              { value: '80+',    label: 'Local employers' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-green-700">{value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Post a job in minutes</h2>
            <p className="text-slate-500">No account manager. No approval queue. Just fill in the form and go live.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 relative">
                <div className="w-10 h-10 bg-green-700 text-white font-extrabold text-lg rounded-xl flex items-center justify-center mb-5">
                  {n}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Built for Northern BC employers
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Everything you need. Nothing you don't.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-6 hover:border-green-300 hover:bg-green-50/30 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-green-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Simple, honest pricing</h2>
            <p className="text-slate-500">No hidden fees. No subscription traps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PricingCard
              name="Single Listing"
              price="$49"
              period="per listing"
              features={['Active for 30 days', 'Real-time view counts', 'Employer dashboard', 'Activate / deactivate anytime']}
              cta="Post a job"
              href="https://buy.stripe.com/test_4gM4gA9QydTf8Ic0jS7EQ01"
            />
            <PricingCard
              name="3-Pack"
              price="$119"
              period="for 3 listings"
              features={['Save $28 vs single', 'All Single features', 'Use over 90 days', 'Good for seasonal hiring']}
              cta="Get started"
              href="https://buy.stripe.com/test_7sY9AUbYGeXjcYseaI7EQ02"
              highlight
            />
            <PricingCard
              name="Unlimited Month"
              price="$199"
              period="per month"
              features={['Unlimited listings', 'Featured placement', 'Priority support', 'Best for active hirers']}
              cta="Get started"
              href="https://buy.stripe.com/test_dRmeVed2KeXjcYs1nW7EQ03"
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10">
            What Northern BC employers say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <div key={name} className="bg-slate-50 rounded-2xl border border-slate-200 p-7">
                <div className="flex gap-0.5 mb-4">
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
      <section className="bg-green-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to find your next hire?
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Join 80+ Northern BC employers already using NorthernHires.
          </p>
          {employerProfile ? (
            <Link to="/employers/dashboard"
              className="inline-flex items-center gap-2 bg-white text-green-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-green-50 transition-colors">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/employers/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-green-50 transition-colors">
                Create Employer Account
              </Link>
              <Link to="/employers/login"
                className="inline-flex items-center justify-center gap-2 border border-green-600 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-green-400 transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

function PricingCard({ name, price, period, features, cta, href, highlight = false }) {
  return (
    <div className={`rounded-2xl p-7 border ${highlight ? 'bg-green-900 text-white border-green-700' : 'bg-white border-slate-200'} shadow-sm`}>
      <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-green-300' : 'text-slate-500'}`}>{name}</p>
      <p className={`text-4xl font-extrabold mb-0.5 ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</p>
      <p className={`text-xs mb-6 ${highlight ? 'text-green-300' : 'text-slate-400'}`}>{period}</p>
      <ul className="space-y-2 mb-7">
        {features.map((f) => (
          <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-green-100' : 'text-slate-600'}`}>
            <CheckCircle size={14} className={highlight ? 'text-green-400' : 'text-green-600'} />
            {f}
          </li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-center font-semibold text-sm px-5 py-3 rounded-xl transition-colors ${
          highlight
            ? 'bg-white text-green-900 hover:bg-green-50'
            : 'bg-green-700 text-white hover:bg-green-800'
        }`}
      >
        {cta}
      </a>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-white">
                Northern<span className="text-green-400">Hires</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              The free, local job board built for Prince George and Northern BC communities.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/alerts" className="hover:text-white transition-colors">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/employers" className="hover:text-white transition-colors">Employer Info</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} NorthernHires. Serving Prince George &amp; Northern BC.
          </p>
          <p className="text-sm text-green-500 font-medium">Always free for job seekers.</p>
        </div>
      </div>
    </footer>
  )
}

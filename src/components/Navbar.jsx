import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, MapPin, ChevronDown, User, LogOut, Briefcase, Building2, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, employerProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    setDropdownOpen(false)
    setMobileOpen(false)
    await signOut()
    navigate('/')
  }

  const displayName = employerProfile?.company_name
    ?? profile?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Account'

  // Show "Post a Job" only for employers or unauthenticated visitors — never for job seekers
  const showPostJob = !user || !!employerProfile

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl text-slate-900">
              Northern<span className="text-green-700">Hires</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-green-700 transition-colors">
              Browse Jobs
            </Link>
            <Link to="/employers" className="text-sm font-medium text-slate-600 hover:text-green-700 transition-colors">
              For Employers
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-green-700 transition-colors">
              About
            </Link>
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-green-700 transition-colors pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                      employerProfile ? 'bg-green-100 border-green-200' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {employerProfile
                        ? <Building2 size={13} className="text-green-700" />
                        : <User size={13} className="text-slate-500" />
                      }
                    </div>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {employerProfile && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                            <Building2 size={10} /> Employer
                          </span>
                        )}
                      </div>

                      {employerProfile && (
                        <>
                          <DropdownLink to="/employers/dashboard" icon={LayoutDashboard} label="Employer Dashboard" onClick={() => setDropdownOpen(false)} />
                          <DropdownLink to="/employers/post-job" icon={Briefcase} label="Post a Job" onClick={() => setDropdownOpen(false)} />
                        </>
                      )}

                      {profile && (
                        <DropdownLink to="/dashboard/jobseeker" icon={LayoutDashboard} label="My Dashboard" onClick={() => setDropdownOpen(false)} />
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {showPostJob && (
                  <Link
                    to={employerProfile ? '/employers/post-job' : '/employers/register'}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Post a Job
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-green-700 transition-colors">
                  Sign in
                </Link>
                <Link to="/register"
                  className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          <MobileLink to="/jobs" onClick={() => setMobileOpen(false)}>Browse Jobs</MobileLink>
          <MobileLink to="/employers" onClick={() => setMobileOpen(false)}>For Employers</MobileLink>
          <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
          <hr className="border-slate-100 my-2" />
          {user ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  employerProfile ? 'bg-green-100 border-green-200' : 'bg-slate-100 border-slate-200'
                }`}>
                  {employerProfile ? <Building2 size={15} className="text-green-700" /> : <User size={15} className="text-slate-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              {employerProfile && (
                <>
                  <MobileLink to="/employers/dashboard" onClick={() => setMobileOpen(false)}>Employer Dashboard</MobileLink>
                  <MobileLink to="/employers/post-job" onClick={() => setMobileOpen(false)}>Post a Job</MobileLink>
                </>
              )}
              {profile && <MobileLink to="/dashboard/jobseeker" onClick={() => setMobileOpen(false)}>My Dashboard</MobileLink>}
              <button onClick={handleSignOut}
                className="w-full text-left text-sm font-medium text-red-600 px-2 py-2.5 hover:bg-red-50 rounded-lg transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <MobileLink to="/login" onClick={() => setMobileOpen(false)}>Sign in</MobileLink>
              <Link to="/register"
                className="block bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-2"
                onClick={() => setMobileOpen(false)}>
                Create Free Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function DropdownLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
      <Icon size={14} className="text-slate-400" /> {label}
    </Link>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="block text-sm font-medium text-slate-700 px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors">
      {children}
    </Link>
  )
}

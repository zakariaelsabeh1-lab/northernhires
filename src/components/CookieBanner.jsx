import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'nh_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Cookie size={18} className="text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">
            We use local storage to remember your preferences. We do not use tracking cookies.{' '}
            <Link to="/privacy" className="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition-colors"
          >
            <X size={12} /> Decline
          </button>
          <button
            onClick={accept}
            className="text-xs font-bold text-white bg-green-700 hover:bg-green-600 px-4 py-2 rounded-xl transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

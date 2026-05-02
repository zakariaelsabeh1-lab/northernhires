import { Link } from 'react-router-dom'
import { Shield, Lock, Database, Mail, Eye, UserX } from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={16} className="text-green-700" />
        </div>
        <h2 className="font-bold text-slate-900 text-base">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-green-300 text-sm max-w-md mx-auto">
            Last updated: May 2, 2026. NorthernHires is committed to protecting your personal information.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        <Section icon={Eye} title="What Information We Collect">
          <p>When you create an account as a job seeker, we collect your name, email address, phone number, city, and any profile information you choose to provide including your bio, skills, and job preferences.</p>
          <p>When you apply for a job, we collect your application details including your cover letter, years of experience, and resume if uploaded.</p>
          <p>When you use the AI Resume Builder, we collect the information you enter into the form (name, work history, education, skills) to generate your resume. The generated resume is stored in your profile.</p>
          <p>Employer accounts collect company name, contact name, email address, and job posting details.</p>
        </Section>

        <Section icon={Database} title="How Your Data Is Stored">
          <p>NorthernHires uses <strong>Supabase</strong> as its database and storage provider. All data is stored on servers located in <strong>Canada</strong>, ensuring your information remains subject to Canadian privacy law.</p>
          <p>Uploaded resume files are stored in Supabase Storage with access controlled by your account. Resume files associated with applications are only accessible to the employer you applied to.</p>
          <p>Passwords are never stored in plain text. Authentication is handled securely by Supabase Auth.</p>
        </Section>

        <Section icon={Lock} title="How We Use Your Information">
          <p>We use your information solely to operate the NorthernHires platform:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To match job seekers with relevant job listings based on preferences</li>
            <li>To deliver job alert emails when you subscribe</li>
            <li>To forward applications to employers when you apply for a job</li>
            <li>To notify employers of new applicants</li>
            <li>To generate your AI resume via the Claude AI API (Anthropic)</li>
          </ul>
          <p>When you apply for a job, your application details (name, email, phone, resume, cover letter) are shared with the employer who posted that job. This is the only circumstance in which your personal information is shared with a third party.</p>
        </Section>

        <Section icon={UserX} title="We Do Not Sell Your Data">
          <p><strong>NorthernHires does not sell, rent, trade, or otherwise disclose your personal information to any third party for marketing or commercial purposes.</strong></p>
          <p>We do not use your data for advertising targeting, behavioral tracking, or any purpose beyond operating the platform.</p>
        </Section>

        <Section icon={Shield} title="Data Retention & Deletion">
          <p>You may delete your account at any time by contacting us. Upon account deletion, your personal profile data, saved jobs, and application history will be removed from our active systems.</p>
          <p>Job applications that have been submitted to employers may be retained in employer records after your account is deleted, as they form part of the employer's hiring record.</p>
          <p>You can delete your AI-generated resume from your dashboard at any time.</p>
        </Section>

        <Section icon={Lock} title="Cookies & Local Storage">
          <p>NorthernHires uses browser <strong>localStorage</strong> to store session preferences such as your cookie consent choice and saved job states. We do not use third-party tracking cookies.</p>
          <p>No advertising or analytics cookies are used on this platform.</p>
        </Section>

        <Section icon={Mail} title="Contact Us">
          <p>If you have questions about this Privacy Policy or want to request access to, correction of, or deletion of your personal data, please contact us:</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:info@northernhires.ca" className="text-green-700 hover:text-green-800 font-medium">
              info@northernhires.ca
            </a>
          </p>
          <p>We will respond to privacy-related requests within 30 days.</p>
        </Section>

        <div className="text-center pt-2 pb-4">
          <Link to="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← Back to NorthernHires
          </Link>
          <span className="mx-3 text-slate-300">|</span>
          <Link to="/terms" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}

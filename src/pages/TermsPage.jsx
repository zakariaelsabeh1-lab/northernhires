import { Link } from 'react-router-dom'
import { FileText, Briefcase, User, CreditCard, Tag, Scale } from 'lucide-react'

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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-green-300 text-sm max-w-md mx-auto">
            Last updated: May 2, 2026. By using NorthernHires you agree to these terms.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        <Section icon={FileText} title="Acceptance of Terms">
          <p>By accessing or using NorthernHires ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.</p>
          <p>NorthernHires reserves the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>
        </Section>

        <Section icon={Briefcase} title="Employer Posting Rules">
          <p>Employers who post job listings agree to the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All job postings must be for real, legitimate positions available in Northern British Columbia.</li>
            <li>Job descriptions must be accurate and not misleading regarding compensation, responsibilities, or working conditions.</li>
            <li>Employers must not post discriminatory job listings. All postings must comply with the BC Human Rights Code.</li>
            <li>Employers may not post listings for multi-level marketing schemes, unpaid positions (unless designated volunteer), or roles that violate Canadian employment law.</li>
            <li>Employers are responsible for responding to applicants in a timely and respectful manner.</li>
            <li>NorthernHires reserves the right to remove any listing that violates these rules without refund.</li>
          </ul>
        </Section>

        <Section icon={User} title="Job Seeker Rules">
          <p>Job seekers using the Platform agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate information in their profile, resume, and job applications.</li>
            <li>Not submit fraudulent applications or misrepresent qualifications, experience, or identity.</li>
            <li>Use the AI Resume Builder only to generate resumes that reflect their own genuine background.</li>
            <li>Not use the Platform for any unlawful purpose or in any way that could harm other users or employers.</li>
            <li>Be respectful in all communications with employers facilitated through the Platform.</li>
          </ul>
          <p>NorthernHires reserves the right to suspend or terminate accounts that violate these rules.</p>
        </Section>

        <Section icon={Scale} title="No Guarantee of Employment">
          <p><strong>NorthernHires is a job board platform only.</strong> We do not guarantee that job seekers will receive job offers, interviews, or employment as a result of using the Platform.</p>
          <p>We do not guarantee the accuracy, completeness, or legality of job postings listed by employers. Job seekers are responsible for conducting their own due diligence on potential employers.</p>
          <p>NorthernHires is not a party to any employment agreement, contract, or arrangement between employers and job seekers.</p>
        </Section>

        <Section icon={CreditCard} title="Payment Terms">
          <p>Job seekers use NorthernHires for free. There are no fees of any kind charged to job seekers.</p>
          <p>Employers may be charged a fee to post job listings. Pricing is displayed at the time of purchase. All prices are in Canadian dollars (CAD) and include applicable taxes where required.</p>
          <p>Payments are processed securely. NorthernHires does not store payment card information.</p>
          <p>Job posting fees are non-refundable once a listing has been published, except at the sole discretion of NorthernHires in cases of platform error.</p>
        </Section>

        <Section icon={Tag} title="Promo Code Terms">
          <p>NorthernHires may issue promotional codes that provide discounts or free job postings. The following terms apply to all promo codes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Promo codes are valid for one-time use per account unless otherwise stated.</li>
            <li>Promo codes may have expiry dates and may be withdrawn at any time without notice.</li>
            <li>Promo codes cannot be combined with other offers or transferred to another account.</li>
            <li>Fraudulent use of promo codes will result in account termination.</li>
            <li>NorthernHires reserves the right to cancel any posting made with a fraudulently obtained promo code.</li>
          </ul>
        </Section>

        <Section icon={Scale} title="Governing Law">
          <p>These Terms of Service are governed by and construed in accordance with the laws of the <strong>Province of British Columbia, Canada</strong>, and the applicable federal laws of Canada.</p>
          <p>Any disputes arising from these terms or use of the Platform shall be subject to the exclusive jurisdiction of the courts of British Columbia.</p>
          <p>If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>
        </Section>

        <Section icon={FileText} title="Contact">
          <p>For questions about these Terms of Service, contact us at:</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:info@northernhires.ca" className="text-green-700 hover:text-green-800 font-medium">
              info@northernhires.ca
            </a>
          </p>
        </Section>

        <div className="text-center pt-2 pb-4">
          <Link to="/privacy" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← Privacy Policy
          </Link>
          <span className="mx-3 text-slate-300">|</span>
          <Link to="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            Back to NorthernHires →
          </Link>
        </div>
      </div>
    </div>
  )
}

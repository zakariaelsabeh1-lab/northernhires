import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobTitle, applicantName, applicantEmail, employerId } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: employer } = await supabaseAdmin
      .from('employers')
      .select('user_id, company_name')
      .eq('id', employerId)
      .single()

    if (!employer) {
      return new Response(JSON.stringify({ error: 'Employer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(employer.user_id)
    const employerEmail = user?.email
    if (!employerEmail) {
      return new Response(JSON.stringify({ error: 'No employer email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://northernhires.ca'

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NorthernHires <noreply@northernhires.ca>',
        to: employerEmail,
        subject: `New application for "${jobTitle}"`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#15803d;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px">New Job Application</h1>
            </div>
            <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <p style="margin:0 0 16px">Hi <strong>${employer.company_name}</strong>,</p>
              <p style="margin:0 0 16px">
                <strong>${applicantName}</strong> has applied for your listing <strong>"${jobTitle}"</strong>.
              </p>
              <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
                <tr>
                  <td style="padding:8px 0;color:#64748b;font-size:14px">Applicant</td>
                  <td style="padding:8px 0;font-weight:600;font-size:14px">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b;font-size:14px">Email</td>
                  <td style="padding:8px 0;font-size:14px"><a href="mailto:${applicantEmail}" style="color:#15803d">${applicantEmail}</a></td>
                </tr>
              </table>
              <a href="${siteUrl}/employers/dashboard"
                style="display:inline-block;background:#15803d;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
                Review Application →
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
                You're receiving this because you have an active listing on NorthernHires.
              </p>
            </div>
          </div>
        `,
      }),
    })

    return new Response(JSON.stringify({ ok: emailRes.ok }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

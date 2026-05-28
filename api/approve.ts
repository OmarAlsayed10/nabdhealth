import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'
import { verifyApprovalToken } from './_lib/approval-token'
import { buildDoctorApprovedEmail } from './_lib/email'

function htmlPage(title: string, message: string, color: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:48px 24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="padding:20px 24px;background:${color};color:white"><h1 style="margin:0;font-size:20px">${title}</h1></div>
    <div style="padding:24px;line-height:1.6">${message}</div>
  </div>
</body></html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).send('Method not allowed')
  }

  const token = typeof req.query.token === 'string' ? req.query.token : ''
  if (!token) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(htmlPage('Invalid link', '<p>This approval link is missing its token.</p>', '#b91c1c'))
  }

  let payload
  try {
    payload = verifyApprovalToken(token)
  } catch (err) {
    console.error('[approve] verify error:', err)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage('Server error', '<p>Approval system not configured (missing APPROVAL_SECRET).</p>', '#b91c1c'))
  }

  if (!payload) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res
      .status(400)
      .send(htmlPage('Link expired or invalid', '<p>This approval link is no longer valid. It may have expired or been tampered with.</p>', '#b91c1c'))
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage('Not configured', '<p>SMTP env vars not set.</p>', '#b91c1c'))
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const email = buildDoctorApprovedEmail({
    fullName: payload.fullName,
    clinicName: payload.clinicName,
  })

  try {
    await transporter.sendMail({
      from: `"Nabd" <${user}>`,
      to: payload.email,
      replyTo: 'nabdhealtheg@gmail.com',
      subject: email.subject,
      html: email.html,
      text: email.text,
    })
  } catch (err) {
    const e = err as { code?: string; message?: string }
    console.error('[approve] SMTP error:', e)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(502).send(htmlPage('Email failed', `<p>Could not send the approval email: ${e?.message ?? 'unknown'}</p>`, '#b91c1c'))
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(
    htmlPage(
      'Approved',
      `<p>Approval email sent to <strong>${payload.email}</strong>.</p>
       <p style="color:#6b7280;font-size:13px">Dr. ${payload.fullName} (${payload.clinicName}) has been notified. Reach out to them on WhatsApp to share the installer.</p>`,
      '#0A7A8C',
    ),
  )
}

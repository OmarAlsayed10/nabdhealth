import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'
import { validateAccessRequestServer } from './_lib/validation'
import { checkRateLimit } from './_lib/rateLimit'
import { buildAdminEmail, buildDoctorAckEmail } from './_lib/email'
import { signApprovalToken } from './_lib/approval-token'

const TO_EMAIL = 'nabdhealtheg@gmail.com'

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string') return fwd.split(',')[0].trim()
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0]
  return req.socket?.remoteAddress ?? 'unknown'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  const limit = checkRateLimit(`access-request:${ip}`, { maxRequests: 3, windowMs: 60_000 })
  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    return res.status(429).json({ message: 'Too many requests. Please try again later.' })
  }

  const validation = validateAccessRequestServer(req.body ?? {})
  if (!validation.ok) {
    return res.status(400).json({ message: validation.message })
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    const missing = [
      !host && 'SMTP_HOST',
      !user && 'SMTP_USER',
      !pass && 'SMTP_PASS',
    ].filter(Boolean).join(', ')
    console.error('[access-request] SMTP env vars missing:', missing)
    return res.status(500).json({ message: `Email service not configured (missing: ${missing}).` })
  }

  let approveUrl: string
  try {
    const token = signApprovalToken({
      email: validation.value.email,
      fullName: validation.value.fullName,
      clinicName: validation.value.clinicName,
    })
    const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
      || `https://${req.headers.host ?? ''}`
    approveUrl = `${siteUrl}/api/approve?token=${encodeURIComponent(token)}`
  } catch (err) {
    console.error('[access-request] token signing failed:', err)
    return res.status(500).json({ message: 'Approval system not configured (missing APPROVAL_SECRET).' })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const adminEmail = buildAdminEmail(validation.value, approveUrl)
  const doctorEmail = buildDoctorAckEmail(validation.value)
  const fromHeader = `"Nabd" <${user}>`

  try {
    await Promise.all([
      transporter.sendMail({
        from: fromHeader,
        to: TO_EMAIL,
        replyTo: validation.value.email,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      }),
      transporter.sendMail({
        from: fromHeader,
        to: validation.value.email,
        replyTo: TO_EMAIL,
        subject: doctorEmail.subject,
        html: doctorEmail.html,
        text: doctorEmail.text,
      }),
    ])
    return res.status(200).json({ ok: true })
  } catch (err) {
    const e = err as { code?: string; response?: string; message?: string }
    console.error('[access-request] SMTP error:', {
      code: e?.code,
      response: e?.response,
      message: e?.message,
    })
    return res.status(502).json({
      message: `Email send failed: ${e?.code ?? ''} ${e?.message ?? 'unknown error'}`.trim(),
    })
  }
}

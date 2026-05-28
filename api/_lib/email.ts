import { escapeHtml, type AccessRequestValid } from './validation'

interface BuiltEmail {
  subject: string
  html: string
  text: string
}

function buildInfoTable(data: AccessRequestValid): string {
  const e = escapeHtml
  const mapsUrl = `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`
  const rows: Array<[string, string]> = [
    ['Full Name', e(data.fullName)],
    ['Email', `<a href="mailto:${e(data.email)}">${e(data.email)}</a>`],
    ['Phone', `${e(data.countryCode)} ${e(data.phoneNational)}`],
    ['Country', e(data.countryIso2)],
    ['Clinic Name', e(data.clinicName)],
    ['Clinic Country', `${e(data.clinicCountryName)} (${e(data.clinicCountryIso2)})`],
    ['Clinic City', e(data.clinicCity)],
    ['Clinic Street', e(data.clinicStreet)],
    [
      'Map Location',
      `<a href="${mapsUrl}" target="_blank" rel="noopener">${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)} (open in Google Maps)</a>`,
    ],
  ]
  if (data.details) rows.push(['Additional Details', e(data.details).replace(/\n/g, '<br>')])
  return rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:8px 12px;background:#f9fafb;font-weight:600;color:#374151;border:1px solid #e5e7eb;width:160px;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#111827;border:1px solid #e5e7eb">${val}</td></tr>`,
    )
    .join('')
}

function plainTextOf(data: AccessRequestValid): string {
  return [
    `Full Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.countryCode} ${data.phoneNational}`,
    `Country: ${data.countryIso2}`,
    `Clinic Name: ${data.clinicName}`,
    `Clinic Country: ${data.clinicCountryName} (${data.clinicCountryIso2})`,
    `Clinic City: ${data.clinicCity}`,
    `Clinic Street: ${data.clinicStreet}`,
    `Location: ${data.location.lat}, ${data.location.lng}`,
    data.details ? `Details: ${data.details}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function shell(headerTitle: string, headerSub: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="padding:24px;background:linear-gradient(135deg,#1ECFE0,#0A7A8C);color:white">
      <h1 style="margin:0;font-size:20px">${headerTitle}</h1>
      <p style="margin:6px 0 0;opacity:0.9;font-size:14px">${headerSub}</p>
    </div>
    <div style="padding:20px;font-size:14px;line-height:1.6;color:#111827">${body}</div>
  </div>
</body></html>`
}

export function buildAdminEmail(data: AccessRequestValid, approveUrl: string): BuiltEmail {
  const subject = `New access request — ${data.fullName} (${data.clinicName})`
  const body = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5">${buildInfoTable(data)}</table>
    <div style="margin-top:24px;text-align:center">
      <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#0A7A8C;color:white;text-decoration:none;border-radius:8px;font-weight:600">Approve &amp; Send Installer</a>
      <p style="margin:12px 0 0;color:#6b7280;font-size:12px">Clicking this will email the doctor the installer download link. Link expires in 48 hours.</p>
    </div>
  `
  const html = shell('New Access Request', 'Nabd — request submitted via the website', body)
  const text = `${plainTextOf(data)}\n\nApprove: ${approveUrl}`
  return { subject, html, text }
}

export function buildDoctorAckEmail(data: AccessRequestValid): BuiltEmail {
  const e = escapeHtml
  const subject = 'We received your Nabd Clinic access request'
  const body = `
    <p>Dear Dr. ${e(data.fullName)},</p>
    <p>Thank you for requesting access to <strong>Nabd Clinic</strong>. We received your request for <strong>${e(data.clinicName)}</strong> and our team will review it within 1–2 business days.</p>
    <p>Once approved, you will receive a follow-up email with the installer download link and setup instructions.</p>
    <p style="margin-top:24px;color:#6b7280;font-size:13px">If you did not submit this request, you can ignore this message.</p>
    <p style="margin-top:24px">— The Nabd Team</p>
  `
  const html = shell('Request Received', 'Thanks for choosing Nabd Clinic', body)
  const text = `Dear Dr. ${data.fullName},\n\nThank you for requesting access to Nabd Clinic. We received your request for ${data.clinicName} and our team will review it within 1–2 business days.\n\nOnce approved, you will receive a follow-up email with the installer download link and setup instructions.\n\n— The Nabd Team`
  return { subject, html, text }
}

export function buildDoctorApprovedEmail(
  data: Pick<AccessRequestValid, 'fullName' | 'clinicName'>,
  installerUrl: string,
): BuiltEmail {
  const e = escapeHtml
  const subject = 'Your Nabd Clinic access is approved'
  const body = `
    <p>Dear Dr. ${e(data.fullName)},</p>
    <p>Great news — your access request for <strong>${e(data.clinicName)}</strong> has been approved.</p>
    <p>Download the Nabd Clinic installer using the button below:</p>
    <div style="margin:24px 0;text-align:center">
      <a href="${installerUrl}" style="display:inline-block;padding:14px 28px;background:#0A7A8C;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">Download Nabd Clinic Installer</a>
    </div>
    <p style="margin-top:24px">Need help installing? Reply to this email and our team will assist you.</p>
    <p style="margin-top:24px">— The Nabd Team</p>
  `
  const html = shell('Access Approved', 'Your Nabd Clinic installer is ready', body)
  const text = `Dear Dr. ${data.fullName},\n\nGreat news — your access request for ${data.clinicName} has been approved.\n\nDownload the installer here:\n${installerUrl}\n\nNeed help? Reply to this email.\n\n— The Nabd Team`
  return { subject, html, text }
}

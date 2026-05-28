import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 14 * 24 * 60 * 60 * 1000

export interface ApprovalPayload {
  email: string
  fullName: string
  clinicName: string
  exp: number
}

function getSecret(): string {
  const s = process.env.APPROVAL_SECRET
  if (!s || s.length < 16) throw new Error('APPROVAL_SECRET not set or too short')
  return s
}

function b64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}

function isApprovalPayload(v: unknown): v is ApprovalPayload {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.email === 'string' &&
    typeof o.fullName === 'string' &&
    typeof o.clinicName === 'string' &&
    typeof o.exp === 'number'
  )
}

export function signApprovalToken(payload: Omit<ApprovalPayload, 'exp'>): string {
  const full: ApprovalPayload = { ...payload, exp: Date.now() + TTL_MS }
  const body = b64url(JSON.stringify(full))
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyApprovalToken(token: string): ApprovalPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null

  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!isApprovalPayload(parsed)) return null
  if (parsed.exp < Date.now()) return null
  return parsed
}

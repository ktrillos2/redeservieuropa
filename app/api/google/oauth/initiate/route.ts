import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { google } from 'googleapis'

function getEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`[calendar] Missing env: ${name}`)
  return v
}

export async function GET(req: Request) {
  // Protección opcional por token (reutilizamos MAIL_TEST_TOKEN si existe)
  const expected = process.env.MAIL_TEST_TOKEN
  if (expected) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    if (token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  const clientId = getEnv('GOOGLE_CLIENT_ID')
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
  const redirectUri = getEnv('GOOGLE_REDIRECT_URI')

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
  ]

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: expected || undefined,
  })

  return NextResponse.json({ url, redirectUri })
}

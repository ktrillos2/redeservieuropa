import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { google } from 'googleapis'

function getEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`[calendar] Missing env: ${name}`)
  return v
}

export async function GET(req: NextRequest) {
  const expected = process.env.MAIL_TEST_TOKEN
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  if (expected && state !== expected) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
  }
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const clientId = getEnv('GOOGLE_CLIENT_ID')
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
  const redirectUri = getEnv('GOOGLE_REDIRECT_URI')

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  const { tokens } = await oAuth2Client.getToken(code)

  // IMPORTANTE: guardar tokens.refresh_token manualmente en env/secret store.
  return NextResponse.json({
    message: 'Tokens obtenidos. Guarda el refresh_token de forma segura en GOOGLE_REFRESH_TOKEN.',
    tokens,
  })
}

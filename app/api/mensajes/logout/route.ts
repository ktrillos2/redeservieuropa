import { NextResponse } from 'next/server'

const COOKIE_NAME = 'mensajes_auth'
const COOKIE_USER = 'mensajes_user'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
  res.cookies.set(COOKIE_USER, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
  return res
}

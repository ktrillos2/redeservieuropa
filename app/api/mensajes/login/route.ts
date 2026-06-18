import { NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/server-client'
import bcrypt from 'bcryptjs'

const COOKIE_NAME = 'mensajes_auth'
const COOKIE_USER = 'mensajes_user'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const user = String(form.get('user') || '').trim()
    const pass = String(form.get('pass') || '')
    if (!user || !pass) return NextResponse.json({ ok: false, error: 'Usuario y contraseña requeridos' }, { status: 400 })
    const doc = await serverClient.fetch<any>(`*[_type == "messageUser" && username == $u][0]{ _id, username, passwordHash, active }`, { u: user })
    if (!doc || doc.active === false) return NextResponse.json({ ok: false, error: 'Usuario no válido o inactivo' }, { status: 401 })
    const ok = await bcrypt.compare(pass, String(doc.passwordHash || ''))
    if (!ok) return NextResponse.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
    const res = NextResponse.json({ ok: true })
    const maxAge = 60 * 60 * 8
    res.cookies.set(COOKIE_NAME, '1', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge })
    res.cookies.set(COOKIE_USER, String(doc._id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}

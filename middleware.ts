import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Redirigir POST /gracias a GET /gracias para evitar Server Actions POST
  if (pathname === '/gracias' && req.method === 'POST') {
    const url = req.nextUrl.clone()
    url.method = 'GET' as any
    url.search = ''
    url.pathname = '/gracias'
    return NextResponse.redirect(url, 303)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/gracias'],
}

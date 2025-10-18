import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Redirigir POST /gracias a GET /gracias
  if (pathname === '/gracias' && req.method === 'POST') {
    const url = req.nextUrl.clone()
    url.pathname = '/gracias'
    url.search = '' // Limpiar query params si es necesario
    return NextResponse.redirect(url, 303)
  }
  
  return NextResponse.next()
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isAdminSubdomain = hostname.startsWith('admin.')
  const pathname = request.nextUrl.pathname

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session cookie
  const { data: { session } } = await supabase.auth.getSession()

  // ── admin.soopnote.com 접속 시 ──────────────────────────
  if (isAdminSubdomain) {
    // 인증 경로는 통과 (로그인 페이지 등)
    if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
      return response
    }

    // 로그인 안 된 경우 → /login 으로
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // role 확인 (super_admin 또는 writer만 허용)
    const { data: profile } = await supabase
      .from('sn_users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'writer'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 루트(/) 접속 → /admin 으로 rewrite
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }

    // /admin/* 이 아닌 경로 → /admin 으로 rewrite
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }

    return response
  }

  // ── www.soopnote.com 접속 시 ────────────────────────────
  // /admin 경로 보호: 비로그인 시 홈으로 리다이렉트
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // role 확인 (super_admin 또는 writer만 허용)
    const { data: profile } = await supabase
      .from('sn_users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'writer'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 권한 있어도 www에서 /admin 접근 시 → admin 서브도메인으로 리다이렉트
    // (로컬 개발 환경은 예외: localhost/127.0.0.1에서는 /admin 을 그대로 렌더링)
    const isLocalDev =
      hostname.includes('localhost') || hostname.startsWith('127.0.0.1')
    if (!isLocalDev) {
      return NextResponse.redirect(
        new URL(pathname, 'https://admin.soopnote.com')
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
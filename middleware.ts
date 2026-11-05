import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ROLES = ['super_admin', 'writer']

// 역할 조회 결과를 아주 짧게 들고 있는다.
//
// 관리자 화면 하나를 여는 동안 미들웨어는 수십 번 실행된다 — 페이지 자체,
// 그 화면이 부르는 API, 뒤따르는 내비게이션까지. 예전에는 그때마다 sn_users
// 를 왕복해서, 11월 5일 로그에는 5초 동안 같은 조회가 30번 찍혔다.
// (그날 Supabase 요청 328건 중 120건이 이 조회였고, 그중 69건이 미들웨어였다.)
//
// 확인 자체는 모든 요청에서 그대로 한다. 왕복만 재사용한다. 권한을 회수하면
// 최대 TTL 만큼 늦게 반영되므로 짧게 잡는다.
const ROLE_CACHE_TTL_MS = 10_000
const roleCache = new Map<string, { role: string | null; expiresAt: number }>()

type MiddlewareSupabase = ReturnType<typeof createServerClient>

async function readRole(supabase: MiddlewareSupabase, userId: string): Promise<string | null> {
  const now = Date.now()
  const cached = roleCache.get(userId)
  if (cached && cached.expiresAt > now) return cached.role

  const { data } = await supabase
    .from('sn_users')
    .select('role')
    .eq('id', userId)
    .single()

  const role = (data as { role?: string } | null)?.role ?? null
  roleCache.set(userId, { role, expiresAt: now + ROLE_CACHE_TTL_MS })

  // 아이솔레이트가 오래 살아남아도 Map 이 계속 자라지 않도록 정리한다.
  if (roleCache.size > 100) {
    for (const [key, value] of roleCache) {
      if (value.expiresAt <= now) roleCache.delete(key)
    }
  }

  return role
}

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

    // API 및 글쓰기 경로는 통과 (API 호출, 일반 글쓰기 에디터)
    // 이게 없으면 /api/* 가 /admin 페이지로 rewrite 되어 모든 API 호출이 깨짐
    //
    // 역할 조회보다 먼저 빠져나간다. 예전에는 조회를 마친 뒤에야 통과시켜서,
    // 관리자 화면이 부르는 API 호출 하나하나가 sn_users 왕복을 일으켰다.
    //
    // 보호가 약해지는 건 아니다. 같은 API 를 www.soopnote.com 으로 부르면
    // 미들웨어의 역할 검사는 원래 거치지 않는다(아래 www 분기는 /admin 경로만
    // 본다). 즉 이 검사는 실질적인 관문이 아니었고, 관문은 각 라우트에 있다.
    //
    // 2026-11-05 기준 app/api 전수 확인:
    //   - admin/*, upload, storage-cleanup, quiz/{upload,move-file,
    //     delete-file,storage-cleanup} : sn_users 의 role 을 직접 확인
    //   - account/delete : 세션만 확인 (본인 탈퇴라 역할과 무관)
    //   - quiz/image/[id] : 공개 퀴즈 이미지. 의도적으로 무인증
    // 라우트를 새로 만들 때는 미들웨어에 기대지 말고 여기서 직접 확인할 것.
    //
    // 여기서 막아야 할 것은 관리자 '화면' 이고, 그건 아래 역할 검사가 맡는다.
    if (pathname.startsWith('/api') || pathname.startsWith('/write')) {
      return response
    }

    // role 확인 (super_admin 또는 writer만 허용)
    const role = await readRole(supabase, session.user.id)

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 루트(/) 접속 → /admin 으로 rewrite
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }

    // 그 외 /admin/* 이 아닌 경로 → /admin 으로 rewrite
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
    const role = await readRole(supabase, session.user.id)

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 권한 있어도 www에서 /admin 접근 시 → admin 서브도메인으로 리다이렉트
    // (개발 모드(next dev)에서는 예외: 접속 주소와 무관하게 /admin 을 그대로 렌더링)
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(
        new URL(pathname, 'https://admin.soopnote.com')
      )
    }
  }

  return response
}

export const config = {
  // 정적 파일에는 미들웨어를 돌리지 않는다.
  // 예전 matcher 는 _next/static 과 favicon 만 빼고 이미지·폰트·robots.txt 까지
  // 전부 통과시켜서, 파일 하나 받을 때마다 미들웨어가 깨어나 Supabase 왕복이
  // 따라붙었다. 공개 파일을 내주기 전에 관리자 권한을 확인한들 막아주는 것도
  // 없으므로, 아예 제외한다.
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|mjs|map|woff|woff2|ttf|otf|txt|xml)$).*)',
  ],
}
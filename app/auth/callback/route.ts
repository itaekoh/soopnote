import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 실패해도 아무 말 없이 /login 으로 돌려보내고 있었다. 로그인 화면은 error
 * 파라미터를 읽지도 않아서, 사용자 입장에서는 구글/카카오를 눌렀다가 그냥
 * 로그인 화면으로 되돌아오는 것으로만 보였다. 원인을 짐작할 단서가 0이었다.
 *
 * 이제 실패 사유를 쿼리로 넘기고 서버 로그에도 남긴다.
 */
function fail(
  origin: string,
  reason: string,
  detail?: string,
  staleVerifiers: string[] = []
) {
  console.error(`[auth/callback] 실패: ${reason}${detail ? ` — ${detail}` : ''}`);
  const url = new URL('/login', origin);
  url.searchParams.set('error', 'auth_callback_error');
  url.searchParams.set('reason', reason);
  if (detail) url.searchParams.set('detail', detail.slice(0, 200));

  const response = NextResponse.redirect(url.toString());

  // 쓸 수 없게 된 PKCE 검증 쿠키를 지운다.
  //
  // 구글과 카카오는 이 쿠키 하나(sb-<ref>-auth-token-code-verifier)를 같이
  // 쓴다. 로그인을 시작했다가 중간에 그만두거나 flow state 가 만료되면
  // 못 쓰는 값이 남는데, 그대로 두면 다음 시도에서도 같은 값이 서버로 가서
  // 또 거부된다. 한 번 어긋나면 두 공급자 모두 계속 실패하는 이유다.
  // (앱 퀴즈는 signInWithIdToken 이라 이 쿠키를 쓰지 않아 영향이 없다.)
  //
  // 지워 두면 다음 시도가 새 값으로 깨끗하게 시작한다.
  for (const name of staleVerifiers) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  }

  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // 공급자(구글/카카오)나 Supabase 가 오류를 붙여 돌려보낸 경우.
  // 예전에는 code 가 없다는 이유로 뭉뚱그려 처리돼서 사유가 사라졌다.
  const providerError = searchParams.get('error') || searchParams.get('error_code');
  if (providerError) {
    return fail(origin, providerError, searchParams.get('error_description') || undefined);
  }

  // admin 서브도메인 여부 판단 (프록시 환경에서는 x-forwarded-host 우선)
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    new URL(origin).host;
  const isAdminSubdomain = host.startsWith('admin.');
  const destPath = isAdminSubdomain ? '/admin' : '/';

  if (code) {
    const cookieStore = await cookies();

    // 쿠키를 캡처하기 위한 배열
    const responseCookies: { name: string; value: string; options: any }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 리다이렉트 응답에 수동으로 설정하기 위해 캡처
              responseCookies.push({ name, value, options });
            });
          },
        },
      }
    );

    // 이 교환은 브라우저가 로그인을 시작할 때 심어 둔 PKCE 검증 쿠키
    // (sb-<ref>-auth-token-code-verifier) 가 이 요청에 함께 와야 성공한다.
    // 실패 원인을 가르기 위해 쿠키가 왔는지도 함께 남긴다.
    const verifierCookies = cookieStore
      .getAll()
      .filter((c) => c.name.includes('auth-token-code-verifier'))
      .map((c) => c.name);

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return fail(
        origin,
        verifierCookies.length > 0 ? 'exchange_failed' : 'missing_code_verifier',
        error.message,
        verifierCookies
      );
    }

    {
      // DB 사전 준비: Supabase 무료 플랜 DB가 비활성 상태일 수 있음
      // Auth 서비스와 DB는 별개 → exchangeCodeForSession은 DB를 깨우지 않음
      // 여기서 간단한 쿼리로 DB를 깨워서, 홈 페이지 로드 시 즉시 응답하도록 함
      try {
        await supabase.from('sn_categories').select('id').limit(1);
      } catch {
        // warmup 실패해도 무시
      }

      const response = NextResponse.redirect(`${origin}${destPath}`);

      // 핵심: 캡처한 쿠키를 리다이렉트 응답에 명시적으로 설정
      // httpOnly: false → 브라우저 JS(createBrowserClient)에서 document.cookie로 읽을 수 있어야 함
      responseCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          httpOnly: false,
        });
      });

      return response;
    }
  }

  // code 가 아예 없는 경우. PKCE 흐름이라면 반드시 붙어 와야 한다.
  // (암묵적 흐름이면 토큰이 URL 조각(#)에 실려 서버까지 오지 않는다.)
  return fail(origin, 'no_code');
}

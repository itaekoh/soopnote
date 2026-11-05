import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * 현재 로그인 사용자 조회 — 중복 요청 제거용 래퍼
 *
 * supabase.auth.getUser() 는 호출할 때마다 /auth/v1/user 로 네트워크를 탄다.
 * 로컬 세션을 읽는 getSession() 과 달리 서버에 토큰을 확인하기 때문이다.
 *
 * 문제는 한 화면이 이걸 여러 번 부른다는 것이었다. 좋아요 한 번 누르면
 * toggleLikeUniversal → checkUserLike → addLike 가 각자 getUser() 를 불러
 * 같은 질문을 세 번 보냈고, 거기에 상세 화면의 loadCurrentUser 와 댓글
 * 컴포넌트가 더해졌다. 11월 5일 Supabase 로그에서는 5초 안에 9번씩 찍혔고,
 * 30분 동안 50건이 브라우저에서 나갔다.
 *
 * 요청이 많아지면 그 자체로도 느리지만, 브라우저는 호스트당 동시 연결이
 * ~6개라 정작 필요한 목록 조회가 밀려난다. 아침에 본 무한 로딩의 배경이다.
 *
 * 그래서 짧은 캐시와 동시 호출 합치기를 둔다. 로그인 상태가 바뀌면 즉시
 * 비우므로 로그아웃이 늦게 반영되는 일은 없다.
 */

const TTL_MS = 10_000;

let userCache: { user: User | null; expiresAt: number } | null = null;
let userInFlight: Promise<User | null> | null = null;

let roleCache: { userId: string; role: string | null; expiresAt: number } | null = null;
// 진행 중인 조회에는 누구 것인지 함께 달아 둔다. 계정이 바뀌는 순간에
// 앞사람의 조회 결과를 그대로 돌려주면 권한을 잘못 보게 된다.
let roleInFlight: { userId: string; promise: Promise<string | null> } | null = null;

/** 로그인/로그아웃·토큰 갱신 때 캐시를 버린다. */
export function invalidateCurrentUser(): void {
  userCache = null;
  roleCache = null;
}

// 브라우저에서만 구독한다. 이 모듈은 서버 컴포넌트에서 import 될 수도 있다.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(() => {
    invalidateCurrentUser();
  });
}

/**
 * 현재 사용자. 로그인하지 않았으면 null.
 * 10초 안의 재호출과 동시 호출은 하나의 요청으로 합쳐진다.
 */
export async function getCurrentUser(): Promise<User | null> {
  const now = Date.now();
  if (userCache && userCache.expiresAt > now) return userCache.user;
  if (userInFlight) return userInFlight;

  userInFlight = (async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      // error 는 "로그인 안 됨" 인 경우에도 온다. 그때는 null 로 본다.
      const user = error ? null : data.user;
      userCache = { user, expiresAt: Date.now() + TTL_MS };
      return user;
    } finally {
      userInFlight = null;
    }
  })();

  return userInFlight;
}

/**
 * 현재 사용자의 역할(super_admin / writer / user …). 로그인 안 했으면 null.
 * sn_users 조회도 같은 방식으로 합친다.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = Date.now();
  if (roleCache && roleCache.userId === user.id && roleCache.expiresAt > now) {
    return roleCache.role;
  }
  if (roleInFlight && roleInFlight.userId === user.id) return roleInFlight.promise;

  const userId = user.id;
  const promise = (async () => {
    const { data } = await supabase
      .from('sn_users')
      .select('role')
      .eq('id', userId)
      .single();

    const role = (data as { role?: string } | null)?.role ?? null;
    roleCache = { userId, role, expiresAt: Date.now() + TTL_MS };
    return role;
  })();

  roleInFlight = { userId, promise };

  // 정리는 등록을 마친 뒤(마이크로태스크)에 돈다. 그사이 다른 조회가
  // 시작됐을 수 있으므로 내 것일 때만 치운다.
  promise
    .finally(() => {
      if (roleInFlight?.promise === promise) roleInFlight = null;
    })
    .catch(() => {
      // 실패 자체는 호출한 쪽이 받는다. 여기서는 삼켜서 unhandled 를 막는다.
    });

  return promise;
}

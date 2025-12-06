import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 서버사이드 Supabase 클라이언트 (Admin 권한)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 환경변수에 추가 필요
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    // 쿠키에서 세션 가져오기
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const { createClient: createBrowserClient } = await import('@supabase/supabase-js');
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const userId = user.id;

    // 1. 작성한 게시글의 author_id를 NULL로 설정 (게시글은 유지)
    const { error: postsError } = await supabaseAdmin
      .from('sn_posts')
      .update({ author_id: null })
      .eq('author_id', userId);

    if (postsError) {
      console.error('게시글 처리 실패:', postsError);
    }

    // 2. 작성한 댓글의 author_id를 NULL로 설정 (댓글은 유지)
    const { error: commentsError } = await supabaseAdmin
      .from('sn_comments')
      .update({ author_id: null })
      .eq('author_id', userId);

    if (commentsError) {
      console.error('댓글 처리 실패:', commentsError);
    }

    // 3. 좋아요 기록 삭제
    const { error: likesError } = await supabaseAdmin
      .from('sn_likes')
      .delete()
      .eq('user_id', userId);

    if (likesError) {
      console.error('좋아요 기록 삭제 실패:', likesError);
    }

    // 4. sn_users 테이블에서 사용자 프로필 삭제
    const { error: profileError } = await supabaseAdmin
      .from('sn_users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('프로필 삭제 실패:', profileError);
      return NextResponse.json({ error: '프로필 삭제에 실패했습니다.' }, { status: 500 });
    }

    // 5. Supabase Auth에서 사용자 삭제
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('사용자 삭제 실패:', deleteError);
      return NextResponse.json({ error: '회원 탈퇴에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error: any) {
    console.error('회원 탈퇴 처리 중 오류:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

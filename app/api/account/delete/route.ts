import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 서버사이드 Supabase 클라이언트 (Admin 권한)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization 헤더 누락');
      return NextResponse.json({ error: '인증 정보가 없습니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // Admin 클라이언트로 토큰 검증 및 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('토큰 검증 실패:', userError);
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const userId = user.id;
    console.log('🔄 회원 탈퇴 요청:', userId, user.email);

    // 중요: 순서를 지켜야 합니다
    // FK가 ON DELETE SET NULL로 설정되어 있어도 명시적으로 처리

    // 1. 좋아요 기록 먼저 삭제 (FK 제약 없음)
    console.log('❤️ 좋아요 기록 삭제 중...');
    const { error: likesError } = await supabaseAdmin
      .from('sn_likes')
      .delete()
      .eq('user_id', userId);

    if (likesError) {
      console.error('❌ 좋아요 기록 삭제 실패:', likesError);
    } else {
      console.log('✅ 좋아요 기록 삭제 완료');
    }

    // 2. 게시글 익명화 (author_id를 NULL로)
    console.log('📝 게시글 익명화 중...');
    const { error: postsError } = await supabaseAdmin
      .from('sn_posts')
      .update({ author_id: null })
      .eq('author_id', userId);

    if (postsError) {
      console.error('❌ 게시글 익명화 실패:', postsError);
    } else {
      console.log('✅ 게시글 익명화 완료');
    }

    // 3. 댓글 익명화 (user_id를 NULL로)
    console.log('💬 댓글 익명화 중...');
    const { error: commentsError } = await supabaseAdmin
      .from('sn_comments')
      .update({ user_id: null })
      .eq('user_id', userId);

    if (commentsError) {
      console.error('❌ 댓글 익명화 실패:', commentsError);
    } else {
      console.log('✅ 댓글 익명화 완료');
    }

    // 4. sn_users 프로필 삭제
    console.log('👤 프로필 삭제 중...');
    const { error: profileError } = await supabaseAdmin
      .from('sn_users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('❌ 프로필 삭제 실패:', profileError);
      return NextResponse.json({ error: '프로필 삭제에 실패했습니다.' }, { status: 500 });
    }
    console.log('✅ 프로필 삭제 완료');

    // 5. Supabase Auth에서 사용자 삭제 (마지막)
    console.log('🔐 Auth 사용자 삭제 중...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('❌ Auth 사용자 삭제 실패:', deleteError);
      return NextResponse.json({ error: '회원 탈퇴에 실패했습니다.' }, { status: 500 });
    }

    console.log('✅ 회원 탈퇴 완료:', userId);
    return NextResponse.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error: any) {
    console.error('회원 탈퇴 처리 중 오류:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

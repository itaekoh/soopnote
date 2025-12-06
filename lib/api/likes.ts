import { supabase } from '../supabase/client';
import type { Like } from '../types/database.types';

/**
 * 특정 게시글에 좋아요 추가
 */
export async function addLike(postId: number): Promise<Like> {
  try {
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 이미 좋아요했는지 확인
    const { data: existingLike } = await supabase
      .from('sn_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLike) {
      throw new Error('이미 좋아요를 누른 게시글입니다.');
    }

    // 좋아요 추가
    const { data, error } = await supabase
      .from('sn_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('좋아요 추가 실패:', error);
      throw error;
    }

    // 좋아요 수는 TRIGGER에서 자동으로 증가됩니다 (supabase_schema.sql:241-244)
    console.log('📊 [LIKE] 좋아요 추가 완료 (TRIGGER로 자동 카운트) - post_id:', postId);

    return data;
  } catch (error) {
    console.error('좋아요 추가 중 오류:', error);
    throw error;
  }
}

/**
 * 특정 게시글에서 좋아요 제거
 */
export async function removeLike(postId: number): Promise<void> {
  try {
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 좋아요 삭제
    const { error } = await supabase
      .from('sn_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('좋아요 제거 실패:', error);
      throw error;
    }

    // 좋아요 수는 TRIGGER에서 자동으로 감소됩니다 (supabase_schema.sql:246-249)
    console.log('📊 [LIKE] 좋아요 제거 완료 (TRIGGER로 자동 카운트) - post_id:', postId);
  } catch (error) {
    console.error('좋아요 제거 중 오류:', error);
    throw error;
  }
}

/**
 * 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
 */
export async function checkUserLike(postId: number): Promise<boolean> {
  try {
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('sn_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('좋아요 확인 실패:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('좋아요 확인 중 오류:', error);
    return false;
  }
}

/**
 * 좋아요 토글 (추가/제거)
 */
export async function toggleLike(postId: number): Promise<boolean> {
  try {
    const isLiked = await checkUserLike(postId);

    if (isLiked) {
      await removeLike(postId);
      return false;
    } else {
      await addLike(postId);
      return true;
    }
  } catch (error) {
    console.error('좋아요 토글 중 오류:', error);
    throw error;
  }
}

// RPC 함수 제거: 좋아요 카운트는 DB TRIGGER에서 자동으로 처리됩니다
// (supabase_schema.sql:225-249 참조)

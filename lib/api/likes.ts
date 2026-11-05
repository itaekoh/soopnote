import { supabase } from '../supabase/client';
import { getCurrentUser } from '../supabase/current-user';
import type { Like } from '../types/database.types';

// RPC 함수 반환 타입
interface AnonymousLikeResponse {
  success: boolean;
  new_like_count: number;
  message: string;
}

/**
 * 특정 게시글에 좋아요 추가
 */
export async function addLike(postId: number): Promise<Like> {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
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
    const user = await getCurrentUser();

    if (!user) {
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
    const user = await getCurrentUser();

    if (!user) {
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

/**
 * 익명 사용자 좋아요 추가 (로그인 불필요)
 * localStorage에 좋아요 여부 저장
 */
export async function addAnonymousLike(postId: number): Promise<void> {
  try {
    // localStorage에서 좋아요한 게시글 목록 가져오기
    const likedPosts = getAnonymousLikedPosts();

    if (likedPosts.includes(postId)) {
      throw new Error('이미 좋아요를 누른 게시글입니다.');
    }

    // RPC 함수를 사용하여 like_count 증가 (RLS 우회)
    const { data, error } = await supabase
      .rpc('increment_anonymous_like_count', { p_post_id: postId })
      .single<AnonymousLikeResponse>();

    if (error) {
      console.error('RPC 호출 실패:', error);
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(data?.message || '좋아요 추가에 실패했습니다.');
    }

    // localStorage에 저장
    likedPosts.push(postId);
    localStorage.setItem('anonymous_liked_posts', JSON.stringify(likedPosts));

    console.log('📊 [ANONYMOUS_LIKE] 익명 좋아요 추가 완료 - post_id:', postId, 'new_count:', data.new_like_count);
  } catch (error) {
    console.error('익명 좋아요 추가 중 오류:', error);
    throw error;
  }
}

/**
 * 익명 사용자 좋아요 제거
 */
export async function removeAnonymousLike(postId: number): Promise<void> {
  try {
    const likedPosts = getAnonymousLikedPosts();

    if (!likedPosts.includes(postId)) {
      throw new Error('좋아요를 누르지 않은 게시글입니다.');
    }

    // RPC 함수를 사용하여 like_count 감소 (RLS 우회)
    const { data, error } = await supabase
      .rpc('decrement_anonymous_like_count', { p_post_id: postId })
      .single<AnonymousLikeResponse>();

    if (error) {
      console.error('RPC 호출 실패:', error);
      throw error;
    }

    if (!data || !data.success) {
      throw new Error(data?.message || '좋아요 제거에 실패했습니다.');
    }

    // localStorage에서 제거
    const updatedLikes = likedPosts.filter(id => id !== postId);
    localStorage.setItem('anonymous_liked_posts', JSON.stringify(updatedLikes));

    console.log('📊 [ANONYMOUS_LIKE] 익명 좋아요 제거 완료 - post_id:', postId, 'new_count:', data.new_like_count);
  } catch (error) {
    console.error('익명 좋아요 제거 중 오류:', error);
    throw error;
  }
}

/**
 * 익명 사용자가 좋아요한 게시글 목록 가져오기
 */
function getAnonymousLikedPosts(): number[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const stored = localStorage.getItem('anonymous_liked_posts');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // 유효한 배열인지 확인
    if (!Array.isArray(parsed)) {
      localStorage.removeItem('anonymous_liked_posts');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('localStorage 읽기 실패:', error);
    // 손상된 데이터 제거
    try {
      localStorage.removeItem('anonymous_liked_posts');
    } catch {}
    return [];
  }
}

/**
 * 익명 사용자 좋아요 여부 확인
 */
export function checkAnonymousLike(postId: number): boolean {
  const likedPosts = getAnonymousLikedPosts();
  return likedPosts.includes(postId);
}

/**
 * 좋아요 토글 (로그인/비로그인 모두 지원)
 */
export async function toggleLikeUniversal(postId: number): Promise<boolean> {
  try {
    // 로그인 확인
    const user = await getCurrentUser();

    if (user) {
      // 로그인한 사용자: 기존 방식
      const isLiked = await checkUserLike(postId);
      if (isLiked) {
        await removeLike(postId);
        return false;
      } else {
        await addLike(postId);
        return true;
      }
    } else {
      // 비로그인 사용자: localStorage 사용
      const isLiked = checkAnonymousLike(postId);
      if (isLiked) {
        await removeAnonymousLike(postId);
        return false;
      } else {
        await addAnonymousLike(postId);
        return true;
      }
    }
  } catch (error) {
    console.error('좋아요 토글 중 오류:', error);
    throw error;
  }
}

/**
 * 좋아요 상태 확인 (로그인/비로그인 모두 지원)
 */
export async function checkLikeUniversal(postId: number): Promise<boolean> {
  try {
    const user = await getCurrentUser();

    if (user) {
      return await checkUserLike(postId);
    } else {
      return checkAnonymousLike(postId);
    }
  } catch {
    return false;
  }
}

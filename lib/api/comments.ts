import { supabase } from '../supabase/client';
import { getCurrentUser } from '../supabase/current-user';
import type { Comment, CommentWithUser, CreateCommentRequest } from '../types/database.types';

/**
 * 특정 게시글의 댓글 목록 조회
 */
export async function getCommentsByPostId(postId: number): Promise<CommentWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('sn_comments')
      .select(`
        id,
        post_id,
        user_id,
        parent_id,
        content,
        is_deleted,
        created_at,
        updated_at,
        user:sn_users!user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('댓글 조회 실패:', error);
      throw error;
    }

    return (data as any) || [];
  } catch (error) {
    console.error('댓글 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 댓글 작성
 */
export async function createComment(request: CreateCommentRequest): Promise<Comment> {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('sn_comments')
      .insert({
        post_id: request.post_id,
        user_id: user.id,
        parent_id: request.parent_id || null,
        content: request.content,
      })
      .select()
      .single();

    if (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }

    // 댓글 수는 DB 트리거(trigger_update_post_comment_count_insert)가 자동으로 증가

    return data;
  } catch (error) {
    console.error('댓글 작성 중 오류:', error);
    throw error;
  }
}

/**
 * 댓글 삭제 (실제 삭제가 아닌 is_deleted 플래그 업데이트)
 */
export async function deleteComment(commentId: number): Promise<void> {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 댓글이 현재 사용자의 것인지 확인
    const { data: comment, error: fetchError } = await supabase
      .from('sn_comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.user_id !== user.id) {
      throw new Error('본인의 댓글만 삭제할 수 있습니다.');
    }

    // is_deleted 플래그 업데이트
    const { error } = await supabase
      .from('sn_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }

    // 댓글 수는 TRIGGER에서 자동으로 감소됩니다 (UPDATE TRIGGER 필요)
    console.log('📊 [COMMENT] 댓글 삭제 완료 (TRIGGER로 자동 카운트) - post_id:', comment.post_id);
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error);
    throw error;
  }
}

/**
 * 댓글 수정
 */
export async function updateComment(commentId: number, content: string): Promise<Comment> {
  try {
    // 현재 로그인한 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 댓글이 현재 사용자의 것인지 확인
    const { data: comment, error: fetchError } = await supabase
      .from('sn_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.user_id !== user.id) {
      throw new Error('본인의 댓글만 수정할 수 있습니다.');
    }

    const { data, error } = await supabase
      .from('sn_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('댓글 수정 중 오류:', error);
    throw error;
  }
}

// RPC 함수 제거: 댓글 카운트는 DB TRIGGER에서 자동으로 처리됩니다
// - INSERT: supabase_schema.sql:212-215
// - DELETE: supabase_schema.sql:217-220
// - UPDATE (is_deleted): 새로 추가 필요

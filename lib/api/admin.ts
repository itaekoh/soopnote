// ============================================
// Admin API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import type { User, Post, Category, UserRole } from '@/lib/types/database.types';

/**
 * 관리자 권한 확인 (writer + super_admin)
 */
export async function checkAdminPermission(): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('sn_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'writer' || data.role === 'super_admin';
  } catch (error) {
    console.error('권한 확인 실패:', error);
    return false;
  }
}

/**
 * Super Admin 권한 확인
 */
export async function checkSuperAdminPermission(): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('sn_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'super_admin';
  } catch (error) {
    console.error('Super Admin 권한 확인 실패:', error);
    return false;
  }
}

// ============================================
// 회원 관리
// ============================================

/**
 * 모든 회원 목록 조회
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('sn_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('회원 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

/**
 * 회원 권한 변경 (RLS 우회 위해 SECURITY DEFINER RPC 사용)
 * super_admin 권한 함수 내부 검증
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase.rpc('admin_update_user_role', {
    target_user_id: userId,
    new_role: role,
  });

  if (error) {
    console.error('권한 변경 실패:', error);
    throw error;
  }
}

/**
 * 테스트 계정 플래그 토글 (본인 부계정 등 통계 제외용)
 * RLS 우회를 위해 SECURITY DEFINER RPC 사용 (super_admin 권한 함수 내부 검증)
 */
export async function updateTestAccountFlag(userId: string, isTest: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_test_account_flag', {
    target_user_id: userId,
    is_test: isTest,
  });

  if (error) {
    console.error('테스트 계정 플래그 변경 실패:', error);
    throw error;
  }
}

// ============================================
// 구독 분석 (트리오! 앱)
// ============================================

export interface SubscriberRow {
  id: string;
  email: string;
  display_name: string | null;
  subscription_state: string | null;
  subscription_expires_at: string | null;
  subscription_product_id: string | null;
  created_at: string;
  is_test_account: boolean | null;
}

/**
 * 구독 정보가 있는 모든 회원 조회 (purchase_token 존재 = 결제 이력 있음)
 * @param excludeTest 테스트 계정 제외 여부 (기본 true)
 */
export async function getAllSubscribers(excludeTest: boolean = true): Promise<SubscriberRow[]> {
  let q = supabase
    .from('sn_users')
    .select('id, email, display_name, subscription_state, subscription_expires_at, subscription_product_id, created_at, is_test_account')
    .not('subscription_purchase_token', 'is', null);

  if (excludeTest) {
    q = q.or('is_test_account.is.null,is_test_account.eq.false');
  }

  const { data, error } = await q.order('subscription_expires_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('구독자 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 추천글 관리
// ============================================

/**
 * 모든 게시글 목록 조회 (관리자용 - 작성자 정보 포함)
 */
export async function getAllPostsForAdmin(): Promise<any[]> {
  const { data, error } = await supabase
    .from('sn_posts_full')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('게시글 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

/**
 * Featured 상태 토글
 */
export async function toggleFeatured(postId: number, isFeatured: boolean): Promise<void> {
  const { error } = await supabase
    .from('sn_posts')
    .update({ is_featured: isFeatured })
    .eq('id', postId);

  if (error) {
    console.error('Featured 토글 실패:', error);
    throw error;
  }
}

// ============================================
// 카테고리 관리
// ============================================

/**
 * 모든 카테고리 목록 조회
 */
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('카테고리 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

/**
 * 카테고리 생성
 */
export async function createCategory(category: {
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  type: 'menu' | 'attribute';
  display_order?: number;
}): Promise<Category> {
  const { data, error } = await supabase
    .from('sn_categories')
    .insert({
      parent_id: category.parent_id || null,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      type: category.type,
      display_order: category.display_order || 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('카테고리 생성 실패:', error);
    throw error;
  }

  return data;
}

/**
 * 카테고리 수정
 */
export async function updateCategory(
  categoryId: number,
  updates: {
    name?: string;
    slug?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from('sn_categories')
    .update(updates)
    .eq('id', categoryId);

  if (error) {
    console.error('카테고리 수정 실패:', error);
    throw error;
  }
}

/**
 * 카테고리 삭제
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await supabase
    .from('sn_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('카테고리 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// Admin API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import type { User, Post, Category, UserRole } from '@/lib/types/database.types';

/**
 * 관리자 권한 확인
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

    return data.role === 'super_admin';
  } catch (error) {
    console.error('권한 확인 실패:', error);
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
 * 회원 권한 변경
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('sn_users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('권한 변경 실패:', error);
    throw error;
  }
}

// ============================================
// 추천글 관리
// ============================================

/**
 * 모든 게시글 목록 조회 (관리자용)
 */
export async function getAllPostsForAdmin(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('sn_posts')
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

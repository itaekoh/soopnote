// ============================================
// Users API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import type { User, UserRole } from '@/lib/types/database.types';

/**
 * 사용자 프로필 생성 (회원가입 시 자동 호출)
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<User> {
  const { data, error } = await supabase
    .from('sn_users')
    .insert({
      id: userId,
      email,
      display_name: displayName || email.split('@')[0],
      role: 'user', // 기본 권한
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('sn_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'display_name' | 'avatar_url' | 'bio'>>
): Promise<User> {
  const { data, error } = await supabase
    .from('sn_users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

/**
 * 사용자 권한 변경 (super_admin만 가능)
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<User> {
  const { data, error } = await supabase
    .from('sn_users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }

  return data;
}

/**
 * 현재 로그인한 사용자와 프로필 정보 가져오기
 */
export async function getCurrentUser(): Promise<{
  user: any;
  profile: User | null;
} | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getUserProfile(user.id);

  return { user, profile };
}

/**
 * 사용자 권한 확인
 */
export async function checkUserRole(userId: string): Promise<UserRole> {
  const profile = await getUserProfile(userId);
  return profile?.role || 'user';
}

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export async function hasPermission(
  userId: string,
  requiredRole: UserRole
): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    writer: 2,
    super_admin: 3,
  };

  return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
}

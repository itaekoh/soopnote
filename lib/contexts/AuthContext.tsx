'use client';

// ============================================
// Authentication Context
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getUserProfile, createUserProfile } from '@/lib/api/users';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/types/database.types';

interface AuthContextType {
  user: AuthUser | null;
  profile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getSession()으로 초기 세션 확인 (로컬 쿠키 읽기, 네트워크 호출 없음)
    // getUser()는 네트워크 호출이라 Supabase 클라이언트를 블로킹하여
    // 다른 데이터 fetch를 방해할 수 있음
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error checking session:', error);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth 상태 변경:', event);

      // INITIAL_SESSION은 위의 getSession()에서 이미 처리
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, displayName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName, // 트리거에서 사용할 메타데이터
          },
        },
      });

      if (error) throw error;

      // 참고: 사용자 프로필은 데이터베이스 트리거가 자동으로 생성합니다.
      // 이메일 확인 후 로그인하면 프로필이 자동으로 로드됩니다.

    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        await loadProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message || 'Google 로그인에 실패했습니다.');
  }

  async function signInWithKakao() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message || '카카오 로그인에 실패했습니다.');
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || '로그아웃에 실패했습니다.');
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  async function deleteAccount() {
    try {
      // 현재 세션에서 access token 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('인증 정보를 찾을 수 없습니다.');
      }

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원 탈퇴에 실패했습니다.');
      }

      // 탈퇴 성공 후 명시적으로 Supabase 세션 정리
      await supabase.auth.signOut();

      // 상태 초기화
      setUser(null);
      setProfile(null);

      // 홈으로 리다이렉트
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw new Error(error.message || '회원 탈퇴에 실패했습니다.');
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    refreshProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

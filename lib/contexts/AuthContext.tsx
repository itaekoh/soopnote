'use client';

// ============================================
// Authentication Context
// ============================================

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const initialSessionHandled = useRef(false);

  useEffect(() => {
    // onAuthStateChange 하나로 모든 인증 상태를 관리
    //
    // 중요: SIGNED_IN 이벤트는 GoTrue 초기화 중(initializePromise 완료 전)에 발생할 수 있음.
    // 이 콜백에서 await으로 Supabase DB 쿼리를 하면 내부적으로 getSession() →
    // initializePromise 대기 → 콜백 완료 대기 → 순환 대기(deadlock)가 발생함.
    // 따라서 SIGNED_IN에서는 loadProfile을 await하지 않음.
    //
    // INITIAL_SESSION은 initializePromise 완료 후에 발생하므로 안전하게 await 가능.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth 상태 변경:', event);

      if (event === 'INITIAL_SESSION') {
        initialSessionHandled.current = true;
        if (session?.user) {
          setUser(session.user);
          // INITIAL_SESSION은 initializePromise 완료 후이므로 안전하게 await 가능
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user);
          // SIGNED_IN은 초기화 중에 발생할 수 있으므로 await하면 deadlock 위험
          // fire-and-forget으로 호출 (INITIAL_SESSION에서 정식으로 처리됨)
          if (initialSessionHandled.current) {
            // 이미 INITIAL_SESSION이 처리된 후의 SIGNED_IN (탭 간 동기화 등)
            loadProfile(session.user.id);
          }
          // 초기화 중 SIGNED_IN은 INITIAL_SESSION이 곧 따라오므로 프로필 로딩 생략
        }
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        // 토큰 갱신 시 프로필 다시 로드할 필요 없음
        if (session?.user) {
          setUser(session.user);
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    try {
      // 재시도 로직: DB 트리거 딜레이 또는 일시적 네트워크 문제 대비
      let userProfile: User | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          userProfile = await getUserProfile(userId);
          if (userProfile) break;
        } catch (error) {
          console.warn(`프로필 로딩 시도 ${attempt + 1}/3 실패:`, error);
        }
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (userProfile) {
        setProfile(userProfile);
      } else {
        // OAuth 신규 유저: DB 트리거로 프로필이 아직 생성되지 않았을 수 있음
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const displayName =
              authUser.user_metadata?.display_name ||
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split('@')[0] ||
              'User';
            const newProfile = await createUserProfile(
              authUser.id,
              authUser.email || '',
              displayName
            );
            setProfile(newProfile);
            return;
          }
        } catch (createError) {
          console.error('프로필 자동 생성 실패:', createError);
        }
        setProfile(null);
      }
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

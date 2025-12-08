'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    const testResults: any = {};

    try {
      // 1. Auth 테스트
      console.log('1️⃣ Auth 테스트 시작...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      testResults.auth = {
        success: !authError,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message,
      };
      console.log('✓ Auth 테스트 완료:', testResults.auth);

      // 2. 게시글 수 조회
      console.log('2️⃣ 게시글 수 조회 시작...');
      const { count, error: countError } = await supabase
        .from('sn_posts')
        .select('*', { count: 'exact', head: true });
      testResults.postsCount = {
        success: !countError,
        count,
        error: countError?.message,
      };
      console.log('✓ 게시글 수 조회 완료:', testResults.postsCount);

      // 3. 최근 게시글 5개 조회
      console.log('3️⃣ 최근 게시글 조회 시작...');
      const { data: posts, error: postsError } = await supabase
        .from('sn_posts')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      testResults.recentPosts = {
        success: !postsError,
        posts: posts?.map(p => ({ id: p.id, title: p.title, status: p.status })),
        error: postsError?.message,
      };
      console.log('✓ 최근 게시글 조회 완료:', testResults.recentPosts);

      // 4. sn_posts_full 뷰 조회
      console.log('4️⃣ sn_posts_full 뷰 조회 시작...');
      const { data: fullPosts, error: fullError } = await supabase
        .from('sn_posts_full')
        .select('*')
        .limit(5);
      testResults.postsFullView = {
        success: !fullError,
        count: fullPosts?.length,
        error: fullError?.message,
      };
      console.log('✓ sn_posts_full 조회 완료:', testResults.postsFullView);

      // 5. 사용자 프로필 조회
      if (user) {
        console.log('5️⃣ 사용자 프로필 조회 시작...');
        const { data: profile, error: profileError } = await supabase
          .from('sn_users')
          .select('*')
          .eq('id', user.id)
          .single();
        testResults.userProfile = {
          success: !profileError,
          profile: profile ? { id: profile.id, display_name: profile.display_name, role: profile.role } : null,
          error: profileError?.message,
        };
        console.log('✓ 프로필 조회 완료:', testResults.userProfile);
      }

      // 6. Featured 게시글 조회
      console.log('6️⃣ Featured 게시글 조회 시작...');
      const { data: featured, error: featuredError } = await supabase
        .from('sn_posts')
        .select('id, title')
        .eq('is_featured', true)
        .limit(5);
      testResults.featuredPosts = {
        success: !featuredError,
        count: featured?.length,
        error: featuredError?.message,
      };
      console.log('✓ Featured 조회 완료:', testResults.featuredPosts);

    } catch (error: any) {
      console.error('❌ 테스트 중 에러:', error);
      testResults.globalError = error.message;
    }

    setResults(testResults);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase 연결 테스트</h1>

        <button
          onClick={testConnection}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-8"
        >
          {loading ? '테스트 중...' : '연결 테스트 실행'}
        </button>

        {results && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">테스트 결과</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>

            {results.globalError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2">전역 에러</h3>
                <p className="text-red-600">{results.globalError}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">참고사항</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>모든 테스트가 성공해야 정상입니다</li>
            <li>에러가 있다면 에러 메시지를 확인하세요</li>
            <li>RLS 관련 에러가 나온다면 SQL에서 RLS를 비활성화했는지 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

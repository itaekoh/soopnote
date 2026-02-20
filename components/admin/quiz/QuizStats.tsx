'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TreePine, Image, Users, RefreshCw } from 'lucide-react';
import { getQuizStats, type QuizStats as QuizStatsType } from '@/lib/api/quiz-admin';

export function QuizStats() {
  const [stats, setStats] = useState<QuizStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await getQuizStats();
      setStats(data);
    } catch (error) {
      console.error('통계 로딩 실패:', error);
      alert('통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">통계를 불러오는 중...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">통계 데이터를 가져올 수 없습니다.</div>;
  }

  const statusDistribution = [
    { label: 'draft', count: stats.draftItems, color: 'bg-gray-200 text-gray-700' },
    { label: 'review', count: stats.reviewItems, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'published', count: stats.publishedItems, color: 'bg-green-100 text-green-700' },
    { label: 'archived', count: stats.archivedItems, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">퀴즈 통계</h2>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TreePine className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">수종 수</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalSpecies}</div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.totalSpecies - stats.activeSpecies > 0
              ? `(${stats.totalSpecies - stats.activeSpecies} 비활성)`
              : '전체 활성'}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">문항 수</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.totalItems}</div>
          <div className="text-xs text-green-600 mt-1">
            published {stats.publishedItems}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">퀴즈 시도</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.totalAttempts.toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 mt-1">전체 시도 횟수</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">활성 사용자</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.uniqueUsers}</div>
          <div className="text-xs text-orange-600 mt-1">퀴즈 참여 사용자</div>
        </div>
      </div>

      {/* 문항 상태 분포 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">문항 상태 분포</h3>
        <div className="flex flex-wrap gap-4">
          {statusDistribution.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${item.color}`}>
                {item.label}
              </span>
              <span className="text-lg font-bold text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>

        {/* 프로그레스 바 */}
        {stats.totalItems > 0 && (
          <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-gray-200">
            {stats.draftItems > 0 && (
              <div
                className="bg-gray-400 h-full"
                style={{ width: `${(stats.draftItems / stats.totalItems) * 100}%` }}
                title={`draft: ${stats.draftItems}`}
              />
            )}
            {stats.reviewItems > 0 && (
              <div
                className="bg-yellow-400 h-full"
                style={{ width: `${(stats.reviewItems / stats.totalItems) * 100}%` }}
                title={`review: ${stats.reviewItems}`}
              />
            )}
            {stats.publishedItems > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(stats.publishedItems / stats.totalItems) * 100}%` }}
                title={`published: ${stats.publishedItems}`}
              />
            )}
            {stats.archivedItems > 0 && (
              <div
                className="bg-red-400 h-full"
                style={{ width: `${(stats.archivedItems / stats.totalItems) * 100}%` }}
                title={`archived: ${stats.archivedItems}`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

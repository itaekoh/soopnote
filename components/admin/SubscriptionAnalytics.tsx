'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllSubscribers, type SubscriberRow } from '@/lib/api/admin';

// 트리오! 구독 가격 (KRW)
const PRICE_MONTHLY = 3000;
const PRICE_ANNUAL = 25000;

function isActive(s: SubscriberRow): boolean {
  // cancelled도 만료일 전이면 활성 (자동갱신만 취소된 케이스)
  const st = s.subscription_state;
  if (st !== 'active' && st !== 'grace_period' && st !== 'cancelled') return false;
  if (!s.subscription_expires_at) return false;
  return new Date(s.subscription_expires_at) > new Date();
}

function getProductType(productId: string | null): 'monthly' | 'annual' | 'unknown' {
  if (!productId) return 'unknown';
  if (productId.includes('annual')) return 'annual';
  if (productId.includes('monthly')) return 'monthly';
  return 'unknown';
}

function getProductLabel(t: 'monthly' | 'annual' | 'unknown'): string {
  if (t === 'monthly') return '월간';
  if (t === 'annual') return '연간';
  return '?';
}

function getProductPrice(t: 'monthly' | 'annual' | 'unknown'): number {
  if (t === 'monthly') return PRICE_MONTHLY;
  if (t === 'annual') return PRICE_ANNUAL;
  return 0;
}

/** expires_at 에서 구독 시작 시점 추정 (annual = 365일 전, monthly = 30일 전) */
function estimateStartDate(s: SubscriberRow): Date | null {
  if (!s.subscription_expires_at) return null;
  const expires = new Date(s.subscription_expires_at);
  const type = getProductType(s.subscription_product_id);
  if (type === 'annual') {
    expires.setDate(expires.getDate() - 365);
  } else if (type === 'monthly') {
    expires.setDate(expires.getDate() - 30);
  } else {
    return null;
  }
  return expires;
}

/** YYYY-MM 키 생성 */
function ymKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface MonthlyStats {
  ym: string;
  newCount: number;
  newMonthly: number;
  newAnnual: number;
  estRevenue: number; // 신규 구독 매출 추정
}

export function SubscriptionAnalytics() {
  const [subs, setSubs] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');
  const [productFilter, setProductFilter] = useState<'all' | 'monthly' | 'annual'>('all');
  const [excludeTest, setExcludeTest] = useState(true);

  useEffect(() => { load(); }, [excludeTest]);

  async function load() {
    try {
      setLoading(true);
      const data = await getAllSubscribers(excludeTest);
      setSubs(data);
    } catch {
      alert('구독 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // KPI
  const kpi = useMemo(() => {
    const active = subs.filter(isActive);
    const activeMonthly = active.filter(s => getProductType(s.subscription_product_id) === 'monthly').length;
    const activeAnnual = active.filter(s => getProductType(s.subscription_product_id) === 'annual').length;

    // MRR (월간 반복 매출 환산): 연간은 /12
    const mrr = activeMonthly * PRICE_MONTHLY + activeAnnual * (PRICE_ANNUAL / 12);

    // 누적 추정 매출 (모든 결제 이력 기반)
    const totalRevenue = subs.reduce((sum, s) => {
      return sum + getProductPrice(getProductType(s.subscription_product_id));
    }, 0);

    return {
      totalSubs: subs.length,
      activeCount: active.length,
      activeMonthly,
      activeAnnual,
      mrr: Math.round(mrr),
      totalRevenue,
    };
  }, [subs]);

  // 월별 신규 구독 통계
  const monthly = useMemo<MonthlyStats[]>(() => {
    const map = new Map<string, MonthlyStats>();
    for (const s of subs) {
      const start = estimateStartDate(s);
      if (!start) continue;
      const key = ymKey(start);
      const type = getProductType(s.subscription_product_id);
      const price = getProductPrice(type);
      if (!map.has(key)) {
        map.set(key, { ym: key, newCount: 0, newMonthly: 0, newAnnual: 0, estRevenue: 0 });
      }
      const m = map.get(key)!;
      m.newCount += 1;
      if (type === 'monthly') m.newMonthly += 1;
      if (type === 'annual') m.newAnnual += 1;
      m.estRevenue += price;
    }
    return Array.from(map.values()).sort((a, b) => b.ym.localeCompare(a.ym));
  }, [subs]);

  // 필터링된 구독자 목록
  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      if (stateFilter === 'active' && !isActive(s)) return false;
      if (stateFilter === 'cancelled' && s.subscription_state !== 'cancelled') return false;
      if (stateFilter === 'expired') {
        if (s.subscription_state === 'expired') return true;
        if (s.subscription_expires_at && new Date(s.subscription_expires_at) <= new Date()) return true;
        return false;
      }
      if (productFilter !== 'all' && getProductType(s.subscription_product_id) !== productFilter) return false;
      return true;
    });
  }, [subs, stateFilter, productFilter]);

  function getStateBadge(s: SubscriberRow) {
    if (isActive(s)) {
      if (s.subscription_state === 'grace_period') {
        return { color: 'bg-yellow-100 text-yellow-700', label: '유예' };
      }
      if (s.subscription_state === 'cancelled') {
        return { color: 'bg-amber-100 text-amber-700', label: '활성(갱신X)' };
      }
      return { color: 'bg-green-100 text-green-700', label: '활성' };
    }
    const state = s.subscription_state ?? '-';
    switch (state) {
      case 'cancelled': return { color: 'bg-orange-100 text-orange-700', label: '취소됨' };
      case 'expired': return { color: 'bg-gray-200 text-gray-600', label: '만료' };
      case 'on_hold': return { color: 'bg-red-100 text-red-700', label: '보류' };
      case 'paused': return { color: 'bg-blue-100 text-blue-700', label: '일시정지' };
      default: return { color: 'bg-gray-100 text-gray-500', label: state };
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">구독 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 테스트 제외 토글 */}
      <div className="mb-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={excludeTest}
            onChange={(e) => setExcludeTest(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          />
          <span className="font-medium text-yellow-900">🧪 테스트 계정 제외</span>
          <span className="text-yellow-700 text-xs">(회원관리에서 체크된 계정)</span>
        </label>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs font-medium text-green-700 uppercase mb-1">활성 구독</div>
          <div className="text-2xl font-bold text-green-900">{kpi.activeCount}<span className="text-sm font-normal ml-1">명</span></div>
          <div className="text-xs text-green-700 mt-1">
            월간 {kpi.activeMonthly} · 연간 {kpi.activeAnnual}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs font-medium text-blue-700 uppercase mb-1">MRR (환산)</div>
          <div className="text-2xl font-bold text-blue-900">₩{kpi.mrr.toLocaleString()}</div>
          <div className="text-xs text-blue-700 mt-1">월간 반복 매출 추정</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xs font-medium text-purple-700 uppercase mb-1">누적 매출</div>
          <div className="text-2xl font-bold text-purple-900">₩{kpi.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">전체 결제 추정</div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-700 uppercase mb-1">전체 결제자</div>
          <div className="text-2xl font-bold text-gray-900">{kpi.totalSubs}<span className="text-sm font-normal ml-1">명</span></div>
          <div className="text-xs text-gray-600 mt-1">취소·만료 포함</div>
        </div>
      </div>

      <div className="mb-3 text-xs text-gray-500">
        ※ 매출/MRR은 가격표(월간 ₩{PRICE_MONTHLY.toLocaleString()} / 연간 ₩{PRICE_ANNUAL.toLocaleString()}) 기준 추정값입니다. Google Play 수수료(~15%) 차감 전 값.
      </div>

      {/* 월별 통계 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">📅 월별 신규 구독</h3>
        {monthly.length === 0 ? (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">월별 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">월</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">신규</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">월간</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">연간</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">추정 매출</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthly.map(m => (
                  <tr key={m.ym} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{m.ym}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{m.newCount}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">{m.newMonthly}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">{m.newAnnual}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-purple-700">₩{m.estRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 구독자 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">👥 구독자 목록</h3>
          <div className="flex gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="cancelled">취소됨</option>
              <option value="expired">만료</option>
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="all">전체 상품</option>
              <option value="monthly">월간</option>
              <option value="annual">연간</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">시작(추정)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">만료</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubs.map(s => {
                const badge = getStateBadge(s);
                const start = estimateStartDate(s);
                const type = getProductType(s.subscription_product_id);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 ${isActive(s) ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{s.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">{s.display_name || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{getProductLabel(type)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                      {start ? start.toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                      {s.subscription_expires_at
                        ? new Date(s.subscription_expires_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubs.length === 0 && (
          <div className="text-center py-12 text-gray-500">조건에 맞는 구독자가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

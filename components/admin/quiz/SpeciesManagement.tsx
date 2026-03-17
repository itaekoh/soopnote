'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  getAllSpecies,
  createSpecies,
  updateSpecies,
  getAllGroups,
  type QuizSpeciesWithGroup,
  type QuizGroup,
} from '@/lib/api/quiz-admin';

const EMPTY_FORM = {
  name_ko: '',
  name_latin: '',
  group_id: '',
  aliases: '',
  is_active: true,
};

export function SpeciesManagement() {
  const [species, setSpecies] = useState<QuizSpeciesWithGroup[]>([]);
  const [groups, setGroups] = useState<QuizGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [speciesData, groupsData] = await Promise.all([getAllSpecies(), getAllGroups()]);
      setSpecies(speciesData);
      setGroups(groupsData);
    } catch {
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setDrawerOpen(true);
  }

  function openEdit(sp: QuizSpeciesWithGroup) {
    setFormData({
      name_ko: sp.name_ko,
      name_latin: sp.name_latin || '',
      group_id: sp.group_id || '',
      aliases: sp.aliases?.join(', ') || '',
      is_active: sp.is_active,
    });
    setEditingId(sp.id);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name_ko.trim()) { alert('수종명(한)은 필수입니다.'); return; }

    const aliasArray = formData.aliases.split(',').map((a) => a.trim()).filter(Boolean);
    try {
      if (editingId) {
        await updateSpecies(editingId, {
          name_ko: formData.name_ko.trim(),
          name_latin: formData.name_latin.trim() || null,
          group_id: formData.group_id || null,
          aliases: aliasArray,
          is_active: formData.is_active,
        });
      } else {
        await createSpecies({
          name_ko: formData.name_ko.trim(),
          name_latin: formData.name_latin.trim() || undefined,
          group_id: formData.group_id || null,
          aliases: aliasArray,
          is_active: formData.is_active,
        });
      }
      closeDrawer();
      await loadData();
    } catch (error: any) {
      alert(error.message || '수종 저장에 실패했습니다.');
    }
  }

  async function handleToggleActive(sp: QuizSpeciesWithGroup) {
    try {
      await updateSpecies(sp.id, { is_active: !sp.is_active });
      await loadData();
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">수종 목록을 불러오는 중...</div>;
  }

  return (
    <div className="relative">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          수종 관리 <span className="text-gray-500">({species.length}개)</span>
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />수종 추가
        </button>
      </div>

      {/* 수종 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름(한)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">혼동그룹</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">별칭</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {species.map((sp) => (
              <tr key={sp.id} className={!sp.is_active ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{sp.name_ko}</td>
                <td className="px-4 py-3 text-sm text-gray-500 italic">{sp.name_latin || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {sp.quiz_groups ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {sp.quiz_groups.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {sp.aliases && sp.aliases.length > 0 ? sp.aliases.join(', ') : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    sp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {sp.is_active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(sp)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(sp)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        sp.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={sp.is_active ? '비활성화' : '활성화'}
                    >
                      {sp.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {species.length === 0 && (
        <div className="text-center py-12 text-gray-500">등록된 수종이 없습니다.</div>
      )}

      {/* 드로어 오버레이 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* 배경 딤 */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeDrawer}
          />
          {/* 패널 */}
          <div className="relative z-50 w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-y-auto">
            {/* 드로어 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                {editingId ? '수종 수정' : '새 수종 추가'}
              </h3>
              <button
                onClick={closeDrawer}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수종명(한) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_ko}
                  onChange={(e) => setFormData({ ...formData, name_ko: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="예: 소나무"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">학명</label>
                <input
                  type="text"
                  value={formData.name_latin}
                  onChange={(e) => setFormData({ ...formData, name_latin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="예: Pinus densiflora"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">혼동그룹</label>
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">없음</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">별칭 (쉼표 구분)</label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="예: 적송, 육송"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">활성 상태</span>
                </label>
              </div>

              {/* 하단 버튼 */}
              <div className="mt-auto pt-4 flex gap-2 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

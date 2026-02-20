'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Link2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupSimilarities,
  upsertSimilarity,
  deleteSimilarity,
  type QuizGroup,
  type QuizGroupSimilarity,
} from '@/lib/api/quiz-admin';

export function GroupManagement() {
  const [groups, setGroups] = useState<QuizGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');

  // 유사도 관리
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [similarities, setSimilarities] = useState<QuizGroupSimilarity[]>([]);
  const [simLoading, setSimLoading] = useState(false);
  const [newSimGroupId, setNewSimGroupId] = useState('');
  const [newSimWeight, setNewSimWeight] = useState(1);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const data = await getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error('그룹 목록 로딩 실패:', error);
      alert('그룹 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setGroupName('');
    setShowAddForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!groupName.trim()) {
      alert('그룹명을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        await updateGroup(editingId, groupName.trim());
        alert('그룹이 수정되었습니다.');
      } else {
        await createGroup(groupName.trim());
        alert('그룹이 생성되었습니다.');
      }
      resetForm();
      await loadGroups();
    } catch (error: any) {
      alert(error.message || '그룹 저장에 실패했습니다.');
    }
  }

  function handleEdit(group: QuizGroup) {
    setGroupName(group.name);
    setEditingId(group.id);
    setShowAddForm(true);
  }

  async function handleDelete(groupId: string, groupName: string) {
    if (!confirm(`"${groupName}" 그룹을 삭제하시겠습니까?\n이 그룹에 속한 수종의 group_id가 null로 변경됩니다.`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      alert('그룹이 삭제되었습니다.');
      if (expandedGroupId === groupId) {
        setExpandedGroupId(null);
        setSimilarities([]);
      }
      await loadGroups();
    } catch (error) {
      alert('그룹 삭제에 실패했습니다.');
    }
  }

  // 유사도 관리
  async function toggleSimilarities(groupId: string) {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      setSimilarities([]);
      return;
    }

    setExpandedGroupId(groupId);
    setSimLoading(true);
    try {
      const data = await getGroupSimilarities(groupId);
      setSimilarities(data);
    } catch (error) {
      console.error('유사도 조회 실패:', error);
      alert('유사도 데이터를 불러오는데 실패했습니다.');
    } finally {
      setSimLoading(false);
    }
  }

  async function handleAddSimilarity(e: React.FormEvent) {
    e.preventDefault();
    if (!expandedGroupId || !newSimGroupId) return;

    if (newSimGroupId === expandedGroupId) {
      alert('같은 그룹을 유사 그룹으로 설정할 수 없습니다.');
      return;
    }

    try {
      await upsertSimilarity(expandedGroupId, newSimGroupId, newSimWeight);
      const data = await getGroupSimilarities(expandedGroupId);
      setSimilarities(data);
      setNewSimGroupId('');
      setNewSimWeight(1);
    } catch (error: any) {
      alert(error.message || '유사도 추가에 실패했습니다.');
    }
  }

  async function handleDeleteSimilarity(similarGroupId: string) {
    if (!expandedGroupId) return;

    try {
      await deleteSimilarity(expandedGroupId, similarGroupId);
      const data = await getGroupSimilarities(expandedGroupId);
      setSimilarities(data);
    } catch (error) {
      alert('유사도 삭제에 실패했습니다.');
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">그룹 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          혼동그룹 관리 <span className="text-gray-500">({groups.length}개)</span>
        </h2>
        <button
          onClick={() => { showAddForm ? resetForm() : setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {showAddForm ? (
            <><X className="w-4 h-4" />취소</>
          ) : (
            <><Plus className="w-4 h-4" />그룹 추가</>
          )}
        </button>
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? '그룹 수정' : '새 그룹 추가'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                그룹명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="예: 침엽수, 활엽수, 소나무류"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 그룹 목록 */}
      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-white border-gray-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSimilarities(group.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    expandedGroupId === group.id
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                  title="유사도 관리"
                >
                  <Link2 className="w-4 h-4" />
                  {expandedGroupId === group.id ? (
                    <ChevronUp className="w-3 h-3 inline ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 inline ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(group.id, group.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 유사도 패널 */}
            {expandedGroupId === group.id && (
              <div className="ml-6 mt-1 mb-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">
                  유사 그룹 관리 — {group.name}
                </h4>

                {simLoading ? (
                  <div className="text-sm text-gray-500">로딩 중...</div>
                ) : (
                  <>
                    {/* 기존 유사도 목록 */}
                    {similarities.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {similarities.map((sim) => (
                          <div
                            key={sim.similar_group_id}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {sim.similar_group?.name || sim.similar_group_id}
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                가중치: {sim.weight}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSimilarity(sim.similar_group_id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">설정된 유사 그룹이 없습니다.</p>
                    )}

                    {/* 유사도 추가 폼 */}
                    <form onSubmit={handleAddSimilarity} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">유사 그룹</label>
                        <select
                          value={newSimGroupId}
                          onChange={(e) => setNewSimGroupId(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">선택...</option>
                          {groups
                            .filter((g) => g.id !== group.id)
                            .map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-600 mb-1">가중치</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newSimWeight}
                          onChange={(e) => setNewSimWeight(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newSimGroupId}
                        className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        추가
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">등록된 혼동그룹이 없습니다.</div>
      )}
    </div>
  );
}

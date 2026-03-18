'use client';

import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { getQuizModules, updateQuizModule, type QuizModule } from '@/lib/api/quiz-admin';

export function ModuleManagement() {
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setModules(await getQuizModules());
    } catch {
      alert('모듈 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(m: QuizModule) {
    try {
      setSaving(m.id);
      await updateQuizModule(m.id, { is_active: !m.is_active });
      await load();
    } catch {
      alert('상태 변경에 실패했습니다.');
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        모듈을 활성화해도 앱에 해당 화면이 구현되어 있어야 실제로 노출됩니다.
      </p>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모듈명</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">slug (변경 금지)</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성화</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {modules.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-3 text-gray-500">{m.display_order}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
              <td className="px-4 py-3 text-gray-500">{m.description}</td>
              <td className="px-4 py-3 text-xs text-gray-400 font-mono">{m.slug}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(m)}
                  disabled={saving === m.id}
                  className="flex items-center gap-1.5 text-sm disabled:opacity-50"
                >
                  {m.is_active
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  <span className={m.is_active ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {saving === m.id ? '저장 중...' : m.is_active ? '활성' : '비활성'}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

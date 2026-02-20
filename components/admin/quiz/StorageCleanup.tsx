'use client';

import { useState } from 'react';
import { Search, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface ScanResult {
  orphans: string[];
  totalFiles: number;
  usedFiles: number;
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('quiz_public').getPublicUrl(path);
  return data?.publicUrl || '';
}

export function StorageCleanup() {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/quiz/storage-cleanup', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  async function handleDelete() {
    if (!result?.orphans.length) return;
    if (!confirm(`미사용 파일 ${result.orphans.length}개를 삭제하시겠습니까?`)) return;

    setDeleting(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/quiz/storage-cleanup', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths: result.orphans }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`${data.deleted}개 파일이 삭제되었습니다.`);
      setResult(null);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">스토리지 정리</h3>
          <p className="text-sm text-gray-500 mt-1">
            DB에서 참조하지 않는 고아 파일을 스캔하고 삭제합니다.
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {scanning ? '스캔 중...' : '스캔'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Summary */}
      {result && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{result.totalFiles}</div>
            <div className="text-sm text-gray-500">전체 파일</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{result.usedFiles}</div>
            <div className="text-sm text-green-600">사용 중</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{result.orphans.length}</div>
            <div className="text-sm text-red-600">미사용 (고아)</div>
          </div>
        </div>
      )}

      {/* Orphan list */}
      {result && result.orphans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">미사용 파일 목록</h4>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? '삭제 중...' : `전체 삭제 (${result.orphans.length})`}
            </button>
          </div>

          <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
            {result.orphans.map((path) => (
              <div key={path} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicUrl(path)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>';
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 truncate">{path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.orphans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>미사용 파일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

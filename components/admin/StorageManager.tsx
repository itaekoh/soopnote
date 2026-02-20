'use client';

import { useState } from 'react';
import { Search, Trash2, Loader2, ImageIcon, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface BucketResult {
  total: number;
  orphans: string[];
}

interface ScanResult {
  images: BucketResult;
  documents: BucketResult;
}

function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || '';
}

export function StorageManager() {
  const [scanning, setScanning] = useState(false);
  const [deletingBucket, setDeletingBucket] = useState<string | null>(null);
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
      const res = await fetch('/api/storage-cleanup', {
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

  async function handleDelete(bucket: string, paths: string[]) {
    if (!paths.length) return;
    if (!confirm(`${bucket} 버킷의 미사용 파일 ${paths.length}개를 삭제하시겠습니까?`)) return;

    setDeletingBucket(bucket);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/storage-cleanup', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucket, paths }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`${data.deleted}개 파일이 삭제되었습니다.`);
      // Re-scan
      await handleScan();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeletingBucket(null);
    }
  }

  function BucketSection({
    title,
    icon: Icon,
    bucket,
    data,
  }: {
    title: string;
    icon: typeof ImageIcon;
    bucket: string;
    data: BucketResult;
  }) {
    const isDeleting = deletingBucket === bucket;

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Bucket header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-500" />
            <h4 className="font-medium text-gray-900">{title}</h4>
            <span className="text-sm text-gray-500">
              전체 {data.total} / 미사용 {data.orphans.length}
            </span>
          </div>
          {data.orphans.length > 0 && (
            <button
              onClick={() => handleDelete(bucket, data.orphans)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isDeleting ? '삭제 중...' : `삭제 (${data.orphans.length})`}
            </button>
          )}
        </div>

        {/* Orphan list */}
        {data.orphans.length > 0 ? (
          <div className="divide-y max-h-[300px] overflow-y-auto">
            {data.orphans.map((path) => (
              <div key={path} className="flex items-center gap-3 px-4 py-2">
                {bucket === 'images' ? (
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicUrl(bucket, path)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <span className="text-sm text-gray-600 truncate">{path}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            미사용 파일 없음
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">스토리지 정리</h3>
          <p className="text-sm text-gray-500 mt-1">
            images, documents 버킷에서 DB에 참조되지 않는 파일을 스캔하고 삭제합니다.
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {scanning ? '스캔 중...' : '스캔'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Empty buckets notice */}
      <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
        <strong>post-files</strong>, <strong>post-images</strong> 버킷은 비어있습니다 (0개 파일).
        Supabase 대시보드에서 직접 삭제할 수 있습니다.
      </div>

      {result && (
        <div className="space-y-4">
          <BucketSection
            title="images"
            icon={ImageIcon}
            bucket="images"
            data={result.images}
          />
          <BucketSection
            title="documents"
            icon={FileText}
            bucket="documents"
            data={result.documents}
          />
        </div>
      )}
    </div>
  );
}

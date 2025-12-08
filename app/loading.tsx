import { Leaf } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4 animate-pulse">
          <Leaf className="w-8 h-8 text-green-700" />
        </div>
        <p className="text-gray-600 text-lg">페이지를 불러오는 중...</p>
      </div>
    </div>
  );
}

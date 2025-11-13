'use client';

import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <Leaf className="w-7 h-7 text-green-700" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-lg font-semibold">soopnote</div>
          <div className="text-xs text-gray-500 -mt-0.5">plant journal & tree doctor</div>
        </div>
      </Link>

      <nav className="flex items-center gap-6">
        <Link className="text-sm hover:text-green-700 transition-colors" href="/wildflower">
          야생화 일지
        </Link>
        <Link className="text-sm hover:text-green-700 transition-colors" href="/tree-diagnose">
          나무진단
        </Link>
        <Link className="text-sm hover:text-green-700 transition-colors" href="/column">
          칼럼
        </Link>
        <Link href="/write" className="ml-2 py-2 px-4 rounded-lg bg-green-700 text-white text-sm shadow-sm hover:scale-[1.02] transition-transform">
          글쓰기
        </Link>
      </nav>
    </header>
  );
}

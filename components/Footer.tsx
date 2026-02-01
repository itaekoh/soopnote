import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="font-semibold">soopnote</div>
          <div className="text-xs text-gray-500 mt-2">Plant journal · Tree doctor notes</div>
          <nav className="flex gap-4 mt-3">
            <Link href="/about" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">About</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Privacy</Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Contact</Link>
          </nav>
        </div>

        <div className="flex gap-6">
          <div>
            <div className="text-sm font-medium">Contact</div>
            <div className="text-xs text-gray-500 mt-2">treedoctor@kakao.com</div>
          </div>
          <div>
            <div className="text-sm font-medium">License</div>
            <div className="text-xs text-gray-500 mt-2">&copy; 2025 SoopNote. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

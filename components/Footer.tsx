export function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="font-semibold">soopnote</div>
          <div className="text-xs text-gray-500 mt-2">Plant journal · Tree doctor notes</div>
        </div>

        <div className="flex gap-6">
          <div>
            <div className="text-sm font-medium">Contact</div>
            <div className="text-xs text-gray-500 mt-2">email@example.com</div>
          </div>
          <div>
            <div className="text-sm font-medium">License</div>
            <div className="text-xs text-gray-500 mt-2">CC BY-NC 4.0</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

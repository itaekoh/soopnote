interface QuizProgressProps {
  current: number; // 0-based index
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const percent = ((current + 1) / total) * 100;

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-1">
        문제 {current + 1} / {total}
      </p>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-700 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

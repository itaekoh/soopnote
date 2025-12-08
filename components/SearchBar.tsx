'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = '검색어를 입력하세요...',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce: 사용자가 타이핑을 멈춘 후 500ms 후에 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Debounced query가 변경되면 검색 실행
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 검색 중 표시 (query와 debouncedQuery가 다를 때) */}
      {query !== debouncedQuery && query.length > 0 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 mr-8">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

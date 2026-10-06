import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, X, Replace as ReplaceIcon } from 'lucide-react';

interface FindReplaceBarProps {
  isOpen: boolean;
  isReplaceMode: boolean;
  onClose: () => void;
  onFind: (query: string, matchCase: boolean) => void;
  onReplace: (query: string, replacement: string, all: boolean) => void;
  matchCount: { current: number; total: number };
  onNavigateMatch: (direction: 'next' | 'prev') => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  isReplaceMode,
  onClose,
  onFind,
  onReplace,
  matchCount,
  onNavigateMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        findInputRef.current?.focus();
        findInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    onFind(searchQuery, matchCase);
  }, [searchQuery, matchCase]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-2 right-6 z-40 bg-[#252526] border border-[#454545] rounded shadow-xl p-2 flex flex-col gap-1.5 text-xs select-none w-80 text-[#cccccc]">
      {/* Find row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            ref={findInputRef}
            type="text"
            placeholder="Find"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNavigateMatch(e.shiftKey ? 'prev' : 'next');
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] text-[#ffffff] px-2 py-1 pr-16 rounded text-xs outline-none font-mono"
          />
          <span className="absolute right-2 top-1 text-[11px] text-[#858585]">
            {searchQuery ? `${matchCount.total > 0 ? `${matchCount.current} of ${matchCount.total}` : 'No match'}` : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateMatch('prev')}
          title="Previous Match (Shift+Enter)"
          className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
        >
          <ChevronUp size={14} />
        </button>

        <button
          type="button"
          onClick={() => onNavigateMatch('next')}
          title="Next Match (Enter)"
          className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
        >
          <ChevronDown size={14} />
        </button>

        <button
          type="button"
          onClick={() => setMatchCase(!matchCase)}
          title="Match Case"
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            matchCase ? 'bg-[#007acc] text-white' : 'hover:bg-[#333333] text-[#858585]'
          }`}
        >
          Aa
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      {/* Replace row */}
      {isReplaceMode && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Replace"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onReplace(searchQuery, replaceQuery, false);
              }
            }}
            className="flex-1 bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] text-[#ffffff] px-2 py-1 rounded text-xs outline-none font-mono"
          />

          <button
            type="button"
            onClick={() => onReplace(searchQuery, replaceQuery, false)}
            title="Replace"
            className="px-2 py-1 bg-[#333333] hover:bg-[#444444] rounded text-[11px] text-white transition-colors"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={() => onReplace(searchQuery, replaceQuery, true)}
            title="Replace All"
            className="px-2 py-1 bg-[#333333] hover:bg-[#444444] rounded text-[11px] text-white transition-colors"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};

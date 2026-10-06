import React from 'react';
import { Layers, X, BookOpen, Keyboard } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded shadow-2xl w-full max-w-md overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-9 px-3 bg-[#2d2d30] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-white">
            <span className="w-4 h-4 rounded bg-[#2d3748] border border-[#4a5568] flex items-center justify-center text-[#4fd1c5] font-bold text-[10px]">
              J
            </span>
            <span>About JBlock</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#858585] hover:text-white p-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded bg-[#2d3748] border border-[#4a5568] flex items-center justify-center text-[#4fd1c5] font-bold text-2xl shrink-0">
              J
            </div>
            <div>
              <h2 className="text-base font-bold text-white">JBlock</h2>
              <p className="text-xs text-[#61afef]">Simple Java Development Environment</p>
              <p className="text-[11px] text-[#858585] mt-1">Version 0.1 (Architecture Preview)</p>
            </div>
          </div>

          <div className="bg-[#1e1e1e] p-3 rounded border border-[#333333] text-[11px] text-[#abb2bf] leading-relaxed">
            <p className="font-semibold text-white mb-1">Philosophy: Pure Simplicity</p>
            <p>
              "Open the program → write Java → press Run → see the result."
            </p>
            <p className="mt-1 text-[#858585]">
              Designed specifically for beginners who want a fast, focused environment without overwhelming enterprise complexity.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <Keyboard size={13} className="text-[#e5c07b]" />
              <span>Essential Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] bg-[#1e1e1e] p-2.5 rounded border border-[#333333]">
              <div className="flex justify-between pr-2">
                <span className="text-[#858585]">New Java File:</span>
                <span className="font-mono text-white">Ctrl + N</span>
              </div>
              <div className="flex justify-between pl-2">
                <span className="text-[#858585]">Compile:</span>
                <span className="font-mono text-white">F9</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-[#858585]">Open File:</span>
                <span className="font-mono text-white">Ctrl + O</span>
              </div>
              <div className="flex justify-between pl-2">
                <span className="text-[#858585]">Run:</span>
                <span className="font-mono text-white">F10</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-[#858585]">Save File:</span>
                <span className="font-mono text-white">Ctrl + S</span>
              </div>
              <div className="flex justify-between pl-2">
                <span className="text-[#858585]">Compile & Run:</span>
                <span className="font-mono text-white">F11</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-[#858585]">Close Tab:</span>
                <span className="font-mono text-white">Ctrl + W</span>
              </div>
              <div className="flex justify-between pl-2">
                <span className="text-[#858585]">Stop:</span>
                <span className="font-mono text-white">Esc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1e1e1e] border-t border-[#333333] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

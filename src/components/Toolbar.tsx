import React from 'react';
import { 
  FilePlus, 
  FolderOpen, 
  Save, 
  Files, 
  Hammer, 
  Play, 
  Square,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAll: () => void;
  onCompile: () => void;
  onRun: () => void;
  onStop: () => void;
  activeFileName?: string;
  isModified?: boolean;
  isRunning?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onOpen,
  onSave,
  onSaveAll,
  onCompile,
  onRun,
  onStop,
  activeFileName,
  isModified,
  isRunning,
}) => {
  return (
    <div className="h-9 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-2 gap-2 select-none">
      {/* Left primary file operations */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNew}
          title="New Java File (Ctrl+N)"
          className="p-1.5 rounded hover:bg-[#383838] text-[#cccccc] hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          <FilePlus size={15} />
          <span className="hidden md:inline">New</span>
        </button>

        <button
          type="button"
          onClick={onOpen}
          title="Open File (Ctrl+O)"
          className="p-1.5 rounded hover:bg-[#383838] text-[#cccccc] hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          <FolderOpen size={15} />
          <span className="hidden md:inline">Open</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          title={`Save Current File (Ctrl+S)${isModified ? ' - Unsaved changes' : ''}`}
          className={`p-1.5 rounded hover:bg-[#383838] transition-colors flex items-center gap-1.5 text-xs ${
            isModified ? 'text-[#e5c07b] font-medium' : 'text-[#cccccc] hover:text-white'
          }`}
        >
          <Save size={15} />
          <span className="hidden md:inline">Save</span>
        </button>

        <button
          type="button"
          onClick={onSaveAll}
          title="Save All Files"
          className="p-1.5 rounded hover:bg-[#383838] text-[#cccccc] hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          <Files size={15} />
          <span className="hidden lg:inline">Save All</span>
        </button>

        <div className="h-4 w-px bg-[#3e3e42] mx-1" />

        {/* Build & Run Operations */}
        <button
          type="button"
          onClick={onCompile}
          title="Compile Java (F9)"
          className="px-2.5 py-1 rounded bg-[#2d3139] hover:bg-[#363b46] border border-[#3e4451] text-[#abb2bf] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <Hammer size={14} className="text-[#61afef]" />
          <span>Compile</span>
          <span className="text-[10px] text-[#636d83] ml-0.5">F9</span>
        </button>

        {/* Distinctive, easy-to-recognize Run Button */}
        <button
          type="button"
          onClick={onRun}
          title="Run Java Program (F10)"
          className="px-3 py-1 rounded bg-[#2e7d32] hover:bg-[#388e3c] active:bg-[#1b5e20] text-white shadow-xs transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Play size={14} fill="currentColor" />
          <span>Run</span>
          <span className="text-[10px] text-emerald-200 opacity-80 ml-0.5">F10</span>
        </button>

        <button
          type="button"
          onClick={onStop}
          title="Stop Execution (Esc)"
          disabled={!isRunning}
          className={`px-2 py-1 rounded border transition-colors flex items-center gap-1 text-xs ${
            isRunning
              ? 'bg-[#c62828] hover:bg-[#d32f2f] border-[#e53935] text-white'
              : 'border-[#333333] text-[#666666] opacity-60 cursor-not-allowed'
          }`}
        >
          <Square size={13} fill={isRunning ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">Stop</span>
        </button>
      </div>

      {/* Right target info */}
      <div className="flex items-center gap-2 text-xs text-[#858585]">
        {activeFileName && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1e1e1e] border border-[#333333] rounded text-[#abb2bf] font-mono text-[11px]">
            <span className="text-[#5c6370]">Target:</span>
            <span className="text-white font-medium">{activeFileName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

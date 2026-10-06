import React from 'react';
import { Minus, Square, X, Download } from 'lucide-react';

interface TitleBarProps {
  activeFileName?: string;
  isModified?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onOpenInstallModal?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  activeFileName,
  isModified,
  onOpenInstallModal,
}) => {
  return (
    <div className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-2 select-none text-xs">
      {/* Left: App icon and brand */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-[#2d3748] border border-[#4a5568] flex items-center justify-center text-[#4fd1c5] font-bold text-xs tracking-tighter shadow-xs">
          J
        </div>
        <span className="font-semibold text-[#e2e8f0] tracking-wide text-xs">
          JBlock
        </span>
        <span className="text-[#64748b] text-[11px] hidden sm:inline">
          — Simple Java Development Environment
        </span>
      </div>

      {/* Center: Current file indicator */}
      <div className="text-[#888888] text-xs font-mono truncate max-w-sm px-2">
        {activeFileName ? `${activeFileName}${isModified ? ' *' : ''} - JBlock` : 'JBlock'}
      </div>

      {/* Right: Install Desktop App & Window Controls */}
      <div className="flex items-center h-full -mr-2">
        {onOpenInstallModal && (
          <button
            type="button"
            onClick={onOpenInstallModal}
            title="Install JBlock to Windows Desktop (Offline App)"
            className="h-6 px-2.5 mr-2 rounded bg-[#282c34] hover:bg-[#323842] border border-[#3e4451] text-[#61afef] hover:text-white flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Download size={12} />
            <span className="hidden md:inline">Install Desktop App</span>
          </button>
        )}

        <button
          type="button"
          title="Minimize"
          className="h-8 w-11 flex items-center justify-center text-[#8e8e8e] hover:bg-[#2d2d2d] hover:text-white transition-colors"
          onClick={() => {}}
        >
          <Minus size={13} />
        </button>
        <button
          type="button"
          title="Maximize"
          className="h-8 w-11 flex items-center justify-center text-[#8e8e8e] hover:bg-[#2d2d2d] hover:text-white transition-colors"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
        >
          <Square size={11} />
        </button>
        <button
          type="button"
          title="Close JBlock"
          className="h-8 w-11 flex items-center justify-center text-[#8e8e8e] hover:bg-[#e81123] hover:text-white transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to exit JBlock?')) {
              window.close();
            }
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};


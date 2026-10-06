import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { JDKConfig, EditorPosition } from '../types';

interface StatusBarProps {
  jdkConfig: JDKConfig;
  activeFileName?: string;
  cursorPos: EditorPosition;
  onOpenJdkSettings: () => void;
  isModified?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  jdkConfig,
  activeFileName,
  cursorPos,
  onOpenJdkSettings,
  isModified,
}) => {
  return (
    <div className="h-6 bg-[#21252b] border-t border-[#181a1f] text-[#abb2bf] text-[11px] px-3 flex items-center justify-between select-none">
      {/* Left side: JDK status & Project */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenJdkSettings}
          title="Click to configure local JDK path"
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-0.5"
        >
          {jdkConfig.isDetected ? (
            <>
              <CheckCircle2 size={12} className="text-[#98c379]" />
              <span className="font-medium text-[#98c379]">Java {jdkConfig.version} ✓</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} className="text-[#e5c07b]" />
              <span className="font-medium text-[#e5c07b]">Java JDK not detected</span>
            </>
          )}
        </button>

        <span className="text-[#4b5263]">|</span>

        <span className="text-[#858585]">
          Project: <strong className="text-[#abb2bf] font-medium">JBlockProject</strong>
        </span>
      </div>

      {/* Right side: Editor metrics */}
      <div className="flex items-center gap-4 text-[#858585]">
        {activeFileName && (
          <span className="font-mono text-[#abb2bf]">
            {activeFileName}{isModified ? ' *' : ''}
          </span>
        )}

        <span>
          Line {cursorPos.line}, Column {cursorPos.column}
        </span>

        <span>Spaces: 4</span>

        <span>UTF-8</span>

        <span className="hidden sm:inline">LF</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Terminal, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2,
  X 
} from 'lucide-react';
import { OutputTab } from './OutputTab';
import { ProblemsTab } from './ProblemsTab';
import { TerminalTab } from './TerminalTab';
import { CompilerProblem, JDKConfig } from '../../types';

export type BottomPanelTab = 'OUTPUT' | 'PROBLEMS' | 'TERMINAL';

interface BottomPanelProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  outputLogs: string[];
  onClearOutput: () => void;
  problems: CompilerProblem[];
  onSelectProblem: (problem: CompilerProblem) => void;
  jdkConfig: JDKConfig;
  isRunning?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  height: number;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  activeTab,
  onTabChange,
  outputLogs,
  onClearOutput,
  problems,
  onSelectProblem,
  jdkConfig,
  isRunning,
  isCollapsed,
  onToggleCollapse,
  height,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const errorCount = problems.filter(p => p.severity === 'error').length;

  if (isCollapsed) {
    return (
      <div className="h-7 bg-[#21252b] border-t border-[#181a1f] flex items-center justify-between px-3 text-xs select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              onTabChange('OUTPUT');
            }}
            className="flex items-center gap-1.5 text-[#abb2bf] hover:text-white"
          >
            <FileText size={13} />
            <span>OUTPUT</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              onTabChange('PROBLEMS');
            }}
            className="flex items-center gap-1.5 text-[#abb2bf] hover:text-white"
          >
            <AlertCircle size={13} className={errorCount > 0 ? 'text-[#e06c75]' : ''} />
            <span>PROBLEMS {errorCount > 0 && `(${errorCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              onTabChange('TERMINAL');
            }}
            className="flex items-center gap-1.5 text-[#abb2bf] hover:text-white"
          >
            <Terminal size={13} />
            <span>TERMINAL</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-[#5c6370] hover:text-[#abb2bf]"
          title="Expand Panel"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  const effectiveHeight = isMaximized ? 'calc(100vh - 120px)' : `${height}px`;

  return (
    <div
      style={{ height: effectiveHeight }}
      className="flex flex-col bg-[#1e1e1e] border-t border-[#181a1f] transition-all relative z-20"
    >
      {/* Panel header tabs */}
      <div className="h-7 bg-[#21252b] border-b border-[#181a1f] flex items-center justify-between px-2 select-none">
        <div className="flex items-center h-full">
          {/* Output Tab button */}
          <button
            type="button"
            onClick={() => onTabChange('OUTPUT')}
            className={`h-full px-3 flex items-center gap-1.5 text-xs border-r border-[#181a1f] transition-colors ${
              activeTab === 'OUTPUT'
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#61afef]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#282c34] border-t-2 border-t-transparent'
            }`}
          >
            <FileText size={12} />
            <span className="font-medium text-[11px]">OUTPUT</span>
          </button>

          {/* Problems Tab button */}
          <button
            type="button"
            onClick={() => onTabChange('PROBLEMS')}
            className={`h-full px-3 flex items-center gap-1.5 text-xs border-r border-[#181a1f] transition-colors ${
              activeTab === 'PROBLEMS'
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#61afef]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#282c34] border-t-2 border-t-transparent'
            }`}
          >
            <AlertCircle size={12} className={errorCount > 0 ? 'text-[#e06c75]' : ''} />
            <span className="font-medium text-[11px]">PROBLEMS</span>
            {errorCount > 0 && (
              <span className="ml-1 px-1 rounded-full bg-[#e06c75] text-white text-[10px] font-bold">
                {errorCount}
              </span>
            )}
          </button>

          {/* Terminal Tab button */}
          <button
            type="button"
            onClick={() => onTabChange('TERMINAL')}
            className={`h-full px-3 flex items-center gap-1.5 text-xs border-r border-[#181a1f] transition-colors ${
              activeTab === 'TERMINAL'
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#61afef]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#282c34] border-t-2 border-t-transparent'
            }`}
          >
            <Terminal size={12} />
            <span className="font-medium text-[11px]">TERMINAL</span>
          </button>
        </div>

        {/* Panel controls */}
        <div className="flex items-center gap-1 text-[#858585]">
          <button
            type="button"
            title={isMaximized ? 'Restore' : 'Maximize Panel'}
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:text-white rounded hover:bg-[#282c34]"
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            type="button"
            title="Minimize Panel"
            onClick={onToggleCollapse}
            className="p-1 hover:text-white rounded hover:bg-[#282c34]"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Panel Tab View */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'OUTPUT' && (
          <OutputTab logs={outputLogs} onClear={onClearOutput} isRunning={isRunning} />
        )}
        {activeTab === 'PROBLEMS' && (
          <ProblemsTab problems={problems} onSelectProblem={onSelectProblem} />
        )}
        {activeTab === 'TERMINAL' && (
          <TerminalTab jdkConfig={jdkConfig} />
        )}
      </div>
    </div>
  );
};

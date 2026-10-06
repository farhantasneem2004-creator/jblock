import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { CompilerProblem } from '../../types';

interface ProblemsTabProps {
  problems: CompilerProblem[];
  onSelectProblem: (problem: CompilerProblem) => void;
  onClearProblems?: () => void;
}

export const ProblemsTab: React.FC<ProblemsTabProps> = ({
  problems,
  onSelectProblem,
}) => {
  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] font-mono text-xs select-none">
      {/* Tab controls */}
      <div className="h-7 px-3 bg-[#252526] border-b border-[#333333] flex items-center justify-between text-[11px] text-[#858585]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#e06c75]">
            <AlertCircle size={12} />
            <span>{errorCount} {errorCount === 1 ? 'Error' : 'Errors'}</span>
          </span>
          <span className="flex items-center gap-1 text-[#e5c07b]">
            <AlertTriangle size={12} />
            <span>{warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}</span>
          </span>
        </div>
        <span className="text-[10px] text-[#666666]">Click an issue to jump to code line</span>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto">
        {problems.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-[#98c379]">
            <CheckCircle2 size={16} />
            <span>No problems detected in the current workspace.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {problems.map((prob) => {
              const isError = prob.severity === 'error';
              const isWarning = prob.severity === 'warning';

              return (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob)}
                  className="px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer flex items-start gap-2.5 transition-colors group"
                >
                  <div className="mt-0.5 shrink-0">
                    {isError && <AlertCircle size={14} className="text-[#e06c75]" />}
                    {isWarning && <AlertTriangle size={14} className="text-[#e5c07b]" />}
                    {!isError && !isWarning && <Info size={14} className="text-[#61afef]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#abb2bf] group-hover:text-white">
                        {prob.fileName}:{prob.line}:{prob.column}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1 rounded ${
                        isError ? 'bg-[#e06c75]/20 text-[#e06c75]' : 'bg-[#e5c07b]/20 text-[#e5c07b]'
                      }`}>
                        {prob.severity}
                      </span>
                    </div>

                    <div className="text-[#d4d4d4] mt-0.5 font-normal">
                      {prob.message}
                    </div>

                    {prob.codeSnippet && (
                      <div className="mt-1 text-[11px] text-[#7f848e] bg-[#181818] px-2 py-0.5 rounded border border-[#2a2a2a] truncate font-mono">
                        {prob.codeSnippet}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

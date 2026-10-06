import React from 'react';
import { Copy, Trash2, CheckCircle2 } from 'lucide-react';

interface OutputTabProps {
  logs: string[];
  onClear: () => void;
  isRunning?: boolean;
}

export const OutputTab: React.FC<OutputTabProps> = ({
  logs,
  onClear,
  isRunning,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] font-mono text-xs select-text">
      {/* Tab controls */}
      <div className="h-7 px-3 bg-[#252526] border-b border-[#333333] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-[11px] text-[#858585]">
          <span>Program Console</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[#e5c07b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5c07b] animate-pulse" />
              Running...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Output"
            className="flex items-center gap-1 text-[11px] text-[#858585] hover:text-[#cccccc] transition-colors"
          >
            {copied ? <CheckCircle2 size={12} className="text-[#98c379]" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear Output"
            className="flex items-center gap-1 text-[11px] text-[#858585] hover:text-[#cccccc] transition-colors"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-3 overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-[#555555] italic">
            [No output yet. Click 'Run' (F10) to execute the active Java file.]
          </div>
        ) : (
          logs.map((log, index) => {
            let color = 'text-[#d4d4d4]';
            if (log.startsWith('[Compilation]')) color = 'text-[#61afef] font-semibold';
            else if (log.startsWith('[Error]') || log.includes('error:')) color = 'text-[#e06c75]';
            else if (log.startsWith('[Success]') || log.includes('finished successfully')) color = 'text-[#98c379] font-medium';
            else if (log.startsWith('>') || log.startsWith('===')) color = 'text-[#858585]';

            return (
              <div key={index} className={`${color}`}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

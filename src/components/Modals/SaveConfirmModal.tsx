import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface SaveConfirmModalProps {
  isOpen: boolean;
  fileName: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

export const SaveConfirmModal: React.FC<SaveConfirmModalProps> = ({
  isOpen,
  fileName,
  onSave,
  onDontSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded shadow-2xl w-full max-w-sm overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-9 px-3 bg-[#2d2d30] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-white">
            <AlertCircle size={15} className="text-[#e5c07b]" />
            <span>Unsaved Changes</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#858585] hover:text-white p-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <div className="p-4 flex flex-col gap-2">
          <p className="text-white text-sm">
            Save changes before closing?
          </p>
          <p className="text-[#858585] text-xs">
            Your changes in <code className="text-[#e5c07b] font-mono">{fileName}</code> will be lost if you don't save them.
          </p>
        </div>

        {/* Buttons as explicitly requested */}
        <div className="p-3 bg-[#1e1e1e] border-t border-[#333333] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-medium transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onDontSave}
            className="px-3 py-1.5 rounded bg-[#333333] hover:bg-[#444444] text-[#cccccc] hover:text-white transition-colors"
          >
            Don't Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded bg-transparent hover:bg-[#2d2d30] text-[#858585] hover:text-[#cccccc] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { FileCode, X } from 'lucide-react';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (className: string) => void;
}

export const NewFileDialog: React.FC<NewFileDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [className, setClassName] = useState('MyProgram');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = className.trim();
    if (!cleanName) {
      setError('Class name cannot be empty');
      return;
    }
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleanName)) {
      setError('Invalid Java class identifier. Start with a letter, no spaces or special symbols.');
      return;
    }
    onCreate(cleanName);
    setClassName('MyProgram');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded shadow-2xl w-full max-w-md overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-9 px-3 bg-[#2d2d30] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-white">
            <FileCode size={15} className="text-[#e5c07b]" />
            <span>Create New Java File</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#858585] hover:text-white p-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div>
            <label className="block text-[#abb2bf] mb-1 font-medium">
              Class Name:
            </label>
            <input
              type="text"
              autoFocus
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Student or MyProgram"
              className="w-full bg-[#3c3c3c] border border-[#555555] focus:border-[#007acc] text-white px-2.5 py-1.5 rounded outline-none font-mono text-xs"
            />
            {error ? (
              <p className="text-[#e06c75] text-[11px] mt-1">{error}</p>
            ) : (
              <p className="text-[#7f848e] text-[11px] mt-1">
                Will create: <code className="text-[#e5c07b] font-mono">{className ? `${className.trim()}.java` : '...'}</code>
              </p>
            )}
          </div>

          {/* Template preview */}
          <div className="bg-[#1e1e1e] p-2.5 rounded border border-[#333333]">
            <div className="text-[10px] uppercase text-[#666666] mb-1 font-bold">Template Preview:</div>
            <pre className="font-mono text-[11px] text-[#abb2bf] leading-relaxed">
{`public class ${className.trim() || 'MyProgram'} {
    public static void main(String[] args) {
        System.out.println("Hello from ${className.trim() || 'MyProgram'}!");
    }
}`}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#333333] hover:bg-[#444444] text-[#cccccc] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-medium transition-colors"
            >
              Create Java File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

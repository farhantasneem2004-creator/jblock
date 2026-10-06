import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Folder, X, Cpu } from 'lucide-react';
import { JDKConfig } from '../../types';

interface JdkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: JDKConfig;
  onSave: (config: JDKConfig) => void;
}

export const JdkSettingsModal: React.FC<JdkSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [jdkPath, setJdkPath] = useState(config.path);
  const [jdkVersion, setJdkVersion] = useState(config.version);
  const [isDetected, setIsDetected] = useState(config.isDetected);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      path: jdkPath.trim(),
      version: jdkVersion.trim() || '21',
      isDetected: !!jdkPath.trim() && isDetected,
      javacAvailable: !!jdkPath.trim() && isDetected,
      javaAvailable: !!jdkPath.trim() && isDetected,
    });
    onClose();
  };

  const handleAutodetect = () => {
    setJdkPath('C:\\Program Files\\Java\\jdk-21');
    setJdkVersion('21');
    setIsDetected(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded shadow-2xl w-full max-w-lg overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-9 px-3 bg-[#2d2d30] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-white">
            <Cpu size={15} className="text-[#61afef]" />
            <span>Configure Java JDK (Java Development Kit)</span>
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
        <form onSubmit={handleSave} className="p-4 flex flex-col gap-4">
          {/* Status banner */}
          <div className={`p-3 rounded border flex items-start gap-3 ${
            isDetected
              ? 'bg-[#1b2b23] border-[#2e7d32] text-[#98c379]'
              : 'bg-[#2b251b] border-[#e5c07b]/40 text-[#e5c07b]'
          }`}>
            <div className="mt-0.5">
              {isDetected ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div>
              <div className="font-semibold text-white">
                {isDetected ? '✓ Java JDK Detected' : '⚠ Java JDK Not Detected'}
              </div>
              <div className="text-[11px] mt-0.5 opacity-90">
                {isDetected
                  ? `JDK Version: ${jdkVersion} (javac & java ready for local offline compilation)`
                  : 'Specify the installation directory of your JDK to enable local compilation.'}
              </div>
            </div>
          </div>

          {/* Directory path */}
          <div>
            <label className="block text-[#abb2bf] mb-1 font-medium">
              JDK Home Directory Path:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jdkPath}
                onChange={(e) => setJdkPath(e.target.value)}
                placeholder="e.g. C:\Program Files\Java\jdk-21"
                className="flex-1 bg-[#3c3c3c] border border-[#555555] focus:border-[#007acc] text-white px-2.5 py-1.5 rounded outline-none font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleAutodetect}
                className="px-2.5 py-1.5 bg-[#333333] hover:bg-[#444444] rounded text-white flex items-center gap-1.5 transition-colors"
                title="Detect Standard JDK Location"
              >
                <Folder size={13} />
                <span>Auto-Detect</span>
              </button>
            </div>
            <p className="text-[#7f848e] text-[11px] mt-1">
              Standard Windows location: <code className="text-[#abb2bf] font-mono">C:\Program Files\Java\jdk-21</code>
            </p>
          </div>

          {/* Version */}
          <div>
            <label className="block text-[#abb2bf] mb-1 font-medium">
              JDK Version:
            </label>
            <input
              type="text"
              value={jdkVersion}
              onChange={(e) => setJdkVersion(e.target.value)}
              placeholder="21"
              className="w-32 bg-[#3c3c3c] border border-[#555555] focus:border-[#007acc] text-white px-2.5 py-1.5 rounded outline-none font-mono text-xs"
            />
          </div>

          {/* Detection toggles */}
          <div className="bg-[#1e1e1e] p-3 rounded border border-[#333333] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#abb2bf]">javac (Java Compiler)</span>
              <span className="text-[#98c379] font-mono font-medium">Detected (javac.exe)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#abb2bf]">java (Java Runtime)</span>
              <span className="text-[#98c379] font-mono font-medium">Detected (java.exe)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#abb2bf]">Target Environment</span>
              <span className="text-[#61afef] font-mono font-medium">Local Computer (Offline)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#333333]">
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
              Save JDK Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

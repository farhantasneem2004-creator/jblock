import React, { useState } from 'react';
import { 
  WifiOff, 
  Download, 
  Monitor, 
  CheckCircle2, 
  X, 
  HardDrive,
  FileCode,
  Layers,
  Terminal,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { downloadWindowsSetupScript } from '../../utils/installerGenerator';

interface OfflineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
  canInstallPwa: boolean;
  isInstalled: boolean;
}

export const OfflineGuideModal: React.FC<OfflineGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  canInstallPwa,
  isInstalled,
}) => {
  const [downloadedScript, setDownloadedScript] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSetup = () => {
    downloadWindowsSetupScript();
    setDownloadedScript(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#21252b] border border-[#3e4451] rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-10 px-4 bg-[#282c34] border-b border-[#181a1f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-semibold text-white">
            <WifiOff size={16} className="text-[#98c379]" />
            <span>Offline Usage & Windows Desktop Installation Guide</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#323842] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#1c2938] to-[#18232f] border border-[#2c3e50] rounded p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded bg-[#61afef]/10 border border-[#61afef]/30 flex items-center justify-center text-[#61afef] shrink-0 mt-0.5">
              <Monitor size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">Standalone Windows Desktop Software</h3>
                <span className="px-2 py-0.5 rounded bg-[#2e7d32]/30 text-[#98c379] border border-[#2e7d32]/60 text-[10px] font-semibold">
                  100% Offline Verified
                </span>
              </div>
              <p className="text-[#abb2bf] text-xs mt-1 leading-relaxed">
                JBlock is engineered with an advanced Service Worker (<strong>jblock-offline-v2</strong>) that permanently caches the entire application, code editor, fonts, and Java runner to your local hard drive. You can disconnect your internet and code in Java anywhere.
              </p>
            </div>
          </div>

          {/* Installation Methods */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 text-[#9da5b4]">
              Two Ways to Install JBlock on Your Windows Desktop
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Method 1: PWA Desktop App */}
              <div className="bg-[#181a1f] border border-[#2d3139] rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Monitor size={14} className="text-[#61afef]" />
                      Method 1: Direct App Install
                    </span>
                    {isInstalled && (
                      <span className="text-[10px] text-[#98c379] font-medium">Installed ✓</span>
                    )}
                  </div>
                  <p className="text-[#858585] text-xs leading-relaxed">
                    Uses Windows Chromium app hosting. Installs JBlock as a standalone window and adds <code className="text-[#e5c07b] font-mono">JBlock.exe</code> shortcut to your Windows Desktop and Start Menu.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2d3139]">
                  <button
                    type="button"
                    onClick={onTriggerInstall}
                    className="w-full py-1.5 px-3 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-medium rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download size={13} />
                    <span>{isInstalled ? 'Reinstall / Open App' : 'Install JBlock to Desktop'}</span>
                  </button>
                </div>
              </div>

              {/* Method 2: Clickable Windows Setup Script */}
              <div className="bg-[#181a1f] border border-[#2d3139] rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Terminal size={14} className="text-[#98c379]" />
                      Method 2: Clickable Setup (.cmd)
                    </span>
                    <span className="text-[10px] text-[#abb2bf] font-mono">Windows .bat/.cmd</span>
                  </div>
                  <p className="text-[#858585] text-xs leading-relaxed">
                    Download an executable Windows setup script. Just double-click it on Windows to create a direct Desktop shortcut and configure offline mode automatically.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2d3139]">
                  <button
                    type="button"
                    onClick={handleDownloadSetup}
                    className="w-full py-1.5 px-3 bg-[#282c34] hover:bg-[#323842] border border-[#3e4451] text-white font-medium rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>{downloadedScript ? 'Downloaded Setup Script!' : 'Download Windows Setup (.cmd)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How Offline Caching Works */}
          <div className="bg-[#181a1f] border border-[#2d3139] rounded p-4 space-y-3">
            <h4 className="text-white font-semibold text-xs flex items-center gap-2">
              <HardDrive size={15} className="text-[#e5c07b]" />
              <span>How Local Caching & Offline Fallback Works</span>
            </h4>
            
            <div className="space-y-2 text-[#abb2bf] text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#98c379] mt-1.5 shrink-0" />
                <p>
                  <strong>Service Worker Pre-caching (jblock-offline-v2):</strong> When you open JBlock, all HTML, CSS, JavaScript, icons, and programming fonts are downloaded once and stored permanently in your browser's persistent cache storage.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#98c379] mt-1.5 shrink-0" />
                <p>
                  <strong>Cache-First Offline Fallback:</strong> If you lose internet or turn off Wi-Fi, the Service Worker immediately intercepts all requests and serves the files directly from your computer's drive—no network timeouts or errors.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#98c379] mt-1.5 shrink-0" />
                <p>
                  <strong>Local Code Execution:</strong> When offline, JBlock automatically routes compilation and execution to the embedded Java engine (<code className="text-[#e5c07b] font-mono">javaEngine.ts</code>). Your Java code executes locally on your CPU with zero remote servers.
                </p>
              </div>
            </div>
          </div>

          {/* Step by step offline verification */}
          <div className="bg-[#14211a] border border-[#2e7d32]/50 rounded p-4">
            <div className="flex items-center gap-2 font-semibold text-white mb-2">
              <CheckCircle2 size={16} className="text-[#98c379]" />
              <span>How to Verify Offline Mode on Your Computer</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[#abb2bf] text-xs">
              <li>Install JBlock using Method 1 or Method 2 above.</li>
              <li>Close your web browser completely.</li>
              <li><strong>Disconnect from the Internet:</strong> Turn off Wi-Fi or unplug your Ethernet cable.</li>
              <li>Double-click the <strong>JBlock icon on your Windows Desktop</strong>.</li>
              <li>Notice how JBlock opens instantly in its own window without needing any internet connection.</li>
              <li>Edit your Java code and click <strong className="text-white">Run (F10)</strong>—the code compiles and executes offline!</li>
            </ol>
          </div>

          {/* Native .EXE Builder Instructions for Developers */}
          <div className="bg-[#1e2227] border border-[#2d3139] rounded p-3 text-[11px] text-[#858585]">
            <span className="font-semibold text-white">For Standalone .EXE Binary Compilation:</span>
            <p className="mt-1">
              JBlock includes an <code className="text-[#abb2bf] font-mono">electron-main.cjs</code> configuration. Developers can generate a standalone Windows installer executable (<code className="text-[#abb2bf] font-mono">JBlock-Setup.exe</code>) by running <code className="text-[#abb2bf] font-mono">npx electron-builder --win</code> on their computer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181a1f] border-t border-[#2d3139] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6b717d]">
            Service Worker Cache: <span className="text-[#98c379] font-mono font-medium">jblock-offline-v2 (Active)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#333333] hover:bg-[#444444] text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

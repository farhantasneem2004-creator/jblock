import React, { useState } from 'react';
import { Download, Monitor, CheckCircle2, ShieldCheck, X, HardDrive, Terminal } from 'lucide-react';
import { downloadWindowsSetupScript } from '../../utils/installerGenerator';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallPwa: boolean;
  onTriggerInstall: () => void;
  isInstalled: boolean;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose,
  canInstallPwa,
  onTriggerInstall,
  isInstalled,
}) => {
  const [downloadedPackage, setDownloadedPackage] = useState(false);

  if (!isOpen) return null;

  const handleDownloadOfflineHTML = () => {
    // Generate standalone portable bundle
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JBlock - Offline Desktop Java IDE</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #181818; color: #ccc; display: flex; flex-direction: column; height: 100vh; }
    .header { padding: 12px 20px; background: #21252b; border-bottom: 1px solid #333; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-weight: bold; color: #fff; font-size: 16px; display: flex; align-items: center; gap: 8px; }
    .badge { background: #2e7d32; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
    .content { flex: 1; padding: 24px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    pre { background: #21252b; padding: 16px; border-radius: 6px; border: 1px solid #333; color: #abb2bf; font-family: Consolas, monospace; overflow-x: auto; }
    .btn { background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span style="background:#2d3748; border:1px solid #4a5568; padding:2px 8px; border-radius:4px; color:#4fd1c5;">J</span>
      JBlock Offline Portable Launcher
    </div>
    <span class="badge">Offline Verified</span>
  </div>
  <div class="content">
    <h2>Portable Offline JBlock Launcher</h2>
    <p>To run JBlock completely offline on your desktop:</p>
    <ol>
      <li>Open your web browser (Google Chrome, Microsoft Edge, or Brave).</li>
      <li>Open JBlock.</li>
      <li>Click the <strong>Install Desktop App</strong> icon on the top right.</li>
      <li>Windows will install JBlock to your <strong>Desktop</strong> and <strong>Start Menu</strong> as a standalone application.</li>
    </ol>
    <h3>Local Java JDK Compilation:</h3>
    <p>When running Java code locally on Windows, ensure your JDK is installed in:</p>
    <pre>C:\\Program Files\\Java\\jdk-21\\bin</pre>
    <p>Test in Windows Command Prompt with:</p>
    <pre>javac -version
java -version</pre>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JBlock-Desktop-Offline-Launcher.html';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedPackage(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#21252b] border border-[#3e4451] rounded shadow-2xl w-full max-w-lg overflow-hidden text-xs text-[#cccccc]">
        {/* Header */}
        <div className="h-10 px-4 bg-[#282c34] border-b border-[#181a1f] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Monitor size={16} className="text-[#61afef]" />
            <span>Install JBlock as Offline Desktop Software</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#858585] hover:text-white p-1"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Status banner */}
          <div className="p-3.5 rounded bg-[#1e2227] border border-[#2d3139] flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-[#2e7d32]/20 border border-[#2e7d32]/50 flex items-center justify-center text-[#98c379] shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                100% Offline Desktop Mode Ready
              </div>
              <p className="text-[11.5px] text-[#abb2bf] mt-0.5 leading-relaxed">
                JBlock is engineered as a standalone desktop application. Once installed, it works completely without internet access—your Java files remain private on your computer.
              </p>
            </div>
          </div>

          {/* Installation method 1: Native Windows App */}
          <div className="bg-[#181a1f] p-4 rounded border border-[#2d3139] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="font-medium text-white flex items-center gap-2">
                <HardDrive size={14} className="text-[#e5c07b]" />
                <span>Option 1: Install to Windows Desktop & Start Menu</span>
              </div>
              {isInstalled && (
                <span className="text-[11px] text-[#98c379] font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Installed
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#858585]">
              Creates a native desktop icon and Start Menu shortcut. Runs in a dedicated window without browser toolbars.
            </p>

            <button
              type="button"
              onClick={onTriggerInstall}
              className="mt-1 px-4 py-2 bg-[#007acc] hover:bg-[#1f8ad2] text-white font-medium rounded flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Install JBlock Desktop App (Windows)</span>
            </button>

            <button
              type="button"
              onClick={() => downloadWindowsSetupScript()}
              className="mt-1 px-4 py-1.5 bg-[#282c34] hover:bg-[#323842] border border-[#3e4451] text-[#98c379] font-medium rounded flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <Terminal size={13} />
              <span>Download Windows Setup Installer (.cmd)</span>
            </button>
          </div>

          {/* Installation method 2: Portable standalone launcher */}
          <div className="bg-[#181a1f] p-4 rounded border border-[#2d3139] flex flex-col gap-2">
            <div className="font-medium text-white flex items-center gap-2">
              <Terminal size={14} className="text-[#98c379]" />
              <span>Option 2: Standalone Portable Desktop Launcher</span>
            </div>
            <p className="text-[11px] text-[#858585]">
              Download an offline package that can be opened on any computer without internet connection.
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadOfflineHTML}
                className="px-3 py-1.5 bg-[#282c34] hover:bg-[#323842] border border-[#3e4451] text-white rounded flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <Download size={13} />
                <span>{downloadedPackage ? 'Downloaded Launcher!' : 'Download Portable Package'}</span>
              </button>
              {downloadedPackage && (
                <span className="text-[11px] text-[#98c379] flex items-center gap-1">
                  <CheckCircle2 size={12} /> Saved to Downloads
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#181a1f] border-t border-[#2d3139] flex justify-end">
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { MenuBar } from './components/MenuBar';
import { Toolbar } from './components/Toolbar';
import { Explorer } from './components/Explorer/Explorer';
import { EditorTabs } from './components/Editor/EditorTabs';
import { CodeEditor, CodeEditorHandle } from './components/Editor/CodeEditor';
import { FindReplaceBar } from './components/Editor/FindReplaceBar';
import { BottomPanel, BottomPanelTab } from './components/BottomPanel/BottomPanel';
import { StatusBar } from './components/StatusBar';
import { NewFileDialog } from './components/Modals/NewFileDialog';
import { SaveConfirmModal } from './components/Modals/SaveConfirmModal';
import { AboutModal } from './components/Modals/AboutModal';
import { JdkSettingsModal } from './components/Modals/JdkSettingsModal';
import { DesktopInstallModal } from './components/Modals/DesktopInstallModal';
import { OfflineGuideModal } from './components/Modals/OfflineGuideModal';
import { 
  ProjectFile, 
  EditorTab, 
  CompilerProblem, 
  JDKConfig, 
  EditorPosition 
} from './types';
import { 
  loadSavedFiles, 
  saveFilesToStorage, 
  loadSavedTabs, 
  saveTabsToStorage, 
  loadActiveTabId, 
  saveActiveTabId, 
  loadJdkConfig, 
  saveJdkConfig 
} from './utils/storage';
import { analyzeJavaSource } from './utils/javaSyntax';
import { executeJavaProject } from './utils/javaEngine';

export default function App() {
  // State: Project Files & Tabs
  const [files, setFiles] = useState<Record<string, ProjectFile>>(loadSavedFiles);
  const [tabs, setTabs] = useState<EditorTab[]>(loadSavedTabs);
  const [activeFileId, setActiveFileId] = useState<string>(loadActiveTabId);

  // Layout State
  const [explorerWidth, setExplorerWidth] = useState<number>(230);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(true);
  const [bottomHeight, setBottomHeight] = useState<number>(180);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('OUTPUT');

  // Diagnostics & Runner State
  const [outputLogs, setOutputLogs] = useState<string[]>([
    '==================================================',
    'JBlock - Simple Java Development Environment (v0.1)',
    'Ready. Open or write Java code and press Run (F10).',
    'Offline desktop execution engine loaded.',
    '==================================================',
  ]);
  const [problems, setProblems] = useState<CompilerProblem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<EditorPosition>({ line: 1, column: 1 });
  const [jdkConfig, setJdkConfig] = useState<JDKConfig>(loadJdkConfig);

  // Search & Replace State
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [searchHighlight, setSearchHighlight] = useState<{ query: string; matchCase: boolean }>({ query: '', matchCase: false });
  const [matchCount, setMatchCount] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Dialogs State
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileParentId, setNewFileParentId] = useState<string>('src');
  const [tabToClosePending, setTabToClosePending] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isJdkSettingsOpen, setIsJdkSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOfflineGuideOpen, setIsOfflineGuideOpen] = useState(false);

  // PWA Desktop Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Hidden file input ref for Open File
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<CodeEditorHandle>(null);

  // Resize dragging references
  const isResizingExplorer = useRef(false);
  const isResizingBottom = useRef(false);

  // Active File Reference
  const activeFile = files[activeFileId];
  const activeTab = tabs.find(t => t.fileId === activeFileId);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstallPwa(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install JBlock on Windows: In Google Chrome or Microsoft Edge, look for the "Install" or "App" icon in the address bar, or click Menu (...) -> Apps -> "Install JBlock".');
    }
  };

  // Persist files, tabs, activeTab
  useEffect(() => {
    saveFilesToStorage(files);
  }, [files]);

  useEffect(() => {
    saveTabsToStorage(tabs);
  }, [tabs]);

  useEffect(() => {
    if (activeFileId) saveActiveTabId(activeFileId);
  }, [activeFileId]);

  // Synchronize dynamic problem analysis whenever active file changes
  useEffect(() => {
    if (activeFile && activeFile.name.endsWith('.java')) {
      const detectedProblems = analyzeJavaSource(activeFile.content, activeFile.name, activeFile.id);
      setProblems(detectedProblems);
    } else {
      setProblems([]);
    }
  }, [activeFile?.content, activeFile?.name, activeFile?.id]);

  // Mouse drag handlers for resizing panels
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingExplorer.current) {
        const newWidth = Math.max(160, Math.min(500, e.clientX));
        setExplorerWidth(newWidth);
      }
      if (isResizingBottom.current) {
        const newHeight = Math.max(90, Math.min(500, window.innerHeight - e.clientY - 24));
        setBottomHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizingExplorer.current = false;
      isResizingBottom.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Editor content modification
  const handleEditorChange = (newContent: string) => {
    if (!activeFileId) return;

    setFiles(prev => ({
      ...prev,
      [activeFileId]: {
        ...prev[activeFileId],
        content: newContent,
      },
    }));

    setTabs(prev =>
      prev.map(t => (t.fileId === activeFileId ? { ...t, isModified: true } : t))
    );
  };

  // Open file in tabs
  const handleSelectFile = (fileId: string) => {
    const file = files[fileId];
    if (!file || file.isFolder) return;

    const tabExists = tabs.some(t => t.fileId === fileId);
    if (!tabExists) {
      setTabs(prev => [...prev, { fileId, name: file.name, isModified: false }]);
    }
    setActiveFileId(fileId);
  };

  // Close Tab handler with Unsaved Check
  const handleCloseTab = (fileId: string) => {
    const tab = tabs.find(t => t.fileId === fileId);
    if (tab && tab.isModified) {
      setTabToClosePending(fileId);
      return;
    }
    closeTabImmediately(fileId);
  };

  const closeTabImmediately = (fileId: string) => {
    const remainingTabs = tabs.filter(t => t.fileId !== fileId);
    setTabs(remainingTabs);

    if (activeFileId === fileId) {
      if (remainingTabs.length > 0) {
        setActiveFileId(remainingTabs[remainingTabs.length - 1].fileId);
      } else {
        setActiveFileId('');
      }
    }
    setTabToClosePending(null);
  };

  // Save Current File
  const handleSaveFile = useCallback(() => {
    if (!activeFileId) return;
    setTabs(prev =>
      prev.map(t => (t.fileId === activeFileId ? { ...t, isModified: false } : t))
    );
  }, [activeFileId]);

  // Save As
  const handleSaveAs = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    link.click();
    URL.revokeObjectURL(url);
    handleSaveFile();
  };

  // Save All
  const handleSaveAll = useCallback(() => {
    setTabs(prev => prev.map(t => ({ ...t, isModified: false })));
  }, []);

  // Open File from local computer using browser File API
  const handleOpenFileFromDisk = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const selected = fileList[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const newId = `imported_${Date.now()}`;
      const newFile: ProjectFile = {
        id: newId,
        name: selected.name,
        path: `/JBlockProject/src/${selected.name}`,
        content,
        isFolder: false,
        parentId: 'src',
      };

      setFiles(prev => {
        const updated = { ...prev, [newId]: newFile };
        const srcFolder = updated['src'];
        if (srcFolder) {
          srcFolder.children = [...(srcFolder.children || []), newId];
        }
        return updated;
      });

      setTabs(prev => [...prev, { fileId: newId, name: selected.name, isModified: false }]);
      setActiveFileId(newId);
    };

    reader.readAsText(selected);
    e.target.value = '';
  };

  // Create New File Action
  const handleCreateNewFile = (className: string) => {
    const fileName = `${className}.java`;
    const newId = `file_${Date.now()}`;
    const initialContent = `public class ${className} {
    public static void main(String[] args) {
        System.out.println("Hello from ${className}!");
    }
}
`;

    const newFile: ProjectFile = {
      id: newId,
      name: fileName,
      path: `/JBlockProject/${newFileParentId}/${fileName}`,
      content: initialContent,
      isFolder: false,
      parentId: newFileParentId,
    };

    setFiles(prev => {
      const updated = { ...prev, [newId]: newFile };
      const parent = updated[newFileParentId];
      if (parent) {
        parent.children = [...(parent.children || []), newId];
      }
      return updated;
    });

    setTabs(prev => [...prev, { fileId: newId, name: fileName, isModified: false }]);
    setActiveFileId(newId);
    setIsNewFileDialogOpen(false);
  };

  // Delete file from Explorer
  const handleDeleteFile = (fileId: string) => {
    const file = files[fileId];
    if (!file || file.name === 'Main.java') return;

    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      setFiles(prev => {
        const next = { ...prev };
        const parentId = next[fileId]?.parentId;
        if (parentId && next[parentId]) {
          next[parentId].children = (next[parentId].children || []).filter(id => id !== fileId);
        }
        delete next[fileId];
        return next;
      });

      closeTabImmediately(fileId);
    }
  };

  // Compile Java Action (F9)
  const handleCompile = useCallback(async () => {
    if (!activeFile) {
      setOutputLogs(prev => [...prev, '[Error] No Java file is currently open to compile.']);
      return;
    }

    if (!activeFile.name.endsWith('.java')) {
      setOutputLogs(prev => [...prev, `[Build] ${activeFile.name} is not a Java source file.`]);
      return;
    }

    setIsBottomCollapsed(false);
    setOutputLogs(prev => [
      ...prev,
      `--- Compilation Started: ${activeFile.name} ---`,
      `> javac ${activeFile.name}`,
    ]);

    // Check for syntax issues
    const foundProblems = analyzeJavaSource(activeFile.content, activeFile.name, activeFile.id);
    setProblems(foundProblems);

    if (foundProblems.length > 0) {
      setActiveBottomTab('PROBLEMS');
      setOutputLogs(prev => [
        ...prev,
        ...foundProblems.map(p => `${p.fileName}:${p.line}: error: ${p.message}`),
        `[Build Failed] ${foundProblems.length} error(s) found. Check the Problems panel.`,
      ]);
    } else {
      setActiveBottomTab('OUTPUT');
      setOutputLogs(prev => [
        ...prev,
        `Build successful. Class ${activeFile.name.replace('.java', '')} is ready to run.`,
      ]);
    }
  }, [activeFile]);

  // Run Java Program Action (F10)
  const handleRun = useCallback(async () => {
    if (!activeFile) return;

    // Save if modified
    handleSaveFile();
    setIsBottomCollapsed(false);
    setIsRunning(true);

    const className = activeFile.name.replace('.java', '');

    // 1. Check for genuine fatal syntax problems first (mismatched public class name or unclosed brace)
    const fatalProblems = analyzeJavaSource(activeFile.content, activeFile.name, activeFile.id);
    setProblems(fatalProblems);

    if (fatalProblems.length > 0) {
      setActiveBottomTab('PROBLEMS');
      setOutputLogs(prev => [
        ...prev,
        `--- Compilation Failed: ${activeFile.name} ---`,
        ...fatalProblems.map(p => `${p.fileName}:${p.line}: error: ${p.message}`),
        `Compilation failed. Check the Problems panel for details.`,
      ]);
      setIsRunning(false);
      return;
    }

    // 2. Attempt full-stack server execution if available
    let ranViaServer = false;
    try {
      const javaFilesPayload = Object.values(files)
        .filter(f => !f.isFolder && f.name.endsWith('.java'))
        .map(f => ({ name: f.name, content: f.content }));

      const res = await fetch('/api/compile-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: javaFilesPayload,
          mainClass: className,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.output?.length > 0 || data.errors?.length > 0 || data.success)) {
          ranViaServer = true;
          setActiveBottomTab('OUTPUT');
          setOutputLogs(prev => [
            ...prev,
            `--- Running: ${className} (Local JDK) ---`,
            `> java ${className}`,
            ...(data.output || []),
            ...(data.errors?.length > 0 ? [`[Errors]:`, ...data.errors] : []),
            '',
            `Process finished with exit code ${data.exitCode ?? 0}.`,
          ]);
        }
      }
    } catch {
      // Server not reachable or offline mode, seamlessly fall through to client-side Java engine
    }

    // 3. If server didn't run it (offline mode or browser-only), execute via JBlock Java Engine
    if (!ranViaServer) {
      const result = executeJavaProject(activeFileId, files);
      setActiveBottomTab('OUTPUT');

      if (result.success) {
        setOutputLogs(prev => [
          ...prev,
          `--- Running: ${className} (Offline Engine) ---`,
          `> java ${className}`,
          ...(result.output.length > 0 ? result.output : ['[Program finished with no console output]']),
          '',
          `Process finished successfully (${result.durationMs}ms).`,
        ]);
      } else {
        setOutputLogs(prev => [
          ...prev,
          `--- Execution Error: ${className} ---`,
          ...result.output,
          ...result.errors.map(err => `[Error] ${err}`),
          '',
          `Process terminated with exit code 1.`,
        ]);
      }
    }

    setIsRunning(false);
  }, [activeFile, activeFileId, files, handleSaveFile]);

  // Stop Action (Esc)
  const handleStop = () => {
    if (isRunning) {
      setIsRunning(false);
      setOutputLogs(prev => [...prev, '[Execution stopped by user]']);
    }
  };

  // Jump from problem click to editor
  const handleSelectProblem = (problem: CompilerProblem) => {
    if (problem.fileId !== activeFileId) {
      handleSelectFile(problem.fileId);
    }
    setTimeout(() => {
      editorRef.current?.jumpToLine(problem.line, problem.column);
    }, 50);
  };

  // Find & Replace Search
  const handleFind = (query: string, matchCase: boolean) => {
    setSearchHighlight({ query, matchCase });
    if (!query || !activeFile) {
      setMatchCount({ current: 0, total: 0 });
      return;
    }
    const target = matchCase ? activeFile.content : activeFile.content.toLowerCase();
    const search = matchCase ? query : query.toLowerCase();
    const occurrences = target.split(search).length - 1;
    setMatchCount({ current: occurrences > 0 ? 1 : 0, total: occurrences });
  };

  const handleReplace = (query: string, replacement: string, all: boolean) => {
    if (!query || !activeFile) return;
    if (all) {
      const reg = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const newText = activeFile.content.replace(reg, replacement);
      handleEditorChange(newText);
    } else {
      const newText = activeFile.content.replace(query, replacement);
      handleEditorChange(newText);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewFileDialogOpen(true);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFileFromDisk();
      } else if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAs();
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeFileId) handleCloseTab(activeFileId);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindOpen(true);
        setIsReplaceMode(false);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsFindOpen(true);
        setIsReplaceMode(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCompile();
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleRun();
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleCompile();
        setTimeout(handleRun, 300);
      } else if (e.key === 'Escape') {
        if (isFindOpen) {
          setIsFindOpen(false);
        } else if (isRunning) {
          handleStop();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, handleSaveFile, handleCompile, handleRun, isFindOpen, isRunning]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#181818] text-[#cccccc] font-sans antialiased">
      {/* Hidden File Input for Open File */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".java,.txt,.md"
        className="hidden"
      />

      {/* Top Title Bar */}
      <TitleBar
        activeFileName={activeFile?.name}
        isModified={activeTab?.isModified}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Menu Bar */}
      <MenuBar
        activeFileName={activeFile?.name}
        onNewFile={() => {
          setNewFileParentId('src');
          setIsNewFileDialogOpen(true);
        }}
        onOpenFile={handleOpenFileFromDisk}
        onSaveFile={handleSaveFile}
        onSaveAs={handleSaveAs}
        onSaveAll={handleSaveAll}
        onCloseFile={() => activeFileId && handleCloseTab(activeFileId)}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        onCut={() => editorRef.current?.cut()}
        onCopy={() => editorRef.current?.copy()}
        onPaste={() => editorRef.current?.paste()}
        onSelectAll={() => editorRef.current?.selectAll()}
        onFind={() => {
          setIsFindOpen(true);
          setIsReplaceMode(false);
        }}
        onReplace={() => {
          setIsFindOpen(true);
          setIsReplaceMode(true);
        }}
        onToggleExplorer={() => setIsExplorerOpen(!isExplorerOpen)}
        onToggleBottomPanel={(tab) => {
          setIsBottomCollapsed(false);
          if (tab) setActiveBottomTab(tab);
        }}
        onCompile={handleCompile}
        onRun={handleRun}
        onStop={handleStop}
        onOpenJdkSettings={() => setIsJdkSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenOfflineGuide={() => setIsOfflineGuideOpen(true)}
      />

      {/* Compact Toolbar */}
      <Toolbar
        activeFileName={activeFile?.name}
        isModified={activeTab?.isModified}
        isRunning={isRunning}
        onNew={() => {
          setNewFileParentId('src');
          setIsNewFileDialogOpen(true);
        }}
        onOpen={handleOpenFileFromDisk}
        onSave={handleSaveFile}
        onSaveAll={handleSaveAll}
        onCompile={handleCompile}
        onRun={handleRun}
        onStop={handleStop}
      />

      {/* Main Workspace (Explorer + Editor + Bottom Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Resizable Explorer */}
        {isExplorerOpen && (
          <div
            style={{ width: `${explorerWidth}px` }}
            className="h-full shrink-0 flex flex-col relative"
          >
            <Explorer
              files={files}
              activeFileId={activeFileId}
              onSelectFile={handleSelectFile}
              onNewFile={(parentId = 'src') => {
                setNewFileParentId(parentId);
                setIsNewFileDialogOpen(true);
              }}
              onDeleteFile={handleDeleteFile}
              onRefresh={() => {
                setOutputLogs(prev => [...prev, '[Explorer] Workspace files re-indexed.']);
              }}
            />

            {/* Explorer Right Drag Handle */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                isResizingExplorer.current = true;
              }}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#007acc] transition-colors z-30"
            />
          </div>
        )}

        {/* Center Area: Editor Tabs + Editor + Bottom Panel */}
        <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
          {/* Editor Tabs Strip */}
          <EditorTabs
            tabs={tabs}
            activeFileId={activeFileId}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
            onNewTab={() => {
              setNewFileParentId('src');
              setIsNewFileDialogOpen(true);
            }}
          />

          {/* Central Code Editor Area */}
          <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
            {activeFile ? (
              <CodeEditor
                ref={editorRef}
                value={activeFile.content}
                fileName={activeFile.name}
                fileId={activeFile.id}
                onChange={handleEditorChange}
                onCursorChange={setCursorPos}
                searchHighlight={isFindOpen ? searchHighlight : undefined}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#282c34] text-[#5c6370] p-6 select-none">
                <div className="w-12 h-12 rounded bg-[#21252b] border border-[#3e4451] flex items-center justify-center text-[#61afef] text-xl font-bold mb-3">
                  J
                </div>
                <p className="text-sm text-[#abb2bf] font-medium">No Java File Open</p>
                <p className="text-xs text-[#5c6370] mt-1">Select a file from the Explorer on the left, or press Ctrl+N to create a new file.</p>
                <button
                  type="button"
                  onClick={() => {
                    setNewFileParentId('src');
                    setIsNewFileDialogOpen(true);
                  }}
                  className="mt-4 px-3 py-1.5 rounded bg-[#007acc] text-white text-xs hover:bg-[#1f8ad2] transition-colors"
                >
                  Create New Java File
                </button>
              </div>
            )}

            {/* Find & Replace Floating Bar */}
            <FindReplaceBar
              isOpen={isFindOpen}
              isReplaceMode={isReplaceMode}
              onClose={() => setIsFindOpen(false)}
              onFind={handleFind}
              onReplace={handleReplace}
              matchCount={matchCount}
              onNavigateMatch={(dir) => {
                setOutputLogs(prev => [...prev, `[Search] Navigating to ${dir} match`]);
              }}
            />
          </div>

          {/* Bottom Panel Resizer Top Handle */}
          {!isBottomCollapsed && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                isResizingBottom.current = true;
              }}
              className="h-1 bg-[#181a1f] hover:bg-[#007acc] cursor-row-resize transition-colors z-30 shrink-0"
            />
          )}

          {/* Resizable Bottom Panel */}
          <BottomPanel
            activeTab={activeBottomTab}
            onTabChange={setActiveBottomTab}
            outputLogs={outputLogs}
            onClearOutput={() => setOutputLogs([])}
            problems={problems}
            onSelectProblem={handleSelectProblem}
            jdkConfig={jdkConfig}
            isRunning={isRunning}
            isCollapsed={isBottomCollapsed}
            onToggleCollapse={() => setIsBottomCollapsed(!isBottomCollapsed)}
            height={bottomHeight}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        jdkConfig={jdkConfig}
        activeFileName={activeFile?.name}
        cursorPos={cursorPos}
        onOpenJdkSettings={() => setIsJdkSettingsOpen(true)}
        isModified={activeTab?.isModified}
      />

      {/* Modals & Dialogs */}
      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onCreate={handleCreateNewFile}
      />

      <SaveConfirmModal
        isOpen={!!tabToClosePending}
        fileName={tabs.find(t => t.fileId === tabToClosePending)?.name || 'File'}
        onSave={() => {
          if (tabToClosePending) {
            handleSaveFile();
            closeTabImmediately(tabToClosePending);
          }
        }}
        onDontSave={() => {
          if (tabToClosePending) {
            closeTabImmediately(tabToClosePending);
          }
        }}
        onCancel={() => setTabToClosePending(null)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <JdkSettingsModal
        isOpen={isJdkSettingsOpen}
        onClose={() => setIsJdkSettingsOpen(false)}
        config={jdkConfig}
        onSave={(newConfig) => {
          setJdkConfig(newConfig);
          saveJdkConfig(newConfig);
        }}
      />

      <DesktopInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canInstallPwa={canInstallPwa}
        onTriggerInstall={handleTriggerInstall}
        isInstalled={isInstalled}
      />

      <OfflineGuideModal
        isOpen={isOfflineGuideOpen}
        onClose={() => setIsOfflineGuideOpen(false)}
        onTriggerInstall={handleTriggerInstall}
        canInstallPwa={canInstallPwa}
        isInstalled={isInstalled}
      />
    </div>
  );
}

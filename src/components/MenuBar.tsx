import React, { useState, useEffect, useRef } from 'react';

interface MenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface MenuDef {
  label: string;
  items: MenuItem[];
}

interface MenuBarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAs: () => void;
  onSaveAll: () => void;
  onCloseFile: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFind: () => void;
  onReplace: () => void;
  onToggleExplorer: () => void;
  onToggleBottomPanel: (tab?: 'OUTPUT' | 'PROBLEMS' | 'TERMINAL') => void;
  onCompile: () => void;
  onRun: () => void;
  onStop: () => void;
  onOpenJdkSettings: () => void;
  onOpenAbout: () => void;
  onOpenInstallModal?: () => void;
  onOpenOfflineGuide?: () => void;
  activeFileName?: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSaveAs,
  onSaveAll,
  onCloseFile,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onFind,
  onReplace,
  onToggleExplorer,
  onToggleBottomPanel,
  onCompile,
  onRun,
  onStop,
  onOpenJdkSettings,
  onOpenAbout,
  onOpenInstallModal,
  onOpenOfflineGuide,
}) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenuIndex(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'New Java File', shortcut: 'Ctrl+N', action: onNewFile },
        { label: 'New Project...', action: () => alert('Project creation will be available in V0.2. Currently editing JBlockProject.') },
        { label: 'Open File...', shortcut: 'Ctrl+O', action: onOpenFile },
        { label: 'Open Project...', action: () => alert('Use Explorer to browse files in JBlockProject.') },
        { label: '', action: () => {}, separator: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: onSaveFile },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
        { label: 'Save All', action: onSaveAll },
        { label: '', action: () => {}, separator: true },
        ...(onOpenInstallModal ? [{ label: 'Install Desktop App...', action: onOpenInstallModal }] : []),
        { label: 'Close File', shortcut: 'Ctrl+W', action: onCloseFile },
        { label: 'Exit', action: () => window.close() },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: onRedo },
        { label: '', action: () => {}, separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: onCut },
        { label: 'Copy', shortcut: 'Ctrl+C', action: onCopy },
        { label: 'Paste', shortcut: 'Ctrl+V', action: onPaste },
        { label: 'Select All', shortcut: 'Ctrl+A', action: onSelectAll },
      ],
    },
    {
      label: 'Search',
      items: [
        { label: 'Find', shortcut: 'Ctrl+F', action: onFind },
        { label: 'Replace', shortcut: 'Ctrl+H', action: onReplace },
        { label: 'Find Next', shortcut: 'F3', action: onFind },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Explorer', action: onToggleExplorer },
        { label: 'Output Panel', action: () => onToggleBottomPanel('OUTPUT') },
        { label: 'Problems Panel', action: () => onToggleBottomPanel('PROBLEMS') },
        { label: 'Terminal Panel', action: () => onToggleBottomPanel('TERMINAL') },
      ],
    },
    {
      label: 'Project',
      items: [
        { label: 'New Project...', action: () => alert('Project template wizard scheduled for V0.3') },
        { label: 'Add Java File...', shortcut: 'Ctrl+N', action: onNewFile },
        { label: 'Remove Java File', action: onCloseFile },
      ],
    },
    {
      label: 'Build',
      items: [
        { label: 'Compile', shortcut: 'F9', action: onCompile },
        { label: 'Clean', action: () => alert('Build cache cleaned. All outputs reset.') },
        { label: 'Build Project', shortcut: 'F11', action: onCompile },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Run', shortcut: 'F10', action: onRun },
        { label: 'Run Without Debugging', shortcut: 'Ctrl+F5', action: onRun },
        { label: 'Stop', shortcut: 'Esc', action: onStop },
      ],
    },
    {
      label: 'Settings',
      items: [
        { label: 'Java Settings (JDK)...', action: onOpenJdkSettings },
        { label: 'Editor Settings...', action: () => alert('Editor Settings: Font: JetBrains Mono 14px, Tab size: 4 spaces, UTF-8 LF.') },
        { label: 'Appearance', action: () => alert('Theme: JBlock Dark IDE Charcoal (Standard)') },
      ],
    },
    {
      label: 'Help',
      items: [
        ...(onOpenOfflineGuide ? [{ label: 'Offline Usage & Installation Guide...', action: onOpenOfflineGuide }] : []),
        ...(onOpenInstallModal ? [{ label: 'Install Desktop App...', action: onOpenInstallModal }] : []),
        { label: '', action: () => {}, separator: true },
        { label: 'Documentation', action: onOpenAbout },
        { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+/', action: onOpenAbout },
        { label: '', action: () => {}, separator: true },
        { label: 'About JBlock', action: onOpenAbout },
      ],
    },
  ];

  return (
    <div ref={containerRef} className="flex items-center text-xs text-[#cccccc] select-none h-6 px-1 bg-[#1e1e1e] border-b border-[#2d2d2d]">
      {menus.map((menu, index) => {
        const isOpen = openMenuIndex === index;
        return (
          <div key={menu.label} className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuIndex(isOpen ? null : index)}
              onMouseEnter={() => {
                if (openMenuIndex !== null) setOpenMenuIndex(index);
              }}
              className={`px-2 py-0.5 rounded-sm hover:bg-[#333333] transition-colors focus:outline-none ${
                isOpen ? 'bg-[#333333] text-white' : ''
              }`}
            >
              {menu.label}
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#252526] border border-[#3e3e42] shadow-xl py-1 z-50 rounded-sm">
                {menu.items.map((item, itemIdx) => {
                  if (item.separator) {
                    return <div key={`sep-${itemIdx}`} className="h-px bg-[#333333] my-1" />;
                  }
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        setOpenMenuIndex(null);
                        item.action();
                      }}
                      className="w-full text-left px-3 py-1 flex items-center justify-between text-xs text-[#d4d4d4] hover:bg-[#094771] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-[#858585] group-hover:text-white font-mono text-[10px]">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

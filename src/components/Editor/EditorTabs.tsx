import React from 'react';
import { X, FileCode, FileText, Plus } from 'lucide-react';
import { EditorTab } from '../../types';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onNewTab: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  const getFileIcon = (name: string) => {
    if (name.endsWith('.java')) {
      return <FileCode size={13} className="text-[#e5c07b] shrink-0" />;
    }
    return <FileText size={13} className="text-[#98c379] shrink-0" />;
  };

  return (
    <div className="h-9 bg-[#21252b] border-b border-[#181a1f] flex items-center overflow-x-auto select-none no-scrollbar">
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.fileId === activeFileId;
          return (
            <div
              key={tab.fileId}
              onClick={() => onSelectTab(tab.fileId)}
              className={`h-full flex items-center gap-2 px-3 text-xs border-r border-[#181a1f] cursor-pointer group transition-colors min-w-[120px] max-w-[200px] ${
                isActive
                  ? 'bg-[#282c34] text-white border-t-2 border-t-[#61afef]'
                  : 'bg-[#21252b] text-[#abb2bf] hover:bg-[#252a32] border-t-2 border-t-transparent'
              }`}
            >
              {getFileIcon(tab.name)}
              <span className="truncate font-mono text-[11.5px] flex-1">
                {tab.name}
              </span>

              {/* Unsaved indicator asterisk or close button */}
              <div className="flex items-center">
                {tab.isModified && (
                  <span className="w-2 h-2 rounded-full bg-[#d19a66] mr-1 group-hover:hidden" title="Unsaved changes" />
                )}
                <button
                  type="button"
                  title="Close tab (Ctrl+W)"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.fileId);
                  }}
                  className={`p-0.5 rounded hover:bg-[#3e4451] hover:text-white transition-colors ${
                    tab.isModified ? 'hidden group-hover:block text-[#abb2bf]' : 'text-[#5c6370] hover:text-[#abb2bf]'
                  }`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New tab button */}
      <button
        type="button"
        onClick={onNewTab}
        title="New Java File (Ctrl+N)"
        className="h-full px-2.5 flex items-center text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#282c34] transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  FilePlus, 
  FolderPlus, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ProjectFile } from '../../types';

interface ExplorerProps {
  files: Record<string, ProjectFile>;
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onNewFile: (parentFolderId?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRefresh?: () => void;
}

export const Explorer: React.FC<ExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onRefresh,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const renderFileIcon = (fileName: string) => {
    if (fileName.endsWith('.java')) {
      return <FileCode size={14} className="text-[#e5c07b] shrink-0" />;
    }
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return <FileText size={14} className="text-[#98c379] shrink-0" />;
    }
    return <FileText size={14} className="text-[#abb2bf] shrink-0" />;
  };

  const renderTreeItem = (fileId: string, depth = 0) => {
    const item = files[fileId];
    if (!item) return null;

    if (item.isFolder) {
      const isCollapsed = !!collapsedFolders[fileId];
      const children = item.children || [];

      return (
        <div key={item.id} className="select-none">
          <div
            onClick={() => toggleFolder(item.id)}
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
            className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-[#2a2d2e] cursor-pointer text-xs text-[#cccccc] font-normal group transition-colors"
          >
            <span className="text-[#858585] shrink-0">
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            {isCollapsed ? (
              <Folder size={14} className="text-[#61afef] shrink-0" />
            ) : (
              <FolderOpen size={14} className="text-[#61afef] shrink-0" />
            )}
            <span className="truncate font-medium text-[#d4d4d4]">{item.name}</span>

            {/* Quick action button to add file into this folder */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center pr-1 transition-opacity">
              <button
                type="button"
                title={`New Java File in ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNewFile(item.id);
                }}
                className="p-0.5 hover:text-white text-[#858585]"
              >
                <FilePlus size={12} />
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <div>
              {children.map(childId => renderTreeItem(childId, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isActive = activeFileId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => onSelectFile(item.id)}
        onDoubleClick={() => onSelectFile(item.id)}
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer text-xs transition-colors group ${
          isActive
            ? 'bg-[#37373d] text-white font-medium border-l-2 border-[#007acc]'
            : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'
        }`}
      >
        {renderFileIcon(item.name)}
        <span className="truncate flex-1 font-mono text-[11.5px]">{item.name}</span>

        {/* Delete action (except for Main.java) */}
        {item.name !== 'Main.java' && (
          <button
            type="button"
            title="Delete File"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(item.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-[#858585] hover:text-[#e06c75] p-0.5 transition-all"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#21252b] text-[#cccccc] select-none border-r border-[#181a1f]">
      {/* Explorer Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-[#181a1f] text-[11px] font-bold tracking-wider text-[#9da5b4]">
        <span>EXPLORER</span>
        <div className="flex items-center gap-1 text-[#6b717d]">
          <button
            type="button"
            title="New Java File"
            onClick={() => onNewFile('src')}
            className="p-1 hover:text-white rounded hover:bg-[#2c313a] transition-colors"
          >
            <FilePlus size={13} />
          </button>
          {onRefresh && (
            <button
              type="button"
              title="Refresh Explorer"
              onClick={onRefresh}
              className="p-1 hover:text-white rounded hover:bg-[#2c313a] transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1.5 focus:outline-none">
        {renderTreeItem('root', 0)}
      </div>

      {/* Project info footer */}
      <div className="p-2 border-t border-[#181a1f] text-[10px] text-[#5c6370] flex items-center justify-between">
        <span>Standard Java Project</span>
        <span>JDK 21</span>
      </div>
    </div>
  );
};

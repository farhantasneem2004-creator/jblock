import { ProjectFile, EditorTab, JDKConfig } from '../types';
import { INITIAL_FILES } from '../constants/initialFiles';

const STORAGE_KEYS = {
  FILES: 'jblock_files_v01',
  TABS: 'jblock_tabs_v01',
  ACTIVE_TAB: 'jblock_active_tab_v01',
  JDK_CONFIG: 'jblock_jdk_config_v01',
};

export const DEFAULT_JDK_CONFIG: JDKConfig = {
  version: '21',
  isDetected: true,
  path: 'C:\\Program Files\\Java\\jdk-21',
  javacAvailable: true,
  javaAvailable: true,
};

export function loadSavedFiles(): Record<string, ProjectFile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load saved files:', err);
  }
  return INITIAL_FILES;
}

export function saveFilesToStorage(files: Record<string, ProjectFile>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (err) {
    console.error('Failed to save files:', err);
  }
}

export function loadSavedTabs(): EditorTab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load tabs:', err);
  }
  return [
    { fileId: 'main_java', name: 'Main.java', isModified: false },
    { fileId: 'student_java', name: 'Student.java', isModified: false },
  ];
}

export function saveTabsToStorage(tabs: EditorTab[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  } catch (err) {
    console.error('Failed to save tabs:', err);
  }
}

export function loadActiveTabId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (raw) return raw;
  } catch {}
  return 'main_java';
}

export function saveActiveTabId(fileId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, fileId);
  } catch {}
}

export function loadJdkConfig(): JDKConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JDK_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_JDK_CONFIG;
}

export function saveJdkConfig(config: JDKConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JDK_CONFIG, JSON.stringify(config));
  } catch {}
}

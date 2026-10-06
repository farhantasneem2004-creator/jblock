export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  parentId: string | null;
  children?: string[]; // IDs of children if folder
}

export interface EditorTab {
  fileId: string;
  name: string;
  isModified: boolean;
}

export interface CompilerProblem {
  id: string;
  fileId: string;
  fileName: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  codeSnippet?: string;
}

export interface JDKConfig {
  version: string;
  isDetected: boolean;
  path: string;
  javacAvailable: boolean;
  javaAvailable: boolean;
}

export interface EditorPosition {
  line: number;
  column: number;
}

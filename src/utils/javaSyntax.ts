import { CompilerProblem } from '../types';

export interface Token {
  type: 'keyword' | 'type' | 'string' | 'char' | 'number' | 'comment' | 'annotation' | 'operator' | 'bracket' | 'method' | 'identifier' | 'text';
  text: string;
}

const KEYWORDS = new Set([
  'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'default', 'do', 'else', 'enum', 'extends', 'final', 'finally', 'for',
  'goto', 'if', 'implements', 'import', 'instanceof', 'interface', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while', 'record', 'sealed',
  'permits', 'var', 'yield'
]);

const BUILTIN_TYPES = new Set([
  'boolean', 'byte', 'char', 'short', 'int', 'long', 'float', 'double',
  'String', 'System', 'Object', 'Integer', 'Double', 'Float', 'Long', 'Short',
  'Byte', 'Character', 'Boolean', 'List', 'ArrayList', 'Map', 'HashMap',
  'Set', 'HashSet', 'Scanner', 'Math', 'StringBuilder', 'StringBuffer',
  'Exception', 'Throwable', 'PrintStream', 'Arrays', 'Collections', 'Void'
]);

const CONSTANTS = new Set(['true', 'false', 'null']);

export function tokenizeJavaLine(line: string, inMultiLineComment: boolean): { tokens: Token[]; stillInMultiComment: boolean } {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  if (inMultiLineComment) {
    const endComment = line.indexOf('*/');
    if (endComment === -1) {
      tokens.push({ type: 'comment', text: line });
      return { tokens, stillInMultiComment: true };
    } else {
      tokens.push({ type: 'comment', text: line.substring(0, endComment + 2) });
      i = endComment + 2;
    }
  }

  while (i < len) {
    const ch = line[i];

    // Single-line comment
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', text: line.substring(i) });
      break;
    }

    // Multi-line comment start
    if (ch === '/' && line[i + 1] === '*') {
      const endComment = line.indexOf('*/', i + 2);
      if (endComment === -1) {
        tokens.push({ type: 'comment', text: line.substring(i) });
        return { tokens, stillInMultiComment: true };
      } else {
        tokens.push({ type: 'comment', text: line.substring(i, endComment + 2) });
        i = endComment + 2;
        continue;
      }
    }

    // Annotation (@Override, etc.)
    if (ch === '@') {
      let j = i + 1;
      while (j < len && /[a-zA-Z0-9_]/.test(line[j])) {
        j++;
      }
      tokens.push({ type: 'annotation', text: line.substring(i, j) });
      i = j;
      continue;
    }

    // String literal
    if (ch === '"') {
      let j = i + 1;
      while (j < len) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', text: line.substring(i, j) });
      i = j;
      continue;
    }

    // Char literal
    if (ch === "'") {
      let j = i + 1;
      while (j < len) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === "'") {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'char', text: line.substring(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < len && /[0-9a-fA-FxX._LldDfF]/.test(line[j])) {
        j++;
      }
      tokens.push({ type: 'number', text: line.substring(i, j) });
      i = j;
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1;
      while (j < len && /[a-zA-Z0-9_$]/.test(line[j])) {
        j++;
      }
      const word = line.substring(i, j);

      // Check if followed by '(' -> method call
      let k = j;
      while (k < len && line[k] === ' ') k++;
      const isMethod = k < len && line[k] === '(';

      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (BUILTIN_TYPES.has(word)) {
        tokens.push({ type: 'type', text: word });
      } else if (CONSTANTS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (isMethod) {
        tokens.push({ type: 'method', text: word });
      } else {
        tokens.push({ type: 'identifier', text: word });
      }
      i = j;
      continue;
    }

    // Brackets
    if (/[{}()[\]]/.test(ch)) {
      tokens.push({ type: 'bracket', text: ch });
      i++;
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?:;.,]/.test(ch)) {
      tokens.push({ type: 'operator', text: ch });
      i++;
      continue;
    }

    // Whitespace and other characters
    tokens.push({ type: 'text', text: ch });
    i++;
  }

  return { tokens, stillInMultiComment: false };
}

/**
 * Validates Java source for genuine syntax errors without false positives on benign code.
 */
export function analyzeJavaSource(code: string, fileName: string, fileId: string): CompilerProblem[] {
  if (!fileName.endsWith('.java')) return [];

  const problems: CompilerProblem[] = [];
  const lines = code.split('\n');

  // Check 1: Check public class name matching file name
  const expectedClass = fileName.replace(/\.java$/, '');
  const publicClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  if (publicClassMatch) {
    const actualClass = publicClassMatch[1];
    if (actualClass !== expectedClass) {
      let classLine = 1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`public class ${actualClass}`)) {
          classLine = i + 1;
          break;
        }
      }
      problems.push({
        id: `mismatch-${classLine}`,
        fileId,
        fileName,
        line: classLine,
        column: 14,
        severity: 'error',
        message: `class ${actualClass} is public, should be declared in a file named ${actualClass}.java`,
        codeSnippet: `public class ${actualClass} { ... }`,
      });
    }
  }

  // Check 2: Check matching braces
  let openBraces = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip string literals and comments
    const stripped = line.replace(/\/\/.*$/, '').replace(/"(?:[^"\\]|\\.)*"/g, '');
    for (const c of stripped) {
      if (c === '{') openBraces++;
      if (c === '}') openBraces--;
    }
  }

  if (openBraces > 0) {
    problems.push({
      id: `unclosed-brace`,
      fileId,
      fileName,
      line: lines.length,
      column: 1,
      severity: 'error',
      message: `reached end of file while parsing (missing ${openBraces} closing brace '}')`,
    });
  } else if (openBraces < 0) {
    problems.push({
      id: `extra-brace`,
      fileId,
      fileName,
      line: lines.length,
      column: 1,
      severity: 'error',
      message: `class, interface, or enum expected (extra closing brace '}')`,
    });
  }

  // Check 3: Check missing semicolon ONLY on unambiguous completed statements
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const stripped = rawLine.replace(/\/\/.*$/, '').trim();
    if (!stripped) continue;

    // Ignore comments, annotations, brackets, control headers
    if (
      stripped.startsWith('/*') ||
      stripped.startsWith('*') ||
      stripped.startsWith('@') ||
      stripped.startsWith('package ') ||
      stripped.startsWith('import ') ||
      stripped.startsWith('class ') ||
      stripped.startsWith('public class ') ||
      stripped.startsWith('interface ') ||
      stripped.startsWith('public interface ') ||
      stripped.startsWith('if ') ||
      stripped.startsWith('if(') ||
      stripped.startsWith('else') ||
      stripped.startsWith('for ') ||
      stripped.startsWith('for(') ||
      stripped.startsWith('while ') ||
      stripped.startsWith('while(') ||
      stripped.startsWith('switch ') ||
      stripped.startsWith('switch(') ||
      stripped.startsWith('case ') ||
      stripped.startsWith('default:') ||
      stripped.startsWith('try') ||
      stripped.startsWith('catch') ||
      stripped.startsWith('finally') ||
      stripped.endsWith('{') ||
      stripped.endsWith('}') ||
      stripped.endsWith(';') ||
      stripped.endsWith(':') ||
      stripped.endsWith(',') ||
      stripped.endsWith('\\') ||
      stripped.includes('abstract ')
    ) {
      continue;
    }

    // An unambiguous statement line like:
    // System.out.println("something")
    // return x
    // int x = 10
    if (
      stripped.startsWith('System.out.print') ||
      stripped.startsWith('System.err.print') ||
      stripped.startsWith('return ') ||
      /^(?:int|double|float|boolean|char|String|long|short|byte)\s+[A-Za-z0-9_]+\s*=\s*[^;]+$/.test(stripped)
    ) {
      problems.push({
        id: `semicolon-${i + 1}`,
        fileId,
        fileName,
        line: i + 1,
        column: rawLine.length + 1,
        severity: 'error',
        message: `';' expected`,
        codeSnippet: stripped,
      });
    }
  }

  return problems;
}

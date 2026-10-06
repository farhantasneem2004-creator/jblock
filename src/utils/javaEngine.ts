/**
 * JBlock Java Execution Engine
 * Offline, standalone Java compiler & runtime simulation engine.
 * Transpiles Java classes into runnable JavaScript inside a safe, synchronous environment
 * with full stdout/stderr capture and infinite loop protection.
 */

import { ProjectFile } from '../types';

export interface ExecutionResult {
  success: boolean;
  output: string[];
  errors: string[];
  exitCode: number;
  durationMs: number;
}

export function executeJavaProject(
  activeFileId: string,
  files: Record<string, ProjectFile>,
  userInputValues: string[] = []
): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];
  const errors: string[] = [];

  const activeFile = files[activeFileId];
  if (!activeFile) {
    return {
      success: false,
      output: [],
      errors: ['No active file selected for execution.'],
      exitCode: 1,
      durationMs: 0,
    };
  }

  // Collect all .java files in the project
  const javaFiles = Object.values(files).filter(f => !f.isFolder && f.name.endsWith('.java'));
  const activeClassName = activeFile.name.replace(/\.java$/, '');

  // Custom output buffer
  let currentLineBuffer = '';
  const printHook = (text: any) => {
    const str = String(text ?? '');
    currentLineBuffer += str;
    if (currentLineBuffer.includes('\n')) {
      const parts = currentLineBuffer.split('\n');
      for (let i = 0; i < parts.length - 1; i++) {
        output.push(parts[i]);
      }
      currentLineBuffer = parts[parts.length - 1];
    }
  };

  const printlnHook = (text: any = '') => {
    const str = String(text ?? '');
    currentLineBuffer += str;
    output.push(currentLineBuffer);
    currentLineBuffer = '';
  };

  // Build combined source
  // Transpile Java classes into JavaScript
  try {
    let combinedTranspiled = `
    "use strict";
    const __output = [];
    let __lineBuffer = "";
    const System = {
      out: {
        print: function(msg) {
          __print(msg !== undefined ? msg : "");
        },
        println: function(msg) {
          __println(msg !== undefined ? msg : "");
        },
        printf: function(fmt, ...args) {
          __print(fmt);
        }
      },
      err: {
        print: function(msg) { __print(msg !== undefined ? msg : ""); },
        println: function(msg) { __println(msg !== undefined ? msg : ""); }
      },
      currentTimeMillis: function() { return Date.now(); }
    };

    // Scanner simulation
    let __inputPtr = 0;
    const __inputs = ${JSON.stringify(userInputValues)};
    function Scanner() {
      return {
        next: function() { return __inputs[__inputPtr++] || "input"; },
        nextLine: function() { return __inputs[__inputPtr++] || ""; },
        nextInt: function() { return parseInt(__inputs[__inputPtr++] || "0", 10); },
        nextDouble: function() { return parseFloat(__inputs[__inputPtr++] || "0.0"); },
        hasNext: function() { return __inputPtr < __inputs.length; }
      };
    }

    // Java String methods polyfill
    if (!String.prototype.charAt) {
      String.prototype.charAt = function(i) { return this[i] || ""; };
    }
    if (!String.prototype.equals) {
      String.prototype.equals = function(other) { return this.valueOf() === String(other).valueOf(); };
    }
    if (!String.prototype.equalsIgnoreCase) {
      String.prototype.equalsIgnoreCase = function(other) { return this.toLowerCase() === String(other).toLowerCase(); };
    }
    `;

    // Transpile other helper classes first, then the active class
    const otherFiles = javaFiles.filter(f => f.id !== activeFileId);
    for (const f of otherFiles) {
      combinedTranspiled += '\n' + transpileJavaClass(f.content, f.name);
    }
    // Now active class
    combinedTranspiled += '\n' + transpileJavaClass(activeFile.content, activeFile.name);

    // Call Main.main
    combinedTranspiled += `
    \n
    if (typeof ${activeClassName} !== 'undefined') {
      if (typeof ${activeClassName}.main === 'function') {
        ${activeClassName}.main([]);
      } else {
        throw new Error("Class ${activeClassName} does not have a 'public static void main(String[] args)' method.");
      }
    } else {
      throw new Error("Could not find class definition for ${activeClassName}.");
    }
    `;

    // Infinite loop protection by injecting loop counters
    combinedTranspiled = protectInfiniteLoops(combinedTranspiled);

    // Run in Function constructor sandbox
    const runner = new Function('__print', '__println', combinedTranspiled);
    runner(printHook, printlnHook);

    // Flush any leftover buffer
    if (currentLineBuffer.length > 0) {
      output.push(currentLineBuffer);
      currentLineBuffer = '';
    }

    const durationMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      output,
      errors: [],
      exitCode: 0,
      durationMs,
    };
  } catch (err: any) {
    if (currentLineBuffer.length > 0) {
      output.push(currentLineBuffer);
      currentLineBuffer = '';
    }

    let errorMsg = err.message || String(err);
    if (errorMsg.includes('Infinite loop detected')) {
      errorMsg = 'Runtime Error: Infinite loop detected (loop executed over 100,000 times).';
    } else if (errorMsg.includes('is not a function')) {
      errorMsg = `Runtime Error: Method call error: ${errorMsg}`;
    }

    errors.push(errorMsg);
    const durationMs = Math.round(performance.now() - startTime);

    return {
      success: false,
      output,
      errors,
      exitCode: 1,
      durationMs,
    };
  }
}

/**
 * Converts Java code to executable JavaScript
 */
function transpileJavaClass(source: string, fileName: string): string {
  let code = source;

  // 1. Remove package and imports
  code = code.replace(/package\s+[a-zA-Z0-9_.]+;/g, '');
  code = code.replace(/import\s+[a-zA-Z0-9_.*]+;/g, '');

  // 2. Remove annotations
  code = code.replace(/@Override\s*/g, '');
  code = code.replace(/@Deprecated\s*/g, '');

  // 3. Process classes
  // Change "public class X" / "class X"
  // In JavaScript ES6:
  // "public static void main(String[] args)" -> "static main(args)"
  // "public static int add(int a, int b)" -> "static add(a, b)"
  // "public void introduce()" -> "introduce()"
  // "public Student(String name, int age)" -> "constructor(name, age)"

  // Extract class name
  const classMatch = code.match(/class\s+([A-Za-z0-9_]+)(?:\s+extends\s+[A-Za-z0-9_]+)?/);
  const currentClassName = classMatch ? classMatch[1] : '';

  // Clean access modifiers: public, private, protected, final, synchronized, volatile
  // Replace Java constructors: "ClassName(...)" -> "constructor(...)"
  if (currentClassName) {
    const constructorRegex = new RegExp(`(?:public|private|protected)?\\s*${currentClassName}\\s*\\(([^)]*)\\)\\s*\\{`, 'g');
    code = code.replace(constructorRegex, 'constructor($1) {');
  }

  // Replace "public static void main(String[] args)" or "public static void main(String args[])"
  code = code.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, 'static main(args) {');

  // Replace static methods: "(public/private/protected)? static (type) methodName(params) {" -> "static methodName(params) {"
  code = code.replace(
    /(?:public|private|protected)?\s*static\s+(?:[A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g,
    'static $1($2) {'
  );

  // Replace instance methods: "(public/private/protected)? (type) methodName(params) {" -> "methodName(params) {"
  code = code.replace(
    /(?:public|private|protected)?\s*(?:void|int|double|float|boolean|char|String|long|short|byte|[A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g,
    '$1($2) {'
  );

  // Clean parameter types inside method arguments: e.g. "int a, int b" -> "a, b"
  // We can do this cleanly for method signatures
  code = code.replace(
    /((?:static\s+)?[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/g,
    (match) => {
      return match.replace(/(?:int|double|float|boolean|char|String|long|short|byte|[A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)/g, '$1');
    }
  );

  // Clean constructor arguments
  code = code.replace(
    /(constructor\s*\([^)]*\)\s*\{)/g,
    (match) => {
      return match.replace(/(?:int|double|float|boolean|char|String|long|short|byte|[A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)/g, '$1');
    }
  );

  // Clean field declarations inside class: e.g. "private String name;" -> "name;"
  // and "private int age = 10;" -> "age = 10;"
  code = code.replace(
    /(?:public|private|protected)?\s*(?:int|double|float|boolean|char|String|long|short|byte|[A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)(\s*=\s*[^;]+)?;/g,
    (match, varName, initVal) => {
      // In JS class body, fields can just be "name = val;" or inside constructor
      return `${varName}${initVal ? initVal : ' = null'};`;
    }
  );

  // Clean local variable declarations inside methods:
  // "int x = 5;" -> "let x = 5;"
  // "String s = "hello";" -> "let s = "hello";"
  // "Student s = new Student(...);" -> "let s = new Student(...);"
  // "for (int i = 0;" -> "for (let i = 0;"
  code = code.replace(
    /\b(?:int|double|float|boolean|char|String|long|short|byte|var|[A-Z][A-Za-z0-9_]*)(?:\[\])?\s+([A-Za-z0-9_]+)\s*(=|;|,)/g,
    'let $1 $2'
  );

  // Clean enhanced for loops: "for (Type item : items)" -> "for (let item of items)"
  code = code.replace(/for\s*\(\s*(?:let\s+)?([A-Za-z0-9_]+)\s*:\s*([^)]+)\)/g, 'for (let $1 of $2)');

  // Clean "boolean" literal comparisons or true/false
  // Handle "new int[5]" -> "new Array(5).fill(0)"
  code = code.replace(/new\s+(?:int|double|float|long|short|byte)\[(\d+|[A-Za-z0-9_]+)\]/g, 'new Array($1).fill(0)');
  code = code.replace(/new\s+String\[(\d+|[A-Za-z0-9_]+)\]/g, 'new Array($1).fill("")');
  code = code.replace(/new\s+boolean\[(\d+|[A-Za-z0-9_]+)\]/g, 'new Array($1).fill(false)');

  // Handle array literal { 1, 2, 3 } -> [ 1, 2, 3 ]
  code = code.replace(/=\s*\{\s*([^}]+)\s*\};/g, '= [$1];');

  // Handle .length -> in JS arrays and strings, length is a property .length,
  // but in Java String it's .length().
  // Let's support both .length() and .length:
  code = code.replace(/\.length\(\)/g, '.length');

  // Handle class definition: remove "public" keyword before class
  code = code.replace(/public\s+class\s+/g, 'class ');

  return code;
}

/**
 * Protects against infinite while/for loops by injecting a maximum iteration guard
 */
function protectInfiniteLoops(code: string): string {
  let loopId = 0;
  return code.replace(/(for|while)\s*\(([^)]+)\)\s*\{/g, (match, loopType, condition) => {
    loopId++;
    const guardVar = `__loopGuard_${loopId}`;
    return `let ${guardVar} = 0;\n${loopType} (${condition}) {\nif (++${guardVar} > 100000) { throw new Error("Infinite loop detected"); }\n`;
  });
}

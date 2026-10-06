import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { tokenizeJavaLine, analyzeJavaSource } from '../../utils/javaSyntax';
import { EditorPosition } from '../../types';

export interface CodeEditorHandle {
  focus: () => void;
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
  jumpToLine: (line: number, column?: number) => void;
  getContent: () => string;
}

interface CodeEditorProps {
  value: string;
  fileName: string;
  fileId: string;
  onChange: (newValue: string) => void;
  onCursorChange: (pos: EditorPosition) => void;
  searchHighlight?: { query: string; matchCase: boolean };
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({
  value,
  fileName,
  onChange,
  onCursorChange,
  searchHighlight,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const codePreRef = useRef<HTMLDivElement>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Cursor state
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  // Update cursor position and report to parent
  const updateCursorMetrics = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSelection({ start, end });

    const textBefore = textarea.value.substring(0, start);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    setCursorPos({ line, col });
    onCursorChange({ line, column: col });
  };

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (gutterRef.current) gutterRef.current.scrollTop = top;
      if (codePreRef.current) {
        codePreRef.current.scrollTop = top;
        codePreRef.current.scrollLeft = left;
      }
    }
  };

  // Expose imperatives for MenuBar / shortcuts
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    undo: () => {
      if (historyIndex > 0) {
        const prev = history[historyIndex - 1];
        setHistoryIndex(historyIndex - 1);
        onChange(prev);
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        const next = history[historyIndex + 1];
        setHistoryIndex(historyIndex + 1);
        onChange(next);
      }
    },
    cut: () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const selected = textarea.value.substring(start, end);
        navigator.clipboard.writeText(selected).catch(() => {});
        const newVal = textarea.value.substring(0, start) + textarea.value.substring(end);
        updateValue(newVal);
        setTimeout(() => {
          textarea.setSelectionRange(start, start);
        }, 0);
      }
    },
    copy: () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const selected = textarea.value.substring(start, end);
        navigator.clipboard.writeText(selected).catch(() => {});
      }
    },
    paste: async () => {
      try {
        const text = await navigator.clipboard.readText();
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newVal = textarea.value.substring(0, start) + text + textarea.value.substring(end);
        updateValue(newVal);
        const newPos = start + text.length;
        setTimeout(() => {
          textarea.setSelectionRange(newPos, newPos);
          updateCursorMetrics();
        }, 0);
      } catch {
        // clipboard access restricted
      }
    },
    selectAll: () => {
      textareaRef.current?.select();
    },
    jumpToLine: (targetLine: number, targetCol = 1) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const lines = textarea.value.split('\n');
      let charIndex = 0;
      for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
        charIndex += lines[i].length + 1; // +1 for \n
      }
      charIndex += Math.min(targetCol - 1, (lines[targetLine - 1] || '').length);

      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
      updateCursorMetrics();

      // Scroll into view
      const lineHeight = 21; // roughly 21px
      textarea.scrollTop = Math.max(0, (targetLine - 4) * lineHeight);
    },
    getContent: () => value,
  }));

  const updateValue = (newVal: string) => {
    onChange(newVal);
    // Push to history
    setHistory(prev => {
      const nextHist = prev.slice(0, historyIndex + 1);
      nextHist.push(newVal);
      if (nextHist.length > 50) nextHist.shift();
      return nextHist;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  };

  // Keyboard enhancements (Auto-indent, Tab, auto-close pairs)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // TAB or Shift+TAB
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = '    ';
      if (!e.shiftKey) {
        // Insert 4 spaces
        const newVal = value.substring(0, start) + tabSpaces + value.substring(end);
        updateValue(newVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
          updateCursorMetrics();
        }, 0);
      } else {
        // Dedent: if line starts with 4 spaces or less, remove them
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const linePrefix = value.substring(lineStart, lineStart + 4);
        const spacesToRemove = linePrefix.match(/^ +/)?.[0]?.length || 0;
        if (spacesToRemove > 0) {
          const newVal = value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove);
          updateValue(newVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - spacesToRemove);
            updateCursorMetrics();
          }, 0);
        }
      }
      return;
    }

    // ENTER: Auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const textBefore = value.substring(0, start);
      const lastNewLine = textBefore.lastIndexOf('\n');
      const currentLine = textBefore.substring(lastNewLine + 1);

      // Find leading whitespace
      const matchLeading = currentLine.match(/^[ \t]*/);
      let indent = matchLeading ? matchLeading[0] : '';

      // If line ended with '{', add 4 spaces
      const trimmedBefore = currentLine.trim();
      const extraIndent = trimmedBefore.endsWith('{');
      if (extraIndent) {
        indent += '    ';
      }

      // Check if cursor is right before '}'
      const charAfter = value.charAt(start);
      if (extraIndent && charAfter === '}') {
        const baseIndent = matchLeading ? matchLeading[0] : '';
        const insertion = '\n' + indent + '\n' + baseIndent;
        const newVal = value.substring(0, start) + insertion + value.substring(end);
        updateValue(newVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
          updateCursorMetrics();
        }, 0);
        return;
      }

      const newVal = value.substring(0, start) + '\n' + indent + value.substring(end);
      updateValue(newVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        updateCursorMetrics();
      }, 0);
      return;
    }

    // Auto-close pairs: (), {}, [], "", ''
    const pairs: Record<string, string> = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && start === end) {
      const openChar = e.key;
      const closeChar = pairs[openChar];

      // If typing a closing char when the next char is already that closing char, just move past it
      if (openChar === '"' || openChar === "'") {
        if (value.charAt(start) === openChar) {
          e.preventDefault();
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          updateCursorMetrics();
          return;
        }
      }

      e.preventDefault();
      const newVal = value.substring(0, start) + openChar + closeChar + value.substring(end);
      updateValue(newVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorMetrics();
      }, 0);
      return;
    }

    // Skip over closing bracket if typed
    if ((e.key === ')' || e.key === '}' || e.key === ']') && value.charAt(start) === e.key && start === end) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      updateCursorMetrics();
      return;
    }

    // Backspace: delete closing pair if deleting opening char
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = value.charAt(start - 1);
      const charAfter = value.charAt(start);
      if (
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'")
      ) {
        e.preventDefault();
        const newVal = value.substring(0, start - 1) + value.substring(start + 1);
        updateValue(newVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          updateCursorMetrics();
        }, 0);
        return;
      }
    }
  };

  // Split lines for render
  const lines = useMemo(() => value.split('\n'), [value]);

  // Bracket matching calculation
  const matchingBracketInfo = useMemo(() => {
    const pos = selection.start;
    if (pos < 0 || pos > value.length) return null;

    const charBefore = value[pos - 1];
    const charAt = value[pos];

    const bracketPairs: Record<string, { match: string; dir: number }> = {
      '(': { match: ')', dir: 1 },
      ')': { match: '(', dir: -1 },
      '{': { match: '}', dir: 1 },
      '}': { match: '{', dir: -1 },
      '[': { match: ']', dir: 1 },
      ']': { match: '[', dir: -1 },
    };

    let targetChar = '';
    let targetPos = -1;

    if (bracketPairs[charBefore]) {
      targetChar = charBefore;
      targetPos = pos - 1;
    } else if (bracketPairs[charAt]) {
      targetChar = charAt;
      targetPos = pos;
    } else {
      return null;
    }

    const { match, dir } = bracketPairs[targetChar];
    let depth = 0;
    let curr = targetPos;

    while (curr >= 0 && curr < value.length) {
      if (value[curr] === targetChar) depth++;
      else if (value[curr] === match) {
        depth--;
        if (depth === 0) {
          return { original: targetPos, partner: curr };
        }
      }
      curr += dir;
    }

    return null;
  }, [value, selection]);

  // Syntax highlight token color classes
  const getTokenClass = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'text-[#c678dd] font-semibold'; // Purple/magenta (public, class, static, etc.)
      case 'type':
        return 'text-[#e5c07b] font-medium'; // Warm gold (String, int, Student, etc.)
      case 'string':
      case 'char':
        return 'text-[#98c379]'; // Green ("Hello World")
      case 'number':
        return 'text-[#d19a66]'; // Orange (123)
      case 'comment':
        return 'text-[#5c6370] italic'; // Muted slate comment
      case 'annotation':
        return 'text-[#61afef]'; // Cyan/blue (@Override)
      case 'method':
        return 'text-[#61afef]'; // Blue (println, add)
      case 'operator':
        return 'text-[#56b6c2]'; // Cyan (+, -, =)
      case 'bracket':
        return 'text-[#abb2bf]'; // Slate grey
      default:
        return 'text-[#abb2bf]'; // Default identifier
    }
  };

  // Render tokens for syntax highlighting
  const renderedLines = useMemo(() => {
    let inMultiComment = false;
    let charOffsetCounter = 0;

    return lines.map((lineText, lineIdx) => {
      const lineStartChar = charOffsetCounter;
      charOffsetCounter += lineText.length + 1; // + \n

      const isCurrentLine = cursorPos.line === lineIdx + 1;
      const { tokens, stillInMultiComment } = tokenizeJavaLine(lineText, inMultiComment);
      inMultiComment = stillInMultiComment;

      let lineCharCounter = lineStartChar;

      return (
        <div
          key={lineIdx}
          className={`h-[21px] whitespace-pre px-4 leading-[21px] transition-colors ${
            isCurrentLine ? 'bg-[#2c313c]/60' : ''
          }`}
        >
          {tokens.length === 0 ? (
            <span>&#8203;</span>
          ) : (
            tokens.map((tok, tokIdx) => {
              const tokStart = lineCharCounter;
              lineCharCounter += tok.text.length;

              // Check if token contains matching bracket
              let isMatchedBracket = false;
              if (matchingBracketInfo) {
                if (
                  (tokStart <= matchingBracketInfo.original && matchingBracketInfo.original < tokStart + tok.text.length) ||
                  (tokStart <= matchingBracketInfo.partner && matchingBracketInfo.partner < tokStart + tok.text.length)
                ) {
                  isMatchedBracket = true;
                }
              }

              // Search highlight check
              let isSearchHit = false;
              if (
                searchHighlight &&
                searchHighlight.query.length > 0 &&
                (searchHighlight.matchCase
                  ? tok.text.includes(searchHighlight.query)
                  : tok.text.toLowerCase().includes(searchHighlight.query.toLowerCase()))
              ) {
                isSearchHit = true;
              }

              return (
                <span
                  key={tokIdx}
                  className={`${getTokenClass(tok.type)} ${
                    isMatchedBracket
                      ? 'bg-[#3e4451] ring-1 ring-[#61afef] rounded-xs font-bold text-white'
                      : ''
                  } ${isSearchHit ? 'bg-[#61afef]/40 text-white rounded-xs ring-1 ring-[#61afef]' : ''}`}
                >
                  {tok.text}
                </span>
              );
            })
          )}
        </div>
      );
    });
  }, [lines, cursorPos.line, matchingBracketInfo, searchHighlight]);

  return (
    <div className="relative flex-1 h-full bg-[#282c34] text-[#abb2bf] font-mono text-[14px] overflow-hidden flex select-text">
      {/* Line numbers gutter */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-13 bg-[#21252b] border-r border-[#1e2227] select-none py-2 text-right pr-3 text-[#4b5263] shrink-0 overflow-hidden font-mono text-[13px]"
      >
        {lines.map((_, idx) => {
          const lineNum = idx + 1;
          const isCurrent = cursorPos.line === lineNum;
          return (
            <div
              key={idx}
              className={`h-[21px] leading-[21px] ${
                isCurrent ? 'text-[#c8ccd4] font-bold' : ''
              }`}
            >
              {lineNum}
            </div>
          );
        })}
      </div>

      {/* Editor Content Area (Syntax overlay + Interactive transparent textarea) */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Background Syntax Highlight Layer */}
        <div
          ref={codePreRef}
          aria-hidden="true"
          className="absolute inset-0 py-2 pointer-events-none overflow-hidden font-mono text-[14px]"
        >
          {renderedLines}
        </div>

        {/* Foreground Interactive Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorMetrics}
          onClick={updateCursorMetrics}
          onSelect={updateCursorMetrics}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="absolute inset-0 py-2 px-4 w-full h-full bg-transparent text-transparent caret-[#528bff] resize-none outline-none overflow-auto font-mono text-[14px] leading-[21px] whitespace-pre tab-[4]"
          style={{
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
});

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { JDKConfig } from '../../types';

interface TerminalTabProps {
  jdkConfig: JDKConfig;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({ jdkConfig }) => {
  const [history, setHistory] = useState<string[]>([
    'JBlock Local Command Interface [Version 0.1.0]',
    '(C) JBlock Development Team. All rights reserved.',
    '',
    `Workspace: C:\\Users\\Developer\\JBlockProject`,
    `JDK Status: Java ${jdkConfig.version} (Path: ${jdkConfig.path})`,
    'Type "help" for a list of available commands.',
    '',
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const newHistory = [...history, `C:\\JBlockProject> ${cmd}`];

    if (!trimmed) {
      setHistory(newHistory);
      return;
    }

    const [mainCmd, ...args] = trimmed.split(' ');
    const lowerCmd = mainCmd.toLowerCase();

    switch (lowerCmd) {
      case 'help':
        newHistory.push(
          'Available commands:',
          '  help            - Show this list of commands',
          '  java -version   - Check configured local Java version',
          '  javac -version  - Check Java compiler status',
          '  javac <file>    - Simulate compilation check',
          '  dir / ls        - List project files',
          '  cls / clear     - Clear terminal buffer',
          '  echo <text>     - Print text'
        );
        break;

      case 'cls':
      case 'clear':
        setHistory([]);
        return;

      case 'java':
        if (args[0] === '-version' || args[0] === '--version') {
          newHistory.push(
            `openjdk version "${jdkConfig.version}.0.2" 2024-01-16`,
            `OpenJDK Runtime Environment (build ${jdkConfig.version}.0.2+9)`,
            `OpenJDK 64-Bit Server VM (build ${jdkConfig.version}.0.2+9, mixed mode, sharing)`
          );
        } else if (args.length > 0) {
          newHistory.push(`[Execution] Preparing to run class: ${args[0]}... (Execution engine hooks into local JDK in V0.2)`);
        } else {
          newHistory.push('Usage: java [-version] <mainclass> [args...]');
        }
        break;

      case 'javac':
        if (args[0] === '-version') {
          newHistory.push(`javac ${jdkConfig.version}.0.2`);
        } else if (args.length > 0) {
          newHistory.push(`[Compilation] Checking ${args.join(' ')}... (Local javac process integration in V0.2)`);
        } else {
          newHistory.push('Usage: javac <source files>');
        }
        break;

      case 'dir':
      case 'ls':
        newHistory.push(
          ' Directory of C:\\JBlockProject',
          '',
          '03/25/2026  10:00 AM    <DIR>          .',
          '03/25/2026  10:00 AM    <DIR>          ..',
          '03/25/2026  10:00 AM    <DIR>          src',
          '03/25/2026  10:00 AM               542 README.txt',
          '               1 File(s)            542 bytes',
          '               3 Dir(s)   42,109,230,080 bytes free'
        );
        break;

      case 'echo':
        newHistory.push(args.join(' '));
        break;

      default:
        newHistory.push(`'${mainCmd}' is not recognized as an internal or external command.`);
    }

    setHistory(newHistory);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    }
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] font-mono text-xs flex flex-col p-2.5 overflow-hidden select-text">
      <div className="flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed pr-2">
        {history.map((line, idx) => (
          <div key={idx} className="text-[#abb2bf]">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1.5 pt-2 border-t border-[#2d2d2d] shrink-0">
        <span className="text-[#98c379] select-none text-[11px]">C:\JBlockProject&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none text-[#abb2bf] font-mono text-xs"
          placeholder="type command..."
        />
      </div>
    </div>
  );
};

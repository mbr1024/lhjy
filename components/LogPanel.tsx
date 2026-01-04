import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col font-mono">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/20">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">系统核心运行日志</span>
        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 uppercase tracking-widest">Active_Safety</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar bg-background/50">
        {logs.map((log) => (
          <div key={log.id} className={`flex gap-4 px-3 py-2 rounded-lg transition-all ${log.level === 'REPAIR' ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-secondary/40'}`}>
            <span className="text-muted-foreground shrink-0 tabular-nums text-xs font-medium opacity-60">[{log.timestamp}]</span>
            <span className={`font-black shrink-0 w-16 text-center text-[10px] uppercase tracking-tighter ${
              log.level === 'ERROR' ? 'text-destructive' :
              log.level === 'WARN' ? 'text-yellow-500' :
              log.level === 'SUCCESS' ? 'text-green-500' : 
              log.level === 'REPAIR' ? 'text-blue-500' : 'text-muted-foreground'
            }`}>
              {log.level === 'REPAIR' ? 'FIXED' : log.level}
            </span>
            <span className="text-foreground/40 shrink-0 w-24 px-2 bg-secondary/30 rounded border border-border text-[10px] text-center font-bold">
              {log.module}
            </span>
            <span className={`text-sm ${log.level === 'REPAIR' ? 'text-blue-400 font-bold' : 'text-foreground/90'} break-all`}>
                {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default LogPanel;
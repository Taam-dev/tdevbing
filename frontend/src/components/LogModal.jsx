import React, { useEffect, useState, useRef } from 'react';
import { Terminal, X } from 'lucide-react';

export default function LogModal({ account, isOpen, onClose, t }) {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !account) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs/${account.id}`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Lỗi lấy log:', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [isOpen, account]);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1e293b]/70">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wide">
              {t.modalLogTitle} — <span className="text-cyan-600 dark:text-cyan-400 font-bold">{account.name}</span> (ID: {account.id})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                autoScroll
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs Terminal Area (Always dark high-contrast console style) */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-1.5 bg-[#090d16] text-slate-300">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 italic">
              {t.noLogsYet}
            </div>
          ) : (
            logs.map((line, index) => {
              const isHighlight = line.includes('TĂNG') || line.includes('BẮT ĐẦU') || line.includes('HOÀN TẤT') || line.includes('INCREASED') || line.includes('START') || line.includes('DONE');
              const isWarning = line.includes('KHÔNG tăng') || line.includes('LỖI') || line.includes('ERROR') || line.includes('FAIL');
              const isStep = line.includes('[Bước') || line.includes('[Step');

              return (
                <div
                  key={index}
                  className={`leading-relaxed py-0.5 px-1 rounded transition-colors ${
                    isHighlight
                      ? 'text-emerald-400 font-semibold bg-emerald-950/20'
                      : isWarning
                      ? 'text-amber-400 bg-amber-950/20'
                      : isStep
                      ? 'text-cyan-300 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1e293b]/50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
}

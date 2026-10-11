import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Play,
  Loader2,
  Clock,
  Award,
  Terminal,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Square,
  Globe,
  Pencil,
  Check,
  X
} from 'lucide-react';

export default function AccountCard({
  account,
  onLogin,
  onOpenBrowser,
  onRun,
  onStop,
  onReset,
  onDelete,
  onRename,
  onViewLogs,
  t,
  lang = 'vi'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(account.name);

  useEffect(() => {
    setTempName(account.name);
  }, [account.name]);

  const isRunning = account.status === 'running';
  const isLoggingIn = account.status === 'logging_in';
  const isBrowsing = account.status === 'browsing';
  const isBrowserActive = isLoggingIn || isBrowsing;

  const handleSaveRename = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onRename(account.id, tempName.trim());
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setTempName(account.name);
    setIsEditing(false);
  };

  // Format ngày giờ lastRun theo locale
  const formatLastRun = (isoStr) => {
    if (!isoStr) return t.lastRunNever;
    const date = new Date(isoStr);
    return date.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Render Badge trạng thái
  const renderStatusBadge = () => {
    switch (account.status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t.statusRunning}
          </span>
        );
      case 'browsing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <Globe className="w-3.5 h-3.5 animate-pulse text-sky-600 dark:text-sky-400" />
            {t.statusBrowsing}
          </span>
        );
      case 'logging_in':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t.statusLoggingIn}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.statusCompleted}
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {t.statusIdle}
          </span>
        );
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-5 transition-all shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-cyan-950/20 flex flex-col justify-between group">
      {/* Top Bar: Name & Actions */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                #{account.id}
              </span>

              {/* Tên tài khoản hoặc Input sửa tên */}
              {isEditing ? (
                <form onSubmit={handleSaveRename} className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()}
                    className="px-2 py-0.5 text-xs bg-slate-50 dark:bg-[#0b1120] border border-cyan-500 rounded text-slate-900 dark:text-slate-100 focus:outline-none w-full font-bold"
                  />
                  <button
                    type="submit"
                    title={lang === 'vi' ? 'Lưu tên' : 'Save name'}
                    className="p-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title={lang === 'vi' ? 'Hủy' : 'Cancel'}
                    onClick={handleCancelRename}
                    className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5 group/title truncate">
                  <h3
                    onDoubleClick={() => setIsEditing(true)}
                    className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate"
                  >
                    {account.name}
                  </h3>
                  <button
                    title={t.tooltipRename}
                    onClick={() => setIsEditing(true)}
                    className="p-1 opacity-60 group-hover/title:opacity-100 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              profiles/acc_{account.id}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* View Logs */}
            <button
              title={t.tooltipLogs}
              onClick={() => onViewLogs(account)}
              className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded transition"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Reset status */}
            <button
              title={t.tooltipReset}
              onClick={() => onReset(account.id)}
              className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Delete Account */}
            <button
              title={t.tooltipDelete}
              onClick={() => onDelete(account.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {renderStatusBadge()}
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-200 dark:border-slate-800 my-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate" title={formatLastRun(account.lastRun)}>
              {formatLastRun(account.lastRun)}
            </span>
          </div>

          <div className="flex flex-col items-end justify-center">
            {account.earnedToday > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  +{account.earnedToday} pts {lang === 'vi' ? 'hôm nay' : 'today'}
                </span>
                {account.lastPoints > 0 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {lang === 'vi' ? 'Tổng' : 'Total'}: {account.lastPoints.toLocaleString()} pts
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {account.lastPoints ? `${account.lastPoints.toLocaleString()} pts` : '-- pts'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-2 pt-1">
        {isBrowserActive ? (
          <div className="space-y-1.5">
            <button
              onClick={() => onStop(account.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 shadow-md transition active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Đã xong (Đóng Chrome để sẵn sàng)' : 'Done (Close Chrome to Ready)'}</span>
            </button>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-300/80 text-center">
              💡 {lang === 'vi' ? 'Chrome đang mở. Đóng cửa sổ Chrome để mở khóa nút' : 'Chrome is active. Close window to unlock'} <b>Run Daily</b>.
            </p>
          </div>
        ) : isRunning ? (
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 cursor-not-allowed shadow-inner"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.btnRunning}</span>
            </button>
            <button
              onClick={() => onStop(account.id)}
              title={t.btnStop}
              className="p-2 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/50 transition"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {/* Nút 1: Mở Web (Icon quả cầu trắng đen thanh lịch) */}
            <button
              onClick={() => onOpenBrowser(account.id)}
              title={t.tooltipOpenBrowser}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition active:scale-[0.98]"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
              <span className="truncate">{t.btnOpenWeb}</span>
            </button>

            {/* Nút 2: Login */}
            <button
              onClick={() => onLogin(account.id)}
              title={lang === 'vi' ? 'Mở Chrome để đăng nhập tài khoản Microsoft' : 'Open Chrome to login Microsoft account'}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="truncate">{t.btnLogin}</span>
            </button>

            {/* Nút 3: Run Daily */}
            <button
              onClick={() => onRun(account.id)}
              title={lang === 'vi' ? 'Chạy tự động Daily Set & Auto Search' : 'Run automated Daily Set & Search'}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 shadow-md shadow-cyan-500/20 transition active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">{t.btnRunDaily}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

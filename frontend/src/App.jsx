import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Layers,
  CheckCircle,
  Clock,
  PlayCircle,
  ShieldCheck,
  Search,
  Globe,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import AccountCard from './components/AccountCard';
import LogModal from './components/LogModal';
import AddAccountModal from './components/AddAccountModal';
import { translations } from './translations';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAccountForLogs, setSelectedAccountForLogs] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Quản lý theme (dark / light) & ngôn ngữ (vi / en) từ localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('tdevbing_theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('tdevbing_lang') || 'vi');

  const t = translations[lang] || translations.vi;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tdevbing_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tdevbing_lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLang = () => setLang(prev => (prev === 'vi' ? 'en' : 'vi'));

  // Hiển thị thông báo Toast nhanh
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tải danh sách tài khoản
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Lỗi kết nối backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lặp lại việc polling mỗi 2.5s để cập nhật trạng thái tự động
  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 2500);
    return () => clearInterval(interval);
  }, [fetchAccounts]);

  // Handler: Đăng nhập thủ công
  const handleLogin = async (id) => {
    try {
      const res = await fetch(`/api/login/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(t.toastManualLoginSuccess(id), 'info');
        fetchAccounts();
      } else {
        showToast(data.error || t.toastError, 'error');
      }
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Chạy tự động hóa Daily
  const handleRun = async (id) => {
    try {
      const res = await fetch(`/api/run/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(t.toastRunSuccess(id), 'success');
        fetchAccounts();
      } else {
        showToast(data.error || t.toastError, 'error');
      }
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Dừng khẩn cấp
  const handleStop = async (id) => {
    try {
      await fetch(`/api/stop/${id}`, { method: 'POST' });
      showToast(t.toastStopSuccess(id), 'warning');
      fetchAccounts();
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Đặt lại trạng thái về Chưa làm
  const handleReset = async (id) => {
    try {
      await fetch(`/api/accounts/${id}/reset`, { method: 'POST' });
      showToast(t.toastResetSuccess(id), 'info');
      fetchAccounts();
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Xóa tài khoản
  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete(id))) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      showToast(t.toastDeleteSuccess(id), 'info');
      fetchAccounts();
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Mở trình duyệt để tự do kiểm tra
  const handleOpenBrowser = async (id) => {
    try {
      const res = await fetch(`/api/browser/open/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(t.toastOpenBrowserSuccess(id), 'info');
        fetchAccounts();
      } else {
        showToast(data.error || t.toastError, 'error');
      }
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Đổi tên tài khoản
  const handleRename = async (id, newName) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t.toastRenameSuccess(newName), 'success');
        fetchAccounts();
      } else {
        showToast(data.error || t.toastError, 'error');
      }
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Handler: Thêm tài khoản mới
  const handleAddAccount = async (name) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        showToast(t.toastAddSuccess, 'success');
        fetchAccounts();
      }
    } catch (err) {
      showToast(t.toastError, 'error');
    }
  };

  // Thống kê nhanh
  const stats = {
    total: accounts.length,
    running: accounts.filter(a => a.status === 'running').length,
    completed: accounts.filter(a => a.status === 'completed').length,
    idle: accounts.filter(a => a.status === 'idle' || !a.status).length,
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    String(acc.id).includes(searchFilter)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-[#e2e8f0] flex flex-col font-sans transition-colors duration-200">
      {/* Top Banner / Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg border shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/40'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40'
                : 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#141e33]/90 backdrop-blur sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Name: tdevbing với icon quả cầu trắng đen thay thế cho Flame */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-slate-900 dark:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-100 shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.appTitle}{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    {t.versionBadge}
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher: VI / EN */}
            <button
              onClick={toggleLang}
              title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Switcher: Dark / Light */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAccounts()}
              title={t.refreshTitle}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Add Account Button */}
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded bg-cyan-500 hover:bg-cyan-400 dark:bg-cyan-400 dark:hover:bg-cyan-300 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addAccountBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>{t.statsTotal}</span>
              <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {stats.total}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141e33] border border-cyan-200 dark:border-cyan-950/50 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400/80 text-xs font-semibold">
              <span>{t.statsRunning}</span>
              <PlayCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {stats.running}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141e33] border border-emerald-200 dark:border-emerald-950/50 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400/80 text-xs font-semibold">
              <span>{t.statsCompleted}</span>
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.completed}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>{t.statsIdle}</span>
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {stats.idle}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#141e33] border border-slate-300 dark:border-slate-700/80 rounded text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{t.securityNote}</span>
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
            {t.loadingAccounts}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="bg-white/50 dark:bg-[#141e33]/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg py-16 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{t.noAccounts}</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> {t.addFirstAccount}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onLogin={handleLogin}
                onOpenBrowser={handleOpenBrowser}
                onRun={handleRun}
                onStop={handleStop}
                onReset={handleReset}
                onDelete={handleDelete}
                onRename={handleRename}
                onViewLogs={(acc) => setSelectedAccountForLogs(acc)}
                t={t}
                lang={lang}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-[#0b1120] transition-colors">
        {t.footer}
      </footer>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddAccount}
        t={t}
      />

      <LogModal
        account={selectedAccountForLogs}
        isOpen={Boolean(selectedAccountForLogs)}
        onClose={() => setSelectedAccountForLogs(null)}
        t={t}
      />
    </div>
  );
}

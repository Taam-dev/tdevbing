export const translations = {
  vi: {
    appTitle: 'tdevbing',
    versionBadge: 'v1.0',
    appSubtitle: 'Bộ quản lý & Tự động hóa đa tài khoản Microsoft Rewards',
    refreshTitle: 'Làm mới trạng thái',
    addAccountBtn: 'Thêm Tài Khoản',
    
    // Stats
    statsTotal: 'Tổng tài khoản',
    statsRunning: 'Đang chạy',
    statsCompleted: 'Đã hoàn thành',
    statsIdle: 'Chưa làm hôm nay',
    
    // Search & Security
    searchPlaceholder: 'Tìm kiếm tài khoản...',
    securityNote: 'Mỗi tài khoản được bảo vệ với Puppeteer Stealth & thư mục Profile riêng',
    
    // Account list
    loadingAccounts: 'Đang tải dữ liệu tài khoản...',
    noAccounts: 'Chưa có tài khoản nào được thêm',
    addFirstAccount: 'Thêm tài khoản đầu tiên',
    
    // Account Card
    statusRunning: 'Đang chạy Auto',
    statusBrowsing: 'Đang mở Web (Thủ công)',
    statusLoggingIn: 'Đang mở Login',
    statusCompleted: 'Đã hoàn thành hôm nay',
    statusIdle: 'Chưa làm',
    
    lastRunNever: 'Chưa chạy lần nào',
    pts: 'pts',
    
    btnOpenWeb: 'Mở Web',
    btnLogin: 'Login',
    btnRunDaily: 'Run Daily',
    btnStop: 'Dừng',
    btnRunning: 'Đang chạy...',
    btnLoggingIn: 'Đang mở Login...',
    
    tooltipLogs: 'Xem nhật ký thời gian thực',
    tooltipReset: 'Đặt lại trạng thái về Chưa làm',
    tooltipDelete: 'Xóa tài khoản',
    tooltipRename: 'Đổi tên tài khoản',
    tooltipOpenBrowser: 'Mở trình duyệt kiểm tra thủ công',
    confirmDelete: (id) => `Bạn có chắc chắn muốn xóa Account #${id}?`,
    
    // Add Account Modal
    modalAddTitle: 'Thêm Tài Khoản Mới',
    modalAddDesc: 'Nhập tên định danh để dễ quản lý trong danh sách.',
    modalAddLabel: 'Tên tài khoản',
    modalAddPlaceholder: 'Ví dụ: Account Chính, Acc Phụ 1...',
    btnCancel: 'Hủy bỏ',
    btnAddConfirm: 'Thêm tài khoản',
    modalAddTip: 'Hệ thống sẽ tự động tạo thư mục Profile riêng biệt.',
    
    // Log Modal
    modalLogTitle: 'Nhật Ký Tự Động Hóa',
    profileFolder: 'Thư mục Profile:',
    noLogsYet: 'Chưa có bản ghi nhật ký nào. Hãy bấm "Run Daily" hoặc "Mở Web" để xem hoạt động.',
    autoScrollNotice: 'Tự động cuộn theo log mới nhất',
    btnClose: 'Đóng',
    
    // Toasts
    toastManualLoginSuccess: (id) => `Đã mở trình duyệt đăng nhập cho Account #${id}`,
    toastRunSuccess: (id) => `Bắt đầu chạy tự động hóa Account #${id}`,
    toastStopSuccess: (id) => `Đã gửi yêu cầu dừng Account #${id}`,
    toastResetSuccess: (id) => `Đã reset trạng thái Account #${id}`,
    toastDeleteSuccess: (id) => `Đã xóa Account #${id}`,
    toastOpenBrowserSuccess: (id) => `Đã mở trình duyệt cho Account #${id}`,
    toastRenameSuccess: (name) => `Đã đổi tên thành công: ${name}`,
    toastAddSuccess: 'Đã thêm tài khoản mới thành công',
    toastError: 'Có lỗi xảy ra',
    
    // Theme & Lang
    themeDark: 'Giao diện Tối',
    themeLight: 'Giao diện Sáng',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    
    footer: 'tdevbing • Bộ công cụ tự động hóa đa tài khoản Microsoft Rewards • Localhost App'
  },
  en: {
    appTitle: 'tdevbing',
    versionBadge: 'v1.0',
    appSubtitle: 'Microsoft Rewards Multi-Account Automation & Profile Manager',
    refreshTitle: 'Refresh status',
    addAccountBtn: 'Add Account',
    
    // Stats
    statsTotal: 'Total Accounts',
    statsRunning: 'Running',
    statsCompleted: 'Completed',
    statsIdle: 'Pending Today',
    
    // Search & Security
    searchPlaceholder: 'Search accounts by name or ID...',
    securityNote: 'Each account is protected with Puppeteer Stealth & isolated Profile directory',
    
    // Account list
    loadingAccounts: 'Loading account data...',
    noAccounts: 'No accounts added yet',
    addFirstAccount: 'Add your first account',
    
    // Account Card
    statusRunning: 'Running Auto',
    statusBrowsing: 'Browsing (Manual)',
    statusLoggingIn: 'Opening Login',
    statusCompleted: 'Completed Today',
    statusIdle: 'Pending',
    
    lastRunNever: 'Never run',
    pts: 'pts',
    
    btnOpenWeb: 'Open Web',
    btnLogin: 'Login',
    btnRunDaily: 'Run Daily',
    btnStop: 'Stop',
    btnRunning: 'Running...',
    btnLoggingIn: 'Opening Login...',
    
    tooltipLogs: 'View live automation logs',
    tooltipReset: 'Reset status to Pending',
    tooltipDelete: 'Delete account',
    tooltipRename: 'Rename account',
    tooltipOpenBrowser: 'Open Chrome for manual browsing',
    confirmDelete: (id) => `Are you sure you want to delete Account #${id}?`,
    
    // Add Account Modal
    modalAddTitle: 'Add New Account',
    modalAddDesc: 'Enter an account label for easy identification.',
    modalAddLabel: 'Account Name',
    modalAddPlaceholder: 'e.g., Main Account, Sub Acc 1...',
    btnCancel: 'Cancel',
    btnAddConfirm: 'Add Account',
    modalAddTip: 'System will automatically create an isolated Profile directory.',
    
    // Log Modal
    modalLogTitle: 'Automation Logs',
    profileFolder: 'Profile Directory:',
    noLogsYet: 'No logs recorded yet. Click "Run Daily" or "Open Web" to monitor activity.',
    autoScrollNotice: 'Auto-scrolling to latest log line',
    btnClose: 'Close',
    
    // Toasts
    toastManualLoginSuccess: (id) => `Opened login browser for Account #${id}`,
    toastRunSuccess: (id) => `Started automation for Account #${id}`,
    toastStopSuccess: (id) => `Stop request sent for Account #${id}`,
    toastResetSuccess: (id) => `Reset status for Account #${id}`,
    toastDeleteSuccess: (id) => `Deleted Account #${id}`,
    toastOpenBrowserSuccess: (id) => `Opened browser for Account #${id}`,
    toastRenameSuccess: (name) => `Renamed account successfully: ${name}`,
    toastAddSuccess: 'Added new account successfully',
    toastError: 'An error occurred',
    
    // Theme & Lang
    themeDark: 'Dark Theme',
    themeLight: 'Light Theme',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    
    footer: 'tdevbing • Microsoft Rewards Multi-Account Automation Tool • Localhost App'
  }
};

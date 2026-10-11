require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  getAccounts,
  getAccountById,
  addAccount,
  updateAccount,
  deleteAccount
} = require('./services/dbService');
const {
  openBrowser,
  openManualLogin,
  runAutomation,
  stopBrowser,
  getLogs
} = require('./services/puppeteerService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Lấy danh sách tài khoản
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = getAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Thêm tài khoản mới
app.post('/api/accounts', (req, res) => {
  try {
    const { name } = req.body;
    const newAcc = addAccount(name);
    res.status(201).json(newAcc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Xóa tài khoản
app.delete('/api/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    stopBrowser(id); // Dừng trình duyệt nếu đang chạy
    const updated = deleteAccount(id);
    res.json({ success: true, accounts: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Cập nhật tên tài khoản
app.put('/api/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên tài khoản không được để trống' });
    }
    const updated = updateAccount(id, { name: name.trim() });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Reset trạng thái tài khoản về idle
app.post('/api/accounts/:id/reset', (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateAccount(id, { status: 'idle' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Mở Web kiểm tra thủ công (Mở Bing Rewards độc lập)
app.post('/api/browser/open/:id', async (req, res) => {
  const { id } = req.params;
  const account = getAccountById(id);
  if (!account) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  }

  try {
    openBrowser(Number(id)).catch(err => {
      console.error(`Lỗi khi mở Web cho acc ${id}:`, err);
    });
    res.json({ message: 'Đang mở trình duyệt kiểm tra...', accountId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Đăng nhập thủ công (Manual Login)
app.post('/api/login/:id', async (req, res) => {
  const { id } = req.params;
  const account = getAccountById(id);
  if (!account) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  }

  try {
    // Chạy login bất đồng bộ để không treo HTTP request
    openManualLogin(Number(id)).catch(err => {
      console.error(`Lỗi khi mở Login cho acc ${id}:`, err);
    });

    res.json({ message: 'Đang mở trình duyệt để đăng nhập thủ công...', accountId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Chạy tự động hóa Daily Set & Search (/api/run/:id)
app.post('/api/run/:id', async (req, res) => {
  const { id } = req.params;
  const account = getAccountById(id);
  if (!account) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  }

  if (account.status === 'running') {
    return res.status(400).json({ error: 'Tài khoản này đang trong tiến trình chạy!' });
  }

  try {
    // Đánh dấu running ngay lập tức
    updateAccount(id, { status: 'running' });

    // Khởi chạy ngầm không để timeout HTTP
    runAutomation(Number(id)).catch(err => {
      console.error(`Automation lỗi cho acc ${id}:`, err);
    });

    res.json({ message: 'Đã bắt đầu tiến trình tự động hóa', accountId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Dừng trình duyệt của tài khoản
app.post('/api/stop/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await stopBrowser(Number(id));
    res.json({ message: 'Đã yêu cầu dừng tiến trình' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Lấy log thời gian thực của tài khoản
app.get('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const logs = getLogs(id);
  res.json({ logs });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Backend Bing Rewards Server running at: http://localhost:${PORT}`);
  console.log(`📁 Profile directory: ${require('path').resolve(__dirname, 'profiles')}`);
  console.log(`===============================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[!] CANH BAO: Cong ${PORT} dang bi chiem boi tien trinh cu!`);
    console.error(`    Vui long chay stop.bat de giai phong cong roi chay lai start.bat.\n`);
  } else {
    console.error('Server error:', err);
  }
});

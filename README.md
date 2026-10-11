# tdevbing - Microsoft Rewards Multi-Account Automation (Desktop App)

**tdevbing** là phần mềm quản lý và tự động hóa thao tác trình duyệt cho nhiều tài khoản Microsoft Bing Rewards, chạy trực tiếp trên máy cục bộ (Localhost) dưới dạng **Cửa sổ Ứng dụng Desktop Độc Lập (Native Desktop Window)** hoặc giao diện Web.

---

## ✨ Tính năng nổi bật

1. **Chế độ Desktop App độc lập**:
   - Khởi chạy dưới dạng cửa sổ ứng dụng Windows độc lập (không thanh URL, không tab thừa, không bookmarks).
   - Tự động thu nhỏ/ẩn cửa sổ console đen, chỉ hiển thị cửa sổ phần mềm sạch sẽ.
   - Hỗ trợ tạo Shortcut trực tiếp ra màn hình Desktop chỉ với 1 click.
2. **Cách ly Profile trình duyệt tuyệt đối**:
   - Mỗi tài khoản sở hữu một thư mục Profile riêng (`./backend/profiles/acc_X`), duy trì vĩnh viễn phiên đăng nhập, cookie, lịch sử mà không bị lẫn lộn giữa các tài khoản.
3. **Tự động hóa Daily Set**:
   - Truy cập `https://rewards.bing.com/`, duyệt qua từng thẻ Daily Set: mở tab nhiệm vụ -> chờ nhận điểm -> đóng tab an toàn -> quay lại trang chính.
4. **Auto Search thông minh & Chống Tracking**:
   - Tự động sinh từ khóa tìm kiếm tự nhiên qua Groq API (hoặc bộ từ khóa ngẫu nhiên tiếng Việt & tiếng Anh).
   - Typing delay ngẫu nhiên mô phỏng người thật gõ bàn phím.
   - Thử nghiệm Web Search và chuyển tiếp Image Search nếu chưa đạt điểm tối đa.
   - Tự động dọn dẹp lịch sử tìm kiếm sau khi chạy để tránh bị hệ thống theo dõi.
   - **Dừng thông minh**: Nếu 2 lần tìm kiếm liên tiếp không tăng thêm điểm (đã chạm mốc tối đa hôm nay), hệ thống tự động hoàn thành và đóng trình duyệt.
5. **Giao diện hiện đại & Linh hoạt**:
   - **Đổi Theme**: Chuyển đổi linh hoạt giữa **Dark Mode** (Dark Slate `#0f172a`) và **Light Mode** (Sáng tinh tế).
   - **Đa ngôn ngữ**: Hỗ trợ 100% **Tiếng Việt 🇻🇳** và **English 🇬🇧**.
   - **Terminal Live Logs**: Theo dõi từng bước thực thi trong thời gian thực.
   - **Mở Web & Đổi tên**: Cho phép mở trình duyệt kiểm tra thủ công bất kỳ lúc nào và đổi tên gợi nhớ tài khoản trực tiếp.

---

## 📁 Cấu trúc dự án

```text
bingacc/
├── tdevbing.exe                 # File ứng dụng Desktop độc lập (có Icon nhân vật Chibi)
├── build_exe.bat                # Script biên dịch tdevbing.exe 1-click
├── assets/                      # Chứa icon.png và icon.ico của ứng dụng
├── launcher/                    # Mã nguồn C# của file thực thi tdevbing.exe
├── .gitignore                   # Chặn các file bảo mật (cookie profiles, .env, database.json)
├── README.md                    # Hướng dẫn chi tiết
├── run_app.vbs                  # Khởi chạy Desktop App ẩn hoàn toàn màn hình đen CMD
├── start.bat                    # Script khởi động tự động hệ thống
├── stop.bat                     # Script dừng toàn bộ tiến trình và giải phóng port
├── create_desktop_shortcut.bat  # Tạo biểu tượng tdevbing trên màn hình Desktop
├── backend/
│   ├── profiles/                # Dữ liệu profile từng account (Được .gitignore bảo vệ)
│   ├── services/
│   │   ├── dbService.js         # Đọc/ghi database tài khoản
│   │   ├── groqService.js       # Sinh từ khóa AI qua Groq API
│   │   └── puppeteerService.js  # Luồng Puppeteer Stealth, Daily Set & Search
│   ├── .env                     # Chứa PORT & GROQ_API_KEY (Được .gitignore bảo vệ)
│   ├── .env.example             # Mẫu cấu hình môi trường cho Git
│   ├── database.json            # Danh sách tài khoản (Tự tạo nếu chưa có)
│   ├── package.json
│   └── server.js                # Express API Backend
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AccountCard.jsx  # Thẻ tài khoản (Mở Web, Login, Run Daily)
    │   │   ├── AddAccountModal.jsx # Hộp thoại thêm tài khoản
    │   │   └── LogModal.jsx     # Terminal xem live log thời gian thực
    │   ├── translations.js      # Từ điển đa ngôn ngữ (VI / EN)
    │   ├── App.jsx              # Dashboard chính
    │   ├── index.css            # Thiết kế Dark/Light theme
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Hướng dẫn khởi chạy

### Cách 1: Chạy trực tiếp File EXE hoặc Desktop App (Khuyên dùng)
- **Chạy trực tiếp**: Nháy đúp chuột vào file **`tdevbing.exe`** ở thư mục gốc. Ứng dụng sẽ tự động khởi chạy với icon nhân vật Chibi, không có cửa sổ đen CMD, và có biểu tượng ở khay hệ thống (System Tray).
- **Tạo Shortcut ra Desktop (Lần đầu)**: Nháy đúp file `create_desktop_shortcut.bat`. Một shortcut **tdevbing** với icon Chibi sẽ xuất hiện trên màn hình Desktop của bạn.
- **Tắt phần mềm**: Nhấp chuột phải vào icon ở khay hệ thống (góc dưới bên phải) chọn **Thoát ứng dụng (Exit)**, hoặc nháy đúp file `stop.bat` để tắt toàn bộ tiến trình chạy ngầm.

### Cách 2: Chạy thủ công bằng dòng lệnh
1. **Khởi động Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. **Khởi động Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Truy cập trên trình duyệt: `http://localhost:5173`

---

## 🔒 Hướng dẫn Đẩy lên Git (Push to Git) An Toàn

Dự án đã được cấu hình sẵn file [`.gitignore`](file:///.gitignore) để **tuyệt đối không làm lộ các dữ liệu nhạy cảm**:
- ❌ **`backend/profiles/`**: Chứa toàn bộ cookie, token và phiên đăng nhập tài khoản Microsoft của bạn.
- ❌ **`backend/.env`**: Chứa `GROQ_API_KEY`.
- ❌ **`backend/database.json`**: Chứa danh sách tài khoản cá nhân.
- ❌ **`node_modules/`** và **`dist/`**: Thư mục thư viện nặng.

### Các bước đẩy lên GitHub:

1. **Khởi tạo và kiểm tra trạng thái**:
   ```bash
   git status
   ```
2. **Thêm toàn bộ file mã nguồn**:
   ```bash
   git add .
   git commit -m "Initial commit: tdevbing local automation app"
   ```
3. **Liên kết với Repository trên GitHub của bạn**:
   ```bash
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git branch -M main
   git push -u origin main
   ```

Khi clone dự án về máy mới, bạn chỉ cần sao chép `backend/.env.example` thành `backend/.env`, chạy `npm install` ở cả hai thư mục là có thể sử dụng bình thường.

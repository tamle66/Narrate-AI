# 🎙️ Narrate AI: Local Neural TTS Extension

[![Framework: Vite](https://img.shields.io/badge/Framework-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Library: React](https://img.shields.io/badge/Library-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Runtime: Node](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Engine: Kokoro](https://img.shields.io/badge/AI_Engine-Kokoro_82M-FF6B00?style=for-the-badge)](https://github.com/remsky/Kokoro-FastAPI)

**Narrate AI** là một tiện ích mở rộng (Chrome Extension) cao cấp, mang sức mạnh của trí tuệ nhân tạo giọng nói (Neural TTS) trực tiếp vào trình duyệt của bạn. Sử dụng mô hình **Kokoro-82M** chạy hoàn toàn trên máy cục bộ (Local), ứng dụng cung cấp trải nghiệm đọc văn bản chất lượng vượt trội, độ trễ thấp và bảo mật tuyệt đối.

---

## ✨ Tính năng nổi bật

*   🚀 **Local AI Inference**: Chạy hoàn toàn trên máy tính của bạn (hỗ trợ NVIDIA GPU hoặc Apple Silicon), không cần gửi dữ liệu ra ngoài Internet.
*   📖 **Smart Content Extraction**: Tự động nhận diện nội dung bài báo, bỏ qua quảng cáo/menu. Hỗ trợ tốt các trang tin tức Việt Nam (VietnamNet, VnExpress) và các trang học tập (Coursera).
*   🎵 **Karaoke-style UI**: Giao diện trình phát hiện đại với tính năng làm nổi bật câu đang đọc (Karaoke highlighting) giúp bạn dễ dàng theo dõi.
*   ⏩ **Smart Pre-fetching**: Tự động tải trước (buffering) câu tiếp theo trong khi đang đọc câu hiện tại, đảm bảo trải nghiệm nghe liền mạch, không ngắt quãng.
*   🕹️ **Navigation Hub**: Tiến tới hoặc lùi lại từng câu chính xác, điều chỉnh tốc độ đọc (0.5x - 2.0x) và thay đổi giọng đọc ngay lập tức.
*   🖱️ **Context Menu Integration**: 
    *   **"Đọc đoạn đã chọn"**: Đọc nhanh phần văn bản bạn bôi đen.
    *   **"Đọc từ đây"**: Bắt đầu hành trình đọc từ vị trí bạn chọn cho đến hết trang web.

---

## 🛠️ Công nghệ sử dụng

*   **Frontend**: React + TypeScript + TailwindCSS.
*   **Build Tool**: Vite + CRXJS (Manifest V3).
*   **Aesthetics**: Lucide Icons + Glassmorphism Design.
*   **State Management**: Zustand.
*   **Backend Interface**: Kết nối với [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) qua HTTP API.

---

## � Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt đầy đủ các công cụ sau:

### 🔧 Bắt buộc (Required)
1.  **Google Chrome** (hoặc Microsoft Edge)
    *   Tải tại: [chrome.google.com](https://www.google.com/chrome/)

2.  **Python 3.10+**
    *   **Windows**: Tải tại [python.org/downloads](https://www.python.org/downloads/)
    *   **macOS**: Đã có sẵn hoặc cài qua Homebrew: `brew install python`
    *   **Kiểm tra**: Mở Terminal/PowerShell và gõ `python --version`

3.  **Git**
    *   **Windows**: Tải tại [git-scm.com](https://git-scm.com/download/win)
    *   **macOS**: Cài qua Xcode Command Line Tools: `xcode-select --install`
    *   **Kiểm tra**: Gõ `git --version` trong Terminal

4.  **UV Package Manager** (Công cụ cài đặt Python siêu tốc)
    *   **Windows (PowerShell)**:
      ```powershell
      powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
      ```
    *   **macOS/Linux**:
      ```bash
      curl -LsSf https://astral.sh/uv/install.sh | sh
      ```
    *   **Kiểm tra**: Gõ `uv --version`

### 🎯 Tùy chọn (Optional - Dành cho Developer)
*   **Node.js 18+** (Chỉ cần nếu bạn muốn build từ source code)
    *   Tải tại: [nodejs.org](https://nodejs.org/)
    *   Kiểm tra: `node --version` và `npm --version`

---

## 🚀 Hướng dẫn cài đặt

### 📦 Cách 1: Sử dụng bản Build sẵn (Dành cho người dùng)

> **Phù hợp cho**: Người dùng muốn sử dụng ngay mà không cần biết về lập trình.

#### Bước 1: Tải và giải nén Extension
1.  Truy cập trang **[Releases](https://github.com/tamle66/Narrate-AI/releases)** trên GitHub.
2.  Tải file `Narrate-AI-v1.0.1.zip` (hoặc phiên bản mới nhất).
3.  **Giải nén** file ZIP vào một thư mục **cố định** trên ổ đĩa (Ví dụ: `D:\Apps\Narrate-AI`).
    *   ⚠️ **Lưu ý**: Đừng để trong thư mục *Downloads* vì bạn có thể vô tình xóa sau này!

#### Bước 2: Cài đặt Extension vào Chrome
1.  Mở trình duyệt Chrome, gõ vào thanh địa chỉ: `chrome://extensions/`
2.  Bật **Developer Mode** (công tắc ở góc trên cùng bên phải).
3.  Click nút **Load unpacked** (Tải tiện ích đã giải nén).
4.  Chọn thư mục **`extension`** bên trong thư mục bạn vừa giải nén.
5.  Extension sẽ xuất hiện trong danh sách. **Copy Extension ID** (dãy ký tự dài bên dưới tên extension) - bạn sẽ cần nó ở bước tiếp theo.

#### Bước 3: Kết nối Native Host (Cho phép Extension điều khiển máy tính)
1.  Mở thư mục `native-host` (nằm trong thư mục bạn đã giải nén).
2.  **Mở Terminal/PowerShell tại đây**:
    *   **Windows**: Shift + Chuột phải vào khoảng trống → Chọn "Open PowerShell window here"
    *   **macOS**: Chuột phải → Services → New Terminal at Folder
3.  Chạy lệnh: `python install.py`
4.  Khi được hỏi, **dán Extension ID** bạn đã copy ở Bước 2 và nhấn Enter.
5.  Nếu thành công, bạn sẽ thấy thông báo: `Installation Successful!`

#### Bước 4: Cài đặt AI Engine (Bộ não của Extension)

> **Quan trọng**: Đây là bước tải mô hình AI về máy. Bạn cần làm theo đúng thứ tự.

1.  **Mở Terminal/PowerShell tại thư mục gốc** (thư mục `Narrate-AI` bạn đã giải nén ở Bước 1).
    
2.  **Tải mã nguồn AI Core**:
    ```bash
    # Tạo thư mục chứa AI Engine
    mkdir external
    
    # Tải AI Core từ GitHub
    git clone https://github.com/remsky/Kokoro-FastAPI.git external/narrate-ai-core
    
    # Xóa thư mục .git để tránh xung đột (chọn lệnh phù hợp với hệ điều hành)
    # Windows:
    Remove-Item -Recurse -Force external/narrate-ai-core/.git
    # macOS/Linux:
    rm -rf external/narrate-ai-core/.git
    ```

3.  **Di chuyển vào thư mục AI Core**:
    ```bash
    cd external/narrate-ai-core
    ```

4.  **Vá lỗi Dependencies** (Bỏ qua bộ từ điển tiếng Nhật nặng):
    ```bash
    python -c "import re; p='pyproject.toml'; c=open(p).read(); open(p,'w').write(re.sub(r'misaki\[.*?\]', 'misaki[en]', c))"
    ```

5.  **Cài đặt môi trường Python** (Mất khoảng 3-5 phút):
    ```bash
    uv sync --no-dev
    ```

6.  **Khởi chạy Server** (Chọn lệnh phù hợp với phần cứng):
    *   **Windows (Card đồ họa NVIDIA)**: `./start-gpu.ps1`
    *   **Windows (Không có card rời)**: `./start-cpu.ps1`
    *   **macOS (Apple Silicon M1/M2/M3)**: `uv run python -m kokoro_fastapi.main`

7.  **Giữ cửa sổ Terminal mở** (Thu nhỏ, đừng đóng). Server cần chạy ngầm để Extension hoạt động.

8.  Quay lại Chrome, click vào icon Extension → Nhấn **"Kiểm tra kết nối ngay"**.
    *   Nếu thành công, bạn sẽ thấy giao diện chính với nút **"Quét trang hiện tại"**.

---

### 💻 Cách 2: Setup cho Nhà phát triển (Từ Source code)

> **Phù hợp cho**: Developer muốn tùy chỉnh hoặc đóng góp vào dự án.

1.  **Clone Repository và Build**:
    ```bash
    git clone https://github.com/tamle66/Narrate-AI.git
    cd Narrate-AI
    npm install
    npm run build
    ```

2.  **Nạp Extension**: 
    *   Mở `chrome://extensions/`
    *   Bật Developer Mode
    *   Load unpacked → Chọn thư mục `dist`

3.  **Cài đặt Native Host**:
    ```bash
    cd native-host
    python install.py
    # Nhập Extension ID khi được hỏi
    ```

4.  **Cài đặt AI Engine**: Làm theo **Bước 4** của Cách 1 (từ mục "Tải mã nguồn AI Core" trở đi).

---

## 📖 Cách sử dụng

### Lần đầu sử dụng
1.  **Khởi động Server**: Mở Terminal tại `external/narrate-ai-core` và chạy lệnh khởi chạy (xem Bước 4.6 ở trên).
2.  **Mở Extension**: Click vào icon **Narrate AI** trên thanh công cụ Chrome.
3.  **Kiểm tra kết nối**: Nếu thấy nút **"Quét trang hiện tại"**, bạn đã sẵn sàng!

### Các tính năng chính

#### 🔍 Đọc toàn bộ trang web
1.  Mở một trang tin tức hoặc bài viết bất kỳ.
2.  Click icon Extension → Nhấn **"Quét trang hiện tại"**.
3.  Extension sẽ tự động trích xuất nội dung và bắt đầu đọc.

#### ✂️ Đọc đoạn văn bản đã chọn
1.  Bôi đen (highlight) đoạn văn bản bạn muốn nghe.
2.  Chuột phải → Chọn **"Đọc đoạn đã chọn"**.

#### 📍 Đọc từ vị trí cụ thể
1.  Click chuột vào vị trí bạn muốn bắt đầu đọc.
2.  Chuột phải → Chọn **"Đọc từ đây"**.
3.  Extension sẽ đọc từ vị trí đó đến hết trang.

#### 🎛️ Điều chỉnh giọng đọc và tốc độ
*   **Giọng đọc**: Chọn từ dropdown (có hơn 60 giọng khác nhau).
*   **Tốc độ**: Kéo thanh slider từ 0.5x (chậm) đến 2.0x (nhanh).
*   **Điều hướng**: Dùng nút ⏮️ ⏭️ để chuyển câu, hoặc kéo thanh tiến trình.

---

## 🔧 Xử lý sự cố (Troubleshooting)

### ❌ Extension báo "Backend Missing"
**Nguyên nhân**: Chưa cài đặt AI Engine hoặc đặt sai thư mục.

**Giải pháp**:
1.  Kiểm tra xem thư mục `external/narrate-ai-core` (hoặc `external/kokoro-engine`) có tồn tại không.
2.  Nếu chưa có, làm lại **Bước 4** trong hướng dẫn cài đặt.
3.  Nhấn nút **"Kiểm tra kết nối ngay"** trong Extension.

### ❌ Server không khởi động được
**Nguyên nhân**: Thiếu Python hoặc UV, hoặc port 8880 đã bị chiếm.

**Giải pháp**:
1.  Kiểm tra Python: `python --version` (cần ≥ 3.10)
2.  Kiểm tra UV: `uv --version`
3.  Kiểm tra port 8880:
    *   **Windows**: `Get-NetTCPConnection -LocalPort 8880`
    *   **macOS**: `lsof -i :8880`
4.  Nếu port bị chiếm, tắt tiến trình đang dùng port đó.

### ❌ Lỗi "Audio Permission Required"
**Nguyên nhân**: Chrome chặn autoplay audio.

**Giải pháp**: Click vào bất kỳ đâu trong Extension panel để cho phép phát âm thanh.

### ❌ Không đọc được nội dung trang
**Nguyên nhân**: Content script chưa được inject.

**Giải pháp**:
1.  Nhấn F5 để refresh trang web.
2.  Thử lại tính năng "Quét trang hiện tại".

### 💡 Cần trợ giúp thêm?
*   Kiểm tra file log tại: `native-host/host_debug.log`
*   Mở Console trong Extension (F12 → Tab Console) để xem lỗi chi tiết.
*   Tạo Issue trên [GitHub](https://github.com/tamle66/Narrate-AI/issues).

---

## ⚠️ Lưu ý quan trọng

*   **Hiệu năng**: Lần đầu khởi động Server sẽ mất 10-15 giây để tải mô hình AI vào RAM/VRAM.
*   **Bộ nhớ**: Server cần khoảng 2-4GB RAM. Nếu dùng GPU, cần thêm 2GB VRAM.
*   **Tắt Server**: Khi không dùng, bạn có thể tắt Server bằng cách nhấn `Ctrl + C` trong Terminal hoặc đóng cửa sổ Terminal.
*   **Bảo mật**: Tất cả dữ liệu được xử lý cục bộ, không gửi lên Internet.

---

## 📄 Giấy phép

Dự án này được phát triển cho mục đích học tập và sử dụng cá nhân. Thành phần AI Engine tuân theo giấy phép của [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M).

---

<p align="center">
  Phát triển với ❤️ bởi <b>Antigravity</b>
</p>

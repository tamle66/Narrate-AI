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

## 🚀 Hướng dẫn cài đặt

### 1. Cài đặt Extension
1. Clone repo này về máy:
   ```bash
   git clone https://github.com/tamle66/TTS-Extension.git
   cd TTS-Extension
   ```
2. Cài đặt Dependencies:
   ```bash
   npm install
   ```
3. Build dự án:
   ```bash
   npm run build
   ```
4. Mở Chrome, truy cập `chrome://extensions/`. Bật **Developer Mode** và chọn **Load unpacked**, sau đó chọn thư mục `dist` trong project.

### 2. Cấu hình AI Engine (Narrate AI Core)
Mở Side Panel của extension và làm theo hướng dẫn trong mục **Setup Guide**:

1. **Clone AI Engine**:
   ```bash
   git clone https://github.com/remsky/Kokoro-FastAPI.git external/kokoro-engine
   # Lưu ý: Xóa thư mục .git bên trong external/kokoro-engine để tránh xung đột
   ```
2. **Cài đặt môi trường**:
   Sử dụng [uv](https://github.com/astral-sh/uv) để đồng bộ môi trường:
   ```bash
   cd external/kokoro-engine
   uv sync --no-dev
   ```
3. **Khởi chạy Server**:
   *   **Windows (NVIDIA GPU)**: `./start-gpu.ps1`
   *   **macOS (Apple Silicon)**: `uv run python -m kokoro_fastapi.main`

---

## 📖 Cách sử dụng

1. **Side Panel**: Click vào icon Extension để mở bảng điều khiển. Tại đây bạn có thể nhấn "Quét trang hiện tại" để đọc toàn bộ bài báo.
2. **Context Menu**: Bôi đen một đoạn văn bản trên bất kỳ trang web nào, chuột phải và chọn **"Đọc đoạn đã chọn"**.
3. **Karaoke Mode**: Khi đang đọc, câu hiện tại sẽ được in đậm và cuộn vào giữa màn hình trang web để bạn dễ quan sát.

---

## ⚠️ Lưu ý kỹ thuật

*   **Autoplay Policy**: Trình duyệt yêu cầu người dùng tương tác với trang web trước khi phát âm thanh tự động. Nếu thấy thông báo "Audio Permission Required", hãy click vào panel để bắt đầu.
*   **C++ Build Error**: Nếu gặp lỗi khi cài đặt trên Windows, extension đã tích hợp sẵn hướng dẫn vá lỗi (Patch Dependencies) bằng cách sử dụng `misaki[en]` để bỏ qua bộ từ điển tiếng Nhật phức tạp.

---

## 📄 Giấy phép

Dự án này được phát triển cho mục đích học tập và sử dụng cá nhân. Thành phần AI Engine tuân theo giấy phép của [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M).

---

<p align="center">
  Phát triển với ❤️ bởi <b>Antigravity</b>
</p>

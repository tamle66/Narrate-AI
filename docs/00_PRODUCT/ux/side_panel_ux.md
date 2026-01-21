# UX Brief: Kokoro TTS Side Panel

## Feature Context
Tiện ích mở rộng Chrome cho phép người dùng nghe nội dung văn bản chất lượng cao từ server Kokoro TTS chạy local. Giao diện chính là Side Panel đóng vai trò trình phát nhạc (media player) và bảng điều khiển.

## User Flow

### 1. Kịch bản: Đọc vùng chọn (Read Selection)
1. User bôi đen văn bản trên web -> Chuột phải -> Chọn **"Read with Kokoro"**.
2. Chrome mở Side Panel (nếu chưa mở).
3. **Trạng thái Loading:** Side Panel hiển thị animation "Đang kết nối..." hoặc "Đang tạo audio...".
4. **Trạng thái Playing:** Audio bắt đầu phát. Hiển thị trình phát (Play/Pause, Thanh thời gian).
5. User nghe và điều khiển (Tạm dừng/Chạy tiếp, Thay đổi tốc độ).

### 2. Kịch bản: Đọc toàn trang (Reader Mode)
1. User mở Side Panel (bấm icon Extension).
2. User bấm nút **"Đọc trang này"** (Parse & Read Page).
3. **Trạng thái Parsing:** Hệ thống quét nội dung trang.
4. **Trạng thái Playing:** Bắt đầu đọc nội dung chính.

### 3. Kịch bản: Server chưa chạy (Cold Start)
1. User thực hiện hành động đọc.
2. Extension kiểm tra kết nối `localhost:8880`.
3. Nếu thất bại -> Gửi lệnh Native Message để start server.
4. **Trạng thái Waiting:** Hiển thị "Đang khởi động Server Kokoro... (Lần đầu mất khoảng 10-15s)".
5. Kết nối thành công -> Chuyển sang Loading -> Playing.

---

## Content Specification (Vietnamese)

### 1. Side Panel - Main View (Trạng thái chờ)
*   **Header:** Kokoro TTS - Local
*   **Action Button 1:** "Đọc trang hiện tại" (Primary Icon Button: Document Scan)
*   **Status Text:** "Sẵn sàng phát"
*   **Instruction:** "Bôi đen văn bản và chọn 'Read with Kokoro' để bắt đầu."

### 2. Side Panel - Player View (Đang phát)
*   **Track Info:** [Tiêu đề đoạn văn/trang web] (Marquee nếu dài)
*   **Controls:**
    *   [Icon Rewind 10s]
    *   [Icon Play/Pause]
    *   [Icon Forward 10s]
*   **Progress Bar:** [00:00 / 05:30]
*   **Settings Group:**
    *   **Label:** "Voice:" [Dropdown: Bella, Sky, Adam...] - Mặc định "af_bella"
    *   **Label:** "Tốc độ:" [Slider hoặc Select: 0.8x - 1.5x] - Mặc định 1.0x

### 3. Settings / Connection State (Trạng thái lỗi/kết nối)
*   **Error State:** "Không thể kết nối Server."
*   **Action:** [Nút] "Thử lại" | [Nút] "Mở Logs"
*   **Loading State:** "Đang khởi động AI Engine..." (Có Progress bar giả định hoặc Spinner)
*   **Success Message:** (Toast) "Đã kết nối!"

---

## Screen States Details

### 1. Initial / Empty State
Side Panel trống, background glassmorphism mờ nhẹ.
Giữa màn hình là Logo Kokoro + Nút to "Đọc trang này".

### 2. Loading State (Buffering)
Khi đang gọi API `/v1/audio/speech`:
- Nút Play chuyển thành Spinner xoay.
- Thanh Progress chạy hiệu ứng "Indeterminate" (chạy qua chạy lại).
- Text: "Đang tạo giọng nói..."

### 3. Error Case: Native Host chưa cài đặt
Nếu gọi Native Message thất bại:
- Thông báo đỏ: "Chưa tìm thấy ứng dụng hỗ trợ."
- Hướng dẫn: "Vui lòng chạy file `install_host.bat` trong thư mục dự án để cài đặt."

---

## Interactions & Animation
- **Hover:** Các nút điều khiển sáng lên (Glow effect) khi di chuột.
- **Glassmorphism:** Nền Side Panel trong suốt mờ (Backdrop filter: blur), màu tối (Dark theme).
- **Waveform (Optional):** Khi đang phát, có một visualizer thanh sóng nhạc nhảy theo điệu (dùng CSS animation giả lập hoặc Web Audio API thật).

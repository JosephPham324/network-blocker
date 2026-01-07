# Đặc tả Yêu cầu Phần mềm (SRS) – MindfulBlock

## 1. Giới thiệu (Introduction)

### 1.1 Mục đích

Tài liệu này xác định các yêu cầu chức năng và phi chức năng cho hệ thống **MindfulBlock**, một ứng dụng cai nghiện kỹ thuật số giúp người dùng lấy lại quyền kiểm soát thời gian bằng cách hạn chế các trang web gây xao nhãng.

### 1.2 Phạm vi hệ thống

Hệ thống bao gồm:

- Ứng dụng máy tính (Tauri)
- Ứng dụng di động (Flutter)
- Hệ thống hậu cần đám mây (Firebase)

Mục tiêu là quản lý cấu hình tập trung và đồng bộ hóa đa thiết bị.

---

## 2. Yêu cầu Chức năng (Functional Requirements)

### 2.1 [FR-01] Quản lý Danh sách Chặn (Blocklist Management)

Người dùng có thể:

- Thêm
- Sửa
- Xóa  
  các tên miền (domain) cần hạn chế.

Hỗ trợ các chế độ chặn:

- **Hard Block**: Chặn hoàn toàn truy cập.
- **Friction Block**: Tạo thử thách trước khi truy cập.
- **Timed Block**: Chặn theo lịch trình (ví dụ: 08:00 – 17:00).

---

### 2.2 [FR-02] Cơ chế Lực cản nhận thức (Cognitive Friction Layer)

Khi truy cập trang bị hạn chế ở chế độ _Friction_, hệ thống kích hoạt một hoặc nhiều cơ chế sau:

- **Mindful Delay**: Đếm ngược thời gian kèm lời nhắc chánh niệm.
- **Math Challenge**: Giải toán ngẫu nhiên để kích hoạt tư duy logic.
- **Typing Challenge**: Gõ lại văn bản cam kết để xác nhận ý định.

Sau khi hoàn thành thử thách thành công, hệ thống cấp **quyền truy cập tạm thời (Grace Period)**.

---

### 2.3 [FR-03] Đồng bộ hóa Đa thiết bị (Multi-platform Sync)

- Tự động đồng bộ các quy tắc chặn giữa PC và Mobile thông qua Firebase Firestore.
- Đảm bảo tính nhất quán dữ liệu dựa trên cơ chế **versioning**.

---

### 2.4 [FR-04] Thống kê và Phân tích (Analytics)

- Ghi lại số lần vi phạm.
- Ghi lại tổng thời gian tập trung thu hồi được.
- Hiển thị biểu đồ xu hướng sử dụng theo tuần.

---

## 3. Yêu cầu Phi chức năng (Non-functional Requirements)

- **Hiệu năng**: Độ trễ đánh chặn mạng không vượt quá `50ms`.
- **Bảo mật**: Không lưu lịch sử duyệt web chi tiết lên Cloud; chỉ lưu metadata sự kiện.
- **Tính ổn định**: Thiết kế _Offline-first_; tự động đồng bộ khi có kết nối mạng trở lại.
- **Tính khả dụng**: Giao diện tối giản, sử dụng bảng màu **Zen Focus** để giảm kích thích thị giác.

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

Sau khi hoàn thành thử thách thành công hoặc sử dụng **Vé truy cập (Pass)** từ cửa hàng, hệ thống cấp **quyền truy cập tạm thời (Grace Period)**.

---

### 2.3 [FR-03] Đồng bộ hóa Đa thiết bị (Multi-platform Sync)

- Tự động đồng bộ các quy tắc chặn giữa PC và Mobile thông qua Firebase Firestore.
- Đảm bảo tính nhất quán dữ liệu dựa trên cơ chế **versioning**.

---

### 2.4 [FR-04] Thống kê và Phân tích (Analytics)

- Ghi lại số lần vi phạm.
- Ghi lại tổng thời gian tập trung thu hồi được.
- Hiển thị biểu đồ xu hướng sử dụng theo tuần.

  2.5 [FR-05] Chế độ Chặn vĩnh viễn (Persistent Block)

Mô tả: Cho phép người dùng đánh dấu một quy tắc chặn là "Persistent".

Yêu cầu:

Khi ứng dụng MindfulBlock bị tắt, các quy tắc "Persistent" phải được giữ lại trong tệp hosts của hệ thống.

Chỉ các quy tắc không phải vĩnh viễn (Session-based) mới được gỡ bỏ khi người dùng chọn "Tạm dừng bảo vệ" hoặc tắt ứng dụng.

Hệ thống phải có cơ chế kiểm tra và áp dụng lại các quy tắc này mỗi khi máy tính khởi động (Service/Daemon).

---

### 2.6 [FR-06] Hệ thống Gamification

Mô tả: Hệ thống khuyến khích người dùng duy trì sự tập trung thông qua gamification.

Yêu cầu:

- **Streak Tracking**: Theo dõi số ngày liên tiếp người dùng duy trì các quy tắc chặn.
  - Hiển thị streak hiện tại
  - Ghi nhận streak dài nhất
  - **Streak Freeze**: Cho phép sử dụng vật phẩm bảo vệ để không bị ngắt streak khi lỡ một ngày.
  
- **Token Shop**: Hệ thống kinh tế trong ứng dụng.
  - **Earning**: Nhận token sau mỗi phiên tập trung thành công.
  - **Rewards**: Đổi token lấy các vật phẩm (Site Pass, Group Pass, Streak Freeze, Focus Boost).
  - **Focus Boost**: Vật phẩm tăng gấp đôi lượng token nhận được cho phiên tiếp theo.
  
- **Digital Garden**: Biểu diễn trực quan tiến độ và sự phát triển.
  - Các yếu tố hình ảnh phát triển dựa trên mức độ tương tác
  - Khuyến khích sử dụng nhất quán
  
- **Calendar View**: Lịch tương tác hiển thị các ngày hoạt động.
  - Đánh dấu các ngày có phiên chặn active và các ngày sử dụng Streak Freeze.
  - Giúp nhận diện các mẫu hình năng suất
  
- **Persistence**: Dữ liệu gamification được lưu cục bộ và đồng bộ với cloud.

---

### 2.7 [FR-07] Quản lý Cài đặt (Settings Management)

Mô tả: Giao diện cấu hình ứng dụng tập trung.

Yêu cầu:

- **Global Toggle**: Bật/tắt tất cả quy tắc chặn bằng một công tắc.
- **Clean on Exit**: Tùy chọn tự động dọn dẹp file hosts khi thoát ứng dụng.
- **Minimize to Tray**: Mặc định thu nhỏ ứng dụng xuống khay hệ thống thay vì đóng hoàn toàn để đảm bảo tính liên tục của việc chặn và tracking.
- **Friction Preferences**: Cấu hình loại thử thách (Math, Wait, Typing) cho chế độ friction.
- **Settings Sync**: Đồng bộ cài đặt giữa các thiết bị qua Firebase.
- **Persistence**: Lưu trữ cài đặt cục bộ và khôi phục khi khởi động lại.

---

## 3. Yêu cầu Phi chức năng (Non-functional Requirements)

- **Hiệu năng**: Độ trễ đánh chặn mạng không vượt quá `50ms`.
- **Bảo mật**: Không lưu lịch sử duyệt web chi tiết lên Cloud; chỉ lưu metadata sự kiện.
- **Tính ổn định**: Thiết kế _Offline-first_; tự động đồng bộ khi có kết nối mạng trở lại.
- **Tính khả dụng**: Giao diện tối giản, sử dụng bảng màu **Zen Focus** để giảm kích thích thị giác.

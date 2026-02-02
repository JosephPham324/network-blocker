# Mindful Block

[English](./README.md) | **Tiếng Việt**

Mindful Block là một ứng dụng desktop được thiết kế để giúp người dùng duy trì sự tập trung bằng cách chặn các website gây xao nhãng. Ứng dụng hoạt động bằng cách chỉnh sửa file hệ thống `hosts` để chuyển hướng các domain bị chặn về localhost, từ đó ngăn truy cập hiệu quả.

## Tính năng

### Chức năng cốt lõi

- **Chế độ chặn**:
    - **Hard Block**: Chặn truyền thống dựa trên file hosts. Không thể truy cập.
    - **Friction Block**: Yêu cầu hoàn thành một thử thách để truy cập nội dung. Các loại:
        - **Thử thách Toán học**: Giải một phép nhân.
        - **Chờ đợi**: Tạm dừng 15 giây.
        - **Gõ xác nhận**: Gõ một câu xác nhận cụ thể (ví dụ: “I choose to be distracted”).
- **Quản lý file Hosts**: Tự động đọc, ghi và sao lưu file hosts. Yêu cầu quyền Administrator.
- **Xóa cache DNS**: Tự động flush DNS trên Windows để đảm bảo các quy tắc chặn có hiệu lực ngay lập tức.
- **Tiện ích mở rộng trình duyệt**: Thành phần bắt buộc cho “Friction Mode”. Chặn điều hướng đến các site bị chặn và hiển thị giao diện thử thách.
### Quản lý quy tắc
- **Thêm/Xóa quy tắc**: Dễ dàng thêm domain vào danh sách chặn.
- **Nhóm**: Tổ chức các quy tắc chặn thành các nhóm tùy chỉnh.
- **Thao tác hàng loạt**: Chọn nhiều quy tắc để bật/tắt, xóa hoặc chuyển nhóm cùng lúc.
- **Nhập quy tắc**: Nhập các quy tắc chặn từ nguồn bên ngoài (hỗ trợ CSV).
- **Đồng bộ đám mây**: Đồng bộ quy tắc và nhóm giữa các thiết bị bằng Firebase Authentication (đăng nhập Google).
### Gamification và Theo dõi Tiến độ
- **Hệ thống Streak**: Theo dõi số ngày liên tiếp tập trung thành công.
- **Digital Garden**: Biểu diễn trực quan tiến độ và sự phát triển của bạn theo thời gian.
- **Lịch xem**: Lịch tương tác hiển thị các ngày hoạt động và mẫu hình của bạn.
- **Bảng thống kê**: Xem thông tin chi tiết về hiệu quả chặn và mẫu sử dụng.

### Cài đặt và Cấu hình
- **Công tắc toàn cục**: Bật hoặc tắt toàn bộ quy tắc chặn chỉ với một thao tác.
- **Dọn dẹp khi thoát**: Tùy chọn tự động xóa tất cả các mục chặn khỏi file hosts khi đóng ứng dụng.
- **Lưu trữ cài đặt**: Tất cả các tùy chọn cấu hình được lưu cục bộ và đồng bộ lên cloud.
- **Tùy chỉnh Thử thách Friction**: Cấu hình loại thử thách (Toán học, Chờ đợi, Gõ) được sử dụng cho chế độ friction.
## Tài liệu
- [Ý tưởng & Khái niệm sản phẩm](./docs/index.html)
- [Yêu cầu chi tiết (SRS/SDD)](./docs/documents.html)
- [Bản thiết kế Tech Stack](./docs/tech_stack_blueprint.html)
- [Ngữ cảnh kỹ thuật](./docs/tech-context.md)
## Công nghệ sử dụng
### Frontend (Ứng dụng Desktop)
- **Framework**: [React](https://react.dev/)
- **Công cụ build**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
### Backend (Tích hợp hệ thống)
- **Framework**: [Tauri v2](https://tauri.app/) (Rust)
- **Plugins**:
    - `tauri-plugin-shell`: Chạy lệnh hệ thống (ví dụ: `ipconfig`).
    - `tauri-plugin-autostart`: Tự khởi động ứng dụng cùng hệ thống.
    - `tauri-plugin-oauth`: Xử lý luồng OAuth.
    - `is_elevated`: Kiểm tra quyền Administrator.
### Cloud & Xác thực
- **Firebase**: Authentication và Firestore cho lưu trữ dữ liệu và đồng bộ.
## Cấu trúc dự án

Dự án sử dụng mô hình monorepo với **pnpm**:

- **`apps/pc`**: Ứng dụng desktop chính (Tauri + React).
    - `src/components/`: Các component UI (BlockList, Gamification, Settings, v.v.)
    - `src/services/`: Lớp dịch vụ (GamificationService, Firebase, Tauri IPC)
    - `src/hooks/`: Custom React hooks quản lý state
    - `src-tauri/`: Backend Rust tích hợp hệ thống
- **`apps/extension`**: Tiện ích mở rộng trình duyệt (Chrome/Edge/Brave) cho chế độ friction.
- **`apps/mobile`**: Ứng dụng di động (Flutter) - 🚧 Đang phát triển.
- **`apps/web`**: Giao diện web (nếu có).
- **`backend`**: Backend services (Firebase Functions, Firestore rules).
- **`shared`**: Schemas, tiện ích và hằng số dùng chung.
- **`docs`**: Tài liệu dự án (SRS, SDD, ngữ cảnh kỹ thuật).
## Bắt đầu
### Yêu cầu
- **Node.js** & **pnpm**
- **Rust** (cho backend Tauri)
- **Microsoft Visual Studio C++ Build Tools** (trên Windows)
### Cài đặt
1. Clone repository.
2. Cài đặt dependencies:
    ```bash
	    pnpm install
    ```
3. Chạy ứng dụng desktop ở chế độ development:
    ```bash
    cd apps/pc
    pnpm tauri dev
    ```
> **Lưu ý**: Ứng dụng yêu cầu quyền Administrator để chỉnh sửa file `hosts`. Đảm bảo chạy terminal hoặc ứng dụng với quyền Administrator.
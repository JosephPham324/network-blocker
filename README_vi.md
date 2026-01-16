# Mindful Block

[English](README.md) | **Tiếng Việt**

Mindful Block là một ứng dụng máy tính để bàn được thiết kế để giúp người dùng duy trì sự tập trung bằng cách chặn các trang web gây xao nhãng. Nó hoạt động bằng cách sửa đổi tệp `hosts` của hệ thống để chuyển hướng các tên miền được chỉ định về localhost, ngăn chặn truy cập một cách hiệu quả.

## Tính năng

### Chức năng cốt lõi
-   **Chặn trang web**: Chặn quyền truy cập vào các trang web gây xao nhãng bằng cách trỏ tên miền của chúng về `127.0.0.1` và `::1` trong tệp `hosts` hệ thống.
-   **Quản lý tệp Hosts**: Tự động xử lý việc đọc, ghi và sao lưu tệp hosts. Yêu cầu quyền Quản trị viên (Administrator).
-   **Xóa bộ nhớ đệm DNS**: Tự động xóa bộ nhớ đệm (flush) DNS trên Windows để đảm bảo các quy tắc chặn có hiệu lực ngay lập tức.

### Quản lý quy tắc
-   **Thêm/Xóa quy tắc**: Dễ dàng thêm các tên miền vào danh sách chặn của bạn.
-   **Nhóm**: Tổ chức các quy tắc chặn thành các nhóm tùy chỉnh.
-   **Thao tác hàng loạt**: Chọn nhiều quy tắc để bật/tắt, xóa hoặc di chuyển chúng vào các nhóm cùng một lúc.
-   **Nhập quy tắc**: Nhập các quy tắc chặn từ nguồn bên ngoài (hỗ trợ CSV).
-   **Đồng bộ đám mây**: Đồng bộ hóa các quy tắc và nhóm chặn của bạn trên các thiết bị bằng Xác thực Firebase (Đăng nhập Google).

### Cài đặt cụ thể
-   **Bật/Tắt toàn bộ**: Nhanh chóng bật hoặc tắt tất cả các quy tắc chặn chỉ với một công tắc.
-   **Dọn dẹp khi thoát**: Tùy chọn tự động xóa tất cả các mục chặn khỏi tệp hosts khi đóng ứng dụng, đảm bảo mạng của bạn trở lại bình thường.

## Công nghệ sử dụng

### Frontend (Ứng dụng Desktop)
-   **Framework**: [React](https://react.dev/)
-   **Công cụ Build**: [Vite](https://vitejs.dev/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Backend (Tích hợp hệ thống)
-   **Framework**: [Tauri v2](https://tauri.app/) (Rust)
-   **Plugins**:
    -   `tauri-plugin-shell`: Để chạy các lệnh hệ thống (ví dụ: `ipconfig`).
    -   `tauri-plugin-autostart`: Để khởi chạy ứng dụng khi khởi động hệ thống.
    -   `tauri-plugin-oauth`: Để xử lý luồng đăng nhập OAuth.
    -   `is_elevated`: Để kiểm tra quyền quản trị cần thiết.

### Cloud & Auth
-   **Firebase**: Xác thực (Authentication) và Firestore để lưu trữ dữ liệu và đồng bộ hóa.

## Cấu trúc dự án

Dự án này là một monorepo được quản lý bằng **pnpm**:

-   `apps/pc`: Ứng dụng desktop chính (Tauri + React).
-   `backend`: Các dịch vụ backend (Firebase functions, v.v.).
-   `shared`: Mã và tiện ích chia sẻ được sử dụng giữa các gói.
-   `docs`: Tài liệu dự án.

## Bắt đầu

### Yêu cầu tiên quyết
-   **Node.js** & **pnpm**
-   **Rust** (cho Tauri backend)
-   **Microsoft Visual Studio C++ Build Tools** (trên Windows)

### Cài đặt

1.  Clone repository về máy.
2.  Cài đặt các dependencies:
    ```bash
    pnpm install
    ```
3.  Chạy ứng dụng desktop ở chế độ development:
    ```bash
    cd apps/pc
    pnpm tauri dev
    ```

> **Lưu ý**: Ứng dụng yêu cầu quyền Quản trị viên (Administrator) để sửa đổi tệp `hosts`. Đảm bảo bạn chạy terminal hoặc ứng dụng với tư cách Quản trị viên.

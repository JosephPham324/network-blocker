# Tài liệu Thiết kế Hệ thống (SDD) – MindfulBlock

## 1. Kiến trúc Tổng thể (System Architecture)

Hệ thống sử dụng mô hình **Distributed Client–Serverless** với cấu trúc **Monorepo**.

### 1.1 Sơ đồ thành phần

#### Apps

- **pc**

  - Công nghệ: Tauri (Rust backend + React frontend)
  - Chức năng: Can thiệp vào file `hosts` hoặc DNS hệ thống để chặn truy cập.

- **mobile**
  - Công nghệ: Flutter
  - Chức năng: Sử dụng `VpnService` để tạo hầm DNS giả lập cục bộ.

#### Shared

- **schemas**
  - JSON Schema định nghĩa thực thể `BlockRule`.

#### Backend

- **Firebase Auth**: Định danh người dùng.
- **Firestore**: Lưu trữ trạng thái đồng bộ.
- **Cloud Functions**: Chuẩn hóa dữ liệu và phân tích ý định.

---

## 2. Thiết kế Dữ liệu (Data Design)

### 2.1 Cấu trúc Firestore (Paths)

**Đường dẫn dữ liệu riêng tư**

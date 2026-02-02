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

```
users/{userId}/
├── rules/              # BlockRule documents
├── groups/             # RuleGroup documents
├── settings/           # User settings
└── gamification/       # Streak and activity data
```

---

## 3. Kiến trúc Component (Component Architecture)

### 3.1 Frontend (React)

**Component Hierarchy:**
```
App.jsx
├── Sidebar.jsx          # Navigation
├── Dashboard.jsx        # Overview screen
├── BlockList.jsx        # Main rule management
│   ├── FrictionModal.jsx  # Confirmation dialogs
│   └── (Rule items)
├── Gamification.jsx     # Progress tracking
│   ├── Streak display
│   ├── Digital garden
│   └── Calendar view
├── Settings.jsx         # App configuration
└── Login.jsx           # Authentication
```

**State Management:**
- Custom hooks: `useBlockRules()`, `useSettings()`
- React Context for global state (auth, settings)
- Local state for UI interactions

### 3.2 Service Layer

**Services organization:**
- `GamificationService.js`: Manages activity tracking, streak calculation
- `firebase.js`: Cloud operations, authentication
- `tauri.js`: IPC wrapper with mock mode support

### 3.3 Backend (Rust/Tauri)

**Command Structure:**
- `apply_blocking_rules`: Hosts file + cache update
- `check_admin_privileges`: Permission verification
- `start_server`: OAuth and rules server initialization

---

## 4. Mô hình Dữ liệu Gamification (Gamification Data Model)

### 4.1 Streak Calculation Algorithm

```javascript
// Pseudo-code
function calculateStreak(activityDates) {
  let currentStreak = 0;
  let today = getCurrentDate();
  
  // Check if user has activity today or yesterday
  if (!hasActivityOn(today) && !hasActivityOn(yesterday)) {
    return 0; // Streak broken
  }
  
  // Count backwards from today
  let checkDate = today;
  while (hasActivityOn(checkDate)) {
    currentStreak++;
    checkDate = previousDay(checkDate);
  }
  
  return currentStreak;
}
```

### 4.2 Data Persistence Strategy

**Local Storage:**
- Primary storage: Browser localStorage / Tauri store
- Fast access for UI updates
- Survives app restarts

**Cloud Sync:**
- Periodic sync to Firestore (`users/{userId}/gamification`)
- Conflict resolution: Server timestamp wins
- Enables cross-device access

**Data Structure:**
```typescript
interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  activeDays: string[];  // ISO date strings
  lastActivityDate: string;
  totalFocusSessions: number;
}
```


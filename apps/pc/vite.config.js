import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Tauri yêu cầu cổng cố định để kết nối
  server: {
    port: 5173,
    strictPort: true,
  },
  // Hỗ trợ các biến môi trường
  define: {
    "process.env": {},
    __firebase_config: JSON.stringify({
      apiKey: "AIzaSyDd7aTLw6Q-Wq4g4pbmivrqniZ6Lrch9uo",
      authDomain: "mindfulblock-33657.firebaseapp.com",
      projectId: "mindfulblock-33657",
      storageBucket: "mindfulblock-33657.firebasestorage.app",
      messagingSenderId: "246566415924",
      appId: "1:246566415924:web:57e74c4c189b7a37d06461",
      measurementId: "G-EE1LYBN7SZ",
    }),
    __app_id: JSON.stringify("1:246566415924:web:57e74c4c189b7a37d06461"),
  },
});

import React from "react";
import { ShieldAlert } from "lucide-react";

export const AdminRequired = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-red-50 p-10 text-center">
    <ShieldAlert size={64} className="text-red-500 mb-4" />
    <h2 className="text-2xl font-bold text-red-900 font-serif">Yêu cầu quyền Administrator</h2>
    <p className="text-red-700 mt-2 max-w-sm">
      Vui lòng khởi động lại ứng dụng bằng quyền <b>"Run as Administrator"</b> để bật tính năng chặn.
    </p>
    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold">
      Thử lại
    </button>
  </div>
);

export const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#FDFCF8]">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
    <p className="text-primary font-bold animate-pulse">Đang kết nối...</p>
  </div>
);

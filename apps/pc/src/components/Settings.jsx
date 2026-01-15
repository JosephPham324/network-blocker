import React from "react";
import { Shield, ShieldAlert, Power, LogOut } from "lucide-react";

const Settings = ({ settings, toggleBlocking, toggleCleanOnExit }) => {
  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">Cài đặt</h2>
        <p className="text-slate-400 mt-2 text-lg">Quản lý hành vi của ứng dụng.</p>
      </header>

      <div className="grid gap-6">
        {/* Global Blocking Toggle */}
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${settings.blockingEnabled ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                    {settings.blockingEnabled ? <Shield size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">Chặn toàn hệ thống</h3>
                    <p className="text-slate-400 text-sm">Tắt tính năng này sẽ vô hiệu hóa tất cả các quy tắc chặn.</p>
                </div>
            </div>
            <button 
                onClick={toggleBlocking}
                className={`w-16 h-8 rounded-full transition-colors relative ${settings.blockingEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.blockingEnabled ? "left-9" : "left-1"}`} />
            </button>
        </div>

        {/* Clean on Exit Toggle */}
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                    <Power size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">Xóa quy tắc khi thoát</h3>
                    <p className="text-slate-400 text-sm">Tự động bỏ chặn tất cả khi bạn tắt ứng dụng.</p>
                </div>
            </div>
            <button 
                onClick={toggleCleanOnExit}
                className={`w-16 h-8 rounded-full transition-colors relative ${settings.cleanOnExit ? "bg-amber-500" : "bg-slate-200"}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.cleanOnExit ? "left-9" : "left-1"}`} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

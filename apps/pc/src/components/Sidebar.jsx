import React from "react";
import { Shield, Activity, Lock, LogOut, Settings as SettingsIcon } from "lucide-react";
import { signOut } from "firebase/auth"; 
import { auth } from "../services/firebase"; 
import { translations } from "../locales";

const Sidebar = ({ activeTab, setActiveTab, status, onLogout, language = "vi" }) => {
  const t = translations[language].sidebar;

  return (
    <aside className="w-72 border-r border-[#F4F1EA] p-8 bg-white flex flex-col shadow-sm">
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-[#354F52] p-2.5 rounded-2xl text-white shadow-lg shadow-[#354F52]/20">
          <Shield size={22} />
        </div>
        <h1 className="font-bold text-xl text-[#354F52] font-serif">MindfulBlock</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {/* ... (Keep existing buttons) ... */}
        <button
          onClick={() => setActiveTab("dash")}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
            activeTab === "dash" ? "bg-[#EBE7DE] text-[#354F52] font-bold" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Activity size={18} /> <span className="text-sm">{t.dash}</span>
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
            activeTab === "list" ? "bg-[#EBE7DE] text-[#354F52] font-bold" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <Lock size={18} /> <span className="text-sm">{t.list}</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
            activeTab === "settings" ? "bg-[#EBE7DE] text-[#354F52] font-bold" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <SettingsIcon size={18} /> <span className="text-sm">{t.settings}</span>
        </button>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto space-y-4">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} /> <span className="text-sm font-bold">{t.logout}</span>
        </button>

        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${
                status.includes("Bảo vệ") || status === "Protected" || status === "Đang được bảo vệ" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-[10px] font-bold uppercase text-slate-400">System</span>
          </div>
          <p className="text-[11px] font-bold text-primary truncate leading-tight uppercase tracking-tighter">{status}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

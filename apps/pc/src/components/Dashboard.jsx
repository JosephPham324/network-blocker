import React from "react";
import { BarChart3 } from "lucide-react";

import { translations } from "../locales";

const Dashboard = ({ rulesCount, stats, language = "vi" }) => {
  const t = translations[language].dashboard;
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">{t.title}</h2>
        <p className="text-slate-400 mt-2 text-lg">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-6xl font-bold text-emerald-600 mb-2 tracking-tighter">{rulesCount}</p>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{t.rules_active}</p>
        </div>
        <div className="bg-primary p-10 rounded-[48px] text-white shadow-xl shadow-primary/20">
          <p className="text-6xl font-bold mb-2 tracking-tighter">{stats?.time_saved_minutes || 0}m</p>
          <p className="text-xs text-white/50 uppercase font-bold tracking-widest">{t.time_saved}</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[56px] border border-slate-100 flex flex-col items-center justify-center text-center py-20 shadow-sm">
        <BarChart3 className="text-slate-100 mb-6" size={80} />
        <h3 className="text-2xl font-bold text-[#354F52] mb-2 font-serif">{t.analysis_title}</h3>
        <p className="text-slate-400 max-w-xs text-sm leading-relaxed">{t.analysis_desc}</p>
      </div>
    </div>
  );
};

export default Dashboard;

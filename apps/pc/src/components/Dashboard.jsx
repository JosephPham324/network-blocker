import React from "react";
import { BarChart3 } from "lucide-react";

const Dashboard = ({ rulesCount }) => {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">Chào bạn,</h2>
        <p className="text-slate-400 mt-2 text-lg">Hệ thống đang giúp bạn làm chủ thời gian.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-6xl font-bold text-emerald-600 mb-2 tracking-tighter">{rulesCount}</p>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Quy tắc đang chạy</p>
        </div>
        <div className="bg-primary p-10 rounded-[48px] text-white shadow-xl shadow-primary/20">
          <p className="text-6xl font-bold mb-2 tracking-tighter">142m</p>
          <p className="text-xs text-white/50 uppercase font-bold tracking-widest">Thời gian thu hồi</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[56px] border border-slate-100 flex flex-col items-center justify-center text-center py-20 shadow-sm">
        <BarChart3 className="text-slate-100 mb-6" size={80} />
        <h3 className="text-2xl font-bold text-[#354F52] mb-2 font-serif">Phân tích chánh niệm</h3>
        <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Dữ liệu thống kê sẽ xuất hiện sau 24 giờ hoạt động tập trung.</p>
      </div>
    </div>
  );
};

export default Dashboard;

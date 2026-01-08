import React, { useState } from "react";
import { Globe, Trash2 } from "lucide-react";

const BlockList = ({ rules, onAdd, onDelete }) => {
  const [newDomain, setNewDomain] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newDomain);
    setNewDomain("");
  };

  return (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">Danh sách chặn</h2>
        <p className="text-slate-400 mt-2 text-lg">Tự động đồng bộ tới tất cả thiết bị của bạn.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1 relative group">
          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="domain.com (ví dụ: signal.org)..."
            className="w-full pl-16 pr-8 py-6 rounded-[32px] bg-white border-none shadow-sm focus:ring-4 focus:ring-primary/5 outline-none text-xl font-medium"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-10 rounded-[32px] font-bold hover:shadow-lg transition-all active:scale-95 shadow-primary/20 text-lg"
        >
          Chặn
        </button>
      </form>

      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4">Websites Đang Giám Sát</h3>
        {rules.map((r) => (
          <div
            key={r.id}
            className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center group hover:border-emerald-100 hover:shadow-xl hover:translate-y-[-2px] transition-all shadow-sm"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xl text-primary shadow-inner">
                {r.domain.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-2xl text-[#354F52] tracking-tighter">{r.domain}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onDelete(r.id)}
                className="p-4 text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-2xl"
              >
                <Trash2 size={24} />
              </button>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100">
            <p className="text-slate-300 italic font-bold">Danh sách hiện đang trống</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockList;

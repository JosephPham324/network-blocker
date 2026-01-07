/** Location: /apps/pc/src/App.jsx **/
import React, { useState, useEffect } from "react";
import { Shield, Lock, Settings, Activity, AlertCircle, CheckCircle2, Plus, Zap, BarChart3, Clock, Brain, Globe } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- Cấu hình Firebase ---
const firebaseConfig = JSON.parse(__firebase_config || "{}");
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const appId = typeof __app_id !== "undefined" ? __app_id : "mindful-block-prod";

// --- Logic chuẩn hóa tên miền ---
const normalizeDomain = (url) => {
  try {
    let domain = url.toLowerCase().trim();
    if (domain.includes("/")) {
      const urlObj = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
      domain = urlObj.hostname;
    }
    return domain.replace("www.", "");
  } catch (e) {
    return url.toLowerCase().trim();
  }
};

const safeInvoke = async (cmd, args) => {
  if (window.__TAURI__) {
    try {
      const { invoke } = window.__TAURI__.tauri;
      return await invoke(cmd, args);
    } catch (e) {
      console.error("Tauri Error:", e);
      return null;
    }
  }
  console.log(`[MOCK] Calling Tauri: ${cmd}`, args);
  return "SUCCESS";
};

// --- UI COMPONENTS ---
const Sidebar = ({ activeTab, setActiveTab, isSyncing, user }) => (
  <aside className="w-72 border-r border-[#F4F1EA] p-8 bg-white flex flex-col h-full shadow-sm">
    <div className="flex items-center gap-4 mb-16">
      <div className="bg-[#354F52] p-2.5 rounded-2xl text-white shadow-lg shadow-[#354F52]/20">
        <Shield size={28} />
      </div>
      <div>
        <h1 className="font-bold font-serif text-2xl text-[#354F52]">MindfulBlock</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Edition</p>
      </div>
    </div>
    <nav className="space-y-3 flex-1">
      <button
        onClick={() => setActiveTab("dash")}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
          activeTab === "dash" ? "bg-[#EBE7DE] text-[#354F52] font-bold shadow-inner" : "text-slate-400 hover:bg-slate-50"
        }`}
      >
        <Activity size={20} /> <span>Bảng điều khiển</span>
      </button>
      <button
        onClick={() => setActiveTab("list")}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
          activeTab === "list" ? "bg-[#EBE7DE] text-[#354F52] font-bold shadow-inner" : "text-slate-400 hover:bg-slate-50"
        }`}
      >
        <Lock size={20} /> <span>Danh sách chặn</span>
      </button>
    </nav>
    <div className="mt-auto p-5 bg-slate-50 rounded-3xl border border-slate-100">
      <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-400 uppercase">
        <span>Trạng thái Cloud</span>
        <div className={`w-2 h-2 rounded-full ${user ? "bg-emerald-500" : "bg-amber-500"}`} />
      </div>
      <p className="text-xs font-semibold text-[#354F52]">{user ? "Đã kết nối an toàn" : "Đang kết nối..."}</p>
    </div>
  </aside>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("dash");
  const [rules, setRules] = useState([]);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  // RULE 3: Auth Before Queries
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth Error", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sync logic
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    const path = `artifacts/${appId}/users/${user.uid}/block_configs`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRules(data);
        setIsSyncing(false);

        const formatted = data.map((r) => ({ domain: r.domain, is_active: r.is_active }));
        safeInvoke("sync_system_hosts", { rules: formatted });
      },
      (err) => {
        console.error("Firestore error", err);
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addRule = async (e) => {
    e.preventDefault();
    if (!newDomain || !user) return;

    const normalized = normalizeDomain(newDomain);
    const path = `artifacts/${appId}/users/${user.uid}/block_configs`;

    try {
      await addDoc(collection(db, path), {
        domain: normalized,
        is_active: true,
        mode: "HARD",
        v: 1,
        updated_at: serverTimestamp(),
      });
      setNewDomain("");
    } catch (e) {
      console.error("Add Rule Error", e);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFCF8] text-[#2F3E46] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSyncing={isSyncing} user={user} />

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === "dash" ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-serif font-bold text-[#354F52]">Bảng điều khiển</h2>
              <p className="text-slate-400 mt-2">Giám sát trạng thái tập trung trên các thiết bị của bạn.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <Brain className="text-[#354F52] mb-4" size={32} />
                <p className="text-3xl font-bold text-[#354F52]">142m</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Thời gian thu hồi</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <Shield className="text-[#84A98C] mb-4" size={32} />
                <p className="text-3xl font-bold text-[#354F52]">{rules.length}</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Quy tắc đang chạy</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <Zap className="text-[#E29578] mb-4" size={32} />
                <p className="text-3xl font-bold text-[#354F52]">08</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Lần chặn hôm nay</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-serif font-bold text-[#354F52]">Danh sách chặn</h2>
              <p className="text-slate-400 mt-2">Thêm hoặc quản lý các tên miền cần hạn chế.</p>
            </header>

            <form onSubmit={addRule} className="flex gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Nhập tên miền (vd: facebook.com)..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#354F52]/10 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-[#354F52] text-white px-10 py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 shadow-[#354F52]/20"
              >
                Chặn ngay
              </button>
            </form>

            <div className="space-y-4 mt-8">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white p-6 rounded-[28px] border border-slate-100 flex justify-between items-center group hover:border-[#84A98C] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                        rule.is_active ? "bg-[#354F52]" : "bg-slate-200"
                      }`}
                    >
                      {rule.domain.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-lg text-[#354F52]">{rule.domain}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mode: {rule.mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">v{rule.v}</span>
                    <div className={`w-3 h-3 rounded-full ${rule.is_active ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-200"}`} />
                  </div>
                </div>
              ))}
              {rules.length === 0 && !isSyncing && (
                <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Chưa có tên miền nào trong danh sách.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

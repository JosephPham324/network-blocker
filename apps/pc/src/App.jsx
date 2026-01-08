import React, { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth, isCloudReady } from "./services/firebase";
import { callRust } from "./services/tauri";
import { useBlockRules } from "./hooks/useBlockRules";

// Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BlockList from "./components/BlockList";
import { AdminRequired, LoadingScreen } from "./components/StateScreens";

const App = () => {
  const [activeTab, setActiveTab] = useState("dash");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  // Hook for Block Rules Logic
  const { rules, status, addRule, deleteRule } = useBlockRules(user, setIsAdmin);

  // Initialization Check (Admin & Auth)
  useEffect(() => {
    const init = async () => {
      const elevated = await callRust("check_admin_privileges");
      setIsAdmin(elevated === true || elevated === "MOCK_SUCCESS");

      if (isCloudReady) {
        signInAnonymously(auth).catch(console.error);
        return onAuthStateChanged(auth, setUser);
      } else {
        setUser({ uid: "local-user" });
      }
    };
    init();
  }, []);

  if (!isAdmin) return <AdminRequired />;
  if (!user) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-[#FDFCF8] text-[#2F3E46] font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === "dash" ? <Dashboard rulesCount={rules.length} /> : <BlockList rules={rules} onAdd={addRule} onDelete={deleteRule} />}
      </main>
    </div>
  );
};

export default App;

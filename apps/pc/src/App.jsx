import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isCloudReady } from "./services/firebase";
import { callRust } from "./services/tauri";
import { useBlockRules } from "./hooks/useBlockRules";

// Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BlockList from "./components/BlockList";
import Login from "./components/Login"; // <--- Import Login
import { AdminRequired, LoadingScreen } from "./components/StateScreens";

const App = () => {
  const [activeTab, setActiveTab] = useState("dash");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // <--- Add loading state for Auth
  const [isAdmin, setIsAdmin] = useState(true);

  // Hook for Block Rules Logic
  const { rules, status, addRule, deleteRule } = useBlockRules(user, setIsAdmin);

  // Check Admin & Auth Status
  useEffect(() => {
    const init = async () => {
      // 1. Check Admin
      const elevated = await callRust("check_admin_privileges");
      setIsAdmin(elevated === true || elevated === "MOCK_SUCCESS");

      // 2. Check Auth
      if (isCloudReady) {
        // Stop using signInAnonymously here. Just listen for changes.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false); // Stop loading once we know if user is in or out
        });
        return unsubscribe;
      } else {
        // Local/Mock Mode
        setUser({ uid: "local-user" });
        setAuthLoading(false);
      }
    };
    init();
  }, []);

  if (!isAdmin) return <AdminRequired />;

  // Show spinner while checking if user is already logged in
  if (authLoading) return <LoadingScreen />;

  // If no user, show Login screen
  if (!user) return <Login />;

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

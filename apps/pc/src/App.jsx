import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isCloudReady } from "./services/firebase";
import { callRust } from "./services/tauri";
import { useBlockRules } from "./hooks/useBlockRules";

// Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BlockList from "./components/BlockList";
import Login from "./components/Login";
import { AdminRequired, LoadingScreen } from "./components/StateScreens";

const App = () => {
  const [activeTab, setActiveTab] = useState("dash");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  // Hook for Block Rules Logic
  // 1. Extract 'groups' here
  const {
    rules,
    groups, // <--- Added this
    status,
    addRule,
    deleteRule,
    toggleRule,
    toggleBatch,
    deleteBatch,
    moveBatchToGroup,
  } = useBlockRules(user, setIsAdmin);

  useEffect(() => {
    const init = async () => {
      // 1. Check Admin
      const elevated = await callRust("check_admin_privileges");
      setIsAdmin(elevated === true || elevated === "MOCK_SUCCESS");

      // 2. Check Auth
      if (isCloudReady) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
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
        {activeTab === "dash" ? (
          <Dashboard rulesCount={rules.length} />
        ) : (
          <BlockList
            rules={rules}
            groups={groups} // <--- Pass it down here
            onAdd={addRule}
            onDelete={deleteRule}
            onToggle={toggleRule}
            onBatchDelete={deleteBatch}
            onBatchToggle={toggleBatch}
            onBatchMove={moveBatchToGroup}
          />
        )}
      </main>
    </div>
  );
};

export default App;

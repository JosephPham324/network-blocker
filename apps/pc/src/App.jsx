import React, { useState, useEffect } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, isCloudReady } from "./services/firebase";
import { callRust } from "./services/tauri";
import { useBlockRules } from "./hooks/useBlockRules";

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

  const { rules, groups, status, addRule, deleteRule, toggleRule, toggleBatch, deleteBatch, moveBatchToGroup, deleteGroup, importRules } = useBlockRules(
    user,
    setIsAdmin
  );

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      if (isCloudReady) {
        try {
          await getRedirectResult(auth);

          unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("AUTH STATE:", user);
            setUser(user);
            setAuthLoading(false);
          });
        } catch (error) {
          console.error("Auth init error:", error);
          setAuthLoading(false);
        }
      } else {
        setUser({ uid: "local-user" });
        setAuthLoading(false);
      }
    };

    initAuth();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    callRust("check_admin_privileges").then((elevated) => {
      setIsAdmin(elevated === true || elevated === "MOCK_SUCCESS");
    });
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Login />;
  if (!isAdmin) return <AdminRequired />;

  return (
    <div className="flex h-screen bg-[#FDFCF8] text-[#2F3E46] font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      <main className="flex-1 p-12 overflow-y-auto">
        {activeTab === "dash" && <Dashboard rulesCount={rules.length} />}
        {activeTab === "list" && (
          <BlockList
            rules={rules}
            groups={groups}
            onAdd={addRule}
            onDelete={deleteRule}
            onToggle={toggleRule}
            onBatchDelete={deleteBatch}
            onBatchToggle={toggleBatch}
            onBatchMove={moveBatchToGroup}
            onDeleteGroup={deleteGroup}
            onImport={importRules}
          />
        )}
      </main>
    </div>
  );
};

export default App;

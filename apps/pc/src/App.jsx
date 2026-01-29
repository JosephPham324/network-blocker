import React, { useState, useEffect } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, isCloudReady } from "./services/firebase";
import { signOut } from "firebase/auth"; // <--- Add import
import { callRust } from "./services/tauri";
import { useBlockRules } from "./hooks/useBlockRules";
import { useAnalytics } from "./hooks/useAnalytics"; // <--- Import hook
import { useSettings } from "./hooks/useSettings"; // <--- Import hook
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BlockList from "./components/BlockList";
import Login from "./components/Login";
import Settings from "./components/Settings";
import Gamification from "./components/Gamification"; // <--- Add import
import { AdminRequired, LoadingScreen } from "./components/StateScreens";

import { FocusProvider } from "./context/FocusContext"; // <--- Add import

const App = () => {
  const [activeTab, setActiveTab] = useState("dash");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  // Destructure setBlocking
  const { settings, toggleBlocking, toggleCleanOnExit, setLanguage, toggleAutoStart, setBlocking } = useSettings();
  
  const analytics = useAnalytics(user); 

  const { rules, groups, status, addRule, deleteRule, toggleRule, toggleBatch, deleteBatch, moveBatchToGroup, updateRuleMode, deleteGroup, importRules } =
    useBlockRules(
      user,
      setIsAdmin,
      settings.blockingEnabled 
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

  const handleLogout = async () => {
    try {
      // 1. Clean Hosts File
      await callRust("apply_blocking_rules", { rules: [] });
      console.log("Hosts file cleaned on logout");
    } catch (err) {
      console.error("Failed to clean hosts on logout:", err);
    }
    
    // 2. Sign Out
    signOut(auth).catch((error) => console.error("Sign out error", error));
  };

  if (authLoading) return <LoadingScreen language={settings.language} />;
  if (!user) return <Login language={settings.language} />;
  if (!isAdmin) return <AdminRequired language={settings.language} />;

  return (
    <FocusProvider setBlocking={setBlocking}> {/* <--- Wrap Everything */}
        <div className="flex h-screen bg-[#FDFCF8] text-[#2F3E46] font-sans overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status={status} onLogout={handleLogout} language={settings.language} />

        <main className="flex-1 p-12 overflow-y-auto">
            {activeTab === "dash" && <Dashboard rulesCount={rules.length} stats={analytics} language={settings.language} />}
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
                onUpdateMode={updateRuleMode}
                language={settings.language}
            />
            )}
            {activeTab === "gamification" && <Gamification language={settings.language} />}
            {activeTab === "settings" && <Settings settings={settings} toggleBlocking={toggleBlocking} toggleCleanOnExit={toggleCleanOnExit} setLanguage={setLanguage} toggleAutoStart={toggleAutoStart} />}
        </main>
        </div>
    </FocusProvider>
  );
};

export default App;

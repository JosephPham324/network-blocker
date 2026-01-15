import { useState, useEffect } from "react";
import { callRust } from "../services/tauri";

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    return saved
      ? JSON.parse(saved)
      : {
          blockingEnabled: true,
          cleanOnExit: false,
        };
  });

  useEffect(() => {
    localStorage.setItem("app_settings", JSON.stringify(settings));
    
    // Sync with Rust
    callRust("set_clean_on_exit", { enabled: settings.cleanOnExit });
  }, [settings]);

  const toggleBlocking = () => {
    setSettings(prev => ({ ...prev, blockingEnabled: !prev.blockingEnabled }));
  };

  const toggleCleanOnExit = () => {
    setSettings(prev => ({ ...prev, cleanOnExit: !prev.cleanOnExit }));
  };

  return {
    settings,
    toggleBlocking,
    toggleCleanOnExit
  };
};

import { useState, useEffect } from "react";
import { callRust } from "../services/tauri";

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    const defaults = {
      blockingEnabled: true,
      cleanOnExit: false,
      language: "vi",
      autostart: false,
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  // Check actual system autostart status on mount
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const active = await callRust("check_autostart_admin");
        setSettings(prev => {
           if (prev.autostart !== active) {
               return { ...prev, autostart: active };
           }
           return prev;
        });
      } catch (e) {
        console.error("Failed to check autostart:", e);
      }
    };
    checkAutostart();
  }, []);

  useEffect(() => {
    localStorage.setItem("app_settings", JSON.stringify(settings));
    
    // Sync with Rust (Clean on Exit)
    callRust("set_clean_on_exit", { enabled: settings.cleanOnExit });
  }, [settings]);

  const toggleBlocking = () => {
    setSettings(prev => ({ ...prev, blockingEnabled: !prev.blockingEnabled }));
  };

  const toggleCleanOnExit = () => {
    setSettings(prev => ({ ...prev, cleanOnExit: !prev.cleanOnExit }));
  };

  const toggleAutoStart = async () => {
      try {
          const currentlyEnabled = settings.autostart;
          // Calculate NEW state
          const newState = !currentlyEnabled;
          
          await callRust("set_autostart_admin", { enable: newState });
          console.log(`Autostart set to ${newState}`);

          setSettings(prev => ({ ...prev, autostart: newState }));
      } catch (e) {
          console.error("Failed to toggle autostart:", e);
          // Revert visual state if failed??? For now just log
      }
  };

  const setLanguage = (lang) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  return {
    settings,
    toggleBlocking,
    toggleCleanOnExit,
    toggleAutoStart,
    setLanguage
  };
};

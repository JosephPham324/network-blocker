import React from "react";
import { Shield, ShieldAlert, Power, LogOut, Globe } from "lucide-react";
import FrictionModal from "./FrictionModal";
import { useState } from "react";
import { translations } from "../locales";

import { useFocus } from "../context/FocusContext";

const Settings = ({ settings, toggleBlocking, toggleCleanOnExit, setLanguage, toggleAutoStart }) => {
  const t = translations[settings.language].settings;
  const [showFriction, setShowFriction] = useState(false);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const { isFocusing } = useFocus();

  const handleToggleClick = () => {
    if (settings.blockingEnabled) {
      if (isFocusing) {
          // Blocking is ON and Focus is ACTIVE -> Prevent disabling
          setShowFocusWarning(true);
      } else {
          // Trying to disable -> Show Friction
          setShowFriction(true);
      }
    } else {
      // Trying to enable -> Go ahead
      toggleBlocking();
    }
  };

  const confirmDisable = () => {
    toggleBlocking(); // Turn it off
    setShowFriction(false);
  };

  return (
    <div id="settings-container" className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">{t.title}</h2>
        <p className="text-slate-400 mt-2 text-lg">{t.subtitle}</p>
      </header>

      <div className="grid gap-6">
        {/* Language Toggle */}
        <div id="settings-language" className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-100 text-blue-600">
                    <Globe size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">{t.language_title}</h3>
                    <p className="text-slate-400 text-sm">{t.language_desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
                <button 
                    onClick={() => setLanguage("vi")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${settings.language === "vi" ? "bg-white text-[#354F52] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                    Tiếng Việt
                </button>
                <button 
                    onClick={() => setLanguage("en")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${settings.language === "en" ? "bg-white text-[#354F52] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                    English
                </button>
            </div>
        </div>

        {/* Global Blocking Toggle */}
        <div id="settings-blocking-toggle" className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${settings.blockingEnabled ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                    {settings.blockingEnabled ? <Shield size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">{t.blocking_title}</h3>
                    <p className="text-slate-400 text-sm">{t.blocking_desc}</p>
                </div>
            </div>
            <button 
                onClick={handleToggleClick}
                className={`w-16 h-8 rounded-full transition-colors relative ${settings.blockingEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.blockingEnabled ? "left-9" : "left-1"}`} />
            </button>
        </div>

        {/* Clean on Exit Toggle */}
        <div id="settings-clean-exit" className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                    <Power size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">{t.clean_title}</h3>
                    <p className="text-slate-400 text-sm">{t.clean_desc}</p>
                </div>
            </div>
            <button 
                onClick={toggleCleanOnExit}
                className={`w-16 h-8 rounded-full transition-colors relative ${settings.cleanOnExit ? "bg-amber-500" : "bg-slate-200"}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.cleanOnExit ? "left-9" : "left-1"}`} />
            </button>
        </div>

        {/* Auto Start Toggle */}
        <div id="settings-autostart" className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-purple-100 text-purple-600">
                    <Power size={24} className="rotate-180" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#354F52]">{t.autostart_title}</h3>
                    <p className="text-slate-400 text-sm">{t.autostart_desc}</p>
                </div>
            </div>
            <button 
                onClick={toggleAutoStart}
                className={`w-16 h-8 rounded-full transition-colors relative ${settings.autostart ? "bg-purple-500" : "bg-slate-200"}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.autostart ? "left-9" : "left-1"}`} />
            </button>
        </div>
      </div>
      
      {/* Friction Modal */}
      <FrictionModal
        isOpen={showFriction}
        onClose={() => setShowFriction(false)}
        onConfirm={confirmDisable}
        title={t.friction_modal_title}
        message={t.friction_modal_msg}
        confirmationText={t.friction_confirm}
        actionType="disable"
        language={settings.language}
      />

      {/* Focus Warning Modal */}
      {showFocusWarning && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                    <ShieldAlert size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#354F52] font-serif mb-2">{t.focus_warning_title}</h3>
                <p className="text-slate-500 font-medium mb-6">
                    {t.focus_warning_msg}
                </p>
                <button
                    onClick={() => setShowFocusWarning(false)}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-[#354F52] hover:bg-[#2F3E46] transition-all"
                >
                    OK
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

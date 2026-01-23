import React from "react";
import { Shield, ShieldAlert, Power, LogOut, Globe } from "lucide-react";
import FrictionModal from "./FrictionModal";
import { useState } from "react";
import { translations } from "../locales";

const Settings = ({ settings, toggleBlocking, toggleCleanOnExit, setLanguage, toggleAutoStart }) => {
  const t = translations[settings.language].settings;
  const [showFriction, setShowFriction] = useState(false);

  const handleToggleClick = () => {
    if (settings.blockingEnabled) {
      // Trying to disable -> Show Friction
      setShowFriction(true);
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
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">{t.title}</h2>
        <p className="text-slate-400 mt-2 text-lg">{t.subtitle}</p>
      </header>

      <div className="grid gap-6">
        {/* Language Toggle */}
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
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
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
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
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
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
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex items-center justify-between shadow-sm">
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
    </div>
  );
};

export default Settings;

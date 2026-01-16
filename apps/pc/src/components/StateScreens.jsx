import React from "react";
import { ShieldAlert } from "lucide-react";
import { translations } from "../locales";

export const AdminRequired = ({ language = "vi" }) => {
  const t = translations[language].state;
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-red-50 p-10 text-center">
      <ShieldAlert size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-900 font-serif">{t.admin_title}</h2>
      <p className="text-red-700 mt-2 max-w-sm" dangerouslySetInnerHTML={{ __html: t.admin_msg }}></p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold">
        {t.admin_retry}
      </button>
    </div>
  );
};

export const LoadingScreen = ({ language = "vi" }) => {
  const t = translations[language].state;
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FDFCF8]">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-primary font-bold animate-pulse">{t.loading}</p>
    </div>
  );
};

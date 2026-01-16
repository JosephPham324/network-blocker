import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const FrictionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmationText, 
  actionType = "disable" // 'disable' (orange) or 'delete' (red)
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setIsMatch(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setIsMatch(val === confirmationText);
  };

  if (!isOpen) return null;

  const colorClass = actionType === "delete" ? "red" : "amber";

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
        >
            <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 bg-${colorClass}-50 rounded-full flex items-center justify-center text-${colorClass}-500 mb-2`}>
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-[#354F52] font-serif">{title}</h3>
          
          <p className="text-slate-500 font-medium">
            {message}
          </p>

          <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Nhập chính xác câu sau để xác nhận</p>
            <p className="font-mono text-[#354F52] font-bold select-none pointer-events-none">{confirmationText}</p>
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Nhập xác nhận tại đây..."
            className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all ${
                isMatch 
                ? `border-${colorClass}-500 bg-${colorClass}-50/10` 
                : "border-slate-200 focus:border-slate-400"
            }`}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={!isMatch}
              className={`
                py-3 rounded-2xl font-bold text-white shadow-lg transition-all
                ${isMatch 
                    ? `bg-${colorClass}-500 hover:bg-${colorClass}-600 shadow-${colorClass}-200` 
                    : "bg-slate-300 cursor-not-allowed"}
              `}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrictionModal;

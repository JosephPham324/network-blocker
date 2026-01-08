import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { Shield, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to handle Firebase Errors nicely
  const handleError = (error) => {
    console.error(error);
    const msg = error.code || error.message;
    if (msg.includes("auth/invalid-email")) return "Email không hợp lệ.";
    if (msg.includes("auth/user-not-found")) return "Tài khoản không tồn tại.";
    if (msg.includes("auth/wrong-password")) return "Sai mật khẩu.";
    if (msg.includes("auth/email-already-in-use")) return "Email này đã được sử dụng.";
    if (msg.includes("auth/weak-password")) return "Mật khẩu quá yếu (cần 6+ ký tự).";
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(handleError(err));
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(handleError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] p-6 animate-in fade-in duration-700">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#354F52] p-3 rounded-2xl text-white shadow-xl shadow-[#354F52]/20">
          <Shield size={28} />
        </div>
        <h1 className="font-serif font-bold text-3xl text-[#354F52]">MindfulBlock</h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        <h2 className="text-2xl font-bold text-[#354F52] mb-2 font-serif">{isSignUp ? "Tạo tài khoản mới" : "Chào mừng trở lại"}</h2>
        <p className="text-slate-400 mb-8 text-sm">{isSignUp ? "Bắt đầu hành trình tập trung của bạn." : "Tiếp tục nơi bạn đã dừng lại."}</p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#2F3E46] font-bold py-3.5 rounded-2xl transition-all mb-6 active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span>Tiếp tục với Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-slate-300 text-xs font-bold uppercase">Hoặc</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 rounded-2xl outline-none transition-all font-medium text-primary placeholder:text-slate-300"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 rounded-2xl outline-none transition-all font-medium text-primary placeholder:text-slate-300"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
              <Shield size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#2F4548] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isSignUp ? "Đăng ký" : "Đăng nhập"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-slate-400 hover:text-primary text-sm font-semibold transition-colors"
          >
            {isSignUp ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

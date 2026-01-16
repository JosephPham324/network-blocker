import React, { useState } from "react";
// Removed getRedirectResult from here
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebase";
import { Shield, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener"; // Ensure this name matches below
import { invoke } from "@tauri-apps/api/core";
import { listen, once } from "@tauri-apps/api/event";

import { translations } from "../locales";

const Login = ({ language = "vi" }) => {
  const t = translations[language].login;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Removed useEffect/checkRedirect logic.
  // If the user lands here, it means App.js checked for redirect and found nothing.

  const handleError = (error) => {
    console.error(error);
    const msg = error.code || error.message;
    if (msg.includes("auth/invalid-email")) return t.error_email;
    if (msg.includes("auth/user-not-found")) return t.error_user;
    if (msg.includes("auth/wrong-password")) return t.error_pass;
    return t.error_general;
  };
  const handleGoogleLogin_ = async () => {
    setLoading(true);
    try {
      // 1. Start local server to catch the redirect
      // This returns the port the server is listening on
      const port = await start((url) => {
        // 3. This callback runs when Google redirects back to localhost
        const params = new URL(url).searchParams;
        const idToken = params.get("id_token"); // Or access_token depending on your Google setup

        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          signInWithCredential(auth, credential);
        }
      });

      // 2. Construct the Google OAuth URL manually
      // Use your Firebase project's client ID
      const clientId = "project-246566415924.apps.googleusercontent.com";
      const redirectUri = `http://localhost:${port}`;
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20email%20profile&nonce=123`;

      await openUrl(googleUrl); // Opens system browser
    } catch (err) {
      console.error("Login Error:", err);
      setError("OAuth failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await once("redirect_uri", async (event) => {
        const url = new URL(event.payload);
        const code = url.searchParams.get("code");

        if (code) {
          // 1. EXCHANGE CODE FOR ID_TOKEN
          // In a production app, do this exchange in Rust or a Cloud Function!
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code: code,
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: `http://localhost:${port}`,
              grant_type: "authorization_code",
            }),
          });

          const tokens = await response.json();

          if (tokens.id_token) {
            // 2. NOW you have an id_token to give to Firebase
            const credential = GoogleAuthProvider.credential(tokens.id_token);
            await signInWithCredential(auth, credential);
            console.log("Logged in with Code Flow!");
          }
        }
      });

      const port = await invoke("start_server");
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `http://localhost:${port}`;
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&nonce=123`;

      await openUrl(googleUrl);
    } catch (err) {
      console.error(err);
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
      // Success is handled by App.js listener
    } catch (err) {
      setError(handleError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] p-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#354F52] p-3 rounded-2xl text-white shadow-xl shadow-[#354F52]/20">
          <Shield size={28} />
        </div>
        <h1 className="font-serif font-bold text-3xl text-[#354F52]">MindfulBlock</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        <h2 className="text-2xl font-bold text-[#354F52] mb-2 font-serif">{isSignUp ? t.title_signup : t.title_signin}</h2>
        <p className="text-slate-400 mb-8 text-sm">{isSignUp ? t.subtitle_signup : t.subtitle_signin}</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#2F3E46] font-bold py-3.5 rounded-2xl transition-all mb-6 active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span>{t.google_btn}</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-slate-300 text-xs font-bold uppercase">{t.or}</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder={t.email_placeholder}
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
                placeholder={t.password_placeholder}
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
                {isSignUp ? t.btn_signup : t.btn_signin} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-slate-400 hover:text-primary text-sm font-semibold transition-colors"
          >
            {isSignUp ? t.toggle_signin : t.toggle_signup}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

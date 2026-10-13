"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginUser } from "../actions/auth";
import { Lock, Mail, User, ArrowLeft, Loader2, ShieldCheck, Ticket } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = isLogin ? await loginUser(formData) : await registerUser(formData);

    setLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Navigation & Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <a href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Ana Səhifə
          </a>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Access
          </span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 mb-2">
            <Ticket className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? "Sistemə Daxil Olun" : "Qeydiyyatdan Geçin"}
          </h1>
          <p className="text-xs text-slate-400">
            {isLogin
              ? "Biletlərinizə baxmaq və yeni bronlar etmək üçün daxil olun."
              : "Təhlükəsiz bilet alışı üçün şəxsi hesabınızı yaradın."}
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center text-center ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Ad və Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Məs: Əli Əliyev"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Ünvanı
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                placeholder="istifadeci@email.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm mt-2 active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              "Daxil Ol"
            ) : (
              "Hesab Yarat"
            )}
          </button>
        </form>

        {/* Toggle Mode Button */}
        <div className="text-center pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            {isLogin
              ? "Hesabınız yoxdur? Qeydiyyatdan keçin"
              : "Artıq hesabınız var? Daxil olun"}
          </button>
        </div>

      </div>
    </div>
  );
}
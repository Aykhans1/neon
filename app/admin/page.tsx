"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminStats, createEvent, AdminStats } from "../actions/admin";
import { getCurrentUser } from "../actions/auth";
import { ShieldCheck, PlusCircle, Calendar, DollarSign, Ticket, ShoppingBag, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user || (user.role !== "admin" && user.role !== "organizer")) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      const data = await getAdminStats();
      setStats(data);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createEvent(formData);

    setSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      (e.target as HTMLFormElement).reset();
      const data = await getAdminStats();
      setStats(data);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">Giriş Qadağandır (403 RBAC)</h1>
          <p className="text-xs text-slate-400">
            Bu səhifəyə daxil olmaq üçün hesabınızın rolu <strong>Admin</strong> və ya <strong>Təşkilatçı</strong> olmalıdır.
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            Ana Səhifəyə Qayıt
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Ana Səhifə
          </a>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> RBAC Protected Control Panel
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Təşkilatçı İdarəetmə Paneli
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Yeni tədbirlər yaradın, biletləri idarə edin və canlı satış statistikasına baxın.
          </p>
        </div>

        {/* Dashboard Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Ümumi Tədbir</p>
              <h3 className="text-xl font-bold text-white">{stats?.totalEvents || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tamamlanan Sifariş</p>
              <h3 className="text-xl font-bold text-white">{stats?.totalOrders || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Satılan Biletlər</p>
              <h3 className="text-xl font-bold text-white">{stats?.totalTicketsSold || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Ümumi Gəlir</p>
              <h3 className="text-xl font-bold text-white">{stats?.totalRevenue || 0} AZN</h3>
            </div>
          </div>
        </div>

        {/* Create Event Form Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <PlusCircle className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-white">Yeni Tədbir Əlavə Et</h2>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tədbirin Adı</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Məs: Kiber Təhlükəsizlik Konfransı 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kategoriya</label>
                <select
                  name="category"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Konfrans">Konfrans</option>
                  <option value="Konsert">Konsert</option>
                  <option value="İdman">İdman</option>
                  <option value="Məfkurə">Məfkurə / Vebinar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Məkan / Məkan Adı</label>
              <input
                type="text"
                name="location"
                required
                placeholder="Məs: Heydər Əliyev Sarayı, Bakı"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tarix və Saat</label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Şəkil URL-i (Optional)</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Təsvir / Açıqlama</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Tədbir haqqında ətraflı məlumat..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Ticket Type Creation */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">İlkin Bilet Növü</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bilet Növü Adı</label>
                  <input
                    type="text"
                    name="ticketTypeName"
                    required
                    placeholder="Məs: VIP / Standart"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Qiymət (AZN)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Məs: 50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ümumi Say (Sayı)</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    placeholder="Məs: 100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Yaradılır...</span>
                </>
              ) : (
                "Tədbiri Dərc Et"
              )}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
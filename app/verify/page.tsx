"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Search, QrCode, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyTicket } from "../actions/events";

export default function VerifyTicketPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    eventTitle?: string;
    ticketName?: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await verifyTicket(ticketCode.trim());
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <a href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Sayta Qayıt
          </a>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Crypto Verifier
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <QrCode className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Bilet İmzası Yoxlama</h1>
          <p className="text-xs text-slate-400">
            Biletin həqiqiliyini və kriptoqrafik HMAC-SHA256 imzasını yoxlamaq üçün kodu daxil edin.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Bilet Kodu (Ticket Code):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Məs: TKT-X8K9L2-2026"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ticketCode.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Kriptoqrafik İmza Yoxlanılır...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Bileti Yoxla</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Display */}
        {result && (
          <div
            className={`p-5 rounded-xl border space-y-3 animate-in fade-in zoom-in duration-200 ${
              result.valid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.valid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h3 className="font-bold text-sm">{result.message}</h3>
                {result.valid && (
                  <div className="text-xs space-y-1 pt-2 border-t border-emerald-500/20 text-slate-300">
                    <div><span className="text-slate-400">Tədbir:</span> <strong>{result.eventTitle}</strong></div>
                    <div><span className="text-slate-400">Növ:</span> <strong>{result.ticketName}</strong></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
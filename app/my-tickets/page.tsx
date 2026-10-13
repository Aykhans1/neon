import Link from "next/link";
import { getUserTickets } from "../actions/events";
import { getCurrentUser } from "../actions/auth";
import { redirect } from "next/navigation";
import { Ticket, Calendar, MapPin, ShieldCheck, ArrowLeft, QrCode, Lock } from "lucide-react";

export default async function MyTicketsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  const tickets = await getUserTickets();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Ana Səhifə
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> HMAC Validated
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Ticket className="h-7 w-7 text-indigo-500" />
              <span>Mənim Biletlərim</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hesabınızla bron edilmiş rəqəmsal imzalı biletləriniz.
            </p>
          </div>
          <Link
            href="/verify"
            className="self-start sm:self-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-indigo-400 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <QrCode className="h-4 w-4" /> Bilet Yoxla
          </Link>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <Ticket className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Hələ ki, biletiniz yoxdur.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Aktiv tədbirlərə nəzər salaraq özünüzə uyğun biletləri bron edə bilərsiniz.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Tədbirlərə Baxın
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Event Image & Header */}
                <div className="relative h-40 w-full bg-slate-950">
                  <img
                    src={ticket.image_url}
                    alt={ticket.event_title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {ticket.ticket_type_name} ({ticket.price} AZN)
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                      {ticket.event_title}
                    </h3>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{ticket.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{ticket.location}</span>
                    </div>
                  </div>

                  {/* Code & Crypto Signature Box */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Bilet Kodu:</span>
                      <span className="text-indigo-400 font-bold tracking-wider">{ticket.ticket_code}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] border-t border-slate-900 pt-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-emerald-400" /> HMAC Signature:
                      </span>
                      <span className="text-slate-400 truncate max-w-[160px]" title={ticket.signature}>
                        {ticket.signature ? `${ticket.signature.slice(0, 16)}...` : "Yoxdur"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
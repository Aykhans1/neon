import Link from "next/link";
import { getEvents } from "./actions/events";
import { getCurrentUser, logoutUser } from "./actions/auth";
import { Ticket, Calendar, MapPin, User, LogOut, ShieldCheck, QrCode } from "lucide-react";

export default async function HomePage() {
  const events = await getEvents();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. Header / Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              EventBrite<span className="text-indigo-500">.az</span>
            </span>
          </Link>

          {/* Navigation & Auth Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/verify"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800"
            >
              <QrCode className="h-4 w-4 text-indigo-400" />
              <span>Bilet Yoxla</span>
            </Link>

            {user ? (
              // Daxil olmuş istifadəçi bloku
              <div className="flex items-center gap-3">
                <Link
                  href="/my-tickets"
                  className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl hover:bg-slate-800 transition-all text-xs font-medium"
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="text-white font-semibold">{user.fullName}</span>
                </Link>

                <form
                  action={async () => {
                    "use server";
                    await logoutUser();
                  }}
                >
                  <button
                    type="submit"
                    title="Çıxış et"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              // Daxil olmamış istifadəçi düyməsi
              <Link
                href="/auth"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                <span>Daxil Ol / Qeydiyyat</span>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="relative py-12 sm:py-16 px-4 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>HMAC-SHA256 Kriptoqrafik Qorunan Bilet Sistemi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Sənin Ən Yaxşı <span className="text-indigo-500">Tədbirlərin</span> Burada
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Sevdiyiniz konsertlərə, konfranslara və idman yarışlarına rəqəmsal imzalı biletlərinizi anında bron edin.
        </p>
      </section>

      {/* 3. Tədbirlər Siyahısı */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <span>Aktiv Tədbirlər</span>
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">Hələ ki, heç bir tədbir əlavə edilməyib.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-lg"
              >
                {/* Event Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-400 border border-slate-800">
                    {event.category}
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{event.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Pricing & Order Link */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Başlayan Qiymət</span>
                      <span className="text-lg font-extrabold text-white">
                        {event.min_price > 0 ? `${event.min_price} AZN` : "Pulsuz"}
                      </span>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                    >
                      Bilet Al
                    </Link>
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
"use client";

import React, { useState, useEffect, use } from "react";
import { Calendar, MapPin, Ticket, ShieldCheck, ArrowLeft, CheckCircle, Loader2, AlertCircle, QrCode } from "lucide-react";
import { getEventById, createOrder, EventDetailData, OrderResponse } from "../../actions/events";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getEventById(resolvedParams.id);
      setEvent(data);
      if (data && data.ticket_types.length > 0) {
        setSelectedTicketId(data.ticket_types[0].id);
      }
    } catch (err) {
      console.error("Məlumat yüklənərkən xəta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Tədbir detalları yüklənir...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Tədbir Tapılmadı</h1>
        <a href="/" className="text-indigo-400 hover:underline flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Ana Səhifəyə Qayıt
        </a>
      </div>
    );
  }

  const selectedTicket = event.ticket_types.find((t) => t.id === selectedTicketId);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  const handleBooking = async () => {
    if (!selectedTicketId) return;
    
    setSubmitting(true);
    setErrorMessage(null);

    const result = await createOrder(selectedTicketId, quantity, event.id);

    setSubmitting(false);

    if (result.success) {
      setOrderResult(result);
      // Məlumatları yenidən çəkirik ki, qalıq sayı yenilənsin
      loadData();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Səhifəyə Qayıt</span>
          </a>
          <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {event.category}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Tərəf - Şəkil və Təfərrüat */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-800">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h1 className="text-3xl font-extrabold text-white">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 border-y border-slate-800/80 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>{event.event_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Tədbir Haqqında</h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sağ Tərəf - Bilet Seçimi PaneI */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-indigo-400" />
                <span>Bilet Seçimi</span>
              </h2>

              {orderResult ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Sifariş Uğurla Tamamlandı!</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Məlumatlar Neon PostgreSQL bazasına yazıldı.
                    </p>
                  </div>

                  {/* Bilet Kodları Listi */}
                  <div className="space-y-2 text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-indigo-400" />
                      <span>Generasiya Olunmuş Bilet Kodu:</span>
                    </div>
                    {orderResult.tickets?.map((tkt, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-300 font-medium">{tkt.typeName}</span>
                        <span className="font-mono font-bold text-indigo-400">{tkt.code}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setOrderResult(null);
                      setQuantity(1);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-xs text-white py-2.5 rounded-xl transition-all"
                  >
                    Yenidən Bilet Al
                  </button>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Bilet Növləri */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400">Bilet Növü Seçin:</label>
                    {event.ticket_types.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedTicketId === ticket.id
                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                            : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sm text-white">{ticket.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Qalıq: {ticket.available_quantity} ədəd
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-white">{ticket.price} AZN</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bilet Sayı */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-400">Bilet Sayı:</label>
                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={submitting}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="font-bold text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={submitting || (selectedTicket && quantity >= selectedTicket.available_quantity)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cəmi və Bron Et Düyməsi */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Cəmi Məbləğ:</span>
                      <span className="text-2xl font-extrabold text-white">{totalPrice} AZN</span>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={submitting || !selectedTicket || selectedTicket.available_quantity < quantity}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Emal Olunur...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" />
                          <span>Sifarişi Təsdiqlə</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
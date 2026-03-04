import React, { useState, useEffect } from "react";
import {
  Calendar,
  Video,
  Clock,
  History,
  AlertCircle,
  Loader2,
  BadgeCheck,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { completeBooking } from "../../api/booking.api";

export default function MentorSessions() {
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'history'

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        const [upRes, histRes] = await Promise.all([
          api.get("/mentor/bookings/upcoming"),
          api.get("/mentor/bookings/history"),
        ]);

        setUpcoming(upRes.data.data || []);
        setHistory(histRes.data.data || []);
      } catch (err) {
        toast.error("Failed to sync your schedule", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
  }, []);

  const handleComplete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to finish this session? This will release the funds and mark it as completed.")) return;
    try {
      setLoading(true);
      await completeBooking(bookingId);
      toast.success("Session completed! Funds added to your wallet.");
      // Refresh both tabs
      const [upRes, histRes] = await Promise.all([
        api.get("/mentor/bookings/upcoming"),
        api.get("/mentor/bookings/history"),
      ]);
      setUpcoming(upRes.data.data || []);
      setHistory(histRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete session");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentData = activeTab === "upcoming" ? upcoming : history;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#262626] tracking-tight">
            Mentorship Schedule
          </h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-[0.2em]">
            Manage your calls and session history
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-[22px] flex items-center gap-1 shadow-inner border border-gray-200/50">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-[18px] text-xs font-black transition-all flex items-center gap-2 ${activeTab === "upcoming"
              ? "bg-white text-[#FF9500] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <Clock size={16} /> UPCOMING
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-[18px] text-xs font-black transition-all flex items-center gap-2 ${activeTab === "history"
              ? "bg-white text-[#FF9500] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <History size={16} /> HISTORY
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#FF9500] animate-spin" />
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Loading Schedule...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentData.length > 0 ? (
            currentData.map((session) => (
              <div
                key={session.booking_id}
                className="bg-white p-6 md:p-8 rounded-[36px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between group hover:border-[#FF9500]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  {/* Status-based Icon */}
                  <div
                    className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm transition-colors ${session.status === "confirmed"
                      ? "bg-green-50 text-green-500"
                      : session.status === "cancelled"
                        ? "bg-red-50 text-red-500"
                        : "bg-orange-50 text-orange-500"
                      }`}
                  >
                    {session.status === "confirmed" ? (
                      <BadgeCheck size={28} />
                    ) : session.status === "cancelled" ? (
                      <XCircle size={28} />
                    ) : (
                      <Calendar size={28} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-[#262626]">
                        {session.student_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${session.status === "confirmed"
                          ? "bg-green-50 border-green-100 text-green-600"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                          }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">
                          {formatDate(session.start_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#FF9500]">
                        <DollarSign size={14} />
                        <span className="text-xs font-black">
                          {session.price} Earned
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-lg font-black text-[#262626] leading-none mb-1">
                      {formatTime(session.start_time)}
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      Duration: 60 Mins
                    </p>
                  </div>

                  {activeTab === "upcoming" ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-[#262626] text-[#FF9500] px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-[#333] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">
                        <Video size={18} /> START
                      </button>

                      {session.status === "confirmed" && (
                        <button
                          onClick={() => handleComplete(session.booking_id)}
                          className="bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-100"
                        >
                          <BadgeCheck size={18} /> FINISH
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-50 text-gray-300 px-6 py-4 rounded-2xl font-black text-sm border border-gray-100 cursor-not-allowed uppercase tracking-tighter"
                    >
                      {session.status === "completed" ? "Successfully Completed" : session.status}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="bg-white rounded-[48px] border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#262626]">
                No sessions found
              </h3>
              <p className="text-gray-400 font-bold text-sm max-w-xs mt-2">
                {activeTab === "upcoming"
                  ? "Your schedule is currently clear. Time to relax or market your profile!"
                  : "You haven't completed any sessions yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

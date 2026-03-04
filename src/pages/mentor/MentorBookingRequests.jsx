import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Calendar,
  Clock,
  User,
  DollarSign,
  Loader2,
  Inbox,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMentorBookingRequests, approveBooking, rejectBooking } from "../../api/booking.api";

export default function MentorBookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // Tracks which ID is currently being processed

  // 1. Fetch Pending Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getMentorBookingRequests();
      // Use data from the new API directly
      setRequests(res.data || []);
    } catch (err) {
      console.error("Fetch requests failed", err);
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Approve Logic
  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveBooking(id);
      toast.success("Session approved! Funds released.");
      // Remove from UI list
      setRequests((prev) => prev.filter((req) => (req.booking_id || req.id || req.ID) !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  // 3. Reject Logic
  const handleReject = async (id) => {
    try {
      setActionId(id);
      await rejectBooking(id);
      toast.error("Request declined. Student refunded.");
      setRequests((prev) => prev.filter((req) => (req.booking_id || req.id || req.ID) !== id));
    } catch (err) {
      toast.error("Failed to decline request");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FF9500]/10 text-[#FF9500] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Action Required
            </span>
          </div>
          <h1 className="text-4xl font-black text-[#262626] tracking-tight">
            Booking Requests
          </h1>
          <p className="text-gray-400 font-bold mt-1 text-sm">
            Review and manage your incoming mentorship inquiries
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 bg-white border border-gray-100 rounded-[24px] items-center justify-center text-gray-300 shadow-sm">
          <Inbox size={28} />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-[#FF9500] animate-spin" />
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
            Scanning for requests...
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req.booking_id}
                className="bg-white p-8 rounded-[40px] border border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-[#FF9500]/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] transition-all duration-500"
              >
                {/* Left: Student Info */}
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-[#262626] border border-gray-100 group-hover:bg-white transition-colors">
                      <User size={32} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF9500] rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                      <Zap size={14} fill="white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-[#262626] leading-tight mb-1">
                      New Booking
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400">
                        from
                      </span>
                      <span className="text-sm font-black text-[#FF9500] uppercase tracking-tighter bg-[#FF9500]/5 px-2 py-0.5 rounded-lg">
                        {req.student_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Details */}
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 w-full lg:w-auto">
                  <div className="flex flex-col items-center lg:items-end px-6 border-r border-gray-100 last:border-0">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                      Date
                    </span>
                    <div className="flex items-center gap-2 text-sm font-black text-[#262626]">
                      <Calendar size={16} className="text-[#FF9500]" />
                      {formatDate(req.start_time)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end px-6 border-r border-gray-100 last:border-0">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                      Time
                    </span>
                    <div className="flex items-center gap-2 text-sm font-black text-[#262626]">
                      <Clock size={16} className="text-[#FF9500]" />
                      {formatTime(req.start_time)}
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end px-6 last:border-0">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                      Fee
                    </span>
                    <div className="text-xl font-black text-[#262626] flex items-baseline">
                      <span className="text-xs mr-0.5">₹</span>
                      {req.price}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
                  <button
                    onClick={() => handleReject(req.booking_id)}
                    disabled={actionId === req.booking_id}
                    className="flex-1 lg:flex-none p-5 bg-gray-50 text-gray-400 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
                  >
                    {actionId === req.booking_id ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <X size={24} strokeWidth={3} />
                    )}
                  </button>

                  <button
                    onClick={() => handleApprove(req.booking_id)}
                    disabled={actionId === req.booking_id}
                    className="flex-1 lg:flex-none px-8 py-5 bg-[#262626] text-[#FF9500] rounded-3xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#333] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                  >
                    {actionId === req.booking_id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        ACCEPT REQUEST
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="bg-white rounded-[60px] border-2 border-dashed border-gray-100 p-24 flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200 mb-8">
                <ShieldCheck size={56} strokeWidth={1} />
              </div>
              <h3 className="text-3xl font-black text-[#262626]">
                All caught up!
              </h3>
              <p className="text-gray-400 font-bold text-sm max-w-xs mt-3 leading-relaxed">
                There are no pending booking requests right now. New inquiries
                will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

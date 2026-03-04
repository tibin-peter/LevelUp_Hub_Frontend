import React, { useState, useEffect } from "react";
import {
  Calendar as CalIcon,
  Clock,
  Video,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Star,
  MessageSquare,
  Send,
  X
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

export default function StudentBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rating Modal State
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint =
        activeTab === "upcoming"
          ? "/student/bookings/upcoming"
          : "/student/bookings/history";
      const response = await api.get(endpoint);
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setReview("");
    setReviewModalOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.post("/ratings", {
        BookingID: selectedBooking.booking_id,
        MentorID: selectedBooking.mentor_id,
        Rating: rating,
        Review: review,
      });
      if (response.data.success) {
        toast.success("Review submitted! Thank you for your feedback.");
        setReviewModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (booking) => {
    const startTime = new Date(booking.start_time);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (startTime < oneHourFromNow) {
      toast.error("Sessions can only be cancelled at least 1 hour before start");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this session?"))
      return;
    try {
      const response = await api.post(`/student/bookings/${booking.booking_id}/cancel`);
      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        fetchBookings(); // Refresh list
      }
    } catch (err) {
      toast.error("Cancellation failed", err);
    }
  };

  const formatDateTime = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return {
      date: s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-[#262626] tracking-tight">
            My Sessions
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Elevate your skills through scheduled mentorship.
          </p>
        </div>

        {/* Premium Tab Switcher */}
        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex backdrop-blur-md">
          {["upcoming", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? "bg-white text-[#262626] shadow-xl shadow-black/5"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Bookings List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalIcon className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">
              No {activeTab} sessions found
            </p>
          </div>
        ) : (
          bookings.map((booking) => {
            const { date, time } = formatDateTime(
              booking.start_time,
              booking.end_time,
            );
            return (
              <div
                key={booking.booking_id}
                className="group bg-white p-2 rounded-[35px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#FF9500]/5 transition-all duration-500"
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Left: Mentor Info */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.mentor_name}`}
                        className="w-20 h-20 rounded-[24px] bg-gray-50 border border-gray-100 object-cover"
                        alt=""
                      />
                      {activeTab === "upcoming" && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-[#262626]">
                          Mentorship Session
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] ${booking.status === "confirmed"
                            ? "bg-green-50 text-green-600"
                            : booking.status === "paid"
                              ? "bg-yellow-50 text-[#FF9500]"
                              : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {booking.status === "paid" ? "Pending Approval" : booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                        Expert:{" "}
                        <span className="text-[#262626]">
                          {booking.mentor_name}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Center: Schedule */}
                  <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Date
                      </p>
                      <div className="flex items-center gap-2 text-[#262626] font-bold">
                        <CalIcon size={16} className="text-[#FF9500]" />
                        {date}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Time Window
                      </p>
                      <div className="flex items-center gap-2 text-[#262626] font-bold">
                        <Clock size={16} className="text-[#FF9500]" />
                        {time}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Investment
                      </p>
                      <p className="text-[#262626] font-bold">
                        ₹{booking.price}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3">
                    {activeTab === "upcoming" ? (
                      <>
                        <button
                          disabled={booking.status !== "confirmed"}
                          className={`flex-1 lg:flex-none px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${booking.status === "confirmed"
                            ? "bg-[#262626] text-white hover:bg-[#FF9500] shadow-black/10"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed border-gray-200"
                            }`}
                        >
                          <Video size={18} /> {booking.status === "confirmed" ? "Join Session" : "Payment Secured"}
                        </button>
                        <button
                          onClick={() => handleCancel(booking)}
                          className="p-4 rounded-2xl border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Cancel Booking"
                        >
                          <XCircle size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openRatingModal(booking)}
                        className="w-full lg:w-auto bg-[#262626] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF9500] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5"
                      >
                        <Star size={18} className="text-[#FF9500] fill-[#FF9500]" />
                        Rate Mentor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div
            className="absolute inset-0 bg-[#262626]/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setReviewModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-gray-100">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#262626] rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} className="text-[#FF9500]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#262626]">Rate Your Session</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Mentor: {selectedBooking?.mentor_name}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-3 hover:bg-white rounded-2xl transition-colors group"
              >
                <X size={20} className="text-gray-400 group-hover:text-red-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-10">
              {/* Star Rating Selection */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Overall Experience</p>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="transition-all duration-300 transform hover:scale-125"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star
                        size={40}
                        strokeWidth={2}
                        className={`transition-colors duration-300 ${star <= (hover || rating)
                            ? "text-[#FF9500] fill-[#FF9500]"
                            : "text-gray-200 fill-transparent"
                          }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-bold text-[#FF9500] h-4">
                  {rating === 1 && "Need Improvement"}
                  {rating === 2 && "Fair Experience"}
                  {rating === 3 && "Good Support"}
                  {rating === 4 && "Great Mentorship!"}
                  {rating === 5 && "Exceptional Quality!"}
                </p>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Write a Review (Optional)</p>
                <div className="relative group">
                  <textarea
                    rows="4"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us what you learned or how the mentor helped you..."
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[30px] p-6 text-sm font-medium text-[#262626] placeholder-gray-300 focus:bg-white focus:ring-2 focus:ring-[#FF9500]/10 transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={submitting || rating === 0}
                onClick={handleRatingSubmit}
                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${submitting || rating === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#262626] text-white hover:bg-black shadow-black/10"
                  }`}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={16} /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
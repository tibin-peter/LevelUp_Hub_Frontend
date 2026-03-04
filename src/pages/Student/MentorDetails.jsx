import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronLeft,
  Star,
  MessageCircle,
  Video,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  Heart,
  Languages,
  Briefcase,
  Award,
  ArrowRight,
} from "lucide-react";
import api from "../../api/axios";
import { startConversation } from "../../api/chat.api";
import { createConnection } from "../../api/connections.api";
import { toast } from "react-hot-toast";

export default function MentorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchMentorAndSlots = async () => {
      try {
        setLoading(true);
        const [mentorRes, slotsRes] = await Promise.all([
          api.get(`/mentors/${id}`),
          api.get(`/mentors/${id}/slots`),
        ]);

        if (mentorRes.data.success) {
          setMentor(mentorRes.data.data);
        }
        if (slotsRes.data.success) {
          setSlots(slotsRes.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMentorAndSlots();
  }, [id]);

  // Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Future API call: api.post(`/mentors/${id}/favorite`)
  };

  const formatSlotTime = (isoString) => {
    try {
      const dateObj = new Date(isoString);
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date");
      return {
        date: dateObj.toISOString().split("T")[0],
        time: dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        fullDate: dateObj.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          weekday: "short",
        }),
      };
    } catch (e) {
      return { date: "", time: "Invalid Time", fullDate: "Invalid Date" };
    }
  };

  const handlePayment = async () => {
    if (!selectedSlot) return;

    setProcessingPayment(true);

    try {
      // Step A: Load Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Check your internet connection.");
        setProcessingPayment(false);
        return;
      }

      const bookingRes = await api.post("/student/bookings", {
        slot_id: Number(selectedSlot?.ID || selectedSlot?.id),
      });

      if (!bookingRes.data.success) {
        throw new Error(bookingRes.data.message || "Failed to create booking");
      }

      const bookingId =
        bookingRes.data.data?.booking_id || bookingRes.data.data?.ID;

      if (!bookingId) {
        throw new Error("Invalid booking response from server: Missing booking ID");
      }

      const orderRes = await api.post("/payments/order", {
        booking_id: bookingId,
      });

      if (!orderRes.data.success || !orderRes.data.data) {
        throw new Error(orderRes.data.message || "Failed to create payment order");
      }

      const { OrderID, Amount, Key, Currency } = orderRes.data.data;

      if (!Key) {
        throw new Error("Razorpay Key missing from backend response");
      }

      // 3️⃣ Initialize Razorpay Checkout
      const options = {
        key: Key,
        amount: Amount, 
        currency: Currency || "INR",
        name: "LevelUp Hub",
        description: `Mentorship Session with ${mentor.Name}`,
        order_id: OrderID,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              order_id: response.razorpay_order_id,
              payment_id: String(response.razorpay_payment_id),
              signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! Session confirmed.");
              navigate("/dashboard/bookings");
            } else {
              toast.error("Verification failed: " + verifyRes.data.message);
            }
          } catch (err) {
            toast.error("Verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.Name || user?.name || "User Name",
          email: user?.Email || user?.email || "user@example.com",
        },
        theme: { color: "#FF9500" },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay object not found on window");
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessingPayment(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment flow error:", err);
      toast.error(err.response?.data?.message || err.message || "Something went wrong.");
      setProcessingPayment(false);
    }
  };

  const handleConnect = async () => {
    try {
      setProcessingPayment(true);
      // 1. Create a Connection in the formal connections table
      await createConnection(mentor.ID);
      
      // 2. Start (or get) a Conversation in the messages system
      const res = await startConversation(mentor.UserID);
      
      if (res.conversation_id) {
        toast.success("Connection established!");
        navigate("/dashboard/messages");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      toast.error("Unable to initialize communication link.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FF9500] rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">
          Loading Mentor Excellence...
        </p>
      </div>
    );

  if (error || !mentor)
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 text-red-500 inline-block px-6 py-3 rounded-2xl font-bold">
          {error || "Mentor not found"}
        </div>
      </div>
    );

  const skills = mentor.Skills ? mentor.Skills.split(",") : [];
  const filteredSlots = slots.filter((slot) => {
    const { date } = formatSlotTime(slot.StartTime);
    return (filterDate ? date === filterDate : true) && !slot.IsBooked;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between">
        <Link
          to="/dashboard/courses"
          className="group flex items-center gap-2 text-gray-500 hover:text-[#262626] transition-all"
        >
          <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm">Explore Mentors</span>
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Profile & Details */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header Card */}
          <section className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9500]/5 rounded-bl-[100px] -z-0"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-10 items-start">
              <div className="relative group shrink-0 mx-auto md:mx-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF9500] to-orange-300 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <img
                  src={
                    mentor.ProfilePicURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.ID}`
                  }
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] md:rounded-[36px] object-cover bg-white border-4 border-white shadow-sm"
                  alt={mentor.Name}
                />
                <div className="absolute bottom-3 right-3 w-6 h-6 md:w-7 md:h-7 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
              </div>

              <div className="flex-1 space-y-6 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#262626] tracking-tight mb-2">
                      {mentor.Name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-[#FF9500]">
                        <Briefcase size={16} /> {mentor.ExperienceYears} Years
                        Exp
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Languages size={16} /> {mentor.Languages}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleFavorite}
                    className={`p-3.5 md:p-4 rounded-[20px] md:rounded-3xl transition-all duration-500 active:scale-90 ${isFavorite
                      ? "bg-[#FF9500] text-white shadow-[0_10px_20px_rgba(255,149,0,0.3)]"
                      : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    <Heart
                      size={20}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">
                    About Mentor
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">
                    {mentor.Bio ||
                      "Unlocking potential through strategic guidance and industry-vetted expertise."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, i) => (
                    <div
                      key={i}
                      className="px-5 py-2 bg-gray-50/80 backdrop-blur-sm border border-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider"
                    >
                      {skill.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Availability Section */}
          <section className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-[#262626]">
                  Reserve a Session
                </h3>
                <p className="text-gray-400 font-bold text-sm">
                  Select a time that works for your schedule
                </p>
              </div>

              <div className="relative group">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF9500]"
                />
                <input
                  type="date"
                  className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#FF9500]/10 outline-none transition-all cursor-pointer"
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredSlots.map((slot) => {
                const { time, fullDate } = formatSlotTime(slot.StartTime);
                const isSelected = selectedSlot?.ID === slot.ID;
                return (
                  <button
                    key={slot.ID}
                    onClick={() => setSelectedSlot(slot)}
                    className={`relative p-5 rounded-[28px] border-2 transition-all duration-300 text-left group ${isSelected
                      ? "border-[#FF9500] bg-[#FF9500]/5 ring-4 ring-[#FF9500]/5"
                      : "border-gray-50 bg-gray-50/30 hover:border-gray-200"
                      }`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase mb-2 transition-colors ${isSelected ? "text-[#FF9500]" : "text-gray-400"}`}
                    >
                      {fullDate}
                    </p>
                    <p className="text-lg font-black text-[#262626]">{time}</p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-[#FF9500] rounded-full animate-ping"></div>
                    )}
                  </button>
                );
              })}

              {filteredSlots.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                  <Calendar size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold italic text-sm tracking-wide">
                    No sessions found for this selection.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sidebar Action */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-6">
            {/* Booking Summary Card */}
            <div className="bg-[#262626] rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#FF9500]/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                      Investment
                    </p>
                    <h4 className="text-4xl font-black">
                      ₹{mentor.HourlyPrice}
                      <span className="text-lg text-gray-500 font-bold">
                        /hr
                      </span>
                    </h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[#FF9500] font-black">
                      <Star size={16} fill="#FF9500" />
                      <span>{mentor.RatingAvg || "5.0"}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {mentor.TotalReviews || 0} Reviews
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handlePayment}
                    disabled={!selectedSlot || processingPayment}
                    className={`w-full py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl transform active:scale-95
                      ${selectedSlot
                        ? "bg-[#FF9500] text-white hover:bg-[#e68600] shadow-[#FF9500]/20"
                        : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                      }
                    `}
                  >
                    {processingPayment ? "Processing..." : "Confirm & Book"} <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={handleConnect}
                    disabled={processingPayment}
                    className="w-full bg-white/5 text-white py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-white/10 transition flex items-center justify-center gap-2 md:gap-3 border border-white/10"
                  >
                    <MessageCircle size={18} /> {processingPayment ? "Connecting..." : "Direct Message"}
                  </button>
                </div>

                <div className="space-y-5 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">
                        Secure Payment
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        100% Refundable up to 24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                      <Video size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">
                        HD Video Session
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Built-in whiteboard & screen share
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Badge */}
            <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#FF9500]">
                <Award size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-[#262626]">
                  Top Rated Excellence
                </p>
                <p className="text-xs text-gray-400 font-bold">
                  In the top 5% of mentors this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
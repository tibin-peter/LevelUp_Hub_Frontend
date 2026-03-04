import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Users, DollarSign, Star, Loader2, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMentorBookingRequests } from "../../api/booking.api";
import { getMentorProfile } from "../../api/mentor.api";
import { getMentorDashboardStats } from "../../api/dashboard.api";

const initialStats = [
  {
    label: "Cumulative Revenue",
    value: "0",
    icon: <DollarSign className="text-white" size={24} />,
    bg: "bg-[#10B981]",
    trend: "Total Volume",
    key: "total_earnings"
  },
  {
    label: "Available Balance",
    value: "0",
    icon: <DollarSign className="text-white" size={24} />,
    bg: "bg-[#8B5CF6]",
    trend: "Spendable",
    key: "wallet_balance"
  },
  {
    label: "Total Students",
    value: "0",
    icon: <Users className="text-white" size={24} />,
    bg: "bg-[#FF9500]",
    trend: "+0%",
    key: "total_students"
  },
  {
    label: "Booking Requests",
    value: "0",
    icon: <Calendar className="text-white" size={24} />,
    bg: "bg-[#6366F1]",
    trend: "New",
    key: "booking_requests"
  },
];

export default function MentorDashboard() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh profile on mount to check for approval
  useEffect(() => {
    async function refreshProfile() {
      if (user?.role === 'mentor' && user.status !== 'approved') {
        try {
          const res = await getMentorProfile();
          if (res.success && res.data) {
            const latest = res.data;
            // Normalize keys just in case
            const normalizedStatus = latest.Status || latest.status;

            if (normalizedStatus === 'approved') {
              updateUser({
                ...latest,
                status: 'approved',
                isVerified: true
              });
            }
          }
        } catch (e) {
          console.error("Profile refresh failed", e);
        }
      }
    }
    refreshProfile();
  }, []); // Run once on mount

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch specific dashboard stats
        const dashboardRes = await getMentorDashboardStats();
        if (dashboardRes.success && dashboardRes.data) {
          setStats(prev => prev.map(stat => {
            let val = dashboardRes.data[stat.key];
            
            // Format currency for both earnings and wallet balance
            if (stat.key === 'total_earnings' || stat.key === 'wallet_balance') {
              val = dashboardRes.data[stat.key] ?? 0;
              val = `₹${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            }

            return {
              ...stat,
              value: val?.toString() || "0"
            };
          }));
        }

        // Fetch recent booking requests specifically
        const res = await getMentorBookingRequests();
        if (res.success && res.data) {
          setRecentRequests(res.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch mentor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'mentor') {
      // Only fetch data if the mentor is approved. 
      // 'new' or 'pending' mentors don't have bookings yet.
      if (user.status === 'approved') {
        fetchData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading || (loading && user?.role === 'mentor')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF9500]" size={40} />
      </div>
    );
  }

  if (user && user.role === "mentor") {
    if (user.status === "new" || !user.status) {
      return <Navigate to="/mentor/onboarding" replace />;
    }
    if (user.status === "pending") {
      return <Navigate to="/mentor/pending" replace />;
    }
    // If approved, allow access (render dashboard below)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight">
          Welcome, {user?.name?.split(" ")[0] || "Mentor"}
        </h1>
        <p className="text-[#737373] text-lg font-medium">Manage your growth and student success.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="card-premium p-6 flex items-center gap-5 group cursor-default"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300 ${stat.bg}`}>
              {stat.icon}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">{stat.label}</p>
                {stat.trend && (
                  <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-black text-[#171717]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="card-premium p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#171717]">Recent Requests</h2>
            <p className="text-sm text-[#737373] font-medium mt-1">Pending approval from students</p>
          </div>
          <Link to="/mentor/requests" className="group flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] rounded-xl text-sm font-bold text-[#262626] hover:bg-[#F5F5F5] transition-colors">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map(req => (
              <div key={req.booking_id || req.ID} className="group flex items-center justify-between p-5 rounded-2xl border border-[#F5F5F5] hover:border-[#E5E5E5] hover:shadow-md transition-all bg-[#FAFAFA] hover:bg-white">
                <div className="flex items-center gap-5">
                  <div className="bg-[#FFF7ED] p-3 rounded-2xl text-[#C2410C]">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#171717] text-lg mb-0.5">{req.student_name || req.Student?.Name || "Student"}</h4>
                    <p className="text-sm font-medium text-[#737373]">Requested a session</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1.5 bg-[#F0FDF4] text-[#15803D] rounded-lg border border-[#DCFCE7] uppercase tracking-tighter">
                    {req.status || req.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-4">
              <Users className="text-[#D4D4D4]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#171717] mb-2">No pending requests</h3>
            <p className="text-[#737373] max-w-xs mx-auto font-medium">When students book a session with you, they will appear here for approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
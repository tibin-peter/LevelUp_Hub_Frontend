import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Calendar, Clock, Loader2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboardStats } from '../../api/dashboard.api';
import { Link } from 'react-router-dom';

const initialStats = [
  { label: "Active Bookings", value: "0", icon: <Clock className="text-white" size={24} />, bg: "bg-[#FF9500]", key: "active_bookings" },
  { label: "Completed Sessions", value: "0", icon: <BookOpen className="text-[#262626]" size={24} />, bg: "bg-[#F3F4F6]", key: "completed_sessions" },
  { label: "Favorite Mentors", value: "0", icon: <Star className="text-[#262626]" size={24} />, bg: "bg-[#F3F4F6]", key: "favorite_mentors" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(initialStats);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await getStudentDashboardStats();
        if (res.success && res.data) {
          const { active_bookings, completed_sessions, favorite_mentors, upcoming_sessions } = res.data;

          setUpcomingSessions(upcoming_sessions || []);

          setDashboardStats(prev => prev.map(stat => ({
            ...stat,
            value: res.data[stat.key]?.toString() || "0"
          })));
        }
      } catch (err) {
        console.error("Failed to fetch student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-[#737373] text-lg font-medium">Ready to level up your skills today?</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="card-premium p-6 flex items-center gap-5 group cursor-default">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-[#171717]">
                {loading && stat.key !== 'favorites' ? "..." : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended / Upcoming Section */}
      <div className="card-premium p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#171717]">Upcoming Sessions</h2>
            <p className="text-sm text-[#737373] font-medium mt-1">Your scheduled mentorship meetings</p>
          </div>
          <Link to="/dashboard/bookings" className="group flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] rounded-xl text-sm font-bold text-[#262626] hover:bg-[#F5F5F5] transition-colors">
            View Schedule <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-[#FF9500]" size={32} />
          </div>
        ) : upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.booking_id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-[#F5F5F5] hover:border-[#E5E5E5] hover:shadow-md transition-all bg-[#FAFAFA] hover:bg-white">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={`https://ui-avatars.com/api/?name=${session.mentor_name}&background=262626&color=fff`}
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                      alt=""
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#171717] text-lg mb-0.5">{session.mentor_name || "Unassigned"}</h4>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#737373]">
                      <BookOpen size={14} />
                      <span>Mentorship Session</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-[#171717] font-bold">
                      <Calendar size={16} className="text-[#FF9500]" />
                      {session.start_time ? new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date TBD'}
                    </div>
                    <span className="text-xs font-bold text-[#A3A3A3] mt-1 block">
                      {session.start_time ? new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <button className="px-5 py-2.5 bg-[#262626] text-white text-sm font-bold rounded-xl hover:bg-[#FF9500] hover:shadow-lg hover:shadow-[#FF9500]/20 transition-all active:scale-95">
                    Join Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-[#D4D4D4]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#171717] mb-2">No upcomings sessions</h3>
            <p className="text-[#737373] max-w-xs mx-auto mb-6 font-medium">You haven't booked any mentorship sessions yet. Start your journey today!</p>
            <Link to="/dashboard/mentors" className="btn-primary">
              Find a Mentor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

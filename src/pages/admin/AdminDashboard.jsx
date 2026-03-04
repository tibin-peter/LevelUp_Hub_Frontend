import React, { useState, useEffect } from 'react';
import { Users, BookOpen, IndianRupee, ShieldCheck, MessageCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { getAdminDashboardStats } from '../../api/admin.api';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("month");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardStats(filter);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Students", value: stats?.total_students || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Mentors", value: stats?.total_mentors || 0, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Courses", value: stats?.active_courses || 0, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Revenue", value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: IndianRupee, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  // Map backend data to recharts format
  const chartData = stats?.revenue_chart?.map(item => ({
    name: item.label,
    earnings: item.revenue,
    trend: item.revenue, // We use the same value for the line trend
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#262626] border border-white/10 p-4 rounded-2xl shadow-2xl text-white">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-lg font-black text-[#FF9500]">₹{payload[0].value.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Revenue flow analyzed</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#262626]">Platform Snapshot</h1>
          <p className="text-gray-400 font-medium mt-2">Welcome back, {user?.name?.split(" ")[0] || "Admin"}. Here's what's happening today.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          {['week', 'month', 'year'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? "bg-[#262626] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Last {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#FF9500]" size={48} />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <stat.icon className={stat.color} size={28} />
                  </div>
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-[#262626]">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Hybrid Revenue Chart */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-[#262626] flex items-center gap-3">
                  <TrendingUp className="text-[#FF9500]" /> Earnings Flow
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#FF9500] rounded-full"></div>
                    <span className="text-xs font-bold text-gray-500">Earnings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#FF9500]/20 rounded-full border border-[#FF9500]/40"></div>
                    <span className="text-xs font-bold text-gray-500">Trend</span>
                  </div>
                </div>
              </div>

              <div className="h-[400px] w-full mt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF9500" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#A3A3A3', fontSize: 10, fontWeight: 900 }}
                        dy={10}
                      />
                      <YAxis
                        hide
                        domain={['auto', 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F7F7F8' }} />

                      <Area
                        type="monotone"
                        dataKey="trend"
                        stroke="none"
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                        animationDuration={1500}
                      />

                      <Bar
                        dataKey="earnings"
                        barSize={32}
                        radius={[8, 8, 0, 0]}
                        fill="#FF9500"
                        animationDuration={1000}
                      />

                      <Line
                        type="monotone"
                        dataKey="trend"
                        stroke="#FF9500"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#FF9500', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        animationDuration={2000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <TrendingUp size={48} className="opacity-10" />
                    <p className="font-bold">Gathering financial data...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-12 lg:col-span-4 bg-[#262626] rounded-[40px] shadow-2xl shadow-black/20 p-10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#FF9500]/10 rounded-full blur-3xl"></div>

              <h3 className="text-2xl font-black mb-8 relative z-10">Operations Log</h3>

              <div className="space-y-8 relative z-10">
                {(stats?.recent_activities || [
                  { type: "info", title: "System Active", description: "Monitoring global nodes", time: "Now" }
                ]).map((log, i) => {
                  const Icon = log.Type === 'user' ? Users : log.Type === 'course' ? BookOpen : ShieldCheck;
                  const color = log.Type === 'user' ? 'text-blue-400' : log.Type === 'course' ? 'text-purple-400' : 'text-[#FF9500]';
                  return (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:border-[#FF9500]/50 transition-colors">
                        <Icon className={color} size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{log.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">{log.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">{log.time}</span>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-12 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all cursor-not-allowed opacity-50">
                Advanced Logs Soon
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

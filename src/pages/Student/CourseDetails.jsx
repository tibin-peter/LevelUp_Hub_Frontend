import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  Video,
  Star,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Send, // <--- ADDED THIS IMPORT
} from "lucide-react";
import api from "../../api/axios";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, mentorsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/mentors`),
        ]);

        if (courseRes.data.success) {
          setCourse(courseRes.data.data);
        }

        if (mentorsRes.data.success) {
          setMentors(mentorsRes.data.data || []);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        setError("Unable to retrieve course details or available mentors.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle starting a new conversation
  const startConversation = async (mentorId) => {
    try {
      const res = await api.post("/messages/conversations", { mentorId });

      // Fixed: Only one navigate call should exist.
      // It will use the ID returned from your backend.
      if (res.data && res.data.ConversationID) {
        navigate(`/dashboard/messages?id=${res.data.ConversationID}`);
      } else {
        navigate(`/dashboard/messages`);
      }
    } catch (err) {
      console.error("Failed to initiate chat", err);
      // Fallback in case the API fails
      navigate(`/dashboard/messages`);
    }
  };

  // ... rest of your loading and error checks stay the same ...

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#FF9500] border-gray-100"></div>
        <p className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">
          Syncing with Mentors
        </p>
      </div>
    );

  if (error || !course)
    return (
      <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 max-w-2xl mx-auto shadow-sm">
        <h2 className="text-2xl font-black text-[#262626]">
          {error || "Course Not Found"}
        </h2>
        <button
          onClick={() => navigate("/dashboard/courses")}
          className="mt-6 bg-[#262626] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#FF9500] transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative h-[50vh] md:h-[65vh] min-h-[400px] md:min-h-[500px] w-full overflow-hidden bg-gray-900 rounded-b-[40px] md:rounded-b-[60px] shadow-2xl transition-all duration-700">
        <img
          src={course.ImageURL || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000"}
          alt={course.Title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[2s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-10 md:pb-16 max-w-7xl mx-auto w-full">
          {/* Navigation */}
          <Link
            to="/dashboard/courses"
            className="group inline-flex items-center gap-3 text-white/70 hover:text-[#FF9500] font-black uppercase tracking-widest text-[10px] transition-all mb-10 w-fit"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl shadow-sm group-hover:bg-[#FF9500] group-hover:text-white transition-all">
              <ChevronLeft size={16} />
            </div>
            Return to Discovery
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="px-5 py-2 bg-[#FF9500] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FF9500]/20">
                {course.Category || "Specialization"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-widest bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl">
                <TrendingUp size={14} /> Global Top Choice
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 tracking-tight leading-[0.95]">
              {course.Title}
            </h1>

            <div className="flex flex-wrap gap-8 items-center border-t border-white/10 pt-8 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FF9500]">
                  <Video size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Format</p>
                  <p className="text-sm font-bold text-white">1-on-1 Sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification</p>
                  <p className="text-sm font-bold text-white">Full-Stack Experts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-20">
            {/* Description Card */}
            <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gray-50 rounded-full group-hover:bg-[#FF9500]/5 transition-colors duration-700" />
              <h3 className="text-3xl font-black text-[#262626] mb-8 relative">Program Blueprint</h3>
              <p className="text-gray-500 text-xl font-medium leading-relaxed relative">
                {course.Description}
              </p>
            </section>

            {/* Mentors Section */}
            <div>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h3 className="text-4xl font-black text-[#262626]">Expert Mentors</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Connecting you with industry leaders</p>
                </div>
                <div className="hidden md:flex bg-gray-100 px-6 py-3 rounded-2xl gap-2 items-center">
                  <span className="text-xl font-black text-[#262626]">{mentors.length}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advisors Live</span>
                </div>
              </div>

              <div className="space-y-8">
                {mentors.length > 0 ? (
                  mentors.map((mentor) => (
                    <div
                      key={mentor.ID}
                      className="bg-white p-5 md:p-8 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10 group hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:border-[#FF9500]/30 transition-all duration-700"
                    >
                      <div className="flex flex-col sm:flex-row flex-1 items-center gap-6 md:gap-8 w-full">
                        <div className="relative shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[30px] md:rounded-[40px] overflow-hidden bg-gray-100 ring-4 md:ring-8 ring-gray-50 group-hover:ring-[#FF9500]/10 transition-all duration-700">
                            <img
                              src={mentor.ProfilePicURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.Name}`}
                              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                              alt={mentor.Name}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white shadow-lg" />
                        </div>

                        <div className="flex-1 text-center sm:text-left w-full">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                            <h4 className="text-2xl md:text-3xl font-black text-[#262626] group-hover:text-[#FF9500] transition-colors leading-tight tracking-tight">
                              {mentor.Name}
                            </h4>
                          </div>
                          <p className="text-gray-400 text-[10px] md:text-sm font-black uppercase tracking-[0.15em] mb-4">
                            {mentor.Bio || "Verified Lead Consultant"}
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-black text-[#262626] border border-gray-100">
                              <Star size={14} fill="#FF9500" className="text-[#FF9500]" />
                              {mentor.RatingAvg || "5.0"}
                            </div>
                            <span className="text-[9px] md:text-[11px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between gap-4 md:pl-10 md:border-l border-gray-100 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50 mt-2 md:mt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5 md:mb-1">Fee Starting at</p>
                          <p className="text-xl md:text-2xl font-black text-[#262626]">₹{mentor.HourlyPrice || "500"}<span className="text-[10px] md:text-xs text-gray-300">/hr</span></p>
                        </div>

                        <div className="flex gap-2 md:gap-3 justify-end shrink-0">
                          <Link
                            to={`/dashboard/mentordetails/${mentor.ID}`}
                            className="p-3.5 md:p-5 bg-gray-50 text-gray-400 rounded-xl md:rounded-[24px] hover:bg-[#262626] hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <ArrowRight size={18} className="md:w-6 md:h-6" />
                          </Link>
                          <button
                            onClick={() => startConversation(mentor.ID)}
                            className="px-4 md:px-10 py-3.5 md:py-5 bg-[#262626] text-white rounded-xl md:rounded-[24px] font-black text-[9px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-3 hover:bg-[#FF9500] hover:shadow-2xl hover:shadow-[#FF9500]/40 active:scale-95 transition-all"
                          >
                            <Send size={14} className="text-[#FF9500] md:w-[18px] md:h-[18px]" /> Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-32 bg-gray-50 rounded-[60px] border-4 border-dashed border-gray-100 overflow-hidden relative group">
                    <UserPlus size={64} className="mx-auto text-gray-200 mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm relative z-10">
                      Network Expansion in Progress
                    </p>
                    <p className="text-gray-300 text-xs font-bold mt-2">New experts land every Tuesday.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-8">
              {/* Premium Card */}
              <div className="bg-[#262626] p-12 rounded-[56px] text-white shadow-2xl overflow-hidden relative group border border-white/5">
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#FF9500]/20 rounded-full blur-[80px] group-hover:blur-[100px] transition-all duration-1000" />

                <div className="w-20 h-20 bg-[#FF9500] rounded-[28px] flex items-center justify-center mb-12 shadow-2xl shadow-[#FF9500]/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <Video size={40} />
                </div>

                <h3 className="text-4xl font-black mb-8 leading-[1.1] tracking-tight">
                  Premium Experience
                </h3>

                <p className="text-gray-400 text-lg font-medium leading-relaxed mb-12">
                  Gain exclusive technical insights with 1:1 sessions tailored to your pace.
                </p>

                <div className="space-y-8">
                  {[
                    "Custom Growth Maps",
                    "Live Code Diagnostics",
                    "Career Acceleration",
                    "Instant Messaging",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-5 text-[11px] font-black text-gray-100 uppercase tracking-widest"
                    >
                      <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center ring-1 ring-white/20">
                        <CheckCircle size={16} className="text-[#FF9500]" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-16 bg-white text-[#262626] py-6 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-[#FF9500] hover:text-white transition-all shadow-xl active:scale-95">
                  Upgrade to Elite
                </button>
              </div>

              {/* Course Features Mini Card */}
              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Program Perks</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold">Students Enrolled</span>
                    <span className="text-[#262626] font-black">1.4k+</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold">Avg Response</span>
                    <span className="text-green-500 font-black">Under 2hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

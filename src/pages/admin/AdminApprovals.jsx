import React, { useEffect, useState } from "react";
import { getPendingMentors, approveMentor, rejectMentor } from "../../api/admin.api";
import { Check, X, Loader2, AlertCircle, ShieldAlert, FileText, Mail, Briefcase } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminApprovals() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const res = await getPendingMentors();
            if (res.success) {
                setMentors(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch pending mentors", error);
            toast.error("Failed to reach verification servers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await approveMentor(id);
            if (res.success) {
                toast.success("Identity verified and status upgraded.");
                setMentors(prev => prev.filter(m => m.ID !== id));
            }
        } catch (error) {
            toast.error("Approval sequence failed.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Verify: Are you certain you want to reject this application?")) return;
        try {
            const res = await rejectMentor(id);
            if (res.success) {
                toast.success("Application rejected.");
                setMentors(prev => prev.filter(m => m.ID !== id));
            }
        } catch (error) {
            toast.error("Rejection sequence failed.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authenticating Requests</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Trust & Verification</h1>
                    <p className="text-gray-400 font-medium mt-1">Review applicant credentials and authorize platform expertise.</p>
                </div>
                <div className="bg-white px-8 py-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {mentors.slice(0, 3).map((m, i) => (
                            <img key={i} src={m.User?.ProfilePicURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.User?.Name)}&background=random`} className="w-10 h-10 rounded-full border-4 border-white object-cover shadow-sm" alt="" />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mentors.length} Applications Waiting</span>
                </div>
            </div>

            {mentors.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-gray-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                        <ShieldAlert className="text-gray-200" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[#262626] mb-2">Queue Fully Processed</h3>
                    <p className="text-gray-400 max-w-sm font-medium">No pending mentor applications require administrative action at this time.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {mentors.map((mentor) => (
                        <div key={mentor.ID} className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-gray-50">
                            {/* Profile Sidebar */}
                            <div className="p-10 xl:w-80 bg-gray-50/30 flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <img
                                        src={mentor.User?.ProfilePicURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.User?.Name)}&background=random`}
                                        className="w-28 h-28 rounded-[32px] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
                                        alt={mentor.User?.Name}
                                    />
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg border border-gray-100 whitespace-nowrap">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Awaiting Auth</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-[#262626] line-height-1.2">{mentor.User?.Name}</h3>
                                <p className="text-gray-400 text-xs font-bold mt-1 flex items-center gap-1"><Mail size={12} /> {mentor.User?.Email}</p>

                                <div className="mt-8 flex flex-col gap-2 w-full">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 text-left">
                                        <span className="text-[8px] font-black text-gray-300 uppercase block mb-1">Hourly Rate</span>
                                        <span className="font-black text-[#262626]">₹{mentor.HourlyPrice.toLocaleString()}/hr</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 text-left">
                                        <span className="text-[8px] font-black text-gray-300 uppercase block mb-1">Experience</span>
                                        <span className="font-black text-[#262626]">{mentor.ExperienceYears} Seasons</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dossier Content */}
                            <div className="flex-1 p-10 flex flex-col">
                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/50 text-blue-600 rounded-2xl border border-blue-100 font-bold text-xs">
                                        <Briefcase size={16} /> {mentor.category}
                                    </div>
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-2xl border border-gray-100 font-bold text-xs italic">
                                        {mentor.sub_category || "General Specialization"}
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <FileText size={14} /> Professional Narrative
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed font-black line-clamp-4">
                                            {mentor.Bio || "No biographical data provided in application."}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Core Skillset</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(mentor.Skills || "").split(',').map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-[#262626] text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Control Interface */}
                                <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end items-center gap-4">
                                    <button
                                        onClick={() => handleReject(mentor.ID)}
                                        className="h-14 px-8 rounded-2xl text-red-400 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <X size={18} /> Reject Identity
                                    </button>
                                    <button
                                        onClick={() => handleApprove(mentor.ID)}
                                        className="h-14 px-10 rounded-2xl bg-[#FF9500] text-white hover:brightness-110 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-orange-100"
                                    >
                                        <Check size={20} /> Authorize Expert
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

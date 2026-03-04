import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, UserX, UserCheck, Star, Briefcase, IndianRupee, ShieldCheck, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { getMentors, blockUser, unblockUser } from "../../api/admin.api";
import { toast } from "react-hot-toast";

export default function AdminMentors() {
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get("search") || "";

    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(querySearch);

    useEffect(() => {
        setSearchTerm(querySearch);
    }, [querySearch]);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const res = await getMentors();
            if (res.success) {
                setMentors(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch mentors:", err);
            toast.error("Failed to connect to Mentor Network.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const handleToggleBlock = async (mentor) => {
        const action = mentor.IsBlocked ? unblockUser : blockUser;
        const actionName = mentor.IsBlocked ? "unblock" : "block";

        if (!window.confirm(`Are you sure you want to ${actionName} mentor ${mentor.Name}?`)) return;

        try {
            const res = await action(mentor.ID);
            if (res.success) {
                toast.success(`Mentor ${mentor.Name} ${actionName}ed`);
                setMentors(prev => prev.map(m => m.ID === mentor.ID ? { ...m, IsBlocked: !m.IsBlocked } : m));
            }
        } catch (err) {
            toast.error(`Failed to ${actionName} mentor`);
        }
    };

    const filteredMentors = mentors.filter(m =>
        m.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.Email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Mentor Network</h1>
                    <p className="text-gray-400 font-medium mt-1">Supervise verified experts and safeguard instructional quality.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-8 py-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 transition-transform group-hover:rotate-12">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <span className="block text-2xl font-black text-[#262626] line-height-1 leading-none">{mentors.filter(m => !m.IsBlocked).length}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Experts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] relative">
                <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row gap-8 bg-gray-50/20">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={22} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find by expertise, name or secure ID..."
                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white border border-gray-100 focus:border-green-500/30 focus:ring-4 focus:ring-green-500/5 transition-all outline-none font-bold text-[#262626] placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-5 bg-white border border-gray-100 rounded-[24px] text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all group">
                            <Filter size={20} className="group-hover:scale-90 transition-transform" /> Advanced Parameters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="animate-spin text-green-600" size={42} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Auditing Network Nodes</p>
                        </div>
                    ) : filteredMentors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                            <Briefcase size={48} className="text-gray-200" />
                            <p className="font-black text-gray-400">No matching mentors found in history.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-10 py-8">Mentor Identity</th>
                                    <th className="px-10 py-8">Verification Status</th>
                                    <th className="px-10 py-8 text-center">Engagement Profile</th>
                                    <th className="px-10 py-8 text-right">Action Interface</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMentors.map((mentor) => (
                                    <tr key={mentor.ID} className="group hover:bg-gray-50/40 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <img
                                                        src={mentor.ProfilePicURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.Name)}&background=random`}
                                                        className="w-16 h-16 rounded-[24px] object-cover shadow-sm group-hover:scale-110 transition-transform duration-500 border-2 border-white"
                                                        alt=""
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${!mentor.IsBlocked ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'} shadow-lg`}>
                                                        <ShieldCheck size={10} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg text-[#262626] group-hover:text-green-600 transition-colors">{mentor.Name}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{mentor.Email}</p>
                                                    <p className="text-[9px] font-black text-gray-300 mt-1 uppercase">ID: MTR-0{mentor.ID}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${!mentor.IsBlocked ? 'bg-green-50/50 border-green-100 text-green-600' : 'bg-red-50/50 border-red-100 text-red-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${!mentor.IsBlocked ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{!mentor.IsBlocked ? 'Verified Access' : 'Restricted'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm font-black text-gray-600">Established {new Date(mentor.CreatedAt).getFullYear()}</div>
                                                <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Contributor</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="w-12 h-12 rounded-[18px] bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all" title="Review Full Dossier">
                                                    <ExternalLink size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBlock(mentor)}
                                                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${!mentor.IsBlocked ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-green-500 hover:bg-green-50 hover:text-green-600'} border border-transparent hover:border-current/10`}
                                                    title={!mentor.IsBlocked ? 'Restrict Account' : 'Reactive Account'}
                                                >
                                                    {!mentor.IsBlocked ? <UserX size={22} /> : <UserCheck size={22} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

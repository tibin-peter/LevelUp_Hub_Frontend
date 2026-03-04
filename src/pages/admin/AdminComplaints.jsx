import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, CheckCircle, Clock, AlertCircle, Send, Loader2, ShieldCheck, User } from 'lucide-react';
import { getComplaints, replyToComplaint } from "../../api/admin.api";
import { toast } from "react-hot-toast";

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await getComplaints();
            if (res.success) {
                setComplaints(res.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
            toast.error("Support feed synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleReply = async (statusArg = "resolved") => {
        if (!replyText.trim() && statusArg !== "resolved") {
            toast.error("Please provide a response narrative.");
            return;
        }

        try {
            setSending(true);
            const res = await replyToComplaint(selected.ID, replyText, statusArg);
            if (res.success) {
                toast.success(`Ticket ${statusArg === 'resolved' ? 'resolved' : 'updated'}`);
                setReplyText("");
                // Remove from local list as requested
                setComplaints(prev => prev.filter(c => c.ID !== selected.ID));
                setSelected(null);
            }
        } catch (err) {
            toast.error("Failed to transmit reply.");
        } finally {
            setSending(false);
        }
    };

    const filteredComplaints = complaints.filter(c =>
        c.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Support Operations</h1>
                    <p className="text-gray-400 font-medium mt-1">Resolve community disputes and optimize platform trust metrics.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9500] transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Scan ticket database..."
                            className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-4 focus:ring-[#FF9500]/5 w-[300px] lg:w-[400px] font-bold text-[#262626] placeholder:text-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 h-[calc(100vh-320px)] min-h-[600px]">
                {/* List View */}
                <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <h3 className="font-black text-[#262626] uppercase text-[10px] tracking-widest">Incident Stream</h3>
                        <span className="bg-[#262626] text-white text-[9px] font-black px-2 py-1 rounded-lg">{filteredComplaints.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="animate-spin text-[#FF9500]" size={32} />
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Linking Secure Nodes</p>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <ShieldCheck size={48} className="text-gray-200 mb-2" />
                                <p className="text-xs font-black text-gray-400 uppercase">Clearance Log Empty</p>
                            </div>
                        ) : (
                            filteredComplaints.map(c => (
                                <div
                                    key={c.ID}
                                    onClick={() => setSelected(c)}
                                    className={`p-6 rounded-[32px] cursor-pointer transition-all duration-300 border ${selected?.ID === c.ID ? 'bg-[#262626] border-transparent shadow-2xl scale-[1.02]' : 'bg-white border-gray-100 hover:border-[#FF9500]/40'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${c.Status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {c.Status}
                                        </span>
                                        <span className={`text-[10px] font-bold ${selected?.ID === c.ID ? 'text-gray-500' : 'text-gray-300'}`}>
                                            {new Date(c.CreatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className={`font-black mb-1 line-clamp-1 ${selected?.ID === c.ID ? 'text-white' : 'text-[#262626]'}`}>{c.Subject}</h4>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selected?.ID === c.ID ? 'text-gray-400' : 'text-gray-400'}`}>Ref: #INC-{c.ID}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Agent Detail View */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                    {selected ? (
                        <>
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-[#262626] rounded-[22px] flex items-center justify-center text-[#FF9500] shadow-lg shadow-black/10">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-xl text-[#262626]">User ID: {selected.UserID}</h3>
                                            <span className="bg-gray-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest text-gray-500">{selected.Role}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{selected.Category}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {selected.Status === 'open' && (
                                        <button
                                            onClick={() => handleReply("resolved")}
                                            className="px-6 py-4 bg-green-50 text-green-600 rounded-[22px] font-black text-[10px] uppercase tracking-widest hover:bg-green-100 hover:scale-105 transition-all flex items-center gap-2 border border-green-100"
                                        >
                                            <CheckCircle size={18} /> Close Incident
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/30 custom-scrollbar">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-4">User Statement</span>
                                    <div className="bg-white p-8 rounded-[36px] border border-gray-100 shadow-sm max-w-[90%] font-black text-gray-700 leading-relaxed relative">
                                        {selected.Description}
                                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white border-b border-l border-gray-100 rotate-45"></div>
                                    </div>
                                </div>

                                {selected.AdminReply && (
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[9px] font-black text-[#FF9500]/50 uppercase tracking-widest mr-4 text-right">Administrative Response</span>
                                        <div className="bg-[#262626] p-8 rounded-[36px] shadow-2xl max-w-[90%] text-white font-medium leading-relaxed relative">
                                            {selected.AdminReply}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#262626] rotate-45"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-gray-50 bg-white">
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 relative group">
                                        <input
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Compose authoritative response..."
                                            disabled={sending || selected.Status === 'resolved'}
                                            className="w-full px-8 py-5 rounded-[24px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9500]/10 transition-all font-black text-[#262626] disabled:opacity-50"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleReply("resolved")}
                                        disabled={sending || selected.Status === 'resolved'}
                                        className="bg-[#262626] text-[#FF9500] w-16 h-14 rounded-[22px] flex items-center justify-center hover:bg-black hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {sending ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                                    </button>
                                </div>
                                {selected.Status === 'resolved' && (
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mt-4">Communication channel archived for resolved incidents</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
                            <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center mb-10 border border-gray-100">
                                <MessageSquare className="text-gray-200" size={60} />
                            </div>
                            <h3 className="text-3xl font-black text-[#262626] mb-4 tracking-tight">Support Terminal</h3>
                            <p className="text-gray-400 max-w-sm font-black text-xs uppercase tracking-widest leading-loose">
                                Select an active incident from the stream to authorize a response and adjust clearance level.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Search, Filter, Loader2, AlertCircle, IndianRupee, ArrowUpRight, User, Calendar, ShieldCheck } from "lucide-react";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../../api/admin.api";
import { toast } from "react-hot-toast";

export default function AdminWithdrawals() {
    const [withdraws, setWithdraws] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending");

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const res = await getWithdrawals();
            if (res.success) {
                setWithdraws(res.data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch withdrawal queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Authorize transfer of funds to mentor's registered account?")) return;
        try {
            const res = await approveWithdrawal(id);
            if (res.success) {
                toast.success("Withdrawal authorized.");
                fetchWithdrawals();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed.");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Reason for rejection:");
        if (reason === null) return;
        try {
            const res = await rejectWithdrawal(id);
            if (res.success) {
                toast.success("Withdrawal rejected and funds reversed.");
                fetchWithdrawals();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed.");
        }
    };

    const filtered = withdraws.filter(w => filterStatus === "all" || w.Status === filterStatus);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Withdrawal Requests</h1>
                    <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Manage and authorize mentor fund dispersion protocols.</p>
                </div>
                <div className="flex gap-3 p-1.5 bg-white border border-gray-100 rounded-[24px] shadow-sm">
                    {["pending", "approved", "all"].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-8 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-[#262626] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 gap-6">
                            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Querying Request Pool</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-48 opacity-40">
                            <ShieldCheck size={48} className="mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest">No active requests in this protocol</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="px-10 py-8">Mentor Node</th>
                                    <th className="px-10 py-8">Amount Request</th>
                                    <th className="px-10 py-8">Temporal Data</th>
                                    <th className="px-10 py-8 text-right">Verification Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((w) => (
                                    <tr key={w.ID} className="group hover:bg-gray-50/30 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img 
                                                        src={w.Mentor?.ProfilePicURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.Mentor?.Name)}&background=262626&color=fff`} 
                                                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                                                        alt=""
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${w.Status === 'approved' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[#262626]">{w.Mentor?.Name}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{w.Mentor?.Email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-xl font-black text-[#262626] tracking-tight">₹{w.Amount.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Dispersion Sequence</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500">
                                                    <Calendar size={12} className="text-gray-300" />
                                                    REQ: {new Date(w.RequestedAt).toLocaleString()}
                                                </div>
                                                {w.Status !== 'pending' && (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-green-600">
                                                        <CheckCircle2 size={12} className="text-green-400" />
                                                        PROC: {new Date(w.ProcessedAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {w.Status === 'pending' ? (
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleReject(w.ID)}
                                                        className="w-12 h-12 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(w.ID)}
                                                        className="w-12 h-12 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                        title="Approve Request"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${w.Status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                    {w.Status}
                                                </span>
                                            )}
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

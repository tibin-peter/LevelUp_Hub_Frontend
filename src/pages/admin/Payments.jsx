import React, { useState, useEffect } from "react";
import { IndianRupee, Download, Search, Filter, Loader2, AlertCircle, TrendingUp, CheckCircle2, History as HistoryIcon, CreditCard, ShieldCheck, X, Calendar, User, BookOpen } from "lucide-react";
import { getPaymentLedger, getPaymentOverview } from "../../api/admin.api";
import { toast } from "react-hot-toast";

export default function Payments() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [overview, setOverview] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ledgerRes, overviewRes] = await Promise.all([
                getPaymentLedger(searchTerm, statusFilter),
                getPaymentOverview()
            ]);

            if (ledgerRes.success) {
                setTransactions(ledgerRes.data || []);
            }

            if (overviewRes.success) {
                setOverview(overviewRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch payment data:", err);
            toast.error("Internal Audit Synchronization Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter]);

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return "bg-green-50 text-green-600 border-green-100";
            case 'released': return "bg-blue-50 text-blue-600 border-blue-100";
            case 'refunded': return "bg-red-50 text-red-600 border-red-100";
            case 'created': return "bg-orange-50 text-orange-600 border-orange-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const stats = [
        { label: "Total Revenue", value: overview?.total_revenue || 0, icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Escrow Holding", value: overview?.escrow_holding || 0, icon: HistoryIcon, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Total Refunded", value: overview?.total_refunded || 0, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
        { label: "Released", value: overview?.total_released || 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#262626] tracking-tight">Financial Audit Dashboard</h1>
                    <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Comprehensive oversight of all platform capital flows.</p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-[#262626] text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-[#FF9500] hover:scale-105 transition-all shadow-xl group">
                    <Download size={18} /> 
                    EXPORT FISCAL LOG
                </button>
            </div>

            {/* Quick KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                        <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-current group-hover:scale-110 transition-transform`}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[9px] mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-[#262626]">₹{stat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row gap-8 bg-gray-50/20">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9500] transition-all" size={22} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Payment ID, Booking ID, Student or Mentor..." 
                            className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-white border border-gray-100 font-bold text-[#262626] outline-none focus:ring-8 focus:ring-[#FF9500]/5 focus:border-[#FF9500]/20 transition-all" 
                        />
                    </div>
                    <div className="flex gap-4">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-8 py-5 bg-white border border-gray-100 rounded-[28px] text-gray-500 font-black text-[10px] uppercase tracking-widest outline-none focus:border-[#FF9500]/30 transition-all appearance-none cursor-pointer pr-12"
                        >
                            <option value="">All Protocols</option>
                            <option value="paid">PAID</option>
                            <option value="released">RELEASED</option>
                            <option value="refunded">REFUNDED</option>
                            <option value="created">CREATED</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-48 gap-6 text-gray-400">
                            <Loader2 className="animate-spin text-[#FF9500]" size={42} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Registry</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-48 opacity-40">
                            <AlertCircle size={48} className="mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest text-[#262626]">No transaction cycles found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="px-10 py-8">TX Identifier</th>
                                    <th className="px-10 py-8">Entity Logic</th>
                                    <th className="px-10 py-8">Status</th>
                                    <th className="px-10 py-8 text-right">Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((tx) => (
                                    <tr 
                                        key={tx.id} 
                                        onClick={() => setSelectedTx(tx)}
                                        className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="font-mono text-sm font-black text-[#262626] group-hover:text-[#FF9500] transition-colors flex items-center gap-3">
                                                <CreditCard size={16} className="text-gray-300" />
                                                #{tx.id}
                                                <span className="text-[10px] text-gray-300">| BK-{tx.booking_id}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-2">
                                                <Calendar size={12} /> {new Date(tx.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-[#262626]">
                                                    <BookOpen size={12} className="text-orange-400" />
                                                    {tx.mentor_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                    <User size={12} />
                                                    {tx.student_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="text-lg font-black text-[#262626]">₹{(tx.amount / 100).toLocaleString('en-IN')}</div>
                                            {tx.paid_at && (
                                                <div className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-1">
                                                    PAID: {new Date(tx.paid_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#262626]/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-2xl font-black text-[#262626]">Transaction Dossier</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Identifier: #{selectedTx.id}</p>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Razorpay Node</label>
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase block mb-1">Order ID</span>
                                            <code className="text-xs font-black text-[#262626] break-all">{selectedTx.razorpay_order_id}</code>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase block mb-1">Payment ID</span>
                                            <code className="text-xs font-black text-[#262626] break-all">{selectedTx.razorpay_payment_id || "PENDING"}</code>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Linked Booking</label>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Universal ID</span>
                                            <span className="font-black text-[#262626]">BK-{selectedTx.booking_id}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Gross Amount</span>
                                            <span className="font-black text-xl text-[#FF9500]">₹{((selectedTx.amount || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Entity Protocols</label>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-50 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Student Node</p>
                                            <p className="font-black text-sm text-[#262626]">{selectedTx.student_name}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-50 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Mentor Node</p>
                                            <p className="font-black text-sm text-[#262626]">{selectedTx.mentor_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex justify-center">
                            <button onClick={() => setSelectedTx(null)} className="px-12 py-5 rounded-2xl bg-[#262626] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#FF9500] transition-all">
                                Close Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
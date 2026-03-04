import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, ShieldEllipsis, Download, Wallet as WalletIcon, PieChart, Loader2, Sparkles, Activity, ArrowUpRight, ArrowDownLeft, AlertCircle, History as HistoryIcon } from 'lucide-react';
import { getWalletOverview, getWalletTransactions } from '../../api/admin.api';
import { toast } from 'react-hot-toast';

export default function AdminWallet() {
    const [overview, setOverview] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overviewRes, txRes] = await Promise.all([
                getWalletOverview(),
                getWalletTransactions()
            ]);
            
            if (overviewRes.success) {
                setOverview(overviewRes.data);
            }
            if (txRes.success) {
                setTransactions(txRes.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch financial data:", err);
            toast.error("Financial Core Decryption Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <Loader2 className="animate-spin text-[#FF9500]" size={64} />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#262626] animate-pulse" size={24} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Synchronizing Fiscal Fabric</p>
            </div>
        );
    }

    const stats = [
        { label: "Current Balance", value: overview?.current_balance || 0, icon: WalletIcon, color: "text-blue-600", bg: "bg-blue-50/50", sub: "Available capital" },
        { label: "Earned Commission", value: overview?.commission_earned || 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50/50", sub: "Platform net" },
        { label: "Mentor Payouts", value: overview?.total_mentor_payouts || 0, icon: ArrowUpRight, color: "text-orange-600", bg: "bg-orange-50/50", sub: "Total dispensed" },
        { label: "Refunds Given", value: overview?.total_refunds_given || 0, icon: HistoryIcon, color: "text-red-500", bg: "bg-red-50/50", sub: "Capital reversed" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50 transition-all duration-1000 group-hover:scale-150"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-2 h-10 bg-[#FF9500] rounded-full"></div>
                        <h1 className="text-4xl font-black text-[#262626] tracking-tighter">earnings_ledger_v2.0</h1>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] ml-6">Secured audit trail of platform administrative wallet.</p>
                </div>
                <button className="relative z-10 flex items-center gap-3 px-10 py-5 bg-[#262626] text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:bg-[#FF9500] hover:scale-105 transition-all shadow-2xl shadow-black/10">
                    <Download size={20} /> 
                    EXTRACT FISCAL REPORT
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative">
                         <div className={`absolute -right-8 -bottom-8 ${stat.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`}>
                            <stat.icon size={160} strokeWidth={3} />
                        </div>
                        <div className={`${stat.bg} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[9px] mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-[#262626] tracking-tighter">
                            ₹{stat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="mt-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[64px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                    <div>
                        <h3 className="text-2xl font-black text-[#262626] tracking-tight">Audit Sequence</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Immutable record of node transaction events</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-[10px] font-black text-[#FF9500] uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Activity size={16} /> Live Sync Active
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-48 opacity-40">
                            <AlertCircle size={48} className="mb-4" />
                            <p className="font-black text-xs uppercase tracking-widest text-[#262626]">No transaction cycles found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="px-12 py-8">Cycle Entry</th>
                                    <th className="px-12 py-8">Logic Class</th>
                                    <th className="px-12 py-8">Reference</th>
                                    <th className="px-12 py-8 text-right">Differential</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-gray-50/30 transition-all duration-300">
                                        <td className="px-12 py-10">
                                            <div className="font-black text-[#262626] text-sm group-hover:text-[#FF9500] transition-colors flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                                    {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <span className="block font-black tracking-tight">{tx.type.replace(/_/g, ' ').toUpperCase()}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(tx.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <span className="px-4 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-[9px] font-black uppercase tracking-widest border border-gray-100">
                                                {tx.source || 'INTERNAL'}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="text-xs font-black text-[#262626] font-mono">
                                                REF-BOOKING-{tx.reference_id}
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className={`text-xl font-black tracking-tighter ${tx.amount > 0 ? 'text-green-500' : 'text-[#262626]'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">
                                                SECURE SETTLEMENT
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

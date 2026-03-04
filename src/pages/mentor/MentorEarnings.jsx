import React, { useState, useEffect } from "react";
import { Wallet, ArrowDownCircle, Download, Loader2, DollarSign, History as HistoryIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getMentorEarnings, withdrawFunds, getMyWithdrawals } from "../../api/payment.api";
import { toast } from "react-hot-toast";

export default function MentorEarnings() {
  const [earningsData, setEarningsData] = useState({ Balance: 0, History: [] });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [earningsRes, withdrawRes] = await Promise.all([
        getMentorEarnings(),
        getMyWithdrawals()
      ]);

      if (earningsRes.success && earningsRes.data) {
        setEarningsData({
          Balance: earningsRes.data.balance ?? earningsRes.data.Balance ?? 0,
          History: earningsRes.data.history ?? earningsRes.data.History ?? []
        });
      }

      if (withdrawRes.success) {
        setWithdrawals(withdrawRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    const amount = window.prompt("Enter amount to withdraw:", earningsData.Balance);
    if (!amount || isNaN(amount) || amount <= 0) return;

    if (amount > earningsData.Balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setWithdrawing(true);
      const res = await withdrawFunds(amount);
      if (res.success) {
        toast.success("Withdrawal request submitted for admin approval!");
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9500]" />
      </div>
    );
  }

  const getWithdrawalStatusStyles = (status) => {
    switch (status) {
      case 'approved': return "bg-green-50 text-green-600 border-green-100";
      case 'rejected': return "bg-red-50 text-red-600 border-red-100";
      case 'pending': return "bg-orange-50 text-orange-600 border-orange-100";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-black text-[#262626] tracking-tight">Earnings & Wallet</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Manage your professional revenue and fund dispersions.</p>
        </div>
      </div>

      {/* Premium Balance Card */}
      <div className="bg-[#262626] p-12 rounded-[48px] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-gray-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10">
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
            available_capital
          </p>
          <h2 className="text-6xl font-black text-[#FF9500] tracking-tighter">
            ₹{earningsData.Balance?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <CheckCircle2 size={14} className="text-green-500" /> All assets verified
          </div>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={earningsData.Balance <= 0 || withdrawing}
          className="mt-8 md:mt-0 relative z-10 bg-white text-[#262626] px-12 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#FF9500] hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95 group"
        >
          {withdrawing ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} className="group-hover:rotate-12 transition-transform" />}
          REQUEST DISPERSION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Payment History */}
        <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <HistoryIcon size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#262626] tracking-tight">Revenue Stream</h3>
            </div>

            {earningsData.History && earningsData.History.length > 0 ? (
            <div className="space-y-6">
                {earningsData.History.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-6 rounded-[32px] bg-gray-50/50 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(payment.amount || payment.Amount) > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                <ArrowDownCircle size={20} />
                            </div>
                            <div>
                                <span className="block font-black text-[#262626] text-sm uppercase tracking-tight">{payment.type?.replace(/_/g, ' ') || "SESSION EARNING"}</span>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date(payment.created_at || payment.CreatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-[#262626]">
                                ₹{(payment.amount || payment.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">VERIFIED</span>
                        </div>
                    </div>
                ))}
            </div>
            ) : (
            <div className="flex flex-col items-center py-20 text-center opacity-40">
                <HistoryIcon className="text-gray-300 w-12 h-12 mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">No revenue cycles detected</p>
            </div>
            )}
        </div>

        {/* Withdrawal Status */}
        <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Clock size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#262626] tracking-tight">Dispersion Queue</h3>
            </div>

            {withdrawals.length > 0 ? (
                <div className="space-y-6">
                    {withdrawals.map((w) => (
                        <div key={w.id || w.ID} className="flex items-center justify-between p-6 rounded-[32px] bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(w.status || w.Status) === 'approved' ? 'bg-green-50 text-green-500' : (w.status || w.Status) === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                    {(w.status || w.Status) === 'approved' ? <CheckCircle2 size={20} /> : (w.status || w.Status) === 'rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                                </div>
                                <div>
                                    <span className="block font-black text-[#262626] text-sm tracking-tight">₹{(w.amount || w.Amount || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(w.requested_at || w.RequestedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getWithdrawalStatusStyles(w.status || w.Status)}`}>
                                {w.status || w.Status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-20 text-center opacity-40">
                    <Clock className="text-gray-300 w-12 h-12 mb-4" />
                    <p className="font-black text-xs uppercase tracking-widest">Zero active dispersions</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Plus, AlertCircle } from 'lucide-react';
import { getStudentPayments } from '../../api/payment.api';
import api from "../../api/axios";

export default function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const [pRes, wRes] = await Promise.all([
          getStudentPayments(),
          api.get('/payments/mentor/earnings') // This endpoint returns {balance, history} for any user
        ]);

        if (pRes.success) setPayments(pRes.data || []);
        if (wRes.data.success) {
            setWallet(wRes.data.data || { balance: 0, history: [] });
        }
      } catch (err) {
        console.error(err);
        setError("Error loading payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString || isoString.startsWith("0001")) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-[#262626]">Payments & Wallet</h1>

      {/* Premium Wallet Card */}
      <div className="bg-[#262626] p-8 rounded-[40px] text-white flex justify-between items-center shadow-2xl shadow-black/10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#FF9500]/10 rounded-2xl flex items-center justify-center border border-[#FF9500]/20">
            <Plus className="text-[#FF9500]" size={32} />
          </div>
          <div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">
              Wallet Balance (Refunds & Top-ups)
            </p>
            <h2 className="text-4xl font-black text-[#FF9500]">
              ₹{wallet?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
            </h2>
          </div>
        </div>
        <button className="bg-[#FF9500] hover:bg-[#e68600] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#FF9500]/20">
          Top Up Wallet
        </button>
      </div>
      {/* Transaction History */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-[#262626]">Transaction History</h3>
          {loading && <span className="text-sm text-gray-400 animate-pulse">Syncing...</span>}
        </div>

        {error && (
          <div className="p-8 text-center text-red-500 font-bold bg-red-50 m-4 rounded-2xl flex items-center justify-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F7F8] text-gray-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-4">Transaction ID</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Mentor</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">Loading transactions...</td>
                </tr>
              ) : payments.length === 0 && !error ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">No transactions found.</td>
                </tr>
              ) : (
                payments.map((tr) => (
                  <tr key={tr.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-500 text-sm">
                      {tr.razorpay_order_id || `#TR-${tr.id}`}
                    </td>
                    <td className="px-8 py-5 font-bold text-[#262626] text-sm">
                      {formatDate(tr.created_at)}
                    </td>
                    <td className="px-8 py-5 font-bold text-[#262626] text-sm">
                      {tr.mentor_name || "Unknown Mentor"}
                    </td>
                    <td className="px-8 py-5 font-black text-[#262626] text-sm">
                      {tr.currency === "INR" ? "₹" : tr.currency}
                      {(tr.amount / 100).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em]
                        ${tr.status === 'paid' || tr.status === 'captured' ? 'bg-green-50 text-green-600' :
                          tr.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}
                      `}>
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
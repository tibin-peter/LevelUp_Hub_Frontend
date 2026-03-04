import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, CreditCard, Lock, Loader2 } from "lucide-react";
import { createBooking } from "../../api/booking.api";
import { createPaymentOrder, verifyPayment } from "../../api/payment.api";
import { toast } from "react-hot-toast";

export default function BookingCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: slotId } = useParams();
  const [loading, setLoading] = useState(false);

  const slotInfo = location.state?.selectedSlot || "Selected Session";
  const price = location.state?.price || 50;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1. Create the booking record
      const bookingRes = await createBooking(Number(slotId));
      const bookingId = bookingRes.data.booking_id;

      // 2. Create Razorpay Order
      const orderRes = await createPaymentOrder(bookingId);
      const { OrderID, Amount, Currency, Key } = orderRes.data;

      // 3. Open Razorpay Modal
      const options = {
        key: Key,
        amount: Amount,
        currency: Currency,
        name: "LevelUp Hub",
        description: `Mentorship Session - ${slotInfo}`,
        order_id: OrderID,
        handler: async (response) => {
          try {
            setLoading(true);
            await verifyPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success("Payment Successful! Session Booked.");
            navigate("/dashboard/bookings");
          } catch (err) {
            toast.error("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: location.state?.studentName || "",
          email: location.state?.studentEmail || "",
        },
        theme: {
          color: "#FF9500",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] py-20 px-6">
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-white">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#262626]">
            Secure Checkout
          </h2>
          <p className="text-gray-400 font-medium">
            Review your session details
          </p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex justify-between p-6 bg-gray-50 rounded-3xl">
            <span className="text-gray-500 font-bold">1-on-1 Mentorship</span>
            <span className="text-[#262626] font-black">₹{price}</span>
          </div>
          <div className="flex justify-between p-6 bg-gray-50 rounded-3xl">
            <span className="text-gray-500 font-bold">Scheduled Time</span>
            <span className="text-[#FF9500] font-black">{slotInfo}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-[#262626] text-white py-5 rounded-2xl font-extrabold text-lg shadow-lg shadow-black/10 hover:bg-black transition flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <><CreditCard size={24} /> Pay ₹{price} Now</>}
        </button>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
          <Lock size={14} /> Secured by LevelUp Encryption
        </div>
      </div>
    </div>
  );
}

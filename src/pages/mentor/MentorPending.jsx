import React from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function MentorPending() {
    return (
        <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-sm border text-center">
                <div className="w-20 h-20 bg-[#FFF4E5] rounded-full flex items-center justify-center mx-auto mb-8">
                    <Clock className="w-10 h-10 text-[#FF9500]" />
                </div>

                <h2 className="text-3xl font-black mb-4">Application Under Review</h2>

                <p className="text-gray-500 mb-6">
                    Your mentor profile is currently being reviewed by our admin team. This
                    process usually takes 24-48 hours. You will be notified once approved.
                </p>

                <div className="bg-[#F7F7F8] py-4 rounded-2xl text-[#FF9500] font-bold mb-6">
                    Status: PENDING
                </div>

                <Link
                    to="/"
                    className="text-sm text-gray-400 font-semibold hover:text-[#FF9500]"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

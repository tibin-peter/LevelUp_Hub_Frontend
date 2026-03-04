import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function BecomeMentor() {
  const { user } = useAuth();

  return (
    <div className="py-24 px-6 lg:px-16 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Become a Mentor
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Share your knowledge and help the next generation of professionals
          grow.
        </p>

        <div className="bg-[#F7F7F8] p-10 rounded-3xl border border-gray-100 shadow-sm">
          {/* LOGIC: SHOW DIFFERENT CONTENT BASED ON AUTH STATUS */}

          {/* CASE 1: NOT LOGGED IN */}
          {!user && (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Why teach on LevelUp Hub?
              </h2>
              <ul className="text-left space-y-4 mb-8 max-w-lg mx-auto">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF9500]"></div>
                  <span className="text-gray-700">
                    Earn money by sharing your expertise
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF9500]"></div>
                  <span className="text-gray-700">
                    Flexible schedule, teach on your own terms
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF9500]"></div>
                  <span className="text-gray-700">
                    Join a global community of educators
                  </span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#FF9500] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e68600] transition-colors shadow-md"
              >
                Apply Now <ArrowRight size={20} />
              </Link>
            </>
          )}

          {/* CASE 2: LOGGED IN AS STUDENT */}
          {user?.role === "student" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                You're already a member!
              </h2>
              <p className="text-gray-500 mb-6">
                Since you already have a student account, you just need to
                provide your professional details to become a mentor.
              </p>
              <Link
                to="/mentor/onboarding" // Changed from "mentor/onboarding" (relative) to "/mentor/onboarding" (absolute)
                className="inline-flex items-center gap-2 bg-[#FF9500] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e68600] transition-colors shadow-md"
              >
                Complete Mentor Profile <ArrowRight size={20} />
              </Link>
            </div>
          )}

          {/* CASE 3: MENTOR - PENDING */}
          {user?.role === "mentor" && user.status === "pending" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-yellow-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Pending</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Your application is currently under review. We will notify you
                once your profile is approved.
              </p>
              <div className="bg-yellow-50 text-yellow-700 px-6 py-2 rounded-full font-bold text-sm border border-yellow-200">
                Status: Under Review
              </div>
            </div>
          )}

          {/* CASE 4: MENTOR - APPROVED */}
          {user?.role === "mentor" && user.status === "approved" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">You are a Mentor!</h2>
              <p className="text-gray-500 mb-6">
                Your profile is active and ready to accept bookings.
              </p>
              <Link
                to="/mentor/dashboard"
                className="inline-flex items-center gap-2 bg-[#FF9500] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e68600] transition-colors shadow-md"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            </div>
          )}

          {/* CASE 5: MENTOR - NEW (Not finished onboarding) */}
          {user?.role === "mentor" && user.status === "new" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Complete Your Profile
              </h2>
              <p className="text-gray-500 mb-6">
                You need to finish your onboarding to become a visible mentor.
              </p>
              <Link
                to="/mentor/onboarding"
                className="inline-flex items-center gap-2 bg-[#FF9500] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e68600] transition-colors shadow-md"
              >
                Continue Onboarding <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

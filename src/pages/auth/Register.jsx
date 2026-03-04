import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { sendOtpAPI } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Enter email first");
      return;
    }
    try {
      await sendOtpAPI(formData.email);
      toast.success("OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // Inside Register.jsx - handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(formData);

      toast.success("Welcome to LevelHub!");

      // Route based on the role selected/saved
      if (user.role === "mentor") {
        navigate("/mentor/onboarding"); // New mentors go to onboarding
      } else {
        navigate("/dashboard"); // Students go to main dashboard
      }
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
      <div className="flex w-full max-w-[850px] bg-white rounded-[2rem] shadow-xl overflow-hidden">
        {/* Left Side */}
        <div className="w-[45%] relative hidden md:block p-3">
          <div className="h-full w-full rounded-[1.5rem] overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238"
              alt="register"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-6">
            <div className="flex bg-gray-100 p-1 rounded-full mb-4">
              <Link
                to="/login"
                className="px-6 py-1.5 rounded-full text-gray-400 text-xs font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-1.5 rounded-full bg-[#FF9500] text-white text-xs font-semibold shadow-sm"
              >
                Register
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-3"
          >
            <div>
              <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                User Name
              </label>
              <input
                name="name"
                onChange={handleChange}
                type="text"
                required
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                Enter Email
              </label>
              <div className="flex gap-2">
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="Enter email"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619]"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-[#FF9500] text-white px-4 rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                  Enter OTP
                </label>
                <input
                  name="otp"
                  onChange={handleChange}
                  required
                  placeholder="6 digit OTP"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619]"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                Password
              </label>
              <input
                name="password"
                onChange={handleChange}
                type="password"
                required
                placeholder="Create password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                  formData.role === "student"
                    ? "bg-[#FF9500] text-white border-[#FF9500]"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                As a Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("mentor")}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                  formData.role === "mentor"
                    ? "bg-[#FF9500] text-white border-[#FF9500]"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                As a Mentor
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF9500] text-white py-3 rounded-xl font-bold text-xs mt-4 shadow-md hover:bg-[#e68a00] transition-all"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

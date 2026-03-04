import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(loginData);

      // Admin Routing
      if (user.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // Mentor Routing
      if (user.role === "mentor") {
        // Use normalized 'status' from AuthContext
        if (user.status === "approved") {
          navigate("/mentor/dashboard");
        } else if (user.status === "pending") {
          navigate("/mentor/pending");
        } else {
          // 'new' or undefined
          navigate("/mentor/onboarding");
        }
        return;
      }

      // Student Routing
      if (user.role === "student") {
        navigate("/dashboard");
        return;
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
      <div className="flex w-full max-w-[850px] bg-white rounded-[2rem] shadow-xl overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-[45%] relative hidden md:block p-3">
          <div className="h-full w-full rounded-[1.5rem] overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238"
              alt="login"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-10 left-8 right-8 text-white">
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                Welcome Back to LevelHub
              </h2>
              <p className="text-xs opacity-80 leading-relaxed">
                Log in to access your dashboard and continue your journey.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="flex bg-gray-100 p-1 rounded-full mb-6">
              <Link
                to="/login"
                className="px-6 py-1.5 rounded-full bg-[#FF9500] text-white text-xs font-semibold shadow-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-1.5 rounded-full text-gray-400 text-xs font-semibold"
              >
                Register
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                Enter your email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={handleChange}
                required
                autocomplete="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619] transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
                autocomplete="current-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb619] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF9500] text-white py-3 rounded-xl hover:bg-[#e68a00] transition-all font-bold text-xs shadow-lg mt-4"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

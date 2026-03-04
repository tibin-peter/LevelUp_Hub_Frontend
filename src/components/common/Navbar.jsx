import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Helper to determine dashboard path based on role
  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "mentor") {
      if (user.status === "approved") return "/mentor/dashboard";
      if (user.status === "pending") return "/mentor/pending";
      return "/mentor/onboarding";
    }
    return "/dashboard"; // Default student dashboard
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Become a Mentor", path: "/become-mentor" },
  ];


  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full font-sans shadow-sm">
      {/* Orange Top Bar */}
      <div className="bg-[#FF9500] h-10 flex items-center justify-center px-4 text-center">
        <span className="text-white text-[10px] md:text-xs font-medium tracking-wide">
          LevelUp-Hub — A Community Building and Skill Sharing Platform
        </span>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-16 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <Logo />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                let linkName = link.name;
                if (link.name === "Become a Mentor" && user) {
                  if (user.role === "mentor") {
                    if (user.status === "pending") linkName = "Application Pending";
                    else if (user.status === "approved") linkName = "Mentor Profile";
                    else if (user.status === "new") linkName = "Finish Onboarding";
                  }
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === link.path
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-[#FF9500]"
                      }`}
                  >
                    {linkName}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Logic (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 bg-[#262626] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <div className="h-8 w-[1px] bg-gray-200 mx-2" />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-700 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center">
                      {(user.profilePicURL || user.profile_pic_url) ? (
                        <img 
                          src={user.profilePicURL || user.profile_pic_url} 
                          alt="avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FF9500] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#262626]">
                      {user.name?.split(" ")[0] || "User"}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2.5 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-gray-700 text-sm font-bold hover:text-[#FF9500] px-4"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-[#FF9500] text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-[#e68600] transition-all shadow-md shadow-[#FF9500]/20"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-[104px] left-0 w-full bg-white border-b border-gray-100 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => {
              let linkName = link.name;
              if (link.name === "Become a Mentor" && user) {
                if (user.role === "mentor") {
                  if (user.status === "pending") linkName = "Application Pending";
                  else if (user.status === "approved") linkName = "Mentor Profile";
                  else if (user.status === "new") linkName = "Finish Onboarding";
                }
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${location.pathname === link.path
                    ? "bg-[#FFF9F2] text-[#FF9500]"
                    : "bg-gray-50 text-gray-600"
                    }`}
                >
                  {linkName}
                  <ChevronRight size={18} />
                </Link>
              );
            })}

            <hr className="border-gray-100 my-2" />

            {user ? (
              <div className="space-y-3">
                <Link
                  to={getDashboardPath()}
                  onClick={toggleMenu}
                  className="flex items-center justify-center gap-2 w-full bg-[#262626] text-white py-4 rounded-2xl font-black shadow-lg shadow-gray-200"
                >
                  <LayoutDashboard size={20} />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="bg-[#FF9500] text-white py-4 rounded-2xl font-black text-center shadow-lg shadow-[#FF9500]/20"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={toggleMenu}
                  className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-black text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

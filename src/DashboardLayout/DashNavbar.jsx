import { useState, useRef, useEffect } from "react";
import { Bell, Search, Settings, LogOut, User, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function DashNavbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    return `${apiBase}/${url}`;
  };



  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let targetPath = "/dashboard/mentors"; // Default student
    if (user?.role === "mentor") targetPath = "/mentor/explore-courses";
    if (user?.role === "admin") targetPath = "/admin/mentors";

    navigate(`${targetPath}?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect to login page after successful logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-[#FFF3E6] hover:text-[#FF9500] transition-all"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb / Title */}
        <div className="shrink-0">
          <h1 className="text-xl md:text-2xl font-black text-[#262626] tracking-tight">
            Dashboard
          </h1>
          <p className="hidden xs:block text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            Welcome, {user?.name?.split(" ")[0] || "User"}!
          </p>
        </div>

        {/* Search - Hidden on very small screens, shown on md+ */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex items-center bg-[#F7F7F8] rounded-2xl px-4 py-2.5 md:px-5 md:py-3 w-[180px] md:w-[320px] focus-within:ring-2 focus-within:ring-[#FF9500]/20 focus-within:bg-white transition-all border border-transparent focus-within:border-[#FF9500]/30"
        >
          <Search size={18} className="text-gray-400 mr-2 md:mr-3 shrink-0" />
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-xs md:text-sm font-medium text-gray-700 w-full placeholder-gray-400"
          />
        </form>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all duration-300 ${showNotifications ? "bg-[#FFF3E6] text-[#FF9500]" : "hover:bg-gray-50 text-gray-500"}`}
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-[#FF9500] border-2 border-white rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-[#262626]">Notifications</h3>
                <span className="text-xs font-bold text-[#FF9500] cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      New Mentor Request
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sarah updated her schedule.
                    </p>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 rounded-xl flex gap-3 items-start transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#FF9500] mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      Session Confirmed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your session with Marcus is set.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-100"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 pr-4 rounded-[20px] transition-all border border-transparent hover:border-gray-100"
          >
            <img
              src={getImageUrl(user?.profilePicURL || user?.profile_pic_url) || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=262626&color=fff`}
              alt="avatar"
              className="w-10 h-10 rounded-2xl object-cover shadow-sm bg-gray-200"
            />
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-bold text-[#262626]">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {user?.role || "Guest"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-300 ${showProfile ? "rotate-180" : ""}`}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-4 w-60 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-50 mb-2">
                <p className="font-bold text-[#262626] truncate">
                  {user?.email}
                </p>
              </div>

              <Link
                to={
                  `/dashboard/settings` /* Note: Path depends on role, simplifed for now */
                }
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                onClick={() => setShowProfile(false)}
              >
                <Settings size={18} /> Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 font-bold transition-colors mt-1"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

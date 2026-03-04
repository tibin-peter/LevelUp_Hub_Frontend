import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { sidebarConfig } from "../config/sidebar.config.js";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import Logo from "../components/common/Logo.jsx";

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "student";
  const menu = sidebarConfig[role] || [];

  const userPermissions = React.useMemo(() => {
    const perms = user?.permissions || user?.Permissions || [];
    return new Set(perms.map(p => {
      if (typeof p === 'string') return p;
      return p.Slug || p.slug || "";
    }));
  }, [user]);

  const filteredMenu = React.useMemo(() => {
    return menu.map(group => ({
      ...group,
      items: group.items.filter(item => !item.slug || userPermissions.has(item.slug))
    })).filter(group => group.items.length > 0);
  }, [menu, userPermissions]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className={`
      w-80 bg-white border-r border-[#F0F0F0] h-screen sticky top-0 flex flex-col z-50
      fixed inset-y-0 left-0 lg:sticky transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>
      <div className="h-20 lg:h-28 flex items-center px-8 border-b lg:border-none border-gray-50">
        <Logo />
      </div>

      <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((group, gIndex) => (
          <div key={gIndex} className="space-y-2">
            {group.group && (
              <p className="px-4 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 mt-6">
                {group.group}
              </p>
            )}
            {group.items.map((item, index) => {
              const Icon = item.icon;
              const isDashboardRoot = item.path === "/dashboard" || item.path === "/mentor/dashboard" || item.path === "/admin/dashboard";

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  end={isDashboardRoot}
                  onClick={() => {
                    if (window.innerWidth < 1024) closeSidebar();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 border border-transparent
                    ${isActive
                      ? "bg-[#262626] text-white shadow-xl shadow-black/5"
                      : "text-[#737373] hover:bg-[#F9FAFB] hover:text-[#171717]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={22}
                        className={`transition-colors duration-300 ${isActive ? "text-[#FF9500]" : "text-[#A3A3A3] group-hover:text-[#262626]"}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={`text-[15px] ${isActive ? "font-bold" : "font-semibold"}`}>{item.label}</span>

                      {/* Active Indicator Dot */}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF9500] shadow-[0_0_8px_#FF9500]"></div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-[#F0F0F0] bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] font-bold transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

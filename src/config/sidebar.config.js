import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageCircle,
  CreditCard,
  Settings,
  BookOpenCheck,
  Search,
  CalendarClock,
  ShieldCheck,
  AlertCircle,
  History as HistoryIcon
} from "lucide-react";

export const sidebarConfig = {
  student: [
    {
      group: "Main Menu",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", slug: "dashboard" },
        { label: "Explore Mentors", icon: Search, path: "/dashboard/mentors", slug: "explore_mentors" },
        { label: "Connected Mentors", icon: Users, path: "/dashboard/connected-mentors", slug: "mentors" },
        { label: "Courses", icon: BookOpenCheck, path: "/dashboard/courses", slug: "courses" },
        { label: "Bookings", icon: Calendar, path: "/dashboard/bookings", slug: "bookings" },
        { label: "Messages", icon: MessageCircle, path: "/dashboard/messages", slug: "messages" },
        { label: "Payments", icon: CreditCard, path: "/dashboard/payments", slug: "payments" },
        { label: "Settings", icon: Settings, path: "/dashboard/settings", slug: "settings" }
      ]
    }
  ],

  mentor: [
    {
      group: "Main Menu",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/mentor/dashboard", slug: "dashboard" },
        { label: "Explore Courses", icon: Search, path: "/mentor/explore_courses", slug: "explore_courses" },
        { label: "My Courses", icon: BookOpenCheck, path: "/mentor/my_courses", slug: "my_courses" },
        { label: "Sessions", icon: Calendar, path: "/mentor/sessions", slug: "sessions" },
        { label: "Earnings", icon: CreditCard, path: "/mentor/earnings", slug: "earnings" },
        { label: "Messages", icon: MessageCircle, path: "/mentor/messages", slug: "messages" },
        { label: "Booking Requests", icon: MessageCircle, path: "/mentor/requests", slug: "booking_requests" },
        { label: "Settings", icon: Settings, path: "/mentor/settings", slug: "settings" }
      ]
    }
  ],

  admin: [
    {
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", slug: "dashboard" }
      ]
    },
    {
      group: "USER MANAGEMENT",
      items: [
        { label: "All Users", icon: Users, path: "/admin/users" },
        { label: "Students", icon: Users, path: "/admin/students", slug: "students" },
        { label: "Mentors", icon: Users, path: "/admin/mentors", slug: "mentors" },
        { label: "Mentor Approvals", icon: ShieldCheck, path: "/admin/mentor-approvals", slug: "mentor_approvals" },
        { label: "Complaints", icon: AlertCircle, path: "/admin/complaints", slug: "complaints" }
      ]
    },
    {
      group: "LEARNING MANAGEMENT",
      items: [
        { label: "Courses", icon: BookOpenCheck, path: "/admin/courses", slug: "courses" }
      ]
    },
    {
      group: "FINANCIALS",
      items: [
        { label: "Payments", icon: CreditCard, path: "/admin/payments" },
        { label: "Wallet", icon: CreditCard, path: "/admin/wallet" },
        { label: "Withdrawals", icon: HistoryIcon, path: "/admin/withdrawals" }
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { label: "Web Configuration", icon: Settings, path: "/admin/config", slug: "settings" },
        { label: "Profile", icon: Users, path: "/admin/profile", slug: "profile" }
      ]
    }
  ]
};

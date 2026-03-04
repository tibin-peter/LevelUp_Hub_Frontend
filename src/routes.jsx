import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./PublicLayouts/PublicLayout";
import DashboardLayout from "./DashboardLayout/DashboardLayout";

import Home from "./pages/public/Home";
import Courses from "./pages/public/Courses";
import BecomeMentor from "./pages/public/BecomeMentor";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student
import ExploreMentors from "./pages/Student/ExploreMentors"
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentBookings from "./pages/Student/StudentBookings";
import StudentMessages from "./pages/Student/StudentMessages";
import StudentPayments from "./pages/Student/StudentPayments";
import StudentSettings from "./pages/Student/StudentSettings";
import StudentCourses from "./pages/Student/StudentCourses";
import CourseDetails from "./pages/Student/CourseDetails";
import ConnectedMentors from "./pages/Student/ConnectedMentors";

// Mentor
import MentorOnboarding from "./pages/mentor/MentorOnboarding";
import MentorPending from "./pages/mentor/MentorPending";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorSessions from "./pages/mentor/MentorSessions";
import MentorBookingRequests from "./pages/mentor/MentorBookingRequests";
import MentorEarnings from "./pages/mentor/MentorEarnings";
import MentorMessages from "./pages/mentor/MentorMessages";
import MentorSettings from "./pages/mentor/MentorSettings";
import MentorAllCourses from "./pages/mentor/MentorAllCourses";
import MentorMyCourses from "./pages/mentor/MentorMyCourses";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminComplaints from "./pages/admin/AdminComplaints";
import Payments from "./pages/admin/Payments";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminWebConfig from "./pages/admin/AdminWebConfig";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminUsers from "./pages/admin/AdminUsers";
import Settings from "./pages/admin/Settings";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";

import ProtectedRoute from "./guards/ProtectedRoute";
import RoleRoute from "./guards/RoleRoute";
import BookingCheckout from "./pages/Student/BookingCheckout";
import MentorDetails from "./pages/Student/MentorDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="become-mentor" element={<BecomeMentor />} />
        </Route>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          {/* STUDENT ROUTES */}
          <Route element={<RoleRoute allowedRoles={["student"]} />}>
            <Route element={<DashboardLayout />}>
              {/* Nested under /dashboard */}
              <Route path="dashboard">
                <Route index element={<StudentDashboard />} />
                <Route path="mentors" element={<ExploreMentors />} />
                <Route path="connected-mentors" element={<ConnectedMentors />} />
                <Route path="checkout/:id" element={<BookingCheckout />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="course/:id" element={<CourseDetails />} />
                <Route path="mentordetails/:id" element={<MentorDetails />} />
                <Route path="bookings" element={<StudentBookings />} />
                <Route path="messages" element={<StudentMessages />} />
                <Route path="payments" element={<StudentPayments />} />
                <Route path="settings" element={<StudentSettings />} />
              </Route>
            </Route>
          </Route>

          {/* MENTOR ROUTES */}
          <Route element={<RoleRoute allowedRoles={["mentor"]} />}>
            <Route path="mentor">
              {/* 1. PUBLIC-STYLE PAGES (Accessible to unverified mentors) */}
              {/* These are NOT wrapped in DashboardLayout */}
              <Route path="onboarding" element={<MentorOnboarding />} />
              <Route path="pending" element={<MentorPending />} />

              {/* 2. PROTECTED DASHBOARD PAGES */}
              {/* These ARE wrapped in DashboardLayout and will be blocked by the 'isVerified' logic in RoleRoute */}
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<MentorDashboard />} />
                <Route path="explore_courses" element={<MentorAllCourses />} />
                <Route path="my_courses" element={<MentorMyCourses />} />
                <Route path="sessions" element={<MentorSessions />} />
                <Route path="requests" element={<MentorBookingRequests />} />
                <Route path="earnings" element={<MentorEarnings />} />
                <Route path="messages" element={<MentorMessages />} />
                <Route path="settings" element={<MentorSettings />} />
              </Route>
            </Route>
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="admin">
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="mentors" element={<AdminMentors />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="mentor-approvals" element={<AdminApprovals />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="payments" element={<Payments />} />
                <Route path="wallet" element={<AdminWallet />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="config" element={<AdminWebConfig />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

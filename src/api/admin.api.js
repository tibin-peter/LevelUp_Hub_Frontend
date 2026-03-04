import api from "./axios";

// Students
export const getStudents = async () => {
    const response = await api.get("/admin/students");
    return response.data;
};

// Mentors
export const getMentors = async () => {
    const response = await api.get("/admin/mentors");
    return response.data;
};

// All Users
export const getUsers = async (search = "") => {
    const response = await api.get(`/admin/users?search=${search}`);
    return response.data;
};

export const createAdminUser = async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
};

// User Blocking
export const blockUser = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/block`);
    return response.data;
};

export const unblockUser = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/unblock`);
    return response.data;
};

// Mentor Approvals
export const getPendingMentors = async () => {
    const response = await api.get("/admin/mentor-approvals");
    return response.data;
};

export const approveMentor = async (mentorId) => {
    const response = await api.patch(`/admin/mentor-approvals/${mentorId}/approve`);
    return response.data;
};

export const rejectMentor = async (mentorId) => {
    const response = await api.patch(`/admin/mentor-approvals/${mentorId}/reject`);
    return response.data;
};

// Complaints
export const getComplaints = async () => {
    const response = await api.get("/admin/complaints");
    return response.data;
};

export const replyToComplaint = async (complaintId, reply, status) => {
    const response = await api.put(`/admin/complaints/${complaintId}/reply`, { reply, status });
    return response.data;
};

// Get admin dashboard stats
export const getAdminDashboardStats = async (filter = "month") => {
    const response = await api.get(`/admin/dashboard?filter=${filter}`);
    return response.data;
};

// Courses
export const getCourseCount = async () => {
    const response = await api.get("/admin/courses/count");
    return response.data;
};

export const getCourses = async (params = {}) => {
    const response = await api.get("/admin/courses", { params });
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await api.post("/admin/courses", courseData);
    return response.data;
};

export const updateCourse = async (id, courseData) => {
    const response = await api.put(`/admin/courses/${id}`, courseData);
    return response.data;
};

export const deleteCourse = async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
};

// Admin Profile
export const getAdminProfile = async () => {
    const response = await api.get("/admin/profile");
    return response.data;
};

export const updateAdminProfile = async (profileData) => {
    const response = await api.put("/admin/profile/update", profileData);
    return response.data;
};

export const updateAdminProfileImage = async (imageData) => {
    const response = await api.put("/admin/profile/updateimage", imageData);
    return response.data;
};

export const changeAdminPassword = async (passwordData) => {
    const response = await api.put("/admin/profile/password", passwordData);
    return response.data;
};

// RBAC Permissions
export const createPermission = async (permissionData) => {
    const response = await api.post("/admin/permission", permissionData);
    return response.data;
};

export const getPermissions = async () => {
    const response = await api.get("/admin/permissions");
    return response.data;
};

export const getRoles = async () => {
    const response = await api.get("/admin/roles");
    return response.data;
};

export const createRole = async (roleName) => {
    const response = await api.post("/admin/roles", { name: roleName });
    return response.data;
};

export const getRolePermissions = async (roleName) => {
    const response = await api.get(`/admin/roles/${roleName}/permissions`);
    return response.data;
};

export const toggleRolePermission = async (roleId, permissionId, enabled) => {
    const response = await api.patch("/admin/roles/toggle", {
        role_id: roleId,
        permission_id: permissionId,
        enabled
    });
    return response.data;
};

// Payments & Wallet
export const getPaymentLedger = async (search = "", status = "") => {
    const response = await api.get(`/payments/admin/ledger?search=${search}&status=${status}`);
    return response.data;
};

export const getPaymentOverview = async () => {
    const response = await api.get("/payments/admin/payment-overview");
    return response.data;
};

export const getWalletOverview = async () => {
    const response = await api.get("/payments/admin/wallet-overview");
    return response.data;
};

export const getWalletTransactions = async () => {
    const response = await api.get("/payments/admin/wallet-transactions");
    return response.data;
};

export const getWithdrawals = async () => {
    const response = await api.get("/payments/admin/withdrawals");
    return response.data;
};

export const approveWithdrawal = async (id) => {
    const response = await api.patch(`/payments/admin/withdraw/${id}/approve`);
    return response.data;
};

export const rejectWithdrawal = async (id) => {
    const response = await api.patch(`/payments/admin/withdraw/${id}/reject`);
    return response.data;
};

// Existing wallet summary (keep for compatibility if needed, but the new overview is more detailed)
export const getWalletSummary = async () => {
    const response = await api.get("/payments/admin/wallet-summary");
    return response.data;
};

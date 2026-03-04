import api from "./axios";

// Get student dashboard statistics and activity
export const getStudentDashboardStats = async () => {
    const response = await api.get("/dashboard/student");
    return response.data;
};

// Get mentor dashboard statistics
export const getMentorDashboardStats = async () => {
    const response = await api.get("/dashboard/mentor");
    return response.data;
};

import api from "./axios";

// Create a new complaint
export const createComplaint = async (complaintData) => {
    const response = await api.post("/complaints", complaintData);
    return response.data;
};

// Get complaints for the logged-in user (optional, if needed for list)
export const getMyComplaints = async () => {
    const response = await api.get("/complaints/my");
    return response.data;
};

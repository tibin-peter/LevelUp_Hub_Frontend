import api from "./axios";

// Create a new booking
export const createBooking = async (slotId) => {
    const response = await api.post("/student/bookings", { slot_id: slotId });
    return response.data;
};

// Get all bookings for the logged-in student
export const getStudentBookings = async () => {
    const response = await api.get("/student/bookings");
    return response.data;
};

// Get all booking requests for the logged-in mentor
export const getMentorBookings = async () => {
    const response = await api.get("/mentor/bookings");
    return response.data;
};

// Get upcoming bookings for mentor (paid/pending approval)
export const getMentorUpcomingBookings = async () => {
    const response = await api.get("/mentor/bookings/upcoming");
    return response.data;
};

// Get booking requests for mentor
export const getMentorBookingRequests = async () => {
    const response = await api.get("/mentor/bookings/requests");
    return response.data;
};

// Approve a booking
export const approveBooking = async (id) => {
    const response = await api.patch(`/mentor/bookings/${id}/approve`);
    return response.data;
};

// Reject a booking
export const rejectBooking = async (id) => {
    const response = await api.patch(`/mentor/bookings/${id}/reject`);
    return response.data;
};

// Update booking status (e.g., complete)
export const updateBookingStatus = async (bookingId, status) => {
    const response = await api.put(`/mentor/bookings/${bookingId}`, { status });
    return response.data;
};

// Finish/Complete a session
export const completeBooking = async (id) => {
    const response = await api.patch(`/mentor/bookings/${id}/complete`);
    return response.data;
};

// Get upcoming bookings for student
export const getStudentUpcomingBookings = async () => {
    const response = await api.get("/student/bookings/upcoming");
    return response.data;
};

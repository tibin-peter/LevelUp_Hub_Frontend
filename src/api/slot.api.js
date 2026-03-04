import api from "./axios";

// Create a new slot
export const createSlot = async (startTime, endTime) => {
    const response = await api.post("/mentor/slots", {
        start_time: startTime,
        end_time: endTime,
    });
    return response.data;
};

// Get all slots for the logged-in mentor
export const getMentorSlots = async () => {
    const response = await api.get("/mentor/slots");
    return response.data;
};

// Delete a slot
export const deleteSlot = async (id) => {
    const response = await api.delete(`/mentor/slots/${id}`);
    return response.data;
};

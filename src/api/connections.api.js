import api from "./axios";

// Get all connected mentors for the student
export const getMyMentors = async () => {
    const response = await api.get("/connections/my-mentors");
    return response.data;
};

// Create a connection with a mentor
export const createConnection = async (mentorProfileId) => {
    const response = await api.post("/connections/", {
        mentor_profile_id: mentorProfileId
    });
    return response.data;
};

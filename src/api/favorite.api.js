import api from "./axios";

// Add a mentor to favorites
export const addFavorite = async (mentorProfileId) => {
    const response = await api.post(`/favorite/${mentorProfileId}`);
    return response.data;
};

// Remove a mentor from favorites
export const removeFavorite = async (mentorProfileId) => {
    const response = await api.delete(`/favorite/${mentorProfileId}`);
    return response.data;
};

// List all favorite mentors
export const getMyFavorites = async () => {
    const response = await api.get("/favorite/my");
    return response.data;
};

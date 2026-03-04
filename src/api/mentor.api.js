import api from "./axios";

// Create the initial profile (usually called during registration or first step)
export const createMentorProfile = async (profileData) => {
  const response = await api.post("/mentor/profile", profileData);
  return response.data;
};

// Get the current logged-in mentor's profile
export const getMentorProfile = async () => {
  const response = await api.get("/mentor/profile");
  return response.data;
};

// Update existing profile (used in Onboarding)
export const updateMentorProfile = async (profileData) => {
  const response = await api.put("/mentor/profile", profileData);
  return response.data;
};

// Get a mentor's public profile by ID
export const getPublicMentorProfile = async (id) => {
  const response = await api.get(`/mentors/${id}`);
  return response.data;
};

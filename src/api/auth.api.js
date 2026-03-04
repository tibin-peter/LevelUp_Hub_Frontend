import api from "./axios";

export const sendOtpAPI = (email) => api.post("/auth/send-otp", { email });

export const registerAPI = (payload) => api.post("/auth/register", payload);

export const loginAPI = (payload) => api.post("/auth/login", payload);

export const logoutAPI = () => api.post("/auth/logout");

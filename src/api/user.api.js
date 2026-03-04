import api from './axios';

export const updateUserProfile = async (id, data) => {
    try {
        const res = await api.put(`/users/update/${id}`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

export const updateMentorProfile = async (data) => {
    try {
        const res = await api.put(`/api/mentor/profile`, data);
        return res.data;
    } catch (err) {
        throw err.response?.data || err.message;
    }
};

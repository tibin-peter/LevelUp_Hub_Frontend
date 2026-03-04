import api from "./axios";

export const startConversation = async (targetUserId) => {
    const response = await api.post("/messages/conversation", {
        target_user_id: targetUserId
    });
    return response.data;
};

export const listConversations = async () => {
    const response = await api.get("/messages/listconversations");
    return response.data;
};

export const getMessages = async (convId, before = 0) => {
    const response = await api.get(`/messages/${convId}/messages?before=${before}`);
    return response.data;
};

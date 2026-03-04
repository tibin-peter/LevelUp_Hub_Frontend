import api from "./axios";

export const getStudentPayments = async () => {
    const response = await api.get("/payments/student");
    return response.data;
};

export const createPaymentOrder = async (bookingId) => {
    const response = await api.post("/payments/order", { booking_id: Number(bookingId) });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post("/payments/verify", paymentData);
    return response.data;
};

export const getMentorEarnings = async () => {
    const response = await api.get("/payments/mentor/earnings");
    return response.data;
};

export const withdrawFunds = async (amount) => {
    const response = await api.post("/payments/withdraw", { amount: Number(amount) });
    return response.data;
};

export const getMyWithdrawals = async () => {
    const response = await api.get("/payments/withdrawals");
    return response.data;
};
import api from "../utils/api";

export interface CreateRentalPayload {
  vehicleId: string;
  dates: string[];
}

export interface VerifyPaymentPayload {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export const createRental = async (payload: CreateRentalPayload) => {
  const response = await api.post("/rentals", payload);
  return response.data;
};

export const verifyPayment = async (rentalId: string, payload: VerifyPaymentPayload) => {
  const response = await api.post(`/rentals/${rentalId}/verify-payment`, payload);
  return response.data;
};

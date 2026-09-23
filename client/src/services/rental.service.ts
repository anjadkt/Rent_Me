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

export interface IRental {
  _id: string;
  vehicleSnapshot: {
    name: string;
    category: string;
    brand?: string;
    modelName?: string;
    registrationNumber?: string;
    image?: string;
  };
  priceSnapshot: {
    pricePerDay: number;
    securityDeposit: number;
    rentalAmount: number;
    totalAmount: number;
  };
  dates: string[];
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export const getUserRentals = async () => {
  const response = await api.get("/rentals");
  return response.data;
};

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
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  logs?: {
    _id: string;
    action: string;
    notes: string;
    createdAt: string;
  }[];
}

export interface RentalPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAllRentalsParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface GetAllRentalsResponse {
  success: boolean;
  data: IRental[];
  pagination: RentalPagination;
}

export const getUserRentals = async () => {
  const response = await api.get("/rentals");
  return response.data;
};

export const getAllRentals = async (params?: GetAllRentalsParams): Promise<GetAllRentalsResponse> => {
  const response = await api.get<GetAllRentalsResponse>("/rentals/all", { params });
  return response.data;
};

export const rejectRental = async (rentalId: string, notes: string) => {
  const response = await api.put(`/rentals/${rentalId}/reject`, { notes });
  return response.data;
};

export const cancelRental = async (rentalId: string, notes: string) => {
  const response = await api.put(`/rentals/${rentalId}/cancel`, { notes });
  return response.data;
};

export const completeRental = async (rentalId: string, notes: string) => {
  const response = await api.put(`/rentals/${rentalId}/complete`, { notes });
  return response.data;
};


import api from "../utils/api";

export interface Vehicle {
  _id: string;
  name: string;
  category: string;
  brand: string;
  modelName: string;
  registrationNumber: string;
  description?: string;
  images: string[];
  pricePerDay: number;
  securityDeposit?: number;
  status: string;
  isActive: boolean;
  specifications?: any;
  createdAt: string;
}

export interface VehiclePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetVehiclesParams {
  search?: string;
  category?: string;
  status?: string;
  isActive?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface GetVehiclesResponse {
  success: boolean;
  data: Vehicle[];
  pagination: VehiclePagination;
}

export const getVehicles = async (
  params: GetVehiclesParams
): Promise<GetVehiclesResponse> => {
  const response = await api.get<GetVehiclesResponse>(
    "/vehicles",
    {
      params,
    }
  );

  return response.data;
};

export interface GetVehicleByIdResponse {
  success: boolean;
  data: {
    vehicle: Vehicle;
    availability: {
      isAvailable: boolean;
      currentRental: any | null;
      upcomingRentals: any[];
    };
  };
}

export const getVehicleById = async (
  vehicleId: string
): Promise<GetVehicleByIdResponse> => {
  const response = await api.get<GetVehicleByIdResponse>(
    `/vehicles/${vehicleId}`
  );
  return response.data;
};

export const createVehicle = async (formData: FormData): Promise<{ success: boolean; data: Vehicle; message: string }> => {
  const response = await api.post("/vehicles", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateVehicle = async (id: string, formData: FormData): Promise<{ success: boolean; data: Vehicle; message: string }> => {
  const response = await api.put(`/vehicles/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
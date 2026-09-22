import api from "../utils/api";

export interface Vehicle {
  _id: string;
  name: string;
  category: string;
  brand: string;
  modelName: string;
  registrationNumber: string;
  images: string[];
  pricePerDay: number;
  status: string;
  isActive: boolean;
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
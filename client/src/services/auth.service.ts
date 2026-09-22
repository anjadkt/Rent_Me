import api from "../utils/api";

export interface SendOtpPayload {
  name: string;
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}


export const getMe = async () => {

  const response = await api.get("/auth/me");

  return response.data;

};

export const sendOtp = async (payload: SendOtpPayload) => {
  
  const response = await api.post( "/auth/otp", payload);

  return response.data;
};

export const verifyOtp = async ( payload: VerifyOtpPayload ) => {
  const response = await api.post( "/auth/verify", payload );

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { UserRole } from "../types/auth.types.js";

interface AccessTokenPayload {
  _id: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  _id: string;
}

export const generateAccessToken = (
  payload: AccessTokenPayload
) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
};


export const generateRefreshToken = (
  payload: RefreshTokenPayload
) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });
};
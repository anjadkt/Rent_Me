import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { UserRole } from "../types/auth.types.js";
import AppError from "../utils/appError.js";

interface JwtPayload {
  _id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {

  const token = req.cookies.access_token;

  if (!token) {
    return next(
      new AppError(401, "Authentication required")
    );
  }

  try {
    
    const decoded = jwt.verify(
      token,
      env.jwtAccessSecret
    ) as JwtPayload;

    req.user = {
      _id: decoded._id.toString(),
      role: decoded.role,
    };

    next();
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError(401, "Token has expired")
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError(401, "Invalid authentication token")
      );
    }

    return next(
      new AppError(401, "Authentication failed")
    );
  }
};

export default authenticate;
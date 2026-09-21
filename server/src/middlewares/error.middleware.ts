

import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";
import { env } from "../config/env.js";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
    
  let error = err;

  // Convert unknown errors to AppError
  if (!(error instanceof AppError)) {
    error = new AppError(500,"Internal server error");
  }

  const appError = error as AppError;

  // Development logging
  if(env.nodeEnv === 'development'){
    console.error("ERROR:", err);
  }

  res.status(appError.statusCode).json({
    success: false,
    status: appError.status,
    message: appError.message,
  });
};

export default globalErrorHandler;
import { User } from "../models/user.model.js";
import { UserRole } from "../types/auth.types.js";
import AppError from "../utils/appError.js";
import jwt from 'jsonwebtoken'
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";


export const googleLogin = async (req: Request, res:Response, _next:NextFunction) =>  {
    
    const user = req.user as {
      _id: string;
      role: UserRole;
    };

    const access_token = generateAccessToken ({
      _id: user._id,
      role: user.role,
    })

    const refresh_token = generateRefreshToken ({
      _id: user._id
    })

    // set http only cookies
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
        
    res.json({
      success: true,
      message: "Google authentication successful",
      user: req.user,
    });

}

export const refreshToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {

  const token = req.cookies.refresh_token;

  if (!token)  throw new AppError(401, "Refresh token is required")

  const decoded = jwt.verify(token,env.jwtRefreshSecret) as {_id:string}

  if (!decoded) throw new AppError(401, "Invalid refresh token")

  const user = await User.findById(decoded._id);

  if (!user) throw new AppError(401, "User no longer exists");

  const newAccessToken = generateAccessToken({
    _id: user._id.toString(),
    role : user.role
  });

  const newRefreshToken = generateRefreshToken({
    _id: user._id.toString(),
  });

  setAuthCookies(
    res,
    newAccessToken,
    newRefreshToken
  );

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });

};

export const getMe = async (
  req: Request,
  res: Response
) => {

  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const user = await User.findById(req.user._id).select("-__v");

  if (!user) throw new AppError(404, "User not found");

  return res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

export const logout = (
  _req: Request,
  res: Response
) => {

  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
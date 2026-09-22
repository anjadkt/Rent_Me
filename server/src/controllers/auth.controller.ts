import { User } from "../models/user.model.js";
import { UserRole } from "../types/auth.types.js";
import AppError from "../utils/appError.js";
import jwt from 'jsonwebtoken'
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { Otp } from "../models/otp.model.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";


export const sendOtp = async (req: Request, res: Response) => {
  
  const { name, email } = req.body;

  if (!name) {
    throw new AppError(400, "Name is required");
  }

  if (!email) {
    throw new AppError(400, "Email is required");
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // Generate OTP
  const otp = generateOtp();

  // Hash OTP 
  const hashedOtp = hashOtp(otp);

  // OTP expires after 5 minutes
  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  // Remove previous OTPs for this email
  await Otp.deleteMany({
    email: normalizedEmail,
  });

  // Store new OTP
  await Otp.create({
    email: normalizedEmail,
    name: name.trim(),
    otp: hashedOtp,
    expiresAt,
    attempts: 0,
  });

  // Send email
  await sendOtpEmail(
    normalizedEmail,
    name.trim(),
    otp
  );

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  
  const { email, otp } = req.body;

  if (!email) {
    throw new AppError(400, "Email is required");
  }

  if (!otp) {
    throw new AppError(400, "OTP is required");
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
  });

  if (!otpRecord) {
    throw new AppError( 404, "OTP not found or expired" );
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new AppError(400, "OTP has expired" );
  }

  // Prevent brute-force attempts
  if (otpRecord.attempts >= 5) {

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    throw new AppError( 429, "Too many incorrect attempts. Please request a new OTP");
  }

  const hashedOtp = hashOtp(otp);

  if (hashedOtp !== otpRecord.otp) {

    otpRecord.attempts += 1;

    await otpRecord.save();

    throw new AppError( 400, "Invalid OTP");
  }

  // OTP is valid
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $setOnInsert: {
        name: otpRecord.name,
        email: normalizedEmail,
        role: UserRole.USER,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  if (!user) {
    throw new AppError( 500, "Unable to create user");
  }

  // Delete OTP after successful verification
  await Otp.deleteOne({
    _id: otpRecord._id,
  });

  // Generate authentication tokens
  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role : user.role
  });

  const refreshToken = generateRefreshToken({
    _id: user._id.toString(),
  });

  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
};

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
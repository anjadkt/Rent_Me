import { Router } from "express";
import passport from "passport";
import { getMe, googleLogin, logout, refreshToken, sendOtp, verifyOtp } from "../controllers/auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/otp", asyncHandler(sendOtp));

router.post( "/verify", asyncHandler(verifyOtp));

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/login-failed",
  }),
  asyncHandler(googleLogin)
);

router.get("/me", authenticate, asyncHandler(getMe))

router.get("/refresh", authenticate, asyncHandler(refreshToken));

router.post("/logout", authenticate, asyncHandler(logout));

router.get("/login-failed", (_req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;
import { Router } from "express";
import {
  createRental,
  getAllRentals,
  getRentalById,
  getRentals,
  verifyRentalPayment
} from "../controllers/rental.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import authorize from "../middlewares/role.middleware.js";
import { UserRole } from "../types/auth.types.js";

const router = Router();

router.post("/", authenticate, asyncHandler(createRental));
router.post("/:rentalId/verify-payment", authenticate, asyncHandler(verifyRentalPayment));
router.get("/", authenticate, asyncHandler(getRentals));
router.get("/all", authenticate, authorize(UserRole.ADMIN), asyncHandler(getAllRentals));
router.get("/:rentalId", authenticate, authorize(UserRole.ADMIN), asyncHandler(getRentalById))

export default router;
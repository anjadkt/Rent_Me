import { Router } from "express";
import {
  createRental,
  getAllRentals,
  getRentalById,
  getRentals,
  verifyRentalPayment,
  rejectRental,
  cancelRental,
  completeRental
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
router.get("/:rentalId", authenticate, authorize(UserRole.ADMIN), asyncHandler(getRentalById));

router.put("/:rentalId/reject", authenticate, authorize(UserRole.ADMIN), asyncHandler(rejectRental));
router.put("/:rentalId/cancel", authenticate, authorize(UserRole.ADMIN), asyncHandler(cancelRental));
router.put("/:rentalId/complete", authenticate, authorize(UserRole.ADMIN), asyncHandler(completeRental));

export default router;
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createRental, getRentals, verifyRentalPayment  } from "../controllers/rental.controller.js";

const router = Router();

router.post("/", authenticate, asyncHandler(createRental));
router.post("/:rentalId/verify-payment", authenticate, asyncHandler(verifyRentalPayment));
router.get("/", authenticate, asyncHandler(getRentals));

export default router;
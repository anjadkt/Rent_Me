import { Router } from "express";
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from "../controllers/vehicle.controller.js";
import { UserRole } from "../types/auth.types.js";
import authenticate from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import authorize from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", asyncHandler(getVehicles));

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.array("images", 5),
  asyncHandler(createVehicle)
);

router.put(
  "/:vehicleId",
  authenticate,
  authorize(UserRole.ADMIN),
  upload.array("images", 5),
  asyncHandler(updateVehicle)
);

router.delete("/:vehicleId", authenticate, authorize(UserRole.ADMIN), asyncHandler(deleteVehicle));

export default router;
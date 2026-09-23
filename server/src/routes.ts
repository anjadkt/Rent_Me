import { Router } from "express";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicles.routes.js"
import rentalRoutes from "./routes/rental.routes.js"

const router = Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/rentals", rentalRoutes);


export default router;
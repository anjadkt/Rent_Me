import { Router } from "express";
import authRoutes from "./auth.routes.js";
import vehicleRoutes from "./vehicles.routes.js"

const router = Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);


export default router;
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createMarketOrder } from "../controllers/OrderController";
import { validateMarketOrder } from "../middleware/markerOrder.middleware";
const router = Router();

router.post("/", authMiddleware, validateMarketOrder, createMarketOrder);

export default router;

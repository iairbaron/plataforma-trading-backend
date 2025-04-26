import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createMarketOrder, getOrders } from "../controllers/OrderController";
import { validateMarketOrder } from "../middleware/markerOrder.middleware";
const router = Router();

router.post("/", authMiddleware, validateMarketOrder, createMarketOrder);
router.get("/", authMiddleware, getOrders);

export default router;

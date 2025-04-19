import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getInstrumentsController } from "../controllers/market.controller";

const router = Router();

// Obtener todos los instrumentos con sus datos actuales
router.get("/instruments", authMiddleware, getInstrumentsController);

export default router;

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Obtener todos los instrumentos con sus datos actuales
router.get("/instruments", authMiddleware);

export default router;

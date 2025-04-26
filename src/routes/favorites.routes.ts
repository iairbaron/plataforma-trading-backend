import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/favorites.controller";

const router = Router();


router.post("/", authMiddleware, addFavorite);
router.delete("/:symbol", authMiddleware, removeFavorite);
router.get("/", authMiddleware, getFavorites);

export default router;
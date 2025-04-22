import { Request, Response, NextFunction } from "express";
import Coin from "../sdk/coin";

export const validateMarketOrder = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { symbol, amount, type } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Usuario no autenticado" });
    return;
  }

  if (!symbol || !amount || !type) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  if (typeof symbol !== "string" || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  if (!["buy", "sell"].includes(type)) {
    res.status(400).json({ error: "Tipo de orden inválido" });
    return;
  }

  const coin = Coin.getCoin(symbol);
  if (!coin) {
    res.status(404).json({ error: "Moneda no encontrada" });
    return;
  }

  // Agregar datos útiles al body
  req.body.priceAtExecution = coin.price;
  req.body.total = amount * coin.price;

  next();
};

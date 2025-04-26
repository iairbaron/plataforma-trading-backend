import { Request, Response, NextFunction } from "express";
import Coin from "../sdk/coin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateMarketOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol, amount, type } = req.body;

    // Validaciones básicas
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
    
    const userId = req.user?.id;

    // Validación para órdenes de compra
    if (type === "buy") {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: userId as string },
      });

      if (!wallet) {
        res.status(404).json({ error: "Wallet no encontrada" });
        return;
      }

      if (wallet.balance < req.body.total) {
        res.status(400).json({ 
          error: `Fondos insuficientes. Balance disponible: ${wallet.balance}, Necesario: ${req.body.total}` 
        });
        return;
      }
    }

    // Validación para órdenes de venta
    if (type === "sell") {
      const userOrders = await prisma.order.findMany({
        where: { 
          userId: userId as string,
          symbol: symbol 
        },
      });
      
      // Calcular cuánto de esta moneda tiene el usuario
      let totalBought = 0;
      let totalSold = 0;
      
      for (const order of userOrders) {
        if (order.type === "buy") {
          totalBought += order.amount;
        } else if (order.type === "sell") {
          totalSold += order.amount;
        }
      }
      
      const availableAmount = totalBought - totalSold;
      
      if (availableAmount < amount) {
        res.status(400).json({ 
          error: `No tienes suficiente ${symbol.toUpperCase()} para vender. Disponible: ${availableAmount}` 
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error("Error validando orden:", error);
    res.status(500).json({ error: "Error al validar la orden" });
  }
};

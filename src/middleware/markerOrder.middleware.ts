import { Request, Response, NextFunction } from "express";
import Coin from "../sdk/coin";
import { PrismaClient } from "@prisma/client";
import { createErrorResponse } from "../utils/errorResponse";
import {
  validateAmount,
  getWalletOrError,
  hasFunds,
  hasAssets,
} from "../utils/walletHelpers";

export const validateMarketOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol, amount, type } = req.body;

    // Validaciones básicas
    if (!symbol || !amount || !type) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "ORDER_VALIDATION_MISSING_FIELDS",
            "Faltan datos obligatorios"
          )
        );
      return;
    }

    if (
      typeof symbol !== "string" ||
      typeof amount !== "number" ||
      !validateAmount(amount, res)
    ) {
      // validarAmount ya responde si amount <= 0
      return;
    }

    if (!["buy", "sell"].includes(type)) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "ORDER_VALIDATION_INVALID_TYPE",
            "Tipo de orden inválido"
          )
        );
      return;
    }

    const coin = Coin.getCoin(symbol);
    if (!coin) {
      res
        .status(404)
        .json(
          createErrorResponse(
            "ORDER_VALIDATION_COIN_NOT_FOUND",
            "Moneda no encontrada"
          )
        );
      return;
    }

    // Agregar datos útiles al body
    req.body.priceAtExecution = coin.price;
    req.body.total = amount * coin.price;

    const userId = req.user?.id as string;

    // Validación para órdenes de compra
    if (type === "buy") {
      const wallet = await getWalletOrError(userId, res);
      if (!wallet) return;
      if (!hasFunds(wallet, req.body.total, res)) return;
    }

    // Validación para órdenes de venta
    if (type === "sell") {
      if (!(await hasAssets(userId, symbol, amount, res))) return;
    }

    next();
  } catch (error) {
    console.error("Error validando orden:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          "ORDER_VALIDATION_ERROR",
          "Error al validar la orden"
        )
      );
  }
};

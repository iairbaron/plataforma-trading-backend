import prisma from "../prisma";
import { Request, Response } from "express";
import { createErrorResponse } from "../utils/errorResponse";
import { formatNumber } from "../utils/numberFormat";

export const createMarketOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { symbol, amount, type, priceAtExecution, total } = req.body;
    const userId = req.user?.id;

    // Verificar existencia de wallet antes de la transacción
    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId as string },
    });
    if (!wallet) {
      res
        .status(404)
        .json(createErrorResponse("WALLET_NOT_FOUND", "Wallet no encontrada"));
      return;
    }

    // Log para depuración de fondos
    console.log('Balance:', wallet.balance, 'Total:', total, 'Amount:', amount, 'Price:', priceAtExecution);

    // Validar fondos insuficientes antes de la transacción para compras
    if (type === "buy" && wallet.balance < total) {
      res
        .status(400)
        .json(
          createErrorResponse("INSUFFICIENT_FUNDS", "Fondos insuficientes")
        );
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      if (type === "buy") {
        await tx.wallet.update({
          where: { userId: userId as string },
          data: { balance: { decrement: total } },
        });
      }

      if (type === "sell") {
        await tx.wallet.update({
          where: { userId: userId as string },
          data: { balance: { increment: total } },
        });
      }

      return tx.order.create({
        data: {
          userId: userId as string,
          symbol,
          type,
          amount,
          priceAtExecution,
        },
      });
    });

    const formattedOrder = {
      ...order,
      amount: formatNumber(order.amount),
      priceAtExecution: formatNumber(order.priceAtExecution),
    };

    console.log("Formatted order:", formattedOrder);

    res.status(201).json({ status: "success", data: formattedOrder });
  } catch (error: unknown) {
    console.error("Error creando orden:", error);
    console.error("Error fetching orders:", error);
    res
      .status(400)
      .json(
        createErrorResponse(
          "ORDER_FETCH_ERROR",
          error instanceof Error ? error.message : "Error desconocido"
        )
      );
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const formattedOrders = orders.map((order) => ({
      ...order,
      amount: formatNumber(order.amount),
      priceAtExecution: formatNumber(order.priceAtExecution),
    }));
    res.json({ status: "success", data: formattedOrders });
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    res
      .status(400)
      .json(
        createErrorResponse(
          "ORDER_FETCH_ERROR",
          error instanceof Error ? error.message : "Error desconocido"
        )
      );
  }
};

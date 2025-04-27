import prisma from '../prisma';
import { Request, Response } from "express";
import { createErrorResponse } from '../utils/errorResponse';

function formatNumber(num: number, decimals = 8) {
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: false
  });
}

export const createMarketOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { symbol, amount, type, priceAtExecution, total } = req.body;
    const userId = req.user?.id;

    const order = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: userId as string },
      });

      if (!wallet) throw new Error("WALLET_NOT_FOUND");

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

    res.status(201).json({ status: "success", data: formattedOrder });
  } catch (error: unknown) {
    console.error("Error creando orden:", error);
    let code = "ORDER_ERROR";
    let message = "Error desconocido";
    if (error instanceof Error) {
      if (error.message === "WALLET_NOT_FOUND") {
        code = "WALLET_NOT_FOUND";
        message = "Wallet no encontrada";
      } else if (error.message === "Fondos insuficientes") {
        code = "INSUFFICIENT_FUNDS";
        message = "Fondos insuficientes";
      } else {
        message = error.message;
      }
    }
    res.status(400).json(createErrorResponse(code, message));
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const formattedOrders = orders.map(order => ({
      ...order,
      amount: formatNumber(order.amount),
      priceAtExecution: formatNumber(order.priceAtExecution),
    }));
    res.json({ status: "success", data: formattedOrders });
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    res.status(400).json(createErrorResponse("ORDER_FETCH_ERROR", error instanceof Error ? error.message : "Error desconocido"));
  }
};

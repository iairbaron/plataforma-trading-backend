import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

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

      if (!wallet) throw new Error("Wallet no encontrada");

      if (type === "buy") {
        // if (wallet.balance < total) {
        //   throw new Error("Fondos insuficientes");
        // }

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

    res.status(201).json({ status: "success", data: order });
  } catch (error: unknown) {
    console.error("Error creando orden:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(400).json({ error: message });
  }
};

export const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'success', data: orders });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json({ error: message });
  }
};

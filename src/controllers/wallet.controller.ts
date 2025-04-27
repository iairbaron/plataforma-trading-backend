import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Coin from "../sdk/coin";

const prisma = new PrismaClient();

export const depositFunds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id as string;

    if (amount <= 0) {
      res.status(400).json({ error: "La cantidad debe ser mayor que cero" });
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      res.status(404).json({ error: "Wallet no encontrada" });
      return;
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    res.status(200).json({ status: "success", data: updatedWallet });
  } catch (error) {
    console.error("Error depositando fondos:", error);
    res.status(500).json({ error: "Error al depositar fondos" });
  }
};

export const getBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    // Obtener saldo en USD
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      res.status(404).json({ error: "Wallet no encontrada" });
      return;
    }

    // Obtener órdenes de compra
    const orders = await prisma.order.findMany({
      where: { userId, type: "buy" },
    });

    // Calcular valor total de monedas compradas
    const coins = Coin.getCoins();
    const coinDetails: Record<
      string,
      { amount: number; value: number; currentPrice: number }
    > = orders.reduce((acc, order) => {
      const coin = coins.find(
        (c) => c.symbol.toLowerCase() === order.symbol.toLowerCase()
      );
      if (coin) {
        const value = order.amount * coin.price;
        if (!acc[order.symbol]) {
          acc[order.symbol] = { amount: 0, value: 0, currentPrice: coin.price };
        }
        acc[order.symbol].amount += order.amount;
        acc[order.symbol].value += value;
      }
      return acc;
    }, {} as Record<string, { amount: number; value: number; currentPrice: number }>);

    const totalCoinValue = Object.values(coinDetails).reduce(
      (sum, coin) => sum + coin.value,
      0
    );

    res.status(200).json({
      status: "success",
      data: {
        usdBalance: wallet.balance,
        totalCoinValue,
        coinDetails,
      },
    });
  } catch (error) {
    console.error("Error obteniendo balance:", error);
    res.status(500).json({ error: "Error al obtener balance" });
  }
};

export const updateBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { operation, amount } = req.body;
    const userId = req.user?.id as string;

    if (!["deposit", "withdraw"].includes(operation)) {
      res
        .status(400)
        .json({ error: 'Operación inválida. Debe ser "deposit" o "withdraw"' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: "La cantidad debe ser mayor que cero" });
      return;
    }

    if (operation === "deposit") {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        res.status(404).json({ error: "Wallet no encontrada" });
        return;
      }

      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      res.status(200).json({ status: "success", data: updatedWallet });
    } else {
      // withdraw
      try {
        const result = await prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({ where: { userId } });

          if (!wallet) {
            throw new Error("Wallet no encontrada");
          }

          if (wallet.balance < amount) {
            throw new Error("Fondos insuficientes");
          }

          return tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: amount } },
          });
        });

        res.status(200).json({ status: "success", data: result });
      } catch (transactionError: unknown) {
        const message =
          transactionError instanceof Error
            ? transactionError.message
            : "Error en la transacción";
        const status = message === "Fondos insuficientes" ? 400 : 500;
        res.status(status).json({ error: message });
      }
    }
  } catch (error) {
    console.error("Error actualizando balance:", error);
    res.status(500).json({ error: "Error al actualizar balance" });
  }
};

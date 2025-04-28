import { Request, Response } from "express";
import prisma from '../prisma';
import Coin from "../sdk/coin";
import { createErrorResponse } from '../utils/errorResponse';
import { validateAmount, getWalletOrError } from '../utils/walletHelpers';
import { formatNumber } from '../utils/numberFormat';

// Helper para actualizar el balance
async function actualizarBalance(userId: string, amount: number, tipo: "increment" | "decrement") {
  return prisma.wallet.update({
    where: { userId },
    data: { balance: { [tipo]: amount } },
  });
}

export const depositFunds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id as string;

    if (!validateAmount(amount, res)) return;

    const wallet = await getWalletOrError(userId, res);
    if (!wallet) return;

    const updatedWallet = await actualizarBalance(userId, amount, "increment");
    // Formatear balance
    const formattedWallet = {
      ...updatedWallet,
      balance: formatNumber(updatedWallet.balance, 2),
    };
    res.status(200).json({ status: "success", data: formattedWallet });
  } catch (error) {
    console.error("Error depositando fondos:", error);
    res.status(500).json(createErrorResponse('DEPOSIT_ERROR', "Error al depositar fondos"));
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
      res.status(404).json(createErrorResponse('WALLET_NOT_FOUND', "Wallet no encontrada"));
      return;
    }

    // Obtener todas las órdenes del usuario (compras y ventas)
    const orders = await prisma.order.findMany({
      where: { userId },
    });

    // Calcular valor total de monedas (compras - ventas)
    const coins = Coin.getCoins();
    const coinDetails: Record<
      string,
      { amount: string; value: string; currentPrice: string }
    > = {};
    orders.forEach(order => {
      const coin = coins.find(
        (c) => c.symbol.toLowerCase() === order.symbol.toLowerCase()
      );
      if (coin) {
        const value = order.amount * coin.price;
        if (!coinDetails[order.symbol]) {
          coinDetails[order.symbol] = { amount: formatNumber(0, 8), value: formatNumber(0, 2), currentPrice: formatNumber(coin.price, 2) };
        }
        if (order.type === 'buy') {
          coinDetails[order.symbol].amount = formatNumber(parseFloat(coinDetails[order.symbol].amount) + order.amount, 8);
          coinDetails[order.symbol].value = formatNumber(parseFloat(coinDetails[order.symbol].value) + value, 2);
        } else if (order.type === 'sell') {
          coinDetails[order.symbol].amount = formatNumber(parseFloat(coinDetails[order.symbol].amount) - order.amount, 8);
          coinDetails[order.symbol].value = formatNumber(parseFloat(coinDetails[order.symbol].value) - value, 2);
        }
        coinDetails[order.symbol].currentPrice = formatNumber(coin.price, 2);
      }
    });

    const totalCoinValue = Object.values(coinDetails).reduce(
      (sum, coin) => sum + parseFloat(coin.value),
      0
    );

    res.status(200).json({
      status: "success",
      data: {
        usdBalance: formatNumber(wallet.balance, 2),
        totalCoinValue: formatNumber(totalCoinValue, 2),
        coinDetails,
      },
    });
  } catch (error) {
    console.error("Error obteniendo balance:", error);
    res.status(500).json(createErrorResponse('BALANCE_ERROR', "Error al obtener balance"));
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
      res.status(400).json(createErrorResponse('INVALID_OPERATION', 'Operación inválida. Debe ser "deposit" o "withdraw"'));
      return;
    }

    if (!validateAmount(amount, res)) return;

    if (operation === "deposit") {
      const wallet = await getWalletOrError(userId, res);
      if (!wallet) return;

      const updatedWallet = await actualizarBalance(userId, amount, "increment");
      const formattedWallet = {
        ...updatedWallet,
        balance: formatNumber(updatedWallet.balance, 2),
      };
      res.status(200).json({ status: "success", data: formattedWallet });
    } else {
      // withdraw
      try {
        const result = await prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({ where: { userId } });
          if (!wallet) throw new Error("Wallet no encontrada");
          if (wallet.balance < amount) throw new Error("Fondos insuficientes");

          return tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: amount } },
          });
        });
        const formattedResult = {
          ...result,
          balance: formatNumber(result.balance, 2),
        };
        res.status(200).json({ status: "success", data: formattedResult });
      } catch (transactionError: unknown) {
        const message =
          transactionError instanceof Error
            ? transactionError.message
            : "Error en la transacción";
        const code = message === "Fondos insuficientes" ? 'INSUFFICIENT_FUNDS' : 'WITHDRAW_ERROR';
        const status = message === "Fondos insuficientes" ? 400 : 500;
        res.status(status).json(createErrorResponse(code, message));
      }
    }
  } catch (error) {
    console.error("Error actualizando balance:", error);
    res.status(500).json(createErrorResponse('BALANCE_UPDATE_ERROR', "Error al actualizar balance"));
  }
};

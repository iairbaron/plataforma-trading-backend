import prisma from '../prisma';
import { Response } from 'express';
import { createErrorResponse } from './errorResponse';

// Valida que el monto sea mayor a cero
export function validarAmount(amount: number, res?: Response): boolean {
  if (amount <= 0) {
    if (res) {
      res.status(400).json(createErrorResponse('INVALID_AMOUNT', "La cantidad debe ser mayor que cero"));
    }
    return false;
  }
  return true;
}

// Busca la wallet y responde error si no existe
export async function getWalletOrError(userId: string, res?: Response) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    if (res) {
      res.status(404).json(createErrorResponse('WALLET_NOT_FOUND', "Wallet no encontrada"));
    }
    return null;
  }
  return wallet;
}

// Chequea si el usuario tiene fondos suficientes para una compra
export function hasFunds(wallet: { balance: number }, total: number, res?: Response): boolean {
  if (wallet.balance < total) {
    if (res) {
      res.status(400).json(createErrorResponse('INSUFFICIENT_FUNDS', `Fondos insuficientes. Balance disponible: ${wallet.balance}, Necesario: ${total}`));
    }
    return false;
  }
  return true;
}

// Chequea si el usuario tiene activos suficientes para una venta
export async function hasAssets(userId: string, symbol: string, amount: number, res?: Response): Promise<boolean> {
  const userOrders = await prisma.order.findMany({
    where: { userId, symbol },
  });
  let totalBought = 0;
  let totalSold = 0;
  for (const order of userOrders) {
    if (order.type === "buy") totalBought += order.amount;
    else if (order.type === "sell") totalSold += order.amount;
  }
  const availableAmount = totalBought - totalSold;
  if (availableAmount < amount) {
    if (res) {
      res.status(400).json(createErrorResponse('INSUFFICIENT_ASSETS', `No tienes suficiente ${symbol.toUpperCase()} para vender. Disponible: ${availableAmount}`));
    }
    return false;
  }
  return true;
} 
import { Request, Response } from "express";
import Coin from "../sdk/coin";
import { createErrorResponse } from '../utils/errorResponse';
/**
 * Get instruments with current price and daily variation
 */
export const getInstrumentsController = async (req: Request, res: Response) => {
  try {
    const coins = Coin.getCoins();
    res.status(200).json({ coins });
  } catch (error) {
    console.error("Error fetching instruments:", error);
    res.status(500).json(createErrorResponse('MARKET_FETCH_ERROR', 'Error fetching instruments'));
  }
};

import { Response } from "express";
import Coin from "../sdk/coin";
/**
 * Get instruments with current price and daily variation
 */
export const getInstrumentsController = async (res: Response) => {
  try {
    const coins = Coin.getCoins();
    res.status(200).json({ coins });
  } catch (error) {
    console.error("Error fetching instruments:", error);
    res.status(500).json({ message: "Error fetching instruments" });
  }
};

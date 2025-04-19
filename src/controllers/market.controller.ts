import { Request, Response } from "express";
import { fetchStockData } from "../services/market.service";

/**
 * Get instruments with current price and daily variation
 */
export const getInstrumentsController = async (res: Response) => {
  try {
    const instruments = await fetchStockData();
    res.status(200).json({ instruments });
  } catch (error) {
    console.error("Error fetching instruments:", error);
    res.status(500).json({ message: "Error fetching instruments" });
  }
};

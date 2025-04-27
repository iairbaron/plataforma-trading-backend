import axios from "axios";
import { CoinData } from "../types/types";

// List of coin IDs to fetch
const COIN_IDS = [
  "bitcoin",
  "ethereum",
  "litecoin",
  "solana",
  "cardano",
  "dogecoin",
  "polkadot",
  "avalanche-2",
  "chainlink",
  "uniswap",
];

/**
 * Fetch coin data from CoinGecko
 */
export async function fetchCoinData() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: COIN_IDS.join(","),
          price_change_percentage: "24h,7d",
        },
        headers: {
          accept: "application/json",
        },
      }
    );
    if (response.data) {
      const results: CoinData[] = response.data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.current_price,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        change24h: coin.price_change_percentage_24h_in_currency,
        change7d: coin.price_change_percentage_7d_in_currency,
      }));

      return results;
    }
  } catch (error) {
    console.error("Error fetching coin data:", error);
  }
  return [];
}

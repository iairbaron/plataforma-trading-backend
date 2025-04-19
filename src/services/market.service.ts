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
  console.log("COIN_IDS", COIN_IDS.join(","));

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: COIN_IDS.join(","),
          vs_currencies: "usd",
          include_24hr_change: true,
          include_last_updated_at: true,
        },
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.data) {
      const results: CoinData[] = Object.entries(response.data).map(
        ([key, value]: [string, any]) => ({
          id: key,
          price: value.usd,
          change: value.usd_24h_change,
          lastUpdated: value.last_updated_at,
        })
      );

      console.log(results);
      return results;
    }
  } catch (error) {
    console.error("Error fetching coin data:", error);
  }
  return [];
}

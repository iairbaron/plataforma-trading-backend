import { fetchCoinData } from "../services/market.service";
import { CoinData } from "../types/types";

class Coin {
  private static coins: CoinData[] = [];
  
  static async syncCoins() {
    const coins = await fetchCoinData();
    this.coins = coins;

    console.log("Syncing coins", coins);

    return this.coins;
  }

  static getCoins() {
    return this.coins;
  }

  static getCoin(id: string) {
    return this.coins.find((coin) => coin.id === id);
  }
  
}

export default Coin;

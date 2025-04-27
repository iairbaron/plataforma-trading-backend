import { fetchCoinData } from "../services/market.service";
import { CoinData } from "../types/types";

class Coin {
  private static coins: CoinData[] = [];
  
  static async syncCoins() {
    const coins = await fetchCoinData();
    this.coins = coins;

    return this.coins;
  }

  static getCoins() {
    return this.coins;
  }

  static getCoin(identifier: string) {
    const key = identifier.toLowerCase();
    return this.coins.find(
      (coin) =>
        coin.id.toLowerCase() === key || coin.symbol.toLowerCase() === key
    );
  }
  
}

export default Coin;

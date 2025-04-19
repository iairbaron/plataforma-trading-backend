import cron from "node-cron";
import Coin from "../sdk/coin";
// Configura el cron job para que se ejecute cada 1 minuto
cron.schedule("*/10 * * * * *", () => {
    Coin.syncCoins();const API_KEY = process.env.COINGECKO_API_KEY;

  console.log("process.env.COINGECKO_API_KEY");
  console.log("Ejecutando cron job cada 10  segundos");
});

import cron from "node-cron";
import Coin from "../sdk/coin";
// Configura el cron job para que se ejecute cada 1 minuto
cron.schedule("*/30 * * * * *", () => {
  Coin.syncCoins();

  console.log("Ejecutando cron job cada 30  segundos");
});

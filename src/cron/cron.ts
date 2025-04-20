import cron from "node-cron";
import Coin from "../sdk/coin";

console.log("Sincronizando datos al iniciar...");
Coin.syncCoins().then(() => {
  console.log("Datos iniciales sincronizados");
}).catch(err => {
  console.error("Error al sincronizar datos iniciales:", err);
});


cron.schedule("*/5 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Ejecutando sincronización programada cada 5 minutos`);
  Coin.syncCoins();
});

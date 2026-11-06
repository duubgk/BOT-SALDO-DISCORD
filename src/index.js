import { iniciarBot } from "./bot.js";

// Carrega o .env (recurso do próprio Node). Sem .env, usa as variáveis que a hospedagem tiver.
try {
  process.loadEnvFile(".env");
} catch {
  // segue com as variáveis de ambiente
}

await iniciarBot();

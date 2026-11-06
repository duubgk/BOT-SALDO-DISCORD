// Lê o config.json (IDs de cargos e canais) e entrega tudo já organizado.
// Se o arquivo não existir, o bot avisa com uma mensagem clara em vez de quebrar do nada.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const CAMINHO_CONFIG = resolve(process.cwd(), "config.json");

const EMOJIS_PADRAO = {
  ranking: ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"],
  seta: "➜",
  dinheiro: "💰",
  ok: "✅",
  info: "ℹ️",
};

function lerConfig() {
  if (!existsSync(CAMINHO_CONFIG)) {
    throw new Error("Não achei o config.json. Copie o config.example.json para config.json e preencha os IDs.");
  }

  try {
    const dados = JSON.parse(readFileSync(CAMINHO_CONFIG, "utf-8"));
    if (!dados || typeof dados !== "object") throw new Error("o arquivo está vazio ou no formato errado");
    return dados;
  } catch (erro) {
    throw new Error(`O config.json tem algum problema: ${erro.message}`);
  }
}

const bruto = lerConfig();

export const PASTA_DADOS = resolve(process.cwd(), "dados");
export const ARQUIVO_SALDOS = "balances.json";
export const ARQUIVO_HISTORICO = "saldo_history.json";

export const CANAL_LOG_SALDO = String(bruto.channels?.balanceLog ?? "");
export const CARGOS_STAFF = new Set((bruto.staffRoleIds ?? []).map(String));
export const CARGO_TOP1 = String(bruto.top1RoleId ?? "");

// Faixas de cargo por saldo, da maior para a menor (o primeiro que o saldo alcançar vence)
export const FAIXAS_DE_CARGO = (bruto.balanceRoleThresholds ?? [])
  .map((faixa) => ({ minimo: Number(faixa.min ?? 0), cargoId: String(faixa.roleId ?? "") }))
  .filter((faixa) => faixa.cargoId)
  .sort((a, b) => b.minimo - a.minimo);

export const EMOJIS = { ...EMOJIS_PADRAO, ...(bruto.emojis ?? {}) };

// Se você preencher BOT_NAME, BOT_AVATAR_URL ou BOT_BANNER_URL no .env,
// o bot atualiza o próprio perfil ao ligar. Ele lembra o que já aplicou para não repetir
// (o Discord limita quantas vezes dá pra trocar nome e avatar).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ARQUIVO = resolve(process.cwd(), ".bot-identity.json");
const VAZIO = { name: "", avatar: "", banner: "" };

function lerSalvo() {
  try {
    if (!existsSync(ARQUIVO)) return { ...VAZIO };
    return { ...VAZIO, ...JSON.parse(readFileSync(ARQUIVO, "utf-8")) };
  } catch {
    return { ...VAZIO };
  }
}

export async function aplicarIdentidade(cliente, env = process.env) {
  const atual = lerSalvo();
  const pedidos = [
    { campo: "name", valor: env.BOT_NAME?.trim(), aplicar: (v) => cliente.user.setUsername(v), rotulo: "o nome" },
    { campo: "avatar", valor: env.BOT_AVATAR_URL?.trim(), aplicar: (v) => cliente.user.setAvatar(v), rotulo: "o avatar" },
    { campo: "banner", valor: env.BOT_BANNER_URL?.trim(), aplicar: (v) => cliente.user.setBanner(v), rotulo: "o banner" },
  ];

  for (const pedido of pedidos) {
    if (!pedido.valor || atual[pedido.campo] === pedido.valor) continue;
    try {
      await pedido.aplicar(pedido.valor);
      atual[pedido.campo] = pedido.valor;
    } catch (erro) {
      console.warn(`Não consegui atualizar ${pedido.rotulo} do bot.`, erro);
    }
  }

  writeFileSync(ARQUIVO, JSON.stringify(atual, null, 2), "utf-8");
}

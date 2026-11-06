import { EmbedBuilder } from "discord.js";
import { CANAL_LOG_SALDO } from "../config.js";
import { formatarMoeda } from "./formato.js";

// Manda um aviso no canal de log sempre que o saldo de alguém muda
export async function enviarLogDeSaldo({ alvo, staff, centavos, acao }) {
  const canal = await alvo.guild.channels.fetch(CANAL_LOG_SALDO).catch((erro) => {
    console.error(`[log-saldo] Não consegui abrir o canal ${CANAL_LOG_SALDO}:`, erro);
    return null;
  });
  if (!canal) return;

  if (!canal.isTextBased() || !("send" in canal)) {
    console.error(`[log-saldo] O canal ${CANAL_LOG_SALDO} não aceita mensagens de texto.`);
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("Saldo atualizado")
    .setColor(acao === "adicionado" ? 0x57f287 : 0xed4245)
    .setDescription(
      [
        `**Saldo modificado:** ${alvo.toString()}`,
        `**Ação:** ${acao}`,
        `**Quantidade:** ${formatarMoeda(centavos)}`,
        `**Quem modificou:** ${staff.toString()}`,
      ].join("\n"),
    )
    .setTimestamp();

  await canal.send({ embeds: [embed] }).catch((erro) => {
    console.error("[log-saldo] Não consegui enviar o log. Confira as permissões do bot no canal.", erro);
  });
}

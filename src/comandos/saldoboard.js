import { SlashCommandBuilder } from "discord.js";
import { atualizarCargoTop1, montarRanking } from "../utils/saldo.js";
import { painelDoRanking } from "../utils/visual.js";
import { exigirServidor } from "./comum.js";

export const comandoSaldoBoard = {
  data: new SlashCommandBuilder().setName("saldoboard").setDescription("Mostra os 5 usuários com mais saldo"),

  async executar(interaction) {
    const servidor = await exigirServidor(interaction);
    if (!servidor) return;

    const ranking = await montarRanking(servidor);
    await atualizarCargoTop1(servidor, ranking.top[0]?.usuarioId);
    await interaction.reply({ ...painelDoRanking(ranking), allowedMentions: { parse: ["users"] } });
  },
};

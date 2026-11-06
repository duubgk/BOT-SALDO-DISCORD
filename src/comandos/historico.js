import { SlashCommandBuilder } from "discord.js";
import { ehStaff } from "../utils/permissoes.js";
import { historicoDoUsuario, historicoGeral } from "../utils/saldo.js";
import { embedDoHistorico } from "../utils/visual.js";
import { exigirServidor, responderSoParaVoce } from "./comum.js";

export const comandoHistorico = {
  data: new SlashCommandBuilder()
    .setName("historico")
    .setDescription("Ver o histórico de transações de saldo")
    .addUserOption((opcao) => opcao.setName("usuario").setDescription("(opcional) ver o histórico de uma pessoa").setRequired(false))
    .addIntegerOption((opcao) =>
      opcao.setName("limite").setDescription("(opcional) quantas transações mostrar (padrão: 10)").setMinValue(1).setMaxValue(50).setRequired(false),
    ),

  async executar(interaction) {
    const servidor = await exigirServidor(interaction);
    if (!servidor) return;

    const quemUsou = await servidor.members.fetch(interaction.user.id).catch(() => null);
    if (!quemUsou) {
      await responderSoParaVoce(interaction, "❌ Não consegui validar as suas permissões.");
      return;
    }

    const usuario = interaction.options.getUser("usuario");
    const alvo = usuario ? await servidor.members.fetch(usuario.id).catch(() => null) : null;
    const limite = interaction.options.getInteger("limite") ?? 10;

    // O histórico geral é só para a staff. Qualquer um pode ver o de uma pessoa.
    if (!alvo && !ehStaff(quemUsou)) {
      await responderSoParaVoce(
        interaction,
        "❌ Só a staff vê o histórico geral. Use /historico usuario:@alguem para ver o de uma pessoa.",
      );
      return;
    }

    await interaction.deferReply();
    const historico = alvo ? historicoDoUsuario(alvo.id, limite) : historicoGeral(limite);
    await interaction.editReply({ embeds: [embedDoHistorico(historico, alvo ?? undefined)] });
  },
};

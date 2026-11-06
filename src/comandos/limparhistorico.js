import { SlashCommandBuilder } from "discord.js";
import { cp } from "node:fs/promises";
import path from "node:path";
import { store } from "../store.js";
import { carimboParaArquivo } from "../utils/formato.js";
import { embedHistoricoLimpo } from "../utils/visual.js";
import { exigirServidor, exigirStaff, responderSoParaVoce } from "./comum.js";

export const comandoLimparHistorico = {
  data: new SlashCommandBuilder()
    .setName("limparhistorico")
    .setDescription("Limpar o histórico de transações (staff)")
    .addStringOption((opcao) => opcao.setName("confirmacao").setDescription("Digite CONFIRMAR para limpar o histórico").setRequired(true)),

  async executar(interaction) {
    const servidor = await exigirServidor(interaction);
    if (!servidor) return;
    if (!(await exigirStaff(interaction, servidor))) return;

    const confirmacao = interaction.options.getString("confirmacao", true);
    if (confirmacao.toUpperCase() !== "CONFIRMAR") {
      await responderSoParaVoce(
        interaction,
        "❌ Para limpar o histórico, digite CONFIRMAR no campo de confirmação.\n⚠️ **Atenção:** isso não pode ser desfeito!",
      );
      return;
    }

    // Antes de apagar, guarda uma cópia do histórico na pasta de dados
    const arquivoBackup = `saldo_history_backup_${carimboParaArquivo(new Date())}.json`;
    try {
      await cp(store.caminhoHistorico, path.join(store.pasta, arquivoBackup));
    } catch (erro) {
      console.warn("Não consegui criar o backup do histórico:", erro);
    }

    const removidas = store.historico.length;
    store.historico = [];
    await store.salvarHistorico();
    await interaction.reply({ embeds: [embedHistoricoLimpo(removidas, arquivoBackup, interaction.user.username)] });
  },
};

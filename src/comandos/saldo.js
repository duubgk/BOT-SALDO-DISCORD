import { SlashCommandBuilder } from "discord.js";
import { store } from "../store.js";
import { historicoDoUsuario } from "../utils/saldo.js";
import { painelDoSaldo } from "../utils/visual.js";
import { exigirServidor, responderSoParaVoce } from "./comum.js";

export const comandoSaldo = {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Ver o seu saldo ou o de outra pessoa")
    .addUserOption((opcao) => opcao.setName("member").setDescription("(opcional) ver o saldo de outra pessoa").setRequired(false)),

  async executar(interaction) {
    const servidor = await exigirServidor(interaction);
    if (!servidor) return;

    const usuario = interaction.options.getUser("member") ?? interaction.user;
    const membro = await servidor.members.fetch(usuario.id).catch(() => null);
    if (!membro) {
      await responderSoParaVoce(interaction, "❌ Não consegui encontrar esse usuário.");
      return;
    }

    const ultimas = historicoDoUsuario(membro.id, 5);
    await interaction.reply(painelDoSaldo(membro, store.saldoDe(membro.id), ultimas.length));
  },
};

import { SlashCommandBuilder } from "discord.js";
import { alterarSaldo } from "./alterar.js";

export const comandoAddSaldo = {
  data: new SlashCommandBuilder()
    .setName("addsaldo")
    .setDescription("Adicionar saldo a um usuário (staff)")
    .addUserOption((opcao) => opcao.setName("member").setDescription("Quem vai receber").setRequired(true))
    .addStringOption((opcao) => opcao.setName("amount").setDescription("Valor a adicionar (ex: 2,20 ou 22)").setRequired(true))
    .addStringOption((opcao) => opcao.setName("reason").setDescription("Motivo (opcional)").setRequired(false)),

  executar: (interaction) => alterarSaldo(interaction, "adicionar"),
};

import { SlashCommandBuilder } from "discord.js";
import { alterarSaldo } from "./alterar.js";

export const comandoRemoveSaldo = {
  data: new SlashCommandBuilder()
    .setName("removesaldo")
    .setDescription("Remover saldo de um usuário (staff)")
    .addUserOption((opcao) => opcao.setName("member").setDescription("De quem remover").setRequired(true))
    .addStringOption((opcao) => opcao.setName("amount").setDescription("Valor a remover (ex: 2,20 ou 22)").setRequired(true))
    .addStringOption((opcao) => opcao.setName("reason").setDescription("Motivo (opcional)").setRequired(false)),

  executar: (interaction) => alterarSaldo(interaction, "remover"),
};

// Verificações que quase todo comando precisa: estar num servidor e (às vezes) ser staff.
import { ehStaff } from "../utils/permissoes.js";

const responderSoParaVoce = (interaction, conteudo) => interaction.reply({ content: conteudo, ephemeral: true });

// Devolve o servidor, ou responde avisando e devolve null
export async function exigirServidor(interaction) {
  if (!interaction.inGuild() || !interaction.guild) {
    await responderSoParaVoce(interaction, "Esse comando só funciona dentro de um servidor.");
    return null;
  }
  return interaction.guild;
}

// Devolve o membro que usou o comando se ele for staff, ou responde avisando e devolve null
export async function exigirStaff(interaction, servidor) {
  const membro = await servidor.members.fetch(interaction.user.id).catch(() => null);
  if (!membro) {
    await responderSoParaVoce(interaction, "❌ Não consegui validar as suas permissões.");
    return null;
  }
  if (!ehStaff(membro)) {
    await responderSoParaVoce(interaction, "❌ Você não tem permissão para usar esse comando.");
    return null;
  }
  return membro;
}

export { responderSoParaVoce };

// Tudo que o bot mostra no Discord (painéis e embeds) fica aqui.
import {
  ContainerBuilder,
  EmbedBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { EMOJIS } from "../config.js";
import { formatarMoeda } from "./formato.js";

const texto = (conteudo) => new TextDisplayBuilder().setContent(conteudo);
const separador = () => new SeparatorBuilder().setDivider(true);
const painel = (container) => ({ components: [container], flags: MessageFlags.IsComponentsV2 });

export function painelDoRanking(ranking) {
  const container = new ContainerBuilder().addTextDisplayComponents(texto("# TOP 5 - Ranking de saldos"));
  container.addSeparatorComponents(separador());

  for (let i = 0; i < 5; i += 1) {
    const item = ranking.top[i];
    const nome = item ? item.nome : "Sem saldo";
    const valor = item ? formatarMoeda(item.saldo) : "R$ 0,00";
    const avatar = item?.avatar ?? (item ? `https://cdn.discordapp.com/embed/avatars/${Number(item.usuarioId) % 5}.png` : null);

    const secao = new SectionBuilder().addTextDisplayComponents(
      texto(`### ${EMOJIS.ranking[i] ?? i + 1} ${nome}\n${EMOJIS.seta} \`Saldo: ${valor}\``),
    );
    if (avatar) secao.setThumbnailAccessory(new ThumbnailBuilder().setURL(avatar));
    container.addSectionComponents(secao);
  }

  container
    .addSeparatorComponents(separador())
    .addTextDisplayComponents(
      texto(`-# ${EMOJIS.info} \`Como aumentar seu saldo?\` Seu saldo na loja é o quanto você já gastou no total`),
    );
  return painel(container);
}

export function painelDoSaldo(membro, saldo, quantidadeDeTransacoes) {
  const conteudo = [
    `**${EMOJIS.dinheiro} Saldo atual:**`,
    `\`\`\`${formatarMoeda(saldo)}\`\`\``,
    `**${EMOJIS.ok} Últimas transações:**`,
    `\`\`\`${quantidadeDeTransacoes}\`\`\``,
  ].join("\n");

  const secao = new SectionBuilder()
    .addTextDisplayComponents(texto(conteudo))
    .setThumbnailAccessory(new ThumbnailBuilder().setURL(membro.displayAvatarURL({ extension: "png", size: 256 })));

  const container = new ContainerBuilder()
    .addTextDisplayComponents(texto(`## Saldo de __${membro.displayName}__`))
    .addSeparatorComponents(separador())
    .addSectionComponents(secao);
  return painel(container);
}

export function embedDoHistorico(historico, membro) {
  const embed = new EmbedBuilder().setColor(membro ? 0x3498db : 0x9b59b6);
  embed.setTitle(membro ? `Histórico de transações - ${membro.displayName}` : "Histórico geral de transações");

  if (historico.length === 0) {
    return embed.setDescription("Nenhuma transação registrada.");
  }

  if (membro) {
    const somar = (tipo) => historico.filter((item) => item.tipo === tipo).reduce((soma, item) => soma + item.valor, 0);
    embed.addFields({
      name: "Estatísticas do usuário",
      value: `**Total adicionado:** ${formatarMoeda(somar("adicionar"))}\n**Total removido:** ${formatarMoeda(somar("remover"))}\n**Transações:** ${historico.length}`,
    });
  } else {
    embed.addFields({ name: "Estatísticas gerais", value: `**Total de transações:** ${historico.length}` });
  }

  for (const item of historico.slice(0, 10)) {
    const adicionou = item.tipo === "adicionar";
    const motivo = item.motivo ? `\n📝 **Motivo:** ${item.motivo}` : "";
    embed.addFields({
      name: `${adicionou ? "➕" : "➖"} Transação #${item.id}`,
      value:
        `**${adicionou ? "Adicionado" : "Removido"}:** ${formatarMoeda(item.valor)}\n` +
        `👤 **Usuário:** ${item.usuario.nome}\n🛡️ **Staff:** ${item.staff.nome}\n📅 **Data:** ${item.data_formatada}${motivo}`,
    });
  }

  embed.setFooter({
    text:
      historico.length > 10
        ? `Mostrando 10 de ${historico.length} transações. Use /historico usuario:@alguem para ver de uma pessoa`
        : `Total de ${historico.length} transações`,
  });
  return embed;
}

export function embedHistoricoLimpo(removidas, arquivoBackup, nomeDoStaff) {
  return new EmbedBuilder()
    .setTitle("Histórico limpo")
    .setDescription("O histórico de transações foi limpo com sucesso.")
    .setColor(0xed4245)
    .addFields(
      { name: "Estatísticas", value: `**Transações removidas:** ${removidas}\n**Backup criado:** ${arquivoBackup}` },
      { name: "Aviso", value: "Essa ação não pode ser desfeita. O backup foi salvo automaticamente." },
    )
    .setFooter({ text: `Limpo por ${nomeDoStaff}` });
}

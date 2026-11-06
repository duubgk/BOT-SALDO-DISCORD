// Lógica compartilhada do /addsaldo e do /removesaldo (o que muda é só somar ou subtrair).
import { store } from "../store.js";
import { formatarMoeda, lerValor } from "../utils/formato.js";
import { enviarLogDeSaldo } from "../utils/logs.js";
import { atualizarCargoTop1, atualizarCargosDeSaldo, montarRanking, registrarHistorico } from "../utils/saldo.js";
import { exigirServidor, exigirStaff, responderSoParaVoce } from "./comum.js";

const TIPOS = {
  adicionar: { acaoNoLog: "adicionado", mensagem: (valor, membro) => `✅ Adicionado ${valor} ao saldo de ${membro}`, calcular: (atual, valor) => atual + valor },
  remover: { acaoNoLog: "removido", mensagem: (valor, membro) => `✅ Removido ${valor} do saldo de ${membro}`, calcular: (atual, valor) => Math.max(0, atual - valor) },
};

export async function alterarSaldo(interaction, tipo) {
  const servidor = await exigirServidor(interaction);
  if (!servidor) return;

  const staff = await exigirStaff(interaction, servidor);
  if (!staff) return;

  const alvoUsuario = interaction.options.getUser("member", true);
  const membro = await servidor.members.fetch(alvoUsuario.id).catch(() => null);
  if (!membro) {
    await responderSoParaVoce(interaction, "❌ Usuário inválido.");
    return;
  }

  const centavos = lerValor(interaction.options.getString("amount", true));
  if (centavos <= 0) {
    await responderSoParaVoce(interaction, "❌ O valor precisa ser positivo. Use, por exemplo: 2,20 ou 22");
    return;
  }

  const motivo = interaction.options.getString("reason") ?? "";
  const regra = TIPOS[tipo];
  const saldoAnterior = store.saldoDe(membro.id);
  const saldoNovo = regra.calcular(saldoAnterior, centavos);

  await store.definirSaldo(membro.id, saldoNovo);
  await atualizarCargosDeSaldo(membro, saldoNovo);

  const ranking = await montarRanking(servidor);
  await atualizarCargoTop1(servidor, ranking.top[0]?.usuarioId);

  await registrarHistorico({
    tipo,
    staff: { id: staff.id, nome: staff.user.username },
    usuario: { id: membro.id, nome: membro.user.username },
    valor: centavos,
    saldoAnterior,
    saldoNovo,
    motivo,
  });
  await enviarLogDeSaldo({ alvo: membro, staff, centavos, acao: regra.acaoNoLog });

  let resposta = regra.mensagem(formatarMoeda(centavos), membro.toString());
  if (motivo) resposta += `. Motivo: ${motivo}`;
  await interaction.reply({ content: resposta });
}

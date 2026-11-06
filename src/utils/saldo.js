// Regras do saldo: cargos por faixa, cargo de top 1, ranking e histórico.
import { CARGO_TOP1, FAIXAS_DE_CARGO } from "../config.js";
import { store } from "../store.js";
import { formatarDataHora, formatarMoeda } from "./formato.js";

// Dá ao membro o cargo da faixa em que o saldo dele está e tira os das outras faixas
export async function atualizarCargosDeSaldo(membro, saldoEmCentavos) {
  const cargosGerenciados = new Set(FAIXAS_DE_CARGO.map((faixa) => faixa.cargoId));
  const faixaAtual = FAIXAS_DE_CARGO.find((faixa) => saldoEmCentavos >= faixa.minimo);
  if (!faixaAtual) return;

  const cargoNovo = membro.guild.roles.cache.get(faixaAtual.cargoId);
  const cargosParaTirar = membro.roles.cache.filter(
    (cargo) => cargosGerenciados.has(cargo.id) && cargo.id !== faixaAtual.cargoId,
  );

  try {
    if (cargosParaTirar.size > 0) {
      await membro.roles.remove([...cargosParaTirar.values()], "Atualização de cargo por saldo");
    }
    if (cargoNovo && !membro.roles.cache.has(cargoNovo.id)) {
      await membro.roles.add(cargoNovo, "Atualização de cargo por saldo");
    }
  } catch (erro) {
    console.error(`Não consegui atualizar os cargos de ${membro.displayName}:`, erro);
  }
}

// Só uma pessoa pode ter o cargo de top 1: tira dos outros e dá para quem lidera
export async function atualizarCargoTop1(servidor, idDoPrimeiro) {
  const cargoTop = servidor.roles.cache.get(CARGO_TOP1);
  if (!cargoTop) return;

  try {
    for (const [, membro] of cargoTop.members) {
      if (membro.id !== idDoPrimeiro) {
        await membro.roles.remove(cargoTop, "Atualização do cargo de top 1");
      }
    }
    if (!idDoPrimeiro) return;

    const primeiro = await servidor.members.fetch(idDoPrimeiro).catch(() => null);
    if (primeiro && !primeiro.roles.cache.has(cargoTop.id)) {
      await primeiro.roles.add(cargoTop, "Atualização do cargo de top 1");
    }
  } catch (erro) {
    console.error("Não consegui atualizar o cargo de top 1:", erro);
  }
}

// Monta o ranking com os clientes de maior saldo
export async function montarRanking(servidor, limite = 5) {
  const usuarios = Object.entries(store.saldos)
    .map(([usuarioId, centavos]) => ({ usuarioId: String(usuarioId), centavos: Number(centavos) || 0 }))
    .filter((item) => item.centavos > 0)
    .sort((a, b) => b.centavos - a.centavos);

  const top = await Promise.all(
    usuarios.slice(0, limite).map(async (item) => {
      const membro =
        servidor.members.cache.get(item.usuarioId) ?? (await servidor.members.fetch(item.usuarioId).catch(() => null));
      const usuario = membro?.user ?? (await servidor.client.users.fetch(item.usuarioId).catch(() => null));
      return {
        usuarioId: item.usuarioId,
        nome: membro?.displayName ?? usuario?.displayName ?? usuario?.username ?? `Usuário ${item.usuarioId}`,
        saldo: item.centavos,
        avatar: usuario?.displayAvatarURL({ extension: "png", size: 256 }),
      };
    }),
  );

  return {
    totalUsuarios: usuarios.length,
    totalSaldo: usuarios.reduce((soma, item) => soma + item.centavos, 0),
    top,
  };
}

// Anota uma transação no histórico
export async function registrarHistorico({ tipo, staff, usuario, valor, saldoAnterior, saldoNovo, motivo }) {
  const agora = new Date();
  store.historico.push({
    id: store.historico.length + 1,
    tipo,
    data: agora.toISOString(),
    data_formatada: formatarDataHora(agora),
    staff: { id: String(staff.id), nome: staff.nome },
    usuario: { id: String(usuario.id), nome: usuario.nome },
    valor,
    saldo_anterior: saldoAnterior,
    saldo_novo: saldoNovo,
    motivo: motivo ?? "",
  });
  await store.salvarHistorico();
  console.log(`Histórico: ${tipo} ${formatarMoeda(valor)} para ${usuario.nome}`);
}

export function historicoDoUsuario(usuarioId, limite = 10) {
  return store.historico
    .filter((item) => String(item.usuario.id) === String(usuarioId))
    .slice(-limite)
    .reverse();
}

export function historicoGeral(limite = 20) {
  return store.historico.slice(-limite).reverse();
}

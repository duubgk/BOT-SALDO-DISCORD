// Funções pequenas de formatação. O saldo é guardado em centavos (inteiro) para evitar erro de arredondamento.

export function formatarMoeda(centavos) {
  return `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;
}

// Entende "22", "2,20" e "1.234,50". Devolve o valor em centavos, ou -1 se não der pra entender.
export function lerValor(texto) {
  const limpo = String(texto ?? "").trim();
  if (!limpo) return -1;

  if (limpo.includes(",")) {
    const numero = Number(limpo.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? Math.round(numero * 100) : -1;
  }

  // sem vírgula, só aceita número inteiro (ex: 22 vira R$ 22,00)
  if (!/^\d+$/.test(limpo)) return -1;
  return Number(limpo) * 100;
}

const doisDigitos = (n) => String(n).padStart(2, "0");

export function formatarDataHora(data) {
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  const segundo = doisDigitos(data.getSeconds());
  return `${dia}/${mes}/${data.getFullYear()} ${hora}:${minuto}:${segundo}`;
}

// Usado no nome do arquivo de backup: 20261106_143005
export function carimboParaArquivo(data) {
  const dataTexto = `${data.getFullYear()}${doisDigitos(data.getMonth() + 1)}${doisDigitos(data.getDate())}`;
  const horaTexto = `${doisDigitos(data.getHours())}${doisDigitos(data.getMinutes())}${doisDigitos(data.getSeconds())}`;
  return `${dataTexto}_${horaTexto}`;
}

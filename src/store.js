// Guarda saldos e histórico em arquivos .json dentro da pasta "dados".
// A gravação é feita em fila e de forma segura (escreve num arquivo temporário e troca),
// assim dois comandos ao mesmo tempo não embolam o arquivo.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { ARQUIVO_HISTORICO, ARQUIVO_SALDOS, PASTA_DADOS } from "./config.js";

async function lerJson(caminho, valorPadrao) {
  try {
    return JSON.parse(await readFile(caminho, "utf-8"));
  } catch {
    return valorPadrao;
  }
}

export class Armazenamento {
  saldos = {};
  historico = [];
  #fila = Promise.resolve();

  constructor(pasta = PASTA_DADOS) {
    this.pasta = pasta;
    this.caminhoSaldos = path.join(pasta, ARQUIVO_SALDOS);
    this.caminhoHistorico = path.join(pasta, ARQUIVO_HISTORICO);
  }

  async iniciar() {
    await mkdir(this.pasta, { recursive: true });
    this.saldos = await lerJson(this.caminhoSaldos, {});
    this.historico = await lerJson(this.caminhoHistorico, []);
  }

  saldoDe(usuarioId) {
    const valor = this.saldos[String(usuarioId)];
    return typeof valor === "number" ? valor : 0;
  }

  async definirSaldo(usuarioId, centavos) {
    this.saldos[String(usuarioId)] = centavos;
    await this.salvarSaldos();
  }

  salvarSaldos() {
    return this.#gravar(this.caminhoSaldos, this.saldos);
  }

  salvarHistorico() {
    return this.#gravar(this.caminhoHistorico, this.historico);
  }

  // Grava um arquivo por vez, sempre na ordem em que os pedidos chegaram
  #gravar(caminho, dados) {
    const texto = JSON.stringify(dados, null, 2);
    this.#fila = this.#fila.then(async () => {
      const temporario = `${caminho}.tmp`;
      await writeFile(temporario, texto, "utf-8");
      await rename(temporario, caminho);
    });
    return this.#fila;
  }

  arquivoHistoricoExiste() {
    return existsSync(this.caminhoHistorico);
  }
}

export const store = new Armazenamento();

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

// O store lê o config.json ao ser importado, então criamos um temporário antes
import { writeFileSync } from "node:fs";
const pasta = await mkdtemp(path.join(tmpdir(), "saldo-"));
writeFileSync(path.join(pasta, "config.json"), JSON.stringify({ staffRoleIds: [], channels: {}, balanceRoleThresholds: [] }));
process.chdir(pasta);
const { Armazenamento } = await import("../src/store.js");

test("saldo começa em zero e persiste no arquivo", async () => {
  const dados = path.join(pasta, "dados");
  const store = new Armazenamento(dados);
  await store.iniciar();
  assert.equal(store.saldoDe("123"), 0);

  await store.definirSaldo("123", 2500);
  assert.equal(store.saldoDe("123"), 2500);

  const salvo = JSON.parse(await readFile(path.join(dados, "balances.json"), "utf-8"));
  assert.equal(salvo["123"], 2500);
});

test("várias gravações seguidas não corrompem o arquivo", async () => {
  const dados = path.join(pasta, "dados2");
  const store = new Armazenamento(dados);
  await store.iniciar();

  await Promise.all(Array.from({ length: 30 }, (_, i) => store.definirSaldo(`u${i}`, i * 100)));

  const salvo = JSON.parse(await readFile(path.join(dados, "balances.json"), "utf-8"));
  assert.equal(Object.keys(salvo).length, 30);
  assert.equal(salvo.u29, 2900);
  await rm(pasta, { recursive: true, force: true });
});

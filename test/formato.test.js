import assert from "node:assert/strict";
import { test } from "node:test";
import { carimboParaArquivo, formatarMoeda, lerValor } from "../src/utils/formato.js";

test("lerValor entende inteiro e decimal", () => {
  assert.equal(lerValor("22"), 2200);
  assert.equal(lerValor("2,20"), 220);
  assert.equal(lerValor("1.234,50"), 123450);
  assert.equal(lerValor("  5 "), 500);
});

test("lerValor recusa o que não é número", () => {
  assert.equal(lerValor(""), -1);
  assert.equal(lerValor("abc"), -1);
  assert.equal(lerValor("2.5"), -1);
});

test("formatarMoeda mostra em reais", () => {
  assert.equal(formatarMoeda(220), "R$ 2,20");
  assert.equal(formatarMoeda(0), "R$ 0,00");
  assert.equal(formatarMoeda(123450), "R$ 1234,50");
});

test("carimboParaArquivo tem o formato esperado", () => {
  assert.match(carimboParaArquivo(new Date(2026, 10, 6, 14, 30, 5)), /^20261106_143005$/);
});

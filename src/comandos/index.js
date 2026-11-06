import { comandoAddSaldo } from "./addsaldo.js";
import { comandoHistorico } from "./historico.js";
import { comandoLimparHistorico } from "./limparhistorico.js";
import { comandoRemoveSaldo } from "./removesaldo.js";
import { comandoSaldo } from "./saldo.js";
import { comandoSaldoBoard } from "./saldoboard.js";

export const comandos = [
  comandoAddSaldo,
  comandoRemoveSaldo,
  comandoSaldo,
  comandoSaldoBoard,
  comandoHistorico,
  comandoLimparHistorico,
];

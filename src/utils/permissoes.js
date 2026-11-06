import { CARGOS_STAFF } from "../config.js";

export function ehStaff(membro) {
  return membro.roles.cache.some((cargo) => CARGOS_STAFF.has(cargo.id));
}

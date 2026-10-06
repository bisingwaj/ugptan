/**
 * Invalidation du cache après une écriture du module « Provinces ».
 *
 * Même contrat que les autres modules (cf. lib/gouvernance/cache.ts) : chemin
 * donné sous sa forme de ROUTE, dérivé de `NAV`, pour invalider d'un coup les
 * deux langues et les vingt-six provinces.
 */
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { patronRoute } from "@/lib/routes";
import { CHEMIN_PROVINCES } from "@/lib/provinces/chemins";
import { invaliderTags, TAG } from "@/lib/cache/redis";

export function revaliderProvinces(): void {
  revalidatePath(patronRoute(CHEMIN_PROVINCES), "page");
  revalidatePath(patronRoute(`${CHEMIN_PROVINCES}/[province]`), "page");
  after(() => invaliderTags([TAG.provinces]));
}

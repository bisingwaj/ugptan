/**
 * Résolution de l'alias `@/` pour les tests exécutés par Node.
 *
 * `tsconfig.json` fait pointer `@/*` sur `src/*`, mais c'est une convention du
 * compilateur : Node l'ignore. Ce crochet la lui apprend, ce qui permet aux
 * tests d'importer les modules du projet TELS QU'ILS SONT, sans copie ni
 * réécriture — un test qui lit une autre source que l'application ne teste rien.
 *
 * `registerHooks` est intégré à Node (≥ 22.15) : aucune dépendance ajoutée.
 * Le typage TypeScript, lui, est retiré nativement par Node (≥ 22.18).
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const racine = path.resolve(import.meta.dirname, "..", "..");

/** Extensions tentées, dans l'ordre où le compilateur les tenterait. */
const CANDIDATS = [".ts", ".tsx", ".mts", ".js", "/index.ts"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

    const base = path.join(racine, "src", specifier.slice(2));
    const trouve = existsSync(base) && path.extname(base)
      ? base
      : CANDIDATS.map((suffixe) => base + suffixe).find((chemin) => existsSync(chemin));

    if (!trouve) {
      throw new Error(`Alias non résolu : ${specifier} (cherché sous ${base})`);
    }

    return { url: pathToFileURL(trouve).href, shortCircuit: true };
  },
});

import type { Instrumentation } from "next";
import { describeError } from "@/lib/errors";

/**
 * Démarrage du serveur : préférer l'IPv4 pour joindre la base.
 *
 * ─── Ce qui a été mesuré ─────────────────────────────────────────────────────
 * L'hôte Neon résout SIX adresses : trois en IPv4, trois en IPv6. Sur un réseau
 * sans connectivité IPv6 — le cas courant de beaucoup de liaisons —, les trois
 * secondes répondent `EHOSTUNREACH` ou, pire, ne répondent pas du tout. Le
 * pilote tente alors chaque adresse et ressort un `AggregateError: ETIMEDOUT`
 * portant exactement six causes, socket jamais établie (`_closeCode: 1006`).
 *
 * Mesure sur la liaison qui posait problème :
 *   · IPv4 : 3/3 connexions en ~260 ms ;
 *   · IPv6 : 3/3 en EHOSTUNREACH.
 *
 * C'était là toute la cause des « salves » : ni Neon, ni le WebSocket en
 * lui-même, mais une famille d'adresses annoncée et injoignable. Les reprises
 * de `lib/lecture.ts` en absorbaient les effets ; cette ligne en supprime la
 * cause.
 *
 * ⚠️ `ipv4first` ORDONNE, il n'exclut pas : sur un réseau où l'IPv6 fonctionne,
 * les adresses v6 restent utilisables, elles passent simplement après. Retirer
 * cette ligne est donc sans danger là où l'IPv6 est établi, et sans bénéfice.
 */
export function register(): void {
  // Import dynamique : `instrumentation.ts` est aussi évalué dans le runtime
  // Edge, où `node:dns` n'existe pas. Le garde évite d'y casser le démarrage.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  import("node:dns")
    .then(({ setDefaultResultOrder }) => setDefaultResultOrder("ipv4first"))
    .catch((error) => console.warn(`[serveur] ordre de résolution DNS inchangé. ${describeError(error)}`));
}

/**
 * Journal des erreurs de requête.
 *
 * Sans ce crochet, une panne de la couche base ne laissait qu'une ligne
 * « ⨯ Error: [object Object] » : `@neondatabase/serverless` lève un `ErrorEvent`
 * que le journal par défaut ne sait pas décrire, et la cause disparaissait au
 * moment précis où elle était utile. `describeError` en tire au moins le type,
 * l'origine et, pour une socket coupée, la piste à suivre.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  console.error(
    `[serveur] ${request.method} ${request.path} (${context.routeType}) : ${describeError(error)}`,
  );
};

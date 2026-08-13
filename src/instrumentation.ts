import type { Instrumentation } from "next";
import { describeError } from "@/lib/errors";

/**
 * Démarrage du serveur.
 *
 * Le réglage lui-même vit dans `instrumentation-node.ts`, importé ici depuis une
 * branche POSITIVE sur `NEXT_RUNTIME`. La forme compte : ce fichier est compilé
 * pour les deux runtimes, et seul un test positif permet au bundler Edge
 * d'éliminer la branche — un `if (… !== "nodejs") return;` laisse le module
 * Node dans le graphe analysé, et l'avertissement avec.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
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

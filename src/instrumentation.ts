import type { Instrumentation } from "next";
import { describeError } from "@/lib/errors";

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

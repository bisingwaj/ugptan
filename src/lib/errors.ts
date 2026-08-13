/**
 * Rend lisible ce que lève la couche base.
 *
 * `console.error(err)` seul ne suffit pas ici : quand la connexion WebSocket
 * échoue, `@neondatabase/serverless` lève un **ErrorEvent** — qui n'est pas une
 * `Error`, n'a que `stack` et `clientVersion` en propriétés propres, et
 * s'affiche donc « {} » ou « [object Object] ». On perdait la cause au moment
 * où on en avait besoin.
 *
 * Partagé entre le provisionnement du compte initial (lib/auth/bootstrap.ts),
 * la lecture des actualités (lib/actus/) et le journal des erreurs de requête
 * (instrumentation.ts).
 */
export function describeError(error: unknown, profondeur = 0): string {
  if (profondeur > 3) return "…";

  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    const base = [error.name, code, error.message].filter(Boolean).join(" · ");

    // Une chaîne de causes porte presque toujours l'information utile : le
    // framework réemballe volontiers ce qu'il attrape.
    const cause = (error as { cause?: unknown }).cause;
    if (cause != null) return `${base} ← ${describeError(cause, profondeur + 1)}`;

    // Cas observé en rendu serveur : Next réemballe une valeur levée qui n'était
    // pas une `Error`, et son message devient la stringification de l'objet.
    // Sans cette mention, la ligne de journal n'apprend rien à personne.
    if (error.message === "[object Object]") {
      return `${base} (valeur levée non-Error, cause non transmise — typiquement l'ErrorEvent du pilote Neon : vérifier l'accès réseau à la base)`;
    }

    return base;
  }

  if (error && typeof error === "object") {
    const kind = error.constructor?.name || Object.prototype.toString.call(error);
    const stack = (error as { stack?: string }).stack;
    const origin = typeof stack === "string" ? stack.split("\n")[1]?.trim() : undefined;
    const hint =
      kind === "ErrorEvent"
        ? "connexion à la base injoignable — vérifier DATABASE_URL et l'accès réseau à Neon"
        : undefined;
    return [kind, hint, origin].filter(Boolean).join(" · ");
  }

  return String(error);
}

/**
 * Codes Prisma d'une panne de LIAISON — la base n'a pas été jointe. À ne pas
 * confondre avec les codes P2xxx, qui signalent une requête refusée par une
 * base pourtant bien atteinte : celle-là ne se répare pas en réessayant.
 */
const CODES_LIAISON = new Set([
  "P1000", "P1001", "P1002", "P1008", "P1010", "P1017",
  "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "EPIPE",
]);

const MESSAGES_LIAISON =
  /fetch failed|socket|connection (?:closed|terminated|reset|refused)|timed? ?out|network|websocket/i;

/**
 * L'erreur vient-elle de la LIAISON à la base, et non de la requête elle-même ?
 *
 * Le distinguo commande la conduite à tenir : une liaison qui tombe se
 * retente, une requête refusée se corrige. Neon suspend son compute après
 * quelques minutes d'inactivité, et la requête qui le réveille échoue parfois
 * avant que la socket soit établie — un site à trafic modéré rencontre donc ce
 * cas tous les jours.
 *
 * La cause est suivie en profondeur : Prisma et Next réemballent volontiers ce
 * qu'ils attrapent, et l'indice utile est souvent deux niveaux plus bas.
 */
export function estPanneDeLiaison(error: unknown, profondeur = 0): boolean {
  if (profondeur > 3 || error == null || typeof error !== "object") return false;

  const nom = (error as Error).name || error.constructor?.name;
  if (nom === "ErrorEvent" || nom === "PrismaClientInitializationError" || nom === "NeonDbError") {
    return true;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && CODES_LIAISON.has(code)) return true;

  const message = (error as Error).message;
  if (typeof message === "string" && MESSAGES_LIAISON.test(message)) return true;

  // `AggregateError` du résolveur DNS : chaque tentative porte son propre code.
  const errors = (error as { errors?: unknown }).errors;
  if (Array.isArray(errors) && errors.some((e) => estPanneDeLiaison(e, profondeur + 1))) return true;

  return estPanneDeLiaison((error as { cause?: unknown }).cause, profondeur + 1);
}

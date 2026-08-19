import "server-only";

/**
 * Appels de modèle, via OpenRouter.
 *
 * Repris de la plateforme de gouvernance PTN-RDC (`sgo.ptn`,
 * `backend/src/ai/ai.service.ts`), réduit à ce qu'exige la traduction : un
 * tour, une réponse, pas d'outils ni de flux. La clé et le modèle sont les
 * mêmes que là-bas — un seul compte OpenRouter pour les deux applications.
 *
 * L'appel part du SERVEUR, jamais du navigateur : la clé n'a pas à circuler
 * côté client, et le passage obligé par le serveur permet de journaliser
 * chaque génération (cf. le modèle `TraductionAssistee`).
 *
 * Ce module ne sait rien du métier. Il ne construit aucune invite et ne décide
 * de rien — voir `src/lib/ia/traduction.ts` pour ce qui est demandé au modèle.
 */

/** Ce que le fournisseur rend, une fois débarrassé de son enveloppe. */
export type Generation = {
  texte: string;
  modele: string;
  /**
   * Motif d'arrêt renvoyé par le fournisseur. « length » signale une réponse
   * coupée au plafond de jetons : distinguer ce cas d'une réponse mal formée
   * évite d'annoncer « illisible » quand le texte était bon mais incomplet.
   */
  finishReason?: string;
  /** Jetons consommés, quand le fournisseur les renvoie. */
  usage?: { entree: number; sortie: number };
};

export type DemandeGeneration = {
  systeme: string;
  message: string;
  maxTokens?: number;
  temperature?: number;
  /** Exiger une réponse JSON. Tous les modèles n'honorent pas le paramètre. */
  json?: boolean;
  timeoutMs?: number;
};

/**
 * Erreur d'appel au modèle, portant un message déjà rédigé pour la console.
 *
 * Distincte des erreurs ordinaires : le texte est destiné à être stocké dans
 * `TraductionAssistee.erreur` puis affiché tel quel à un rédacteur, qui n'a
 * pas à lire une trace technique.
 */
export class ErreurModele extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErreurModele";
  }
}

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Un tour de traduction est plus long qu'une réponse de conversation : le
 * corps d'un article dépasse volontiers les deux mille mots. Le délai couvre
 * l'appel complet, réponse comprise.
 */
const TIMEOUT_DEFAUT = 90_000;

/**
 * Modèle par défaut.
 *
 * Surchargeable par `OPENROUTER_MODEL` sans redéploiement : le choix relève de
 * l'arbitrage coût / qualité, pas du code. Voir `.env.example` pour les
 * variantes et ce qu'elles coûtent.
 */
const MODELE_DEFAUT = "anthropic/claude-opus-5";

/** Vrai si l'assistance est configurée. Faux : les écrans restent utilisables. */
export function iaConfiguree(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function modeleIA(): string {
  return process.env.OPENROUTER_MODEL || MODELE_DEFAUT;
}

function cle(): string {
  const valeur = process.env.OPENROUTER_API_KEY;
  if (!valeur) {
    throw new ErreurModele(
      "Assistance à la traduction non configurée : aucune clé OpenRouter n'est renseignée côté serveur.",
    );
  }
  return valeur;
}

function entetes(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // Recommandés par OpenRouter pour l'attribution des appels.
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.ugptn.cd",
    "X-Title": "UGPTN · Console d'administration",
  };
}

/**
 * Marque le bloc système comme cachable.
 *
 * Le socle institutionnel — glossaire, règles de traduction — repart identique
 * à chaque appel. Anthropic sait le conserver d'une requête à l'autre et
 * OpenRouter transmet l'annotation ; un fournisseur qui ne la connaît pas
 * l'ignore, de sorte que la marque ne coûte rien là où elle ne sert pas.
 */
function blocSysteme(systeme: string) {
  return {
    role: "system" as const,
    content: [{ type: "text", text: systeme, cache_control: { type: "ephemeral" } }],
  };
}

/**
 * Un tour de génération.
 *
 * Toutes les défaillances remontent en `ErreurModele` avec un message
 * présentable : le service appelant les recopie dans le journal, et la console
 * les affiche sans retraitement.
 */
export async function generer(demande: DemandeGeneration): Promise<Generation> {
  const apiKey = cle();
  const modele = modeleIA();

  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), demande.timeoutMs ?? TIMEOUT_DEFAUT);

  let reponse: Response;
  try {
    reponse = await fetch(ENDPOINT, {
      method: "POST",
      signal: controleur.signal,
      headers: entetes(apiKey),
      body: JSON.stringify({
        model: modele,
        temperature: demande.temperature ?? 0.2,
        max_tokens: demande.maxTokens ?? 4000,
        ...(demande.json ? { response_format: { type: "json_object" } } : {}),
        messages: [blocSysteme(demande.systeme), { role: "user", content: demande.message }],
      }),
    });
  } catch (erreur) {
    if (erreur instanceof Error && erreur.name === "AbortError") {
      throw new ErreurModele("Le service de traduction n'a pas répondu dans le délai imparti.");
    }
    throw new ErreurModele("Service de traduction injoignable.");
  } finally {
    clearTimeout(minuterie);
  }

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    // La trace complète va dans les journaux du serveur ; le rédacteur ne voit
    // que le code et la conduite à tenir.
    console.error(`OpenRouter ${reponse.status} — ${detail.slice(0, 400)}`);
    throw new ErreurModele(
      `Le service de traduction a répondu ${reponse.status}. Vérifiez la clé et le modèle configurés.`,
    );
  }

  const charge = (await reponse.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string | null }; finish_reason?: string }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  } | null;

  const texte = charge?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!texte) throw new ErreurModele("Réponse vide du service de traduction.");

  return {
    texte,
    modele,
    finishReason: charge?.choices?.[0]?.finish_reason,
    usage: charge?.usage
      ? { entree: charge.usage.prompt_tokens ?? 0, sortie: charge.usage.completion_tokens ?? 0 }
      : undefined,
  };
}

/**
 * Isole l'objet JSON d'une réponse.
 *
 * `response_format: json_object` n'est pas honoré par tous les modèles servis
 * par OpenRouter : ceux d'Anthropic ne connaissent pas ce paramètre et
 * répondent volontiers par une phrase d'introduction, ou par un bloc encadré
 * de triples accents graves. Le texte reste bon ; seul son emballage change.
 * On découpe donc du premier `{` à la dernière `}` plutôt que d'échouer sur
 * une différence de forme.
 */
export function extraireJson(brut: string): string {
  const debut = brut.indexOf("{");
  const fin = brut.lastIndexOf("}");
  if (debut === -1 || fin === -1 || fin <= debut) return brut;
  return brut.slice(debut, fin + 1);
}

/**
 * Lit l'objet rendu par le modèle.
 *
 * Distingue la réponse COUPÉE au plafond de jetons de la réponse MAL FORMÉE :
 * les deux se présentaient comme « illisible », ce qui envoyait le rédacteur
 * relancer une génération qui échouerait pareil.
 */
export function lireObjet(generation: Generation): Record<string, unknown> {
  try {
    const objet = JSON.parse(extraireJson(generation.texte)) as unknown;
    if (!objet || typeof objet !== "object" || Array.isArray(objet)) {
      throw new Error("forme inattendue");
    }
    return objet as Record<string, unknown>;
  } catch {
    console.warn(
      `Réponse de traduction illisible — finish_reason=${generation.finishReason ?? "inconnu"}, ` +
        `${generation.texte.length} caractères, fin du texte : ${JSON.stringify(generation.texte.slice(-160))}`,
    );
    throw new ErreurModele(
      generation.finishReason === "length"
        ? "La traduction a été coupée avant sa fin : le contenu est trop long pour un seul appel. Relancez, ou traduisez cette langue à la main."
        : "La réponse du modèle n'a pas pu être interprétée. Relancez, ou saisissez cette langue à la main.",
    );
  }
}

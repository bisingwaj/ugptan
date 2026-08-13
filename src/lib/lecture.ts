/**
 * Enveloppe partagée de toute LECTURE PUBLIQUE de la base.
 *
 * Extraite de `lib/actus/query.ts`, où elle avait été écrite pour les
 * actualités, puis remontée ici quand les événements ont eu le même besoin :
 * les deux modules lisent la même base, sur les mêmes pages, avec le même
 * transport. Deux copies auraient divergé au premier réglage de palier.
 *
 * Elle rend deux services.
 *
 * ─── 1. Des reprises sur panne de LIAISON ────────────────────────────────────
 * Neon suspend son compute après quelques minutes sans requête, et celle qui le
 * réveille échoue avant que la socket soit établie. La page « Actualités »
 * tombait alors en 500, à la vue du public. Les reprises sont échelonnées pour
 * couvrir la durée réelle d'un réveil (cf. `REPRISES_MS`), et cantonnées aux
 * pannes de liaison (cf. `estPanneDeLiaison`) : rejouer une requête que la base
 * a refusée ne ferait que la faire refuser autant de fois.
 *
 * ─── 2. Une tolérance limitée À LA COMPILATION ───────────────────────────────
 * L'accueil et les cinq pages de composante sont pré-rendus au build et lisent
 * la base. Une base injoignable pendant `next build` ferait échouer la
 * construction entière pour un bloc secondaire de page. Ces listes ont un état
 * vide légitime : on y retombe, en le disant dans le journal de build.
 *
 * À L'EXÉCUTION, la panne est relayée telle quelle : une page annonçant « aucun
 * événement » sur une base éteinte mentirait au visiteur, et le mensonge serait
 * mis en cache. Mieux vaut une erreur, que l'exploitant voit et corrige
 * (cf. src/instrumentation.ts pour la trace serveur).
 */
import { describeError, estPanneDeLiaison } from "@/lib/errors";

/**
 * Attentes successives avant chaque reprise, en millisecondes.
 *
 * ⚠️ Ce qui est mesuré, et ce qui ne l'est pas. Le réveil d'un compute Neon
 * suspendu a été soupçonné puis ÉCARTÉ : après huit minutes sans requête, la
 * page « Actualités » se rend en 3,75 s sans déclencher une seule reprise.
 *
 * Ce qui est établi, en revanche, c'est que le transport WebSocket vers Neon
 * échoue par SALVES, là où le transport HTTP reste intact au même instant
 * (mesuré : 8/8 en HTTP contre 3/8 en WebSocket sur la même minute, et 10/10
 * dès lors qu'un même pool est réutilisé). Ces paliers absorbent une salve
 * courte — ils l'ont fait pendant un `next build` à 7 workers, qui s'est
 * terminé sans un seul abandon. Une salve plus longue que le budget ressort en
 * 500, et c'est voulu.
 *
 * Le coût est nul tant que la base répond : ce chemin ne s'ouvre que sur une
 * panne de LIAISON avérée.
 */
const REPRISES_MS = [300, 900, 2000];

const enCompilation = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * Cœur commun : rejoue `faire` tant que la panne est une panne de LIAISON et
 * qu'il reste un palier. Rend la main à `surEchec` quand la reprise n'a plus de
 * sens — paliers épuisés, ou panne que rejouer ne guérira pas.
 *
 * ⚠️ `faire` est une FONCTION, pas une promesse : une promesse déjà rejetée ne
 * se rejoue pas, la reprise n'aurait servi à rien.
 */
async function avecReprises<T>(
  faire: () => Promise<T>,
  module: string,
  contexte: string,
  surEchec: (error: unknown) => T,
  paliers: readonly number[] = REPRISES_MS,
): Promise<T> {
  for (let tentative = 0; ; tentative++) {
    try {
      return await faire();
    } catch (error) {
      const attente = paliers[tentative];
      if (attente === undefined || !estPanneDeLiaison(error)) return surEchec(error);

      console.warn(
        `[${module}] ${contexte} : liaison perdue, reprise ${tentative + 1}/${paliers.length} dans ${attente} ms. ${describeError(error)}`,
      );
      await new Promise((resoudre) => setTimeout(resoudre, attente));
    }
  }
}

/**
 * Fabrique la fonction de lecture PUBLIQUE d'un module. `module` n'est qu'un
 * préfixe de journal (« actus », « events ») : il rend les traces attribuables
 * sans que chaque appelant ait à le répéter.
 *
 * Le repli ne sert qu'à la COMPILATION, jamais à l'exécution (cf. l'en-tête).
 */
export function lecteur(module: string) {
  return function lecture<T>(faire: () => Promise<T>, repli: T, contexte: string): Promise<T> {
    return avecReprises(faire, module, contexte, (error) => {
      if (!enCompilation()) throw error;
      console.warn(
        `[${module}] ${contexte} : base injoignable pendant la compilation, bloc laissé vide. ${describeError(error)}`,
      );
      return repli;
    });
  };
}

/**
 * Lecture d'un écran de la CONSOLE. Mêmes reprises, et AUCUN repli.
 *
 * La différence avec `lecteur` n'est pas un oubli. Une page publique amputée
 * d'un bloc reste lisible ; un écran d'administration qui afficherait un
 * formulaire vide au lieu d'une fiche ferait écraser la fiche au premier
 * enregistrement. Ici, une panne qui survit aux reprises doit se voir — c'est
 * `(console)/error.tsx` qui la recueille, avec sa référence d'incident.
 *
 * Ce chemin existe parce que le transport WebSocket vers Neon échoue par
 * salves (cf. `REPRISES_MS`) : sans lui, une salve d'une demi-seconde suffisait
 * à faire tomber la fiche qu'un rédacteur venait d'ouvrir.
 */
/**
 * Paliers de la console, plus généreux que ceux du site public.
 *
 * Mesuré sur trente chargements d'affilée : avec le budget public (~3,2 s), une
 * salve sur dix survivait encore aux reprises et sortait en 500. La différence
 * de traitement se justifie par ce que coûte chaque issue. Une page publique
 * lente dessert un visiteur qui a d'autres pages ; un écran d'administration
 * qui tombe interrompt un travail en cours, et sa page d'erreur coûte de toute
 * façon un rechargement manuel. Attendre huit secondes de plus, sur la seule
 * requête qui a déjà échoué trois fois, est le moindre mal.
 */
const REPRISES_CONSOLE_MS = [300, 900, 2000, 3500, 5000];

export function lectureConsole<T>(faire: () => Promise<T>, contexte: string): Promise<T> {
  return avecReprises(
    faire,
    "console",
    contexte,
    (error) => { throw error; },
    REPRISES_CONSOLE_MS,
  );
}

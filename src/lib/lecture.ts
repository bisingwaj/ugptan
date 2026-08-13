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
 * Fabrique la fonction de lecture d'un module. `module` n'est qu'un préfixe de
 * journal (« actus », « events ») : il rend les traces attribuables sans que
 * chaque appelant ait à le répéter.
 *
 * ⚠️ `faire` est une FONCTION, pas une promesse : une promesse déjà rejetée ne
 * se rejoue pas, la reprise n'aurait servi à rien.
 */
export function lecteur(module: string) {
  return async function lecture<T>(
    faire: () => Promise<T>,
    repli: T,
    contexte: string,
  ): Promise<T> {
    for (let tentative = 0; ; tentative++) {
      try {
        return await faire();
      } catch (error) {
        const attente = REPRISES_MS[tentative];

        // Deux sorties, une seule conduite : on abandonne dès que la reprise
        // n'a plus de sens — paliers épuisés, ou panne qui n'est pas de liaison.
        if (attente === undefined || !estPanneDeLiaison(error)) {
          if (!enCompilation()) throw error;
          console.warn(
            `[${module}] ${contexte} : base injoignable pendant la compilation, bloc laissé vide. ${describeError(error)}`,
          );
          return repli;
        }

        console.warn(
          `[${module}] ${contexte} : liaison perdue, reprise ${tentative + 1}/${REPRISES_MS.length} dans ${attente} ms. ${describeError(error)}`,
        );
        await new Promise((resoudre) => setTimeout(resoudre, attente));
      }
    }
  };
}

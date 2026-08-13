/**
 * Réglages du serveur Node, appliqués une fois au démarrage.
 *
 * ⚠️ Fichier SÉPARÉ de `instrumentation.ts`, et ce n'est pas cosmétique : ce
 * dernier est compilé pour les DEUX runtimes, Node et Edge (le proxy tourne sur
 * Edge). Une mention de `node:dns` dans son graphe, même gardée à l'exécution
 * par un test sur `NEXT_RUNTIME`, reste visible de l'analyse statique du
 * bundler Edge, qui avertit à chaque compilation. Isolé ici et importé
 * dynamiquement depuis une branche positive, le module ne rejoint jamais le
 * paquet Edge.
 *
 * ─── Deux réglages réseau, une seule panne ──────────────────────────────────
 *
 * L'hôte Neon résout SIX adresses : trois en IPv4, trois en IPv6. La trace d'une
 * connexion échouée les montre toutes les six, et elles n'échouent pas de la
 * même façon — c'est ce contraste qui a livré la cause :
 *
 *     connect EHOSTUNREACH 2600:1f16:… (×3, immédiat)
 *     connect ETIMEDOUT    13.58.18.166 (×3, via internalConnectMultipleTimeout)
 *
 * 1. L'IPv6 est ANNONCÉ MAIS INJOIGNABLE sur la liaison utilisée. Mesuré :
 *    3/3 en EHOSTUNREACH.
 *
 * 2. L'IPv4 répond, mais TROP LENTEMENT POUR NODE. `autoSelectFamily` (Happy
 *    Eyeballs, actif par défaut depuis Node 20) laisse 250 ms à chaque adresse
 *    avant de passer à la suivante. Mesuré sur cette liaison : 12 poignées de
 *    main sur 12 entre 264 et 277 ms, soit une vingtaine de millisecondes de
 *    trop, À CHAQUE FOIS. Les tentatives étaient donc annulées au moment précis
 *    où elles allaient aboutir.
 *
 * Le second point explique ce que le premier laissait inexpliqué : pourquoi la
 * panne était INTERMITTENTE et non systématique. Ce n'était pas un réseau
 * capricieux, c'était une course contre un chronomètre réglé trop court, que la
 * latence gagnait ou perdait à quelques millisecondes près.
 *
 * D'où les deux lignes ci-dessous, qui vont ensemble :
 *   · `ipv4first` évite de dépenser des tentatives sur des adresses mortes ;
 *   · le délai porté à 2 s donne à la poignée de main le temps qu'elle prend
 *     réellement. Il ne RALENTIT rien : c'est un plafond, pas une attente.
 *
 * ⚠️ Aucun des deux n'exclut quoi que ce soit. Sur une liaison où l'IPv6
 * fonctionne, les adresses v6 restent utilisables — elles passent après ; et une
 * connexion qui s'établit en 30 ms s'établit toujours en 30 ms.
 */
import { setDefaultResultOrder } from "node:dns";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

setDefaultResultOrder("ipv4first");
setDefaultAutoSelectFamilyAttemptTimeout(2000);

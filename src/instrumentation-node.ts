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
 * ─── Préférer l'IPv4 pour joindre la base ────────────────────────────────────
 *
 * L'hôte Neon résout SIX adresses : trois en IPv4, trois en IPv6. Sur un réseau
 * sans connectivité IPv6 — le cas courant de beaucoup de liaisons —, les trois
 * secondes répondent `EHOSTUNREACH` ou, pire, ne répondent pas du tout. Le
 * pilote tente alors chaque adresse et ressort un `AggregateError: ETIMEDOUT`
 * portant exactement six causes, socket jamais établie (`_closeCode: 1006`,
 * `_socket: null`).
 *
 * Mesure sur la liaison qui posait problème :
 *   · IPv4 : 3/3 connexions établies en ~260 ms ;
 *   · IPv6 : 3/3 en EHOSTUNREACH.
 *
 * C'était là toute la cause des coupures intermittentes : ni Neon, ni le
 * WebSocket en lui-même, mais une famille d'adresses annoncée et injoignable.
 * Les reprises de `lib/lecture.ts` en absorbaient les effets ; cette ligne en
 * supprime la cause. Elles restent en place — une liaison peut faiblir pour
 * d'autres raisons, et elles ne coûtent rien tant que la base répond.
 *
 * ⚠️ `ipv4first` ORDONNE, il n'exclut pas : sur un réseau où l'IPv6 fonctionne,
 * les adresses v6 restent utilisables, elles passent simplement après. Retirer
 * cette ligne est donc sans danger là où l'IPv6 est établi, et sans bénéfice.
 */
import { setDefaultResultOrder } from "node:dns";

setDefaultResultOrder("ipv4first");

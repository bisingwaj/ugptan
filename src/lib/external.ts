/**
 * Destinations hébergées hors de notre périmètre.
 *
 * DIGIPROCURE est la plateforme numérique de passation et d'approvisionnement
 * du projet : elle porte la mise en concurrence, le dépôt des offres, la
 * contractualisation et le suivi des livraisons, là où ces étapes se tenaient
 * jusqu'ici sur papier et par courrier. Elle a sa propre authentification et
 * ses propres comptes — entreprises candidates, entités bénéficiaires,
 * contrôle. Le bouton du site public ne fait donc que conduire à son écran de
 * connexion ; il n'ouvre aucune session ici.
 *
 * ⚠️ À ne pas confondre avec la console d'administration de l'UGPTN, qui gère
 * le contenu de ce site et reste, elle, sans lien visible nulle part.
 *
 * Trois noms sont acceptés pour la même adresse, dans cet ordre :
 * `NEXT_PUBLIC_DIGIPROCURE_URL`, puis `NEXT_PUBLIC_BIDDERS_PORTAL_URL` et
 * `NEXT_PUBLIC_SUBMITTERS_ADMIN_LOGIN_URL`, en place dans les déploiements
 * existants. Le premier renseigné l'emporte : renommer la variable sur Vercel
 * n'est pas un préalable à la mise en ligne.
 *
 * ⚠️ `process.env.NEXT_PUBLIC_*` doit être écrit en toutes lettres : la valeur
 * est remplacée textuellement au build. Un accès dynamique
 * (`process.env[nom]`) renverrait `undefined` côté navigateur.
 */
const RAW_DIGIPROCURE_URL =
  process.env.NEXT_PUBLIC_DIGIPROCURE_URL ||
  process.env.NEXT_PUBLIC_BIDDERS_PORTAL_URL ||
  process.env.NEXT_PUBLIC_SUBMITTERS_ADMIN_LOGIN_URL ||
  "";

/** Nom de la plateforme, tel qu'il s'affiche. Identique en français et en anglais. */
export const DIGIPROCURE_NOM = "DigiProcure";

/**
 * URL de l'écran de connexion de DigiProcure, ou `null` si la variable n'est
 * pas renseignée. Le `null` est significatif : chaque appelant masque alors son
 * bouton plutôt que d'afficher un lien mort.
 */
export const DIGIPROCURE_URL: string | null = /^https?:\/\//i.test(RAW_DIGIPROCURE_URL.trim())
  ? RAW_DIGIPROCURE_URL.trim()
  : null;

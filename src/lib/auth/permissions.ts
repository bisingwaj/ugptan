/**
 * Rôles et permissions de la console.
 *
 * ⚠️ Aucun import : ni Prisma, ni `node:`. Ce module est lu par des composants
 * clients (barre latérale), par les gardes serveur et par les server actions.
 * Les valeurs de `AdminRole` reproduisent volontairement l'enum `Role` du
 * schéma Prisma — les deux doivent rester alignées.
 *
 * Modèle retenu : le rôle porte un socle de modules, et `User.permissions`
 * ajoute des modules au cas par cas. Il n'existe pas de retrait individuel :
 * pour restreindre un compte, on abaisse son rôle.
 */

export const ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const;
export type AdminRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<AdminRole, string> = {
  ADMIN: "Administrateur",
  EDITOR: "Éditeur",
  VIEWER: "Lecteur",
};

export const ROLE_HINT: Record<AdminRole, string> = {
  ADMIN: "Accès complet, gestion des comptes et des réglages comprise.",
  EDITOR: "Publication et mise à jour des contenus du site.",
  VIEWER: "Consultation du tableau de bord, sans droit de modification.",
};

/** Une permission = un module de la console. */
export const PERMISSIONS = [
  "tableau-de-bord",
  "actualites",
  "documents",
  "medias",
  "evenements",
  "histoires",
  "equipe",
  "videos",
  "newsletter",
  /* Écran de suivi de l'assistance à la traduction. Un module à part, et non un
     onglet d'un autre : il porte des contenus des SIX modules éditoriaux, et le
     travail de relecture ne se range naturellement dans aucun d'eux. */
  "traductions",
  /* Renommée depuis « gouvernance » en même temps que l'entrée de la barre
     latérale : le module couvre les deux pages du groupe « L'UGPTN ». Le module
     n'étant pas encore ouvert, aucun droit effectif n'était accordé sous
     l'ancien nom ; un `gouvernance` resté en base ne correspond simplement plus
     à aucun module et reste sans effet. */
  "ugptn",
  "projet",
  "mgp",
  /* Signalements EAS/HS (exploitation, abus et harcèlement sexuels), déposés
     par le formulaire MGP mais cloisonnés : ni `mgp` ni le rôle ADMIN n'y
     donnent accès (cf. `RESTRICTED` ci-dessous et lib/mgp/acces.ts). */
  "mgp-eas",
  "reglages",
  "utilisateurs",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Modules réservés au rôle ADMIN, qu'aucune permission individuelle ne peut
 * ouvrir. La gestion des comptes en fait partie : c'est l'exigence même de
 * l'authentification privée — seul un administrateur crée des accès.
 *
 * Les réglages l'ont rejointe en même temps que le mode maintenance : la seule
 * commande de la console qui retire le site entier au public n'a pas à être
 * accordable au cas par cas. Le module n'avait aucun écran jusque-là, donc
 * personne ne perd un droit qu'il exerçait.
 */
const ADMIN_ONLY: readonly Permission[] = ["utilisateurs", "reglages"];

/**
 * Permissions NOMINATIVES : aucun rôle ne les contient, pas même ADMIN. Elles
 * ne s'acquièrent que par une inscription expresse dans `User.permissions`.
 *
 * Motif, pour `mgp-eas` : le régime EAS/HS réserve les dossiers à la personne
 * désignée pour les instruire (le ou la spécialiste VBG/EAS), sous accès
 * nominatif (cf. content/legal.ts, section « eas »). L'administrateur de la
 * console est un rôle TECHNIQUE (comptes, réglages) : lui ouvrir d'office des
 * récits de violences sexuelles contredirait l'approche centrée sur la
 * survivante et les engagements publiés. Un administrateur peut l'accorder,
 * y compris à un autre administrateur, mais jamais à lui-même
 * (cf. actions/admin-users.ts) : l'accès suppose l'acte d'une seconde personne.
 *
 * C'est la seule entorse au « pas de retrait individuel » posé en tête : elle
 * ne retire rien à personne, elle refuse de déduire d'un rôle ce qui doit être
 * une désignation.
 */
const RESTRICTED: readonly Permission[] = ["mgp-eas"];

export const isRestrictedPermission = (permission: string): boolean =>
  (RESTRICTED as readonly string[]).includes(permission);

/**
 * Socle de chaque rôle. `"*"` vaut « tous les modules ».
 *
 * ⚠️ `newsletter` ne figure PAS dans le socle de l'éditeur, et c'est délibéré :
 * le module donne accès à une liste d'adresses personnelles et à son export.
 * Il reste accordable au cas par cas (`assignablePermissions`), ce qui répond à
 * l'exigence de le réserver aux administrateurs autorisés du CMS.
 */
const ROLE_BASE: Record<AdminRole, readonly Permission[] | "*"> = {
  ADMIN: "*",
  EDITOR: [
    "tableau-de-bord",
    "actualites",
    "documents",
    "medias",
    "evenements",
    "histoires",
    "equipe",
    "videos",
    "traductions",
    "ugptn",
    "projet",
    "mgp",
  ],
  VIEWER: ["tableau-de-bord"],
};

/** Profil minimal exigé pour statuer sur un droit. */
export type Grantee = { role: AdminRole; permissions: readonly string[] };

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function isRole(value: string): value is AdminRole {
  return (ROLES as readonly string[]).includes(value);
}

/** Permissions accordables individuellement à un rôle donné. */
export function assignablePermissions(role: AdminRole): Permission[] {
  // Un administrateur a déjà tout, sauf les permissions nominatives.
  if (role === "ADMIN") return [...RESTRICTED];
  const base = ROLE_BASE[role];
  const granted = base === "*" ? PERMISSIONS : base;
  return PERMISSIONS.filter((p) => !granted.includes(p) && !ADMIN_ONLY.includes(p));
}

/** Décide de l'accès à un module. Unique source de vérité des autorisations. */
export function can(actor: Grantee, permission: Permission): boolean {
  // Avant le passe-droit ADMIN, délibérément (cf. `RESTRICTED`).
  if (RESTRICTED.includes(permission)) return actor.permissions.includes(permission);
  if (actor.role === "ADMIN") return true;
  if (ADMIN_ONLY.includes(permission)) return false;

  const base = ROLE_BASE[actor.role];
  if (base === "*") return true;
  return base.includes(permission) || actor.permissions.includes(permission);
}

/** Liste effective des modules ouverts à un compte (rôle + ajouts). */
export function grantedPermissions(actor: Grantee): Permission[] {
  return PERMISSIONS.filter((permission) => can(actor, permission));
}

/**
 * Modules à afficher dans la barre latérale et sur le tableau de bord.
 *
 * Diffère de `grantedPermissions` sur un seul point : l'écran « Plaintes »
 * s'ouvre aussi au seul titre de `mgp-eas`. La spécialiste VBG/EAS n'a pas à
 * recevoir le module MGP général pour atteindre ses propres dossiers ; elle n'y
 * verra que ceux-là (cf. lib/mgp/acces.ts). `mgp-eas` n'a pas d'entrée propre.
 */
export function visibleModules(actor: Grantee): Permission[] {
  const granted = grantedPermissions(actor);
  if (granted.includes("mgp-eas") && !granted.includes("mgp")) granted.push("mgp");
  return granted;
}

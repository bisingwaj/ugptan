/**
 * Better Auth — source unique de l'authentification et des sessions.
 *
 * ⚠️ Module SERVEUR. Ne jamais l'importer depuis un composant client : il tire
 * Prisma et la couche crypto. Les composants clients lisent `permissions.ts`
 * (autorisation, sans import) et rien d'autre.
 *
 * Partage des rôles, à garder en tête en lisant ce fichier :
 *   · Better Auth décide QUI est connecté — identité, mot de passe, session,
 *     cookie, expiration, révocation. Rien de tout cela n'est réimplémenté ici.
 *   · Le projet décide CE QUE cette personne a le droit de faire — `role` et
 *     `permissions`, arbitrés par `lib/auth/permissions.ts`.
 *
 * Instanciation PARESSEUSE, comme le client Prisma : `next build` importe ce
 * module pendant la collecte des routes, sans forcément disposer de
 * DATABASE_URL ni de BETTER_AUTH_SECRET. Une construction au niveau module
 * ferait échouer la compilation.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { db } from "@/lib/db";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/auth/validate";

/**
 * Les trois rôles du projet, déclarés à Better Auth.
 *
 * Sans cette déclaration, le plugin ne connaîtrait que ses rôles intégrés
 * (« admin » et « user ») et refuserait les nôtres. Ce qui est accordé ici ne
 * concerne QUE les opérations du plugin, c'est-à-dire la gestion des comptes :
 * `adminAc` les ouvre toutes, `userAc` n'en ouvre aucune. Cela recoupe
 * exactement notre règle — « utilisateurs » est un module réservé à ADMIN
 * (cf. lib/auth/permissions.ts), qui reste l'arbitre de tout le reste.
 */
const ROLES = {
  ADMIN: adminAc,
  EDITOR: userAc,
  VIEWER: userAc,
} as const;

/** Durée d'une session inactive. Reprend les 8 h de la console. */
const SESSION_EXPIRES_IN = 60 * 60 * 8;

/** Message servi à un compte désactivé qui tente de se connecter. */
export const BANNED_MESSAGE = "Ce compte est désactivé. Contactez un administrateur.";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET n'est pas défini — aucune session ne peut être signée ni vérifiée.",
    );
  }

  return betterAuth({
    secret,
    // Épinglée par BETTER_AUTH_URL. Sans elle, l'origine est déduite de la
    // requête — Better Auth le signale au démarrage, et les redirections
    // deviennent hasardeuses derrière un proxy.
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    /* En développement seulement : le serveur ne tourne pas toujours sur le
       port inscrit dans BETTER_AUTH_URL (3000 occupé, instance parallèle…), et
       une origine qui ne correspond pas au pied près ferait refuser les appels
       à /api/auth. En production, la seule origine de confiance est la baseURL. */
    trustedOrigins:
      process.env.NODE_ENV === "production"
        ? undefined
        : ["http://localhost:*", "http://127.0.0.1:*"],
    database: prismaAdapter(db(), { provider: "postgresql" }),

    emailAndPassword: {
      enabled: true,
      /* La pièce maîtresse de l'exigence « aucune inscription publique » :
         l'endpoint /api/auth/sign-up/email refuse toute requête. Les comptes
         naissent par `auth.api.createUser` (plugin admin), depuis la console. */
      disableSignUp: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      /* Aucune réinitialisation en libre-service : sans page publique pour la
         demander, un administrateur redéfinit le mot de passe depuis la console. */
      requireEmailVerification: false,
    },

    session: {
      expiresIn: SESSION_EXPIRES_IN,
      /* Cache de session en cookie volontairement laissé DÉSACTIVÉ : chaque
         vérification relit le compte en base, donc une désactivation, un
         changement de rôle ou un retrait de permission prend effet au
         chargement suivant. C'est la propriété que la console exige. */
    },

    user: {
      additionalFields: {
        /* `input: false` : ces champs ne peuvent PAS être posés par une requête
           cliente (sign-up, update-user). Sans cela, un compte pourrait
           s'accorder lui-même des modules. Seul le serveur les écrit. */
        permissions: { type: "string[]", required: false, defaultValue: [], input: false },
        lastLoginAt: { type: "date", required: false, input: false },
      },
    },

    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            // Trace de connexion, affichée dans le module « Utilisateurs ».
            // Une session naît à la connexion : c'est le bon moment.
            await db()
              .user.update({ where: { id: session.userId }, data: { lastLoginAt: new Date() } })
              .catch(() => {
                // Une trace d'horodatage ne doit jamais faire échouer une connexion.
              });
          },
        },
      },
    },

    plugins: [
      /* Fournit la gestion des comptes depuis la console : création, mot de
         passe, rôle, désactivation (ban) et suppression, avec révocation des
         sessions. C'est ce qui évite d'écrire quoi que ce soit à la main. */
      admin({
        roles: ROLES,
        defaultRole: "EDITOR",
        adminRoles: ["ADMIN"],
        defaultBanReason: "Compte désactivé par un administrateur.",
        bannedUserMessage: BANNED_MESSAGE,
      }),
      /* DOIT rester en dernier : ce plugin pose les cookies renvoyés par les
         endpoints lorsqu'ils sont appelés depuis une server action. */
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

/** Instance Better Auth, créée au premier appel puis réutilisée. */
export const auth = (): Auth => (instance ??= createAuth());

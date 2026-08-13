/**
 * Provisionnement du compte administrateur initial.
 *
 * La console n'expose aucune inscription : sans un premier compte, personne ne
 * peut jamais entrer. Cette amorce crée ce compte à la volée, la première fois
 * que la page de connexion est servie. Elle rend l'installation autonome —
 * aucune commande à lancer après un déploiement.
 *
 * Le mot de passe est confié à `auth.api.createUser` (plugin admin de Better
 * Auth), qui le hache et l'écrit dans `Account.password`. Aucun hachage n'est
 * calculé ici, et le mot de passe en clair n'atteint jamais la base.
 *
 * Appelée sans en-têtes, `createUser` s'exécute hors session : c'est le mode
 * serveur prévu par Better Auth, et la seule façon d'amorcer un système où la
 * création de compte exige déjà d'être administrateur.
 *
 * IDEMPOTENCE, les trois cas possibles :
 *   1. aucun compte à cette adresse → création complète ;
 *   2. compte présent avec un moyen de connexion → on ne touche à rien ;
 *   3. compte présent SANS moyen de connexion (cas d'une base antérieure à
 *      Better Auth) → on lui en attache un, sinon le compte serait inaccessible.
 *
 * ⚠️ Production : définir ADMIN_EMAIL et ADMIN_PASSWORD. Les valeurs de repli
 * ci-dessous sont celles de la spécification de recette, publiques par nature.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { describeError } from "@/lib/errors";

export const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "12345678";
const DEFAULT_ADMIN_NAME = "Administrateur";

export const initialAdminEmail = () =>
  (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

const initialAdminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

/**
 * Mémo par instance : sans lui, chaque affichage de la page de connexion
 * paierait deux requêtes. Positionné uniquement sur une exécution aboutie, pour
 * qu'une base momentanément injoignable soit retentée.
 */
let provisioned = false;

/** Ne lève jamais : l'écran de connexion doit s'afficher même base éteinte. */
export async function ensureInitialAdmin(): Promise<void> {
  if (provisioned) return;

  const email = initialAdminEmail();
  const password = initialAdminPassword();

  try {
    const existing = await db().user.findUnique({
      where: { email },
      select: { id: true, accounts: { select: { id: true }, take: 1 } },
    });

    if (existing) {
      // Cas 3 : le compte survit à une base antérieure, mais son ancien mot de
      // passe n'est pas exploitable par Better Auth. On lui attache un moyen de
      // connexion, avec le hachage de Better Auth, faute de quoi la console
      // n'aurait plus aucune porte d'entrée.
      if (existing.accounts.length === 0) {
        const ctx = await auth().$context;
        await ctx.internalAdapter.createAccount({
          userId: existing.id,
          providerId: "credential",
          accountId: existing.id,
          password: await ctx.password.hash(password),
        });
        console.warn(
          `[admin] Moyen de connexion Better Auth attaché au compte existant ${email}. ` +
            "Changez ce mot de passe depuis la console.",
        );
      }

      provisioned = true;
      return;
    }

    // Cas 1. `createUser` sans en-têtes : exécution serveur, hors session.
    await auth().api.createUser({
      body: {
        email,
        password,
        name: DEFAULT_ADMIN_NAME,
        role: "ADMIN",
        data: { permissions: [] },
      },
    });

    provisioned = true;

    if (password === DEFAULT_ADMIN_PASSWORD) {
      console.warn(
        `[admin] Compte administrateur initial créé (${email}) avec le mot de passe de recette. ` +
          "Définissez ADMIN_PASSWORD et changez-le depuis la console avant toute mise en production.",
      );
    } else {
      console.info(`[admin] Compte administrateur initial créé : ${email}`);
    }
  } catch (error) {
    console.error(`[admin] Provisionnement du compte initial impossible : ${describeError(error)}`);
  }
}

/* `describeError` vit désormais dans lib/errors.ts : le journal des erreurs de
   requête (instrumentation.ts) en a besoin pour les mêmes raisons. */

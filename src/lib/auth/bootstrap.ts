/**
 * Provisionnement du compte administrateur initial.
 *
 * La console n'expose aucune inscription : sans un premier compte, personne ne
 * peut jamais entrer. Cette amorce crée ce compte à la volée, la première fois
 * que la page de connexion est servie sur une base encore vide. Elle rend
 * l'installation autonome — aucune commande à lancer après un déploiement.
 *
 * ⚠️ Elle ne s'exécute QUE si la table `User` est vide. Elle ne réactive rien,
 * ne réinitialise aucun mot de passe et ne recrée pas un compte supprimé.
 * Pour remettre à zéro l'accès administrateur, cf. `pnpm db:seed`.
 *
 * ⚠️ Production : définir ADMIN_EMAIL et ADMIN_PASSWORD. Les valeurs de repli
 * ci-dessous sont celles de la spécification de recette, publiques par nature.
 */
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "12345678";

export const initialAdminEmail = () =>
  (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

const initialAdminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

/**
 * Mémo par instance : sans lui, chaque affichage de la page de connexion
 * paierait un `count()`. Positionné uniquement sur une exécution aboutie, pour
 * qu'une base momentanément injoignable soit retentée.
 */
let provisioned = false;

/** Ne lève jamais : l'écran de connexion doit s'afficher même base éteinte. */
export async function ensureInitialAdmin(): Promise<void> {
  if (provisioned) return;

  try {
    if ((await db().user.count()) > 0) {
      provisioned = true;
      return;
    }

    const email = initialAdminEmail();
    const password = initialAdminPassword();

    // upsert plutôt que create : deux requêtes concurrentes sur une base vide
    // entreraient toutes deux ici, et la seconde violerait l'unicité d'email.
    await db().user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Administrateur",
        role: "ADMIN",
        isActive: true,
        passwordHash: await hashPassword(password),
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
    console.error("[admin] Provisionnement du compte initial impossible :", error);
  }
}

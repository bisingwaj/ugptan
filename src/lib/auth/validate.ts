/**
 * Normalisation et validation des saisies d'identité.
 *
 * Partagé par la connexion et par la gestion des comptes : une adresse doit
 * être normalisée exactement de la même façon à l'écriture et à la lecture,
 * sinon un compte créé « Admin@Gmail.com » resterait introuvable à la connexion.
 *
 * ⚠️ Aucun import : les formulaires de la console sont des composants clients et
 * lisent `PASSWORD_MIN_LENGTH` d'ici. Tirer `lib/auth/password.ts` amènerait
 * `node:crypto` dans le paquet navigateur.
 */

/** Longueur minimale imposée à la création comme à la modification. */
export const PASSWORD_MIN_LENGTH = 8;

/** Casse et espaces retirés. La contrainte d'unicité porte sur cette forme. */
export const normalizeEmail = (value: FormDataEntryValue | null | undefined): string =>
  String(value ?? "").trim().toLowerCase();

/**
 * Contrôle volontairement permissif : une adresse « valide » au sens de la RFC
 * ne dit rien de sa délivrabilité. On écarte les fautes de frappe évidentes,
 * rien de plus.
 */
export const isValidEmail = (email: string): boolean =>
  email.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);

/** Message d'erreur, ou `null` si le mot de passe convient. */
export function passwordIssue(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit comporter au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (password.length > 200) return "Le mot de passe est trop long (200 caractères maximum).";
  return null;
}

/** Nom d'affichage : chaîne nettoyée, ou `null` si le champ est laissé vide. */
export const normalizeName = (value: FormDataEntryValue | null | undefined): string | null => {
  const name = String(value ?? "").trim().slice(0, 120);
  return name.length > 0 ? name : null;
};

/**
 * Logo UGPTN des e-mails, EMBARQUÉ dans le message (pièce jointe en ligne,
 * référencée par `cid:` dans le HTML).
 *
 * ─── Pourquoi pas une URL vers le site ──────────────────────────────────────
 *
 * Le gabarit chargeait `${SITE_URL}/marque/ugptn-blanc.png`. Mesuré le 29
 * septembre 2026 : le domaine répond « 402 Payment Required », l'image ne
 * s'affichait donc chez AUCUN destinataire, qui ne voyait que le texte de
 * remplacement. Une image distante dépend en outre de trois choses que le
 * message ne maîtrise pas : que le site soit en ligne, que son hébergeur serve
 * le fichier, et que le destinataire autorise les images distantes.
 *
 * Embarquée, elle voyage avec le message : Gmail, Outlook et Apple Mail
 * l'affichent sans rien demander, y compris hors ligne.
 *
 * ─── Pourquoi du base64 dans un module, et non le fichier de `public/` ─────
 *
 * Sur un hébergement sans état, `public/` est servi par le CDN et n'est pas
 * garanti dans le système de fichiers de la fonction qui envoie l'e-mail. Un
 * module fait partie du code : il est toujours là.
 *
 * ─── Le fichier ─────────────────────────────────────────────────────────────
 *
 * Tiré de `public/marque/ugptn-blanc.png` (780 × 462), réduit à 264 × 156,
 * soit le double de sa taille d'affichage pour les écrans haute densité, puis
 * aplati sur le noir du bandeau (#161616) et ramené à 128 couleurs : 8,7 Ko.
 * Aplati plutôt que transparent : si un client retire la couleur de fond du
 * bandeau (certains modes sombres le font), le lettrage blanc reste posé sur
 * son propre noir au lieu de disparaître sur du blanc.
 *
 * À régénérer si la marque change, depuis la même source et aux mêmes cotes.
 */
import type { Attachment } from "nodemailer/lib/mailer";

/** Identifiant du logo dans le message, repris par `src="cid:…"` (cf. layout.ts). */
export const LOGO_CID = "logo@ugptn.cd";

/** Taille d'AFFICHAGE, en pixels CSS : la moitié du fichier. */
export const LOGO_WIDTH = 132;
export const LOGO_HEIGHT = 78;

const LOGO_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAQgAAACcCAMAAAC0qMUsAAABgFBMVEX////+/v79/f38/Pz7+/v6+vr4+Pj29vb19fXu7u7o6Oji" +
  "4uLd3d3a2trS0tLNzc3Hx8fExMS8vLy3t7eNscIsruuoqKicnJyRkZGFhYV7e3tzc3Mrq+crqeUqp+Eqpd5qdXopo9spodkpoNco" +
  "ntYondMonNInm9Enms8nl8snk8UmlsomkcMmjr4li7sliLYlhbIkg68kgawkf6kjfKYjeqMjeJ8idJoicZYib5JnZ2deXl5UVFRO" +
  "Tk5LS0sha40hZ4ggY4MjXXgfXnsfWnYeV3EeVG0eUWgdTmQdS2AdSF1DQ0M+Pj47OzscRVghP04bP1AbPEwaOUcaN0QyMjIvLy8s" +
  "LCwaNUIaMj0ZMTwZLjcZKzMoKCgfJikYJy0YJCoYIygXJSsgICAaHyIXISUXHyIWHyIdHR0bGxsaGhoXHB8WGx0WGhwZGRkXGRsX" +
  "GRoXGRkWGRoYGBgXGBoXGBkXGBgWGBoWGBkWGBgXFxgXFxcWFxgWFxcWFxYWFhcWFhbTNOkkAAAgRUlEQVR42u1daVMiSbcuQH1d" +
  "2y1wFwIFWZRFQRC1Gwg2wW4CcEHBcAu4issgvMzAUHXJv35PZu2A3eL0zKh980O3VBVF5VMnz/Kck5kU+oCNqeXdS44cXa4yL/4O" +
  "9fFgaNZqKKQ2LXgIJtUXgvE+gGhWUf2FL5epwj9Zu864ot0IpvPk2EvAeEcS8RIk6BpC5YRHrzFpNW6HdkHvCKQuOTDodw9Ek3kI" +
  "Onx3iIbONL8rN9DXi6B93WwOrToS8HcysG5YXLL7k1c8GM33DESVDquX1F5WzOvVZwYJGROZrdWtyMZmLrWQRf8lhwsHYZdpUWf1" +
  "Jc7J5xoBg6nW3yEQNbSpNZk0K3ZfPMvwr5ZpHxOl+LrZn41awwhtOFBJ1JT3p1GPRau1emM5Dsz2kfYOgKiiqN6wpPbHvDaDbnUz" +
  "xGlA+qmG+0LGC+7vRXBtLVS92nBkETrX7qEqJyh19uUzubjPtqS1eKJZ+HyZzLw7ifgvSmqSflPoCf7Op8PutaUVm28vW+JEg7sq" +
  "s2VejyMUMoM4PKCwoSB94wBGjfwBSsNh0JndoTWN1vsH866AqKKMJoo8Iegz1+nzRMBhXlp1BlNYBWZ93tNSzGHegld8al/PIYZm" +
  "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" +
  "HIYAAAAASUVORK5CYII=";

/**
 * Pièce jointe en ligne. `cid` suffit à nodemailer pour la ranger dans la
 * partie `multipart/related` du message, avec `Content-Disposition: inline` :
 * les clients l'affichent dans le corps, sans la lister comme pièce jointe.
 */
export const logoAttachment = (): Attachment => ({
  filename: "ugptn.png",
  content: Buffer.from(LOGO_PNG_BASE64, "base64"),
  contentType: "image/png",
  cid: LOGO_CID,
});

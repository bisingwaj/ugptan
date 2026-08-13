/**
 * Gabarit commun des e-mails transactionnels — le pendant, en HTML d'e-mail, du
 * design system du site.
 *
 * Trois contraintes dictent la forme de ce fichier, et expliquent qu'on n'y
 * retrouve pas le CSS du site :
 *
 *   1. Les clients de messagerie ne chargent ni feuille externe, ni police
 *      distante fiable, et Outlook ignore une bonne part de la mise en page
 *      moderne. D'où des TABLEAUX imbriqués et des styles EN LIGNE, seule
 *      combinaison qui rende la même chose partout.
 *   2. Les jetons de `styles/tokens.css` sont recopiés ici en valeurs
 *      littérales : `var(--ac)` ne résout pas dans un e-mail. La constante
 *      `PALETTE` ci-dessous est donc la copie assumée — et le seul endroit à
 *      corriger si l'accent du site change.
 *   3. Le rendu doit tenir sur un écran de téléphone : largeur maximale de
 *      600 px, cellules fluides, et une requête média pour les clients qui
 *      l'honorent.
 *
 * Les blocs exportés (`paragraph`, `dataTable`, `button`…) sont les briques
 * réutilisables : un futur e-mail transactionnel se compose en les empilant,
 * sans réécrire une ligne de HTML de messagerie.
 */

/** Recopie des jetons du site (cf. src/styles/tokens.css). */
const PALETTE = {
  accent: "#0f62fe",
  accentDark: "#0043ce",
  accentPale: "#edf5ff",
  accentLine: "#d0e2ff",
  black: "#161616",
  grey90: "#262626",
  grey70: "#525252",
  grey60: "#6f6f6f",
  grey50: "#8d8d8d",
  grey20: "#e0e0e0",
  grey10: "#f4f4f4",
  white: "#ffffff",
} as const;

/** Mêmes familles que le site, avec les replis système des clients de messagerie. */
const FONT_SANS = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Consolas, 'Courier New', monospace";

/**
 * Échappement HTML. Appliqué à TOUTE valeur dynamique : un nom d'utilisateur
 * contenant « < » casserait la mise en page, et un e-mail composé par
 * concaténation est une surface d'injection comme une autre.
 */
export const esc = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* --- Briques de contenu --------------------------------------------------- */

/** Paragraphe courant. `html` déjà échappé par l'appelant si dynamique. */
export const paragraph = (html: string, options: { muted?: boolean } = {}): string =>
  `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:${options.muted ? "13px" : "15px"};line-height:1.65;color:${options.muted ? PALETTE.grey60 : PALETTE.grey70};">${html}</p>`;

/** Intertitre d'une section. */
export const heading = (text: string): string =>
  `<h2 style="margin:0 0 12px;font-family:${FONT_SANS};font-size:19px;line-height:1.3;font-weight:600;letter-spacing:-0.01em;color:${PALETTE.black};">${esc(text)}</h2>`;

/**
 * Tableau d'informations, étiquette à gauche et valeur à droite. C'est la
 * transposition de `.adm-defs` de la console : même hiérarchie, même filet.
 */
export const dataTable = (rows: { label: string; value: string; mono?: boolean }[]): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${PALETTE.grey20};border-collapse:collapse;margin:0 0 24px;">
  ${rows
    .map(
      (row, index) => `
  <tr>
    <td style="padding:14px 16px;border-bottom:${index === rows.length - 1 ? "none" : `1px solid ${PALETTE.grey20}`};font-family:${FONT_MONO};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${PALETTE.grey50};white-space:nowrap;vertical-align:top;">${esc(row.label)}</td>
    <td style="padding:14px 16px;border-bottom:${index === rows.length - 1 ? "none" : `1px solid ${PALETTE.grey20}`};font-family:${row.mono ? FONT_MONO : FONT_SANS};font-size:14px;font-weight:600;color:${PALETTE.black};text-align:right;word-break:break-word;">${esc(row.value)}</td>
  </tr>`,
    )
    .join("")}
</table>`;

/**
 * Bouton principal. Rendu par un tableau et non par un `<a>` stylé : c'est ce
 * qui lui donne une zone cliquable pleine dans les clients qui ignorent le
 * `padding` d'un lien en ligne.
 */
export const button = (label: string, href: string): string => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td bgcolor="${PALETTE.accent}" style="background:${PALETTE.accent};">
      <a href="${esc(href)}" target="_blank" rel="noopener" style="display:inline-block;padding:15px 26px;font-family:${FONT_SANS};font-size:15px;font-weight:500;color:${PALETTE.white};text-decoration:none;">${esc(label)}&nbsp;&nbsp;<span style="font-family:${FONT_MONO};">&rarr;</span></a>
    </td>
  </tr>
</table>`;

/** Lien de repli, pour les clients qui n'affichent pas les boutons. */
export const fallbackLink = (href: string, note: string): string =>
  `<p style="margin:0 0 24px;font-family:${FONT_SANS};font-size:12.5px;line-height:1.6;color:${PALETTE.grey60};">${esc(note)}<br><a href="${esc(href)}" target="_blank" rel="noopener" style="font-family:${FONT_MONO};font-size:12px;color:${PALETTE.accent};word-break:break-all;">${esc(href)}</a></p>`;

/** Encart d'avertissement, filet d'accent à gauche — comme `.adm-ok` de la console. */
export const notice = (html: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="border:1px solid ${PALETTE.accentLine};border-left:3px solid ${PALETTE.accent};background:${PALETTE.accentPale};padding:14px 16px;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${PALETTE.grey70};">${html}</td>
  </tr>
</table>`;

/* --- Enveloppe ------------------------------------------------------------ */

/**
 * Marque de l'UGPTN : carré d'accent portant un carré blanc en bas à droite.
 * Reproduit `.adm__mark` (styles/dashboard.css) en tableaux plutôt qu'en image
 * — une image distante est bloquée par défaut dans la plupart des clients, et
 * l'en-tête d'un e-mail institutionnel ne peut pas s'afficher vide.
 */
const mark = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="30" height="30" style="width:30px;height:30px;background:${PALETTE.accent};">
  <tr>
    <td align="right" valign="bottom" style="padding:0 4px 4px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="10" height="10" style="width:10px;height:10px;background:${PALETTE.white};">
        <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>
</table>`;

export type EmailDocument = {
  /** Ligne d'aperçu affichée après l'objet dans la liste des messages. */
  preheader: string;
  /** Sur-titre, au-dessus du titre principal. */
  kicker: string;
  title: string;
  /** Blocs déjà rendus, empilés dans l'ordre. */
  blocks: string[];
  /** Mention de bas de message, sous le filet. */
  footnote?: string;
};

/**
 * Assemble un e-mail complet. Le seul endroit qui connaisse la structure du
 * document : un nouveau message se contente de fournir son titre et ses blocs.
 */
export function renderEmail({ preheader, kicker, title, blocks, footnote }: EmailDocument): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
<style>
  /* Honorée par les clients qui la lisent ; les autres retombent sur les
     largeurs fluides des tableaux, qui suffisent déjà sur téléphone. */
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:22px !important; padding-right:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PALETTE.grey10};-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.grey10};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${PALETTE.white};border:1px solid ${PALETTE.grey20};">

          <!-- En-tête : bandeau noir, marque et intitulé de la console -->
          <tr>
            <td class="pad" bgcolor="${PALETTE.black}" style="background:${PALETTE.black};padding:22px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right:12px;">${mark}</td>
                  <td valign="middle">
                    <div style="font-family:${FONT_SANS};font-size:16px;font-weight:700;color:${PALETTE.white};line-height:1.2;">UGPTN</div>
                    <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.grey50};line-height:1.4;">Console d'administration</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td class="pad" style="padding:34px 32px 8px;">
              <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.accent};margin:0 0 12px;">${esc(kicker)}</div>
              <h1 style="margin:0 0 20px;font-family:${FONT_SANS};font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:${PALETTE.black};">${esc(title)}</h1>
              ${blocks.join("\n")}
            </td>
          </tr>

          <!-- Pied -->
          <tr>
            <td class="pad" style="padding:24px 32px 30px;border-top:1px solid ${PALETTE.grey20};">
              ${footnote ? `<p style="margin:0 0 12px;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${PALETTE.grey60};">${footnote}</p>` : ""}
              <p style="margin:0;font-family:${FONT_SANS};font-size:11.5px;line-height:1.6;color:${PALETTE.grey50};">
                Unité de Gestion du Projet de Transformation Numérique · République Démocratique du Congo<br>
                Message automatique de la console d'administration. Merci de ne pas y répondre si vous n'êtes pas concerné.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

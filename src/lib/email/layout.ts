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

import { contact } from "@/content/carbon";
import { SITE_URL } from "@/lib/site";

/** Siège de l'Unité, sur une ligne, tel qu'il figure au pied des messages. */
const ADRESSE_POSTALE = `${contact.adresse}, ${contact.quartier}`;

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
 *
 * Les classes `dt-l` et `dt-v` n'ont d'effet que sur écran étroit : la requête
 * média de `renderEmail` y empile la valeur SOUS son étiquette. Sans cela, une
 * étiquette insécable de dix caractères ne laisse à la valeur qu'une colonne de
 * quelques mots, et « Environnementale & sociale » se brise en trois lignes au
 * milieu des mots.
 */
export const dataTable = (rows: { label: string; value: string; mono?: boolean }[]): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${PALETTE.grey20};border-collapse:collapse;margin:0 0 24px;">
  ${rows
    .map(
      (row, index) => `
  <tr>
    <td class="dt-l" style="padding:14px 16px;border-bottom:${index === rows.length - 1 ? "none" : `1px solid ${PALETTE.grey20}`};font-family:${FONT_MONO};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${PALETTE.grey50};white-space:nowrap;vertical-align:top;">${esc(row.label)}</td>
    <td class="dt-v" style="padding:14px 16px;border-bottom:${index === rows.length - 1 ? "none" : `1px solid ${PALETTE.grey20}`};font-family:${row.mono ? FONT_MONO : FONT_SANS};font-size:14px;font-weight:600;color:${PALETTE.black};text-align:right;word-break:break-word;">${esc(row.value)}</td>
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

/**
 * Code que la personne devra recopier ou dicter — un numéro de référence, par
 * exemple. Encadré pointillé d'accent et casse monospace : c'est la
 * transposition du bloc de confirmation du formulaire de plainte, et un numéro
 * isolé du texte se relit sans erreur, y compris imprimé.
 */
export const codeBox = (label: string, value: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center" style="border:1px dashed ${PALETTE.accent};background:${PALETTE.accentPale};padding:18px 16px;">
      <div style="font-family:${FONT_MONO};font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.grey60};margin:0 0 9px;">${esc(label)}</div>
      <div style="font-family:${FONT_MONO};font-size:19px;font-weight:700;letter-spacing:0.04em;color:${PALETTE.accentDark};word-break:break-all;">${esc(value)}</div>
    </td>
  </tr>
</table>`;

/**
 * Texte recopié tel que la personne l'a écrit. Les retours à la ligne sont
 * conservés : un récit de faits se lit par paragraphes, et l'aplatir en un bloc
 * continu trahirait ce que son auteur a mis en forme.
 */
export const textBlock = (label: string, text: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="border:1px solid ${PALETTE.grey20};border-left:3px solid ${PALETTE.grey50};background:${PALETTE.grey10};padding:14px 16px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${PALETTE.grey50};margin:0 0 9px;">${esc(label)}</div>
      <div style="font-family:${FONT_SANS};font-size:14px;line-height:1.65;color:${PALETTE.grey90};">${esc(text).replace(/\r?\n/g, "<br>")}</div>
    </td>
  </tr>
</table>`;

/**
 * Liste numérotée, dans le même filet que `dataTable`. Les puces natives sont
 * évitées : leur retrait varie d'un client à l'autre, et un `<li>` long finit
 * décalé sous son propre marqueur dans Outlook.
 */
export const numberedList = (items: string[]): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${PALETTE.grey20};border-collapse:collapse;margin:0 0 24px;">
  ${items
    .map((item, index) => {
      const border = index === items.length - 1 ? "none" : `1px solid ${PALETTE.grey20}`;
      return `
  <tr>
    <td width="34" style="padding:12px 0 12px 16px;border-bottom:${border};font-family:${FONT_MONO};font-size:12px;color:${PALETTE.accent};vertical-align:top;">${index + 1}.</td>
    <td style="padding:12px 16px 12px 6px;border-bottom:${border};font-family:${FONT_SANS};font-size:13.5px;line-height:1.55;color:${PALETTE.grey70};word-break:break-word;">${esc(item)}</td>
  </tr>`;
    })
    .join("")}
</table>`;

/**
 * Liste de rubriques : un intitulé, puis ce qu'il recouvre.
 *
 * Distincte de `numberedList`, qui énumère des ÉTAPES à suivre dans l'ordre.
 * Ici l'ordre ne veut rien dire, et chaque entrée porte deux niveaux de lecture :
 * l'intitulé se parcourt en diagonale, la ligne dessous se lit si le sujet
 * retient. C'est la forme qui convient à un sommaire de lettre d'information,
 * qu'on survole avant de décider si on l'ouvrira la prochaine fois.
 *
 * Le filet vertical d'accent tient lieu de puce : les puces natives se placent
 * différemment d'un client à l'autre, et se perdent sous Outlook.
 */
export const featureList = (items: { title: string; text: string }[]): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
  ${items
    .map(
      (item, index) => `
  <tr>
    <td style="padding:0 0 ${index === items.length - 1 ? "0" : "18px"};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="3" style="width:3px;background:${PALETTE.accent};font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding:2px 0 2px 14px;">
            <div style="font-family:${FONT_SANS};font-size:15px;font-weight:600;line-height:1.35;color:${PALETTE.black};margin:0 0 5px;">${esc(item.title)}</div>
            <div style="font-family:${FONT_SANS};font-size:13.5px;line-height:1.6;color:${PALETTE.grey70};">${esc(item.text)}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`,
    )
    .join("")}
</table>`;

/* --- Enveloppe ------------------------------------------------------------ */

/**
 * Marque de l'UGPTN, en tête du bandeau noir.
 *
 * ─── Pourquoi une image, alors qu'un e-mail ne peut pas compter dessus ──────
 *
 * La plupart des clients bloquent les images distantes tant que le
 * destinataire ne les autorise pas. Le bandeau portait donc jusqu'ici un carré
 * dessiné en tableaux, qui s'affichait toujours mais ne ressemblait à aucun
 * logo de la charte.
 *
 * Le compromis retenu ne pariait pas sur le déblocage : l'attribut `alt` porte
 * « UGPTN » en blanc, à la taille et à la graisse du mot-symbole. Images
 * bloquées, le bandeau affiche donc le sigle en toutes lettres, à sa place et
 * dans la bonne couleur ; images autorisées, il affiche le logo. Aucun des deux
 * états n'est un accident.
 *
 * L'URL est ABSOLUE et pointe vers le site : un e-mail quitte l'application,
 * plus aucun chemin relatif n'y a de sens. C'est la version à encre blanche,
 * le bandeau étant noir.
 */
const mark = `<img src="${SITE_URL}/marque/ugptn-blanc.png" width="132" height="78" alt="UGPTN" style="display:block;width:132px;height:auto;border:0;outline:none;text-decoration:none;font-family:${FONT_SANS};font-size:19px;font-weight:700;color:${PALETTE.white};">`;

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
  /**
   * Intitulé sous la marque, dans le bandeau noir. Par défaut celui de la
   * console : la plupart des messages en émanent. Un message adressé au PUBLIC
   * — la newsletter — n'a rien à dire d'une console à laquelle son destinataire
   * n'a pas accès, et fournit donc le sien.
   */
  subtitle?: string;
  /**
   * Langue du document. Portée par `<html lang>` : les lecteurs d'écran et les
   * traducteurs automatiques des clients de messagerie s'y fient.
   */
  lang?: string;
  /**
   * Dernière ligne du pied, sous la raison sociale. Même motif que `subtitle` :
   * « message automatique de la console » n'a aucun sens pour un abonné.
   */
  signature?: string;
};

/**
 * Assemble un e-mail complet. Le seul endroit qui connaisse la structure du
 * document : un nouveau message se contente de fournir son titre et ses blocs.
 */
export function renderEmail({
  preheader,
  kicker,
  title,
  blocks,
  footnote,
  subtitle = "Console d'administration",
  lang = "fr",
  signature = "Message automatique de la console d'administration. Merci de ne pas y répondre si vous n'êtes pas concerné.",
}: EmailDocument): string {
  return `<!doctype html>
<html lang="${esc(lang)}">
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
    /* Étiquette au-dessus de sa valeur : sur un téléphone, deux colonnes ne
       laissent à la seconde que quelques caractères. Le filet horizontal reste
       porté par la valeur, qui ferme la ligne. */
    .dt-l, .dt-v { display:block !important; width:auto !important; text-align:left !important; }
    .dt-l { border-bottom:none !important; padding:12px 16px 0 !important; white-space:normal !important; }
    .dt-v { padding:5px 16px 12px !important; }
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
              <!-- Le logo porte déjà le sigle : le répéter en texte à côté le
                   ferait lire deux fois par un lecteur d'écran. Ne subsiste que
                   l'intitulé du message, sous la marque. -->
              ${mark}
              <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.grey50};line-height:1.4;margin-top:10px;">${esc(subtitle)}</div>
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
              <p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11.5px;line-height:1.6;color:${PALETTE.grey50};">
                Unité de Gestion du Projet de Transformation Numérique · République Démocratique du Congo<br>
                ${esc(signature)}
              </p>
              <!-- Bailleurs et tutelle en TEXTE, non en logos : neuf images en
                   pied de message seraient bloquées par défaut chez la plupart
                   des destinataires, et laisseraient neuf cadres vides. La
                   mention, elle, s'affiche toujours. -->
              <!-- Adresse POSTALE de l'expéditeur.
                   Ce n'est pas une formalité juridique de plus : les filtres
                   anti-indésirables la cherchent. Un message de liste dépourvu
                   d'adresse physique identifiable perd des points chez la
                   plupart d'entre eux, et son absence est l'un des rares
                   critères qu'un expéditeur légitime peut corriger d'une
                   ligne. -->
              <p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11.5px;line-height:1.6;color:${PALETTE.grey50};">
                ${esc(ADRESSE_POSTALE)}
              </p>
              <p style="margin:0;font-family:${FONT_MONO};font-size:10.5px;line-height:1.7;letter-spacing:0.04em;color:${PALETTE.grey50};">
                Financement Banque mondiale (IDA) et Agence Française de Développement<br>
                Tutelle : Ministère du Numérique · PTN-RDC · P180495
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

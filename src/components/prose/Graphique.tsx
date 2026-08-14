/**
 * Dessin d'un graphique du corps rédigé.
 *
 * Composant SERVEUR, sans état ni script : ce qui arrive au navigateur est du
 * HTML et un tracé SVG déjà calculés. Une page de rapport n'a pas à embarquer
 * une bibliothèque de graphiques pour montrer douze valeurs, et le graphique
 * s'affiche donc aussi vite que le texte qui l'entoure — sans clignotement au
 * chargement, et sans dépendre de JavaScript.
 *
 * ─── Ce qui est dessiné en HTML, ce qui l'est en SVG ─────────────────────────
 *
 * Les barres et les colonnes sont des BOÎTES : une largeur ou une hauteur en
 * pourcentage suffit, et le HTML les rend responsives sans effort (les
 * intitulés se replacent, le texte reste sélectionnable et cherchable). La
 * courbe, elle, est une géométrie : seul le SVG la trace proprement. L'anneau
 * de même, par ses arcs.
 *
 * ⚠️ Sur la courbe, le tracé est étiré (`preserveAspectRatio="none"`) pour
 * remplir la largeur disponible. Le trait garderait alors une épaisseur
 * déformée : `vector-effect="non-scaling-stroke"` la fige à 2 px réels. Les
 * POINTS ne sont pas des cercles SVG pour la même raison — étirés, ils
 * deviendraient des ellipses — mais des éléments HTML positionnés en
 * pourcentage.
 *
 * ─── Couleur ────────────────────────────────────────────────────────────────
 *
 * Une série unique porte l'accent de la page (`var(--ac)`), qui suit la
 * composante consultée. La couleur n'y encode rien : elle distingue la donnée
 * du fond, et c'est tout. L'anneau est le seul cas où la couleur PORTE
 * l'identité de chaque part ; sa palette est donc fixe, ordonnée, et jamais
 * recyclée au-delà de six parts (cf. `PALETTE`).
 *
 * ─── Lisibilité ─────────────────────────────────────────────────────────────
 *
 * Aucune forme ne repose sur la seule couleur : chaque part de l'anneau est
 * légendée, chaque barre porte sa valeur, et les quatre formes exposent le
 * tableau des chiffres sous « Voir les données ». C'est ce tableau que lit un
 * lecteur d'écran, et c'est lui qui rend le graphique utile à qui ne distingue
 * pas les teintes.
 */
import {
  formatValeurGraphique,
  type Graphique as GraphiqueDonnees,
  type GraphiqueEntree,
  type GraphiqueType,
} from "@/lib/html/graphique";
import type { Lang } from "@/lib/pick";

/* -------------------------------------------------------------------------- */
/* Vocabulaire de la figure                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Chrome du graphique, tenu ici et non dans `content/i18n.ts` : ce sont les
 * mots de la figure elle-même, pas du contenu éditorial du site. Même partage
 * que les libellés de `lib/docs/statut.ts`.
 */
const TEXTES: Record<Lang, {
  donnees: string; intitule: string; valeur: string; part: string;
  autres: string; total: string; source: string;
}> = {
  fr: {
    donnees: "Voir les données",
    intitule: "Intitulé",
    valeur: "Valeur",
    part: "Part",
    autres: "Autres",
    total: "Total",
    source: "Source",
  },
  en: {
    donnees: "View the data",
    intitule: "Label",
    valeur: "Value",
    part: "Share",
    autres: "Other",
    total: "Total",
    source: "Source",
  },
};

const localeIntl = (lang: Lang): string => (lang === "en" ? "en-GB" : "fr-FR");

/**
 * Palette des parts de l'anneau, dans un ordre FIXE — jamais recyclé, jamais
 * réattribué. Deux règles la gouvernent :
 *
 *   · la première part prend l'accent de la page, pour que le graphique
 *     appartienne visuellement à la section qui le porte ;
 *   · les suivantes sont prises aux jetons du design system, et ordonnées de
 *     façon que deux parts VOISINES restent distinguables par un œil
 *     daltonien (écart vérifié : protanopie ΔE ≥ 11, tritanopie ΔE ≥ 7,6).
 *
 * Au-delà de six parts, la palette ne s'étend pas : les plus petites sont
 * regroupées sous « Autres » (cf. `preparerParts`). Inventer une septième
 * teinte reviendrait à demander au lecteur de distinguer des nuances que
 * personne ne distingue.
 */
const PALETTE = ["var(--ac)", "#009d9a", "#8a3ffc", "#ff832b", "#198038", "#ee5396"] as const;
/** Gris du regroupement « Autres » — volontairement en retrait des couleurs de parts. */
const GRIS_AUTRES = "var(--c-40)";
const MAX_PARTS = PALETTE.length;

/** Au-delà, des colonnes verticales deviennent illisibles : on repasse en barres. */
const MAX_COLONNES = 12;

/* -------------------------------------------------------------------------- */
/* Échelles                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Longueur d'une barre, en pourcentage du maximum de la série.
 *
 * Le zéro fait toujours partie de l'échelle : tronquer l'axe pour « mieux voir
 * l'écart » est le premier des mensonges graphiques — deux barres de 98 et 100
 * ne doivent pas paraître doubles l'une de l'autre. Une valeur négative n'a pas
 * de longueur ; sa valeur reste affichée en toutes lettres.
 */
const proportion = (valeur: number, max: number): number =>
  max <= 0 || valeur <= 0 ? 0 : Math.max(1, Math.round((valeur / max) * 1000) / 10);

/** Maximum de la série, plancher à 0 : une série entièrement négative n'étire rien. */
const maximum = (entrees: GraphiqueEntree[]): number =>
  entrees.reduce((haut, entree) => Math.max(haut, entree.valeur), 0);

/* -------------------------------------------------------------------------- */
/* Tableau des données                                                         */
/* -------------------------------------------------------------------------- */

function TableauDonnees({
  entrees, unite, lang, parts,
}: {
  entrees: GraphiqueEntree[];
  unite: string;
  lang: Lang;
  /** Pourcentages de l'anneau, quand la forme en produit. */
  parts?: number[];
}) {
  const t = TEXTES[lang];
  const locale = localeIntl(lang);

  return (
    <details className="prose-graphique__donnees">
      <summary>{t.donnees}</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">{t.intitule}</th>
            <th scope="col">{unite ? `${t.valeur} (${unite})` : t.valeur}</th>
            {parts && <th scope="col">{t.part}</th>}
          </tr>
        </thead>
        <tbody>
          {entrees.map((entree, index) => (
            <tr key={`${entree.label}-${index}`}>
              <th scope="row">{entree.label}</th>
              <td className="mono">{formatValeurGraphique(entree.valeur, unite, locale)}</td>
              {parts && <td className="mono">{formatValeurGraphique(parts[index], "%", locale)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Formes                                                                      */
/* -------------------------------------------------------------------------- */

function Barres({ entrees, unite, lang }: { entrees: GraphiqueEntree[]; unite: string; lang: Lang }) {
  const max = maximum(entrees);
  const locale = localeIntl(lang);

  return (
    <ul className="pg-barres">
      {entrees.map((entree, index) => (
        <li key={`${entree.label}-${index}`} className="pg-barres__ligne">
          <span className="pg-barres__label">{entree.label}</span>
          <span className="pg-barres__piste">
            <span className="pg-barres__fill" style={{ width: `${proportion(entree.valeur, max)}%` }} />
          </span>
          <span className="pg-barres__valeur mono">
            {formatValeurGraphique(entree.valeur, unite, locale)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Colonnes({ entrees, unite, lang }: { entrees: GraphiqueEntree[]; unite: string; lang: Lang }) {
  const max = maximum(entrees);
  const locale = localeIntl(lang);

  return (
    <ul className="pg-colonnes">
      {entrees.map((entree, index) => (
        <li key={`${entree.label}-${index}`} className="pg-colonnes__item">
          <span className="pg-colonnes__valeur mono">
            {formatValeurGraphique(entree.valeur, unite, locale)}
          </span>
          <span className="pg-colonnes__piste">
            <span className="pg-colonnes__fill" style={{ height: `${proportion(entree.valeur, max)}%` }} />
          </span>
          <span className="pg-colonnes__label">{entree.label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Courbe d'évolution.
 *
 * L'échelle verticale part de zéro quand la série est positive — même règle que
 * les barres. Elle descend sous zéro quand la série y descend : une courbe de
 * solde qui passe en négatif doit montrer le passage.
 *
 * Seuls DEUX points sont étiquetés, le plus haut et le dernier : ce sont les
 * deux questions qu'on pose à une courbe (« jusqu'où est-on monté ? », « où en
 * est-on ? »). Étiqueter chaque point rendrait la ligne illisible ; le tableau
 * des données porte le reste.
 */
function Lignes({ entrees, unite, lang }: { entrees: GraphiqueEntree[]; unite: string; lang: Lang }) {
  const locale = localeIntl(lang);
  const valeurs = entrees.map((entree) => entree.valeur);

  const haut = Math.max(...valeurs, 0);
  const bas = Math.min(...valeurs, 0);
  // Série plate : une amplitude nulle diviserait par zéro. La ligne se pose
  // alors à mi-hauteur, ce qui est exactement ce qu'elle raconte.
  const amplitude = haut - bas || 1;

  const points = entrees.map((entree, index) => ({
    ...entree,
    // Un point unique se pose au centre plutôt que de coller au bord gauche.
    x: entrees.length === 1 ? 50 : (index / (entrees.length - 1)) * 100,
    y: ((entree.valeur - bas) / amplitude) * 100,
  }));

  const etiquettes = new Set([valeurs.indexOf(Math.max(...valeurs)), points.length - 1]);

  return (
    <div className="pg-lignes">
      <div className="pg-lignes__cadre">
        <svg
          className="pg-lignes__trace"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Grille : trois repères, dont la ligne du zéro quand elle tombe
              dans l'échelle. Volontairement discrète — elle situe, elle ne
              se lit pas. */}
          {[0, 50, 100].map((niveau) => (
            <line
              key={niveau}
              x1="0"
              x2="100"
              y1={100 - niveau}
              y2={100 - niveau}
              stroke="var(--c-20)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polyline
            points={points.map((point) => `${point.x},${100 - point.y}`).join(" ")}
            fill="none"
            stroke="var(--ac)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {points.map((point, index) => (
          <span
            key={`${point.label}-${index}`}
            className="pg-lignes__point"
            style={{ left: `${point.x}%`, bottom: `${point.y}%` }}
          />
        ))}

        {points.map((point, index) =>
          etiquettes.has(index) ? (
            <span
              key={`etiquette-${index}`}
              className="pg-lignes__valeur mono"
              // L'étiquette est CENTRÉE sur son point, sauf aux extrémités où
              // elle sortirait du cadre : elle rentre alors vers l'intérieur.
              // Sans cela, la dernière valeur — celle qu'on regarde en premier —
              // déborderait sur la marge de la figure.
              style={{
                left: `${point.x}%`,
                bottom: `${point.y}%`,
                transform:
                  point.x > 92 ? "translateX(-100%)" : point.x < 8 ? "none" : "translateX(-50%)",
              }}
            >
              {formatValeurGraphique(point.valeur, unite, locale)}
            </span>
          ) : null,
        )}
      </div>

      {/* Extrémités de l'axe des abscisses. Les intitulés intermédiaires sont
          dans le tableau des données : les répéter ici les superposerait. */}
      <div className="pg-lignes__axe mono">
        <span>{entrees[0].label}</span>
        {entrees.length > 1 && <span>{entrees[entrees.length - 1].label}</span>}
      </div>
    </div>
  );
}

/**
 * Regroupe une série trop longue pour un anneau.
 *
 * Les cinq premières parts par ordre de grandeur restent distinctes, le reste
 * devient « Autres ». C'est la seule façon honnête de garder une palette
 * lisible sans masquer une partie du total.
 *
 * Les valeurs négatives sont écartées : une part de camembert négative n'a pas
 * de sens géométrique. Elles restent visibles dans le tableau des données.
 */
function preparerParts(entrees: GraphiqueEntree[], autres: string) {
  const positives = entrees.filter((entree) => entree.valeur > 0);
  if (positives.length <= MAX_PARTS) return positives;

  const ordonnees = [...positives].sort((a, b) => b.valeur - a.valeur);
  const tete = ordonnees.slice(0, MAX_PARTS - 1);
  const reste = ordonnees.slice(MAX_PARTS - 1).reduce((somme, entree) => somme + entree.valeur, 0);
  return [...tete, { label: autres, valeur: Math.round(reste * 100) / 100 }];
}

function Anneau({ entrees, unite, lang }: { entrees: GraphiqueEntree[]; unite: string; lang: Lang }) {
  const t = TEXTES[lang];
  const locale = localeIntl(lang);

  const parts = preparerParts(entrees, t.autres);
  const total = parts.reduce((somme, part) => somme + part.valeur, 0);
  if (parts.length === 0 || total <= 0) return <Barres entrees={entrees} unite={unite} lang={lang} />;

  const regroupe = parts.length > 0 && parts[parts.length - 1].label === t.autres;

  /**
   * Arcs tracés par `stroke-dasharray` sur un cercle de circonférence 100 :
   * chaque part vaut alors littéralement son pourcentage, et le décalage cumulé
   * (`stroke-dashoffset`) place la suivante. Un rayon de 15,915 donne
   * 2πr = 100 — la circonférence devient l'échelle.
   */
  let cumul = 0;
  const arcs = parts.map((part, index) => {
    const pourcentage = (part.valeur / total) * 100;
    const arc = { part, pourcentage, decalage: 25 - cumul, index };
    cumul += pourcentage;
    return arc;
  });

  const couleur = (index: number): string =>
    regroupe && index === parts.length - 1 ? GRIS_AUTRES : PALETTE[index % PALETTE.length];

  return (
    <div className="pg-anneau">
      <div className="pg-anneau__disque">
        <svg viewBox="0 0 42 42" role="presentation" focusable="false">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--c-10)" strokeWidth="5" />
          {arcs.map((arc) => (
            <circle
              key={`${arc.part.label}-${arc.index}`}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={couleur(arc.index)}
              strokeWidth="5"
              // 0,4 point de blanc entre deux parts : la séparation se voit sans
              // fausser les proportions.
              strokeDasharray={`${Math.max(arc.pourcentage - 0.4, 0.4)} ${100 - Math.max(arc.pourcentage - 0.4, 0.4)}`}
              strokeDashoffset={arc.decalage}
              transform="rotate(-90 21 21)"
            />
          ))}
        </svg>
        <span className="pg-anneau__centre">
          <span className="pg-anneau__total">{formatValeurGraphique(total, unite, locale)}</span>
          <span className="pg-anneau__total-label mono">{t.total}</span>
        </span>
      </div>

      {/* Légende : la couleur ne dit rien seule, le nom et la valeur la
          doublent systématiquement. */}
      <ul className="pg-anneau__legende">
        {arcs.map((arc) => (
          <li key={`legende-${arc.index}`} className="pg-anneau__part">
            <span className="pg-anneau__puce" style={{ background: couleur(arc.index) }} aria-hidden="true" />
            <span className="pg-anneau__nom">{arc.part.label}</span>
            <span className="pg-anneau__valeur mono">
              {formatValeurGraphique(arc.part.valeur, unite, locale)}
              <span className="pg-anneau__pourcent">
                {" "}
                · {formatValeurGraphique(Math.round(arc.pourcentage * 10) / 10, "%", locale)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Figure                                                                      */
/* -------------------------------------------------------------------------- */

/** Forme réellement dessinée : les colonnes cèdent la place aux barres au-delà de douze entrées. */
function formeEffective(type: GraphiqueType, nombre: number): GraphiqueType {
  return type === "colonnes" && nombre > MAX_COLONNES ? "barres" : type;
}

export function Graphique({ graphique, lang }: { graphique: GraphiqueDonnees; lang: Lang }) {
  const t = TEXTES[lang];
  const { entrees, unite } = graphique;
  const forme = formeEffective(graphique.type, entrees.length);

  // Parts de l'anneau, recalculées pour la colonne « Part » du tableau : le
  // tableau montre la série TELLE QU'ELLE EST SAISIE, pourcentages compris.
  const totalPositif = entrees.reduce((somme, entree) => somme + Math.max(entree.valeur, 0), 0);
  const parts =
    forme === "anneau" && totalPositif > 0
      ? entrees.map((entree) => Math.round((Math.max(entree.valeur, 0) / totalPositif) * 1000) / 10)
      : undefined;

  return (
    <figure className="prose-graphique" role="group" aria-label={graphique.titre || undefined}>
      {graphique.titre && <p className="prose-graphique__titre">{graphique.titre}</p>}

      <div className="prose-graphique__corps">
        {forme === "barres" && <Barres entrees={entrees} unite={unite} lang={lang} />}
        {forme === "colonnes" && <Colonnes entrees={entrees} unite={unite} lang={lang} />}
        {forme === "lignes" && <Lignes entrees={entrees} unite={unite} lang={lang} />}
        {forme === "anneau" && <Anneau entrees={entrees} unite={unite} lang={lang} />}
      </div>

      <TableauDonnees entrees={entrees} unite={unite} lang={lang} parts={parts} />

      {graphique.source && (
        <figcaption className="prose-graphique__source">
          {t.source} : {graphique.source}
        </figcaption>
      )}
    </figure>
  );
}

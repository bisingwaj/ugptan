/**
 * Briques des écrans de chargement.
 *
 * Aucune n'est un composant client : ces écrans doivent s'afficher avant que le
 * JavaScript de la page ne soit chargé, c'est même leur seule raison d'être.
 * L'animation vit donc en CSS (cf. src/styles/squelette.css).
 *
 * ─── Ce qu'un squelette doit annoncer ───────────────────────────────────────
 *
 * La structure attendue, à ses vraies dimensions. Un squelette qui invente sa
 * propre mise en page fait sauter la page deux fois : à son apparition, puis à
 * son remplacement. Les gabarits ci-dessous reprennent donc les classes de
 * grille du site (`.section__inner`, `.page-hero`) plutôt que d'en redéfinir.
 */
import type { CSSProperties } from "react";

/** Trois phases de battement, pour qu'une grille ne clignote pas d'un bloc. */
const phase = (i: number) => ["", " sq--b", " sq--c"][i % 3];

type BlocProps = {
  /** Largeur CSS : `"60%"`, `220`… Par défaut, toute la place disponible. */
  largeur?: number | string;
  hauteur?: number | string;
  /** Ton soutenu, pour ce qui remplace une image et non du texte. */
  surface?: boolean;
  /** Rang dans une série : décale le battement. */
  rang?: number;
  style?: CSSProperties;
};

/** Un rectangle. La brique de base de tout le reste. */
export function SqBloc({ largeur = "100%", hauteur = 14, surface, rang = 0, style }: BlocProps) {
  return (
    <span
      className={`sq${surface ? " sq--surface" : ""}${phase(rang)}`}
      style={{ width: largeur, height: hauteur, ...style }}
    />
  );
}

/**
 * Un paragraphe. La dernière ligne est courte, comme dans un vrai texte : une
 * pile de lignes toutes égales se lit comme un tableau, pas comme de la prose.
 */
export function SqTexte({
  lignes = 3,
  hauteur = 13,
  ecart = 9,
}: {
  lignes?: number;
  hauteur?: number;
  ecart?: number;
}) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: ecart }}>
      {Array.from({ length: lignes }, (_, i) => (
        <SqBloc key={i} rang={i} hauteur={hauteur} largeur={i === lignes - 1 ? "62%" : "100%"} />
      ))}
    </span>
  );
}

/**
 * L'en-tête des pages intérieures, calqué sur `PageHero` : fil d'Ariane, titre,
 * chapô. C'est le bloc le plus haut de l'écran, donc celui dont un décalage se
 * verrait le plus.
 */
export function SqPageHero({ chapo = true }: { chapo?: boolean }) {
  return (
    <section className="page-hero">
      <div className="section__inner">
        <SqBloc largeur={190} hauteur={12} style={{ marginBottom: 22 }} />
        <SqBloc largeur="min(560px, 82%)" hauteur={46} style={{ marginBottom: 18 }} />
        {chapo && (
          <span style={{ display: "block", maxWidth: 620 }}>
            <SqTexte lignes={2} />
          </span>
        )}
      </div>
    </section>
  );
}

/**
 * Une carte de liste : visuel, surtitre, titre, métadonnées. Le rapport du
 * visuel est réglable — les cartes d'actualité sont en 3/2, les portraits en
 * carré, les affiches d'événement en 4/3.
 */
export function SqCarte({ rapport = "3 / 2", rang = 0, lignes = 2 }: { rapport?: string; rang?: number; lignes?: number }) {
  return (
    <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
      <span className={`sq sq--surface${phase(rang)}`} style={{ aspectRatio: rapport, width: "100%" }} />
      <div style={{ padding: "18px 18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <SqBloc largeur={96} hauteur={11} rang={rang} />
        <SqTexte lignes={lignes} hauteur={15} ecart={8} />
      </div>
    </div>
  );
}

/**
 * Une grille de cartes, dans le gabarit à filets du site : cellules séparées
 * d'un pixel sur fond gris, comme les grilles réelles.
 */
export function SqGrille({
  cartes = 6,
  colonnes = "repeat(auto-fill, minmax(290px, 1fr))",
  rapport = "3 / 2",
  lignes = 2,
}: {
  cartes?: number;
  colonnes?: string;
  rapport?: string;
  lignes?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: colonnes,
        gap: 1,
        background: "var(--c-20)",
        border: "1px solid var(--c-20)",
      }}
    >
      {Array.from({ length: cartes }, (_, i) => (
        <SqCarte key={i} rang={i} rapport={rapport} lignes={lignes} />
      ))}
    </div>
  );
}

/** Une barre de filtres : quelques pastilles et un champ de recherche. */
export function SqFiltres({ pastilles = 5 }: { pastilles?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 32,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: pastilles }, (_, i) => (
          <SqBloc key={i} rang={i} largeur={78 + ((i * 23) % 46)} hauteur={30} />
        ))}
      </div>
      <SqBloc largeur={230} hauteur={38} />
    </div>
  );
}

/**
 * Enveloppe d'un écran de chargement.
 *
 * `role="status"` et `aria-busy` : sans eux, un lecteur d'écran ne dit rien du
 * tout pendant l'attente, puis annonce une page qui a changé sous lui. Le
 * `aria-label` porte le seul message utile, les blocs eux-mêmes n'ayant rien à
 * énoncer.
 */
export function SqEcran({ children, libelle = "Chargement en cours" }: { children: React.ReactNode; libelle?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={libelle}>
      {children}
    </div>
  );
}

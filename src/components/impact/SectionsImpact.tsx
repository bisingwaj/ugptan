/* ============================================================================
   Rendu des sections « Histoires & impact » à un emplacement de page.

   C'est le seul point de contact entre le CMS et les pages publiques : une page
   place `<SectionsImpact emplacement="…" lang={lang} />` là où le bloc doit
   apparaître, et tout le reste — textes, entrées, ordre, fond, bouton — vient
   de la console (ou du contenu d'origine tant qu'aucune section n'est publiée,
   cf. lib/impact/query.ts).

   ─── Ce qui vient de la donnée, ce qui vient du gabarit ──────────────────────
   Le fond, la compacité, la taille du titre et le numéro sont administrables.
   Les MARGES de l'en-tête, elles, suivent le gabarit : ce sont des constantes
   de dessin, reprises telles quelles des pages d'origine pour que le rendu ne
   bouge pas d'un pixel. Les exposer en console reviendrait à laisser régler une
   maquette depuis un formulaire.
   ========================================================================== */
import Link from "next/link";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";
import { sectionsImpact, type ImpactSectionVue } from "@/lib/impact/query";
import {
  IMPACT_THEME_CLASS, themeSombre,
  type ImpactEmplacement, type ImpactLayout,
} from "@/lib/impact/statut";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { BlocAvantApres } from "@/components/impact/blocs/BlocAvantApres";
import { BlocCartes } from "@/components/impact/blocs/BlocCartes";
import { BlocJalons } from "@/components/impact/blocs/BlocJalons";
import { BlocStats } from "@/components/impact/blocs/BlocStats";
import { BlocTemoignages } from "@/components/impact/blocs/BlocTemoignages";

/**
 * Réglages d'en-tête propres à chaque gabarit, repris des pages d'origine.
 *
 * ⚠️ `blocMaxWidth` et `titreMaxWidth` ne se confondent pas. Le premier borne
 * TOUT l'en-tête — c'est ce que faisaient les sections d'accueil, dont le
 * chapô ne devait pas courir sur la pleine largeur. Le second ne borne QUE le
 * titre, mesuré en `ch` : c'est le cas des diptyques, où le H2 se replie sur
 * dix-huit caractères pendant que son chapô, lui, s'étale. Les fusionner
 * changerait la longueur de ligne de l'un ou de l'autre.
 */
type Entete = {
  blocMaxWidth?: number;
  titreMaxWidth?: string;
  /** Espace sous l'en-tête, avant la grille. */
  marginBottom: number;
  /** Espace sous le titre, avant le chapô. */
  titreMargin: number;
  /** Le chapô prend la classe `.lead` plutôt qu'un style resserré. */
  chapoLead: boolean;
  /** Largeur maximale du chapô, quand il n'est pas en `.lead`. */
  chapoMaxWidth?: number;
  chapoTaille?: number;
  chapoInterligne?: number;
};

const ENTETE: Record<ImpactLayout, Entete> = {
  STATS: { blocMaxWidth: 760, marginBottom: 48, titreMargin: 18, chapoLead: true },
  TEMOIGNAGES: { blocMaxWidth: 680, marginBottom: 44, titreMargin: 14, chapoLead: true },
  CARTES: { marginBottom: 42, titreMargin: 14, chapoLead: false, chapoMaxWidth: 700, chapoTaille: 16, chapoInterligne: 1.6 },
  AVANT_APRES: { titreMaxWidth: "18ch", marginBottom: 44, titreMargin: 22, chapoLead: false, chapoMaxWidth: 720, chapoTaille: 16, chapoInterligne: 1.65 },
  JALONS: { marginBottom: 0, titreMargin: 14, chapoLead: false, chapoMaxWidth: 700, chapoTaille: 16, chapoInterligne: 1.6 },
};

export async function SectionsImpact({
  emplacement,
  lang,
}: {
  emplacement: ImpactEmplacement;
  lang: Lang;
}) {
  const sections = await sectionsImpact(emplacement, lang);
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <SectionImpact key={section.id} section={section} lang={lang} />
      ))}
    </>
  );
}

function SectionImpact({ section, lang }: { section: ImpactSectionVue; lang: Lang }) {
  const t = dict(lang);
  const entete = ENTETE[section.layout];
  const sombre = themeSombre(section.theme);

  const classes = ["section", section.compact ? "section--sm" : "", IMPACT_THEME_CLASS[section.theme]]
    .filter(Boolean)
    .join(" ");

  const titre = section.titre && (
    <h2
      className={section.grandTitre ? "h2" : "h2--sm"}
      style={{ margin: 0, marginBottom: section.lead ? entete.titreMargin : 0, maxWidth: entete.titreMaxWidth }}
    >
      {section.titre}
    </h2>
  );

  const chapo = section.lead && (
    entete.chapoLead ? (
      <p className="lead" style={{ margin: 0 }}>{section.lead}</p>
    ) : (
      <p
        style={{
          margin: 0,
          fontSize: entete.chapoTaille,
          lineHeight: entete.chapoInterligne,
          color: sombre ? "var(--c-40)" : "var(--c-70)",
          maxWidth: entete.chapoMaxWidth,
        }}
      >
        {section.lead}
      </p>
    )
  );

  /**
   * Deux mises en page d'en-tête, décidées par la présence du bouton.
   *
   * Avec bouton : le bloc titre et le bouton se repoussent aux deux bords, le
   * bouton restant aligné sur la dernière ligne du chapô. Sans : le bloc titre
   * occupe seul la largeur, comme sur les pages secondaires.
   */
  const avecBouton = Boolean(section.ctaHref && section.ctaLabel);

  return (
    <section className={classes}>
      <div className="section__inner">
        {(section.kicker || titre || chapo) && (
          <Reveal
            style={
              avecBouton
                ? {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 24,
                    marginBottom: entete.marginBottom,
                  }
                : { maxWidth: entete.blocMaxWidth, marginBottom: entete.marginBottom }
            }
          >
            <div style={avecBouton ? { maxWidth: entete.blocMaxWidth } : undefined}>
              {section.kicker && (
                <Kicker n={section.numero ?? undefined} light={sombre}>{section.kicker}</Kicker>
              )}
              {titre}
              {chapo}
            </div>

            {avecBouton && (
              <Link
                href={section.ctaHref!}
                className={sombre ? "btn btn--on-dark" : "btn btn--outline"}
                style={{ whiteSpace: "nowrap" }}
              >
                {section.ctaLabel} <span className="arrow">→</span>
              </Link>
            )}
          </Reveal>
        )}

        {section.layout === "STATS" && (
          <BlocStats items={section.items} approx={t.lbl.approx} theme={section.theme} />
        )}
        {section.layout === "TEMOIGNAGES" && (
          <BlocTemoignages items={section.items} lang={lang} watchLabel={t.home.watchStory} />
        )}
        {section.layout === "CARTES" && <BlocCartes items={section.items} lang={lang} />}
        {section.layout === "AVANT_APRES" && (
          <BlocAvantApres
            items={section.items}
            lang={lang}
            avantLabel={t.words.avant}
            apresLabel={t.words.apres}
          />
        )}
        {section.layout === "JALONS" && (
          <BlocJalons items={section.items} lang={lang} theme={section.theme} />
        )}
      </div>
    </section>
  );
}

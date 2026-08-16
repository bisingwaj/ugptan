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
import { Fragment } from "react";
import Link from "next/link";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";
import { sectionsImpact, type ImpactSectionVue } from "@/lib/impact/query";
import {
  IMPACT_THEME_CLASS, enteteIntegree, layoutAutonome, themeSombre,
  type ImpactEmplacement, type ImpactLayout,
} from "@/lib/impact/statut";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { BlocAvantApres } from "@/components/impact/blocs/BlocAvantApres";
import { BlocCartes } from "@/components/impact/blocs/BlocCartes";
import { BlocCitation } from "@/components/impact/blocs/BlocCitation";
import { BlocComposantes } from "@/components/impact/blocs/BlocComposantes";
import { BlocContexte } from "@/components/impact/blocs/BlocContexte";
import { BlocEngagements } from "@/components/impact/blocs/BlocEngagements";
import { BlocEquipe } from "@/components/impact/blocs/BlocEquipe";
import { BlocEtapes } from "@/components/impact/blocs/BlocEtapes";
import { BlocFaq } from "@/components/impact/blocs/BlocFaq";
import { BlocGlossaire } from "@/components/impact/blocs/BlocGlossaire";
import { BlocIndicateurs } from "@/components/impact/blocs/BlocIndicateurs";
import { BlocJalons } from "@/components/impact/blocs/BlocJalons";
import { BlocPersonas } from "@/components/impact/blocs/BlocPersonas";
import { BlocPoles } from "@/components/impact/blocs/BlocPoles";
import { BlocPrincipes } from "@/components/impact/blocs/BlocPrincipes";
import { BlocReperes } from "@/components/impact/blocs/BlocReperes";
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
  /** Écartement entre le bloc titre et le bouton, quand il y en a un. */
  gapBouton?: number;
};

/** Gabarits dont l'en-tête est dessiné par le bloc : rien à régler ici. */
const INTEGREE: Entete = { marginBottom: 0, titreMargin: 0, chapoLead: true };

const ENTETE: Record<ImpactLayout, Entete> = {
  STATS: { blocMaxWidth: 760, marginBottom: 48, titreMargin: 18, chapoLead: true },
  TEMOIGNAGES: { blocMaxWidth: 680, marginBottom: 44, titreMargin: 14, chapoLead: true },
  CARTES: { marginBottom: 42, titreMargin: 14, chapoLead: false, chapoMaxWidth: 700, chapoTaille: 16, chapoInterligne: 1.6 },
  AVANT_APRES: { titreMaxWidth: "18ch", marginBottom: 44, titreMargin: 22, chapoLead: false, chapoMaxWidth: 720, chapoTaille: 16, chapoInterligne: 1.65 },
  JALONS: { marginBottom: 0, titreMargin: 14, chapoLead: false, chapoMaxWidth: 700, chapoTaille: 16, chapoInterligne: 1.6 },

  CITATION: INTEGREE,
  CONTEXTE: INTEGREE,
  EQUIPE: INTEGREE,
  GLOSSAIRE: INTEGREE,

  /* Repris de `app/[lang]/ugptn/page.tsx`, bloc par bloc. */
  ETAPES: { blocMaxWidth: 760, titreMaxWidth: "20ch", marginBottom: 44, titreMargin: 18, chapoLead: true },
  PRINCIPES: { marginBottom: 40, titreMargin: 0, chapoLead: true },
  ENGAGEMENTS: { marginBottom: 0, titreMargin: 0, chapoLead: true },
  REPERES: { blocMaxWidth: 720, marginBottom: 40, titreMargin: 14, chapoLead: true },
  POLES: { marginBottom: 0, titreMargin: 0, chapoLead: true },
  FAQ: { marginBottom: 38, titreMargin: 0, chapoLead: true },

  /* Repris de `app/[lang]/project/page.tsx`. */
  PERSONAS: { marginBottom: 44, titreMargin: 0, chapoLead: true },
  COMPOSANTES: { blocMaxWidth: 640, marginBottom: 40, titreMargin: 16, chapoLead: true, gapBouton: 20 },
  INDICATEURS: { blocMaxWidth: 680, marginBottom: 40, titreMargin: 0, chapoLead: true, gapBouton: 20 },
};

/**
 * En-tête de la méthode, seule variante de gabarit du module.
 *
 * `ETAPES` sert deux blocs de la page « L'UGPTN », que le fond distingue : le
 * mandat sur clair, la méthode sur sombre. Leurs GRILLES sont identiques — d'où
 * un seul gabarit — mais leurs en-têtes ne l'ont jamais été : le titre de la
 * méthode se replie plus tôt, et son chapô n'est pas un `.lead`, dont le gris
 * serait illisible sur fond noir.
 */
const ENTETE_ETAPES_SOMBRE: Entete = {
  titreMaxWidth: "18ch",
  marginBottom: 44,
  titreMargin: 14,
  chapoLead: false,
  chapoMaxWidth: 720,
  chapoTaille: 16,
  chapoInterligne: 1.6,
};

const entetePour = (layout: ImpactLayout, sombre: boolean): Entete =>
  layout === "ETAPES" && sombre ? ENTETE_ETAPES_SOMBRE : ENTETE[layout];

export async function SectionsImpact({
  emplacement,
  lang,
}: {
  emplacement: ImpactEmplacement;
  lang: Lang;
}) {
  const sections = await sectionsImpact(emplacement, lang);
  if (sections.length === 0) return null;

  /* Les sections qui « enchaînent » ne rouvrent pas de bande : elles s'ajoutent
     dans celle de la section qu'elles suivent. Un groupe vaut donc une bande.
     Une section autonome dessine la sienne et ferme le groupe en cours. */
  const groupes: ImpactSectionVue[][] = [];
  for (const section of sections) {
    const precedent = groupes[groupes.length - 1];
    const suit =
      section.enchaine &&
      precedent !== undefined &&
      !layoutAutonome(precedent[0].layout) &&
      !layoutAutonome(section.layout);

    if (suit) precedent.push(section);
    else groupes.push([section]);
  }

  return (
    <>
      {groupes.map((groupe) => (
        <BandeImpact key={groupe[0].id} groupe={groupe} lang={lang} />
      ))}
    </>
  );
}

/**
 * Une bande de page : sa `<section>`, son fond, et les sections qu'elle porte.
 *
 * Un gabarit autonome dessine sa bande lui-même — il est alors seul dans son
 * groupe, et cette fonction s'efface devant lui.
 */
function BandeImpact({ groupe, lang }: { groupe: ImpactSectionVue[]; lang: Lang }) {
  const premiere = groupe[0];

  if (layoutAutonome(premiere.layout)) {
    return <CorpsImpact section={premiere} lang={lang} />;
  }

  const classes = ["section", premiere.compact ? "section--sm" : "", IMPACT_THEME_CLASS[premiere.theme]]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className="section__inner">
        {groupe.map((section) => (
          <Fragment key={section.id}>
            <EnteteImpact section={section} />
            <CorpsImpact section={section} lang={lang} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}

/**
 * En-tête d'une section, tel que le rendu commun le pose au-dessus de la grille.
 *
 * Deux cas s'en dispensent : les gabarits qui dessinent leur en-tête eux-mêmes,
 * et les sections qui en poursuivent une autre — leur titre devient alors un
 * sous-titre (`.unite-sub`), parce qu'une bande n'a qu'un seul H2.
 */
function EnteteImpact({ section }: { section: ImpactSectionVue }) {
  const sombre = themeSombre(section.theme);
  const entete = entetePour(section.layout, sombre);

  if (enteteIntegree(section.layout)) return null;

  if (section.enchaine) {
    return section.titre ? (
      <Reveal>
        <h3 className="unite-sub">{section.titre}</h3>
      </Reveal>
    ) : null;
  }

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

  if (!section.kicker && !titre && !chapo) return null;

  return (
    <Reveal
      style={
        avecBouton
          ? {
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: entete.gapBouton ?? 24,
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
  );
}

/**
 * Le corps d'une section : le dessin propre à son gabarit.
 *
 * Un `switch` sans `default`, volontairement : l'union des gabarits étant close,
 * le compilateur refuse la fonction dès qu'un cas manque. Ajouter un gabarit
 * sans l'inscrire ici casse la compilation plutôt que d'afficher une bande vide.
 */
function CorpsImpact({ section, lang }: { section: ImpactSectionVue; lang: Lang }) {
  const t = dict(lang);

  switch (section.layout) {
    case "STATS":
      return <BlocStats items={section.items} approx={t.lbl.approx} theme={section.theme} />;
    case "TEMOIGNAGES":
      return <BlocTemoignages items={section.items} lang={lang} watchLabel={t.home.watchStory} />;
    case "CARTES":
      return <BlocCartes items={section.items} lang={lang} />;
    case "AVANT_APRES":
      return (
        <BlocAvantApres
          items={section.items}
          lang={lang}
          avantLabel={t.words.avant}
          apresLabel={t.words.apres}
        />
      );
    case "JALONS":
      return <BlocJalons items={section.items} lang={lang} theme={section.theme} />;
    case "CITATION":
      return <BlocCitation citation={section.titre} note={section.note} />;
    case "ETAPES":
      return <BlocEtapes items={section.items} theme={section.theme} />;
    case "PRINCIPES":
      return <BlocPrincipes items={section.items} />;
    case "ENGAGEMENTS":
      return <BlocEngagements items={section.items} />;
    case "REPERES":
      return <BlocReperes items={section.items} />;
    case "POLES":
      return <BlocPoles items={section.items} lang={lang} />;
    case "EQUIPE":
      return (
        <BlocEquipe kicker={section.kicker} titre={section.titre} lead={section.lead} lang={lang} />
      );
    case "FAQ":
      return <BlocFaq items={section.items} />;
    case "GLOSSAIRE":
      return <BlocGlossaire titre={section.titre} lead={section.lead} items={section.items} />;
    case "CONTEXTE":
      return (
        <BlocContexte
          kicker={section.kicker}
          titre={section.titre}
          lead={section.lead}
          note={section.note}
          items={section.items}
        />
      );
    case "PERSONAS":
      return <BlocPersonas items={section.items} />;
    case "COMPOSANTES":
      return <BlocComposantes lang={lang} />;
    case "INDICATEURS":
      return <BlocIndicateurs lang={lang} />;
  }
}

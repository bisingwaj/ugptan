"use client";

/**
 * Grille d'événements — reprise fidèle du visuel d'origine, alimentée par la
 * console au lieu du contenu statique.
 *
 * Deux variantes, celles qui existaient déjà :
 *   · `withImage` — la carte pleine du calendrier : vignette duotone, pastille
 *     de catégorie, ligne mono date · lieu, titre, description, pied de carte ;
 *   · la carte compacte de l'accueil : liseré coloré, pastille + date, titre,
 *     lieu et appel à l'action.
 *
 * Trois changements par rapport à la version statique, tous demandés par le
 * passage au CMS :
 *
 *  1. **La carte mène à une fiche.** Le titre porte un lien étiré qui couvre la
 *     carte entière (cf. `.evt-card__lien` dans globals.css). Un `<Link>`
 *     enveloppant tout aurait imbriqué le bouton d'inscription dans un lien,
 *     ce que le HTML n'admet pas.
 *  2. **L'inscription suit ce qui est saisi.** Un lien d'inscription renseigné
 *     dans la console renvoie vers le service qui la gère ; à défaut, la
 *     demande de participation intégrée s'ouvre, exactement comme avant.
 *  3. **L'état vient de la date.** « Passé », « en cours » et « à venir » se
 *     déduisent du calendrier (cf. lib/events/statut.ts) : aucune fiche n'a à
 *     être rouverte le lendemain d'une rencontre pour changer d'étiquette.
 */
import { useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { EvtVue } from "@/lib/events/query";
import { evenementRoute } from "@/lib/routes";
import { Photo } from "@/components/ui/Photo";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { InscriptionModal } from "@/components/events/InscriptionModal";

type Props = { lang: Lang; events: EvtVue[]; withImage?: boolean };

export function EventsGrid({ lang, events, withImage = false }: Props) {
  const t = dict(lang);
  // Seul l'événement choisi vit ici : la saisie, l'envoi et l'accusé de
  // réception appartiennent à la modale, partagée avec la fiche de détail.
  const [reg, setReg] = useState<EvtVue | null>(null);

  /**
   * Appel à l'action du pied de carte.
   *
   * Trois formes selon ce que la fiche permet, et une seule visible à la fois :
   * s'inscrire ailleurs, demander à participer ici, ou simplement lire la fiche
   * quand l'événement est passé.
   */
  const Action = ({ e }: { e: EvtVue }) => {
    const style = {
      display: "inline-flex", alignItems: "center", gap: 7,
      fontSize: 13, fontWeight: 600, color: e.accent, background: "none",
    } as const;

    if (!e.aVenir) {
      return (
        <span className="evt-card__action mono" style={{ fontSize: 11.5, color: "var(--c-50)", marginLeft: "auto" }}>
          {t.evt.past} ✓
        </span>
      );
    }

    if (e.registrationUrl) {
      return (
        <a
          href={e.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="evt-card__action"
          style={style}
        >
          {t.evt.register} ↗
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setReg(e)}
        className="evt-card__action"
        style={style}
      >
        {t.evt.register} →
      </button>
    );
  };

  /** Pastille d'état, posée sur le visuel quand la date le justifie. */
  const Etat = ({ e }: { e: EvtVue }) =>
    e.phase === "EN_COURS" ? (
      <span className="mono evt-etat evt-etat--encours">{t.evt.ongoing}</span>
    ) : e.phase === "TERMINE" ? (
      <span className="mono evt-etat evt-etat--passe">{t.evt.past}</span>
    ) : null;

  return (
    <>
      <RevealGroup className="grid-auto" gap={0.045}>
        {events.map((e) =>
          withImage ? (
            <RevealItem key={e.id} className="evt-card" style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
              <div className="duo" style={{ aspectRatio: "16/9", ["--duo" as string]: e.accent }}>
                <Photo src={e.visuel.src} alt={e.visuel.alt} unoptimized={e.visuel.unoptimized} />
                {e.categorie && (
                  <span className="mono" style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, color: "#fff", background: e.accent, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{e.categorie.nom}</span>
                )}
                <span style={{ position: "absolute", top: 12, right: 12 }}><Etat e={e} /></span>
              </div>
              <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>
                  {e.dateCourte}{e.lieu ? ` · ${e.lieu}` : ""}
                </div>
                <h3 style={{ margin: "12px 0 0", fontSize: 17.5, fontWeight: 600, lineHeight: 1.32, flex: 1 }}>
                  <Link href={evenementRoute(lang, e.slug)} className="evt-card__lien">{e.title}</Link>
                </h3>
                {e.excerpt && (
                  <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{e.excerpt}</p>
                )}
                <div className="evt-card__pied">
                  {e.aVenir && e.places && (
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--c-70)" }}>{e.places}</span>
                  )}
                  <Action e={e} />
                </div>
              </div>
            </RevealItem>
          ) : (
            <RevealItem key={e.id} className="evt-card" style={{ background: "#fff", padding: "24px clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", borderTop: `3px solid ${e.accent}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                {e.categorie ? (
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: e.accent, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{e.categorie.nom}</span>
                ) : <span />}
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{e.dateCourte}</span>
              </div>
              <h3 style={{ margin: "16px 0 0", fontSize: 16.5, fontWeight: 600, lineHeight: 1.32, flex: 1 }}>
                <Link href={evenementRoute(lang, e.slug)} className="evt-card__lien">{e.title}</Link>
              </h3>
              <div className="evt-card__pied" style={{ paddingTop: 14 }}>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-70)" }}>{e.lieu ?? ""}</span>
                <Action e={e} />
              </div>
            </RevealItem>
          ),
        )}
      </RevealGroup>

      {/* Demande de participation — même formulaire que la fiche de détail.
          Il ne s'ouvre que pour les rencontres sans service d'inscription
          externe : le bouton renvoie alors directement vers ce service. */}
      {reg && <InscriptionModal evt={reg} lang={lang} onClose={() => setReg(null)} />}

    </>
  );
}

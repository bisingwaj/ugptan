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
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { EvtVue } from "@/lib/events/query";
import { evenementRoute } from "@/lib/routes";
import { Photo } from "@/components/ui/Photo";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

type Props = { lang: Lang; events: EvtVue[]; withImage?: boolean };

export function EventsGrid({ lang, events, withImage = false }: Props) {
  const t = dict(lang);
  const [reg, setReg] = useState<EvtVue | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", org: "" });

  const close = () => { setReg(null); setDone(false); setForm({ nom: "", email: "", org: "" }); };

  useEffect(() => {
    if (!reg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reg]);

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
        onClick={() => { setReg(e); setDone(false); }}
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

      {/* Demande de participation intégrée — inchangée : elle ne s'ouvre que
          pour les rencontres sans service d'inscription externe. */}
      {reg && (
        <div className="scrim scrim--center" onClick={close}>
          <div className="modal" data-lenis-prevent style={{ width: "100%", maxWidth: 480, background: "#fff", border: "1px solid var(--c-80)" }} onClick={(ev) => ev.stopPropagation()}>
            <div style={{ background: "var(--c-black)", color: "#fff", padding: "24px 26px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 90% 0%, rgba(15,98,254,.34), transparent 55%)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ac-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t.evt.regTitle}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{reg.title}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-40)", marginTop: 8 }}>
                    {reg.dateLabel}{reg.lieu ? ` · ${reg.lieu}` : ""}
                  </div>
                </div>
                <button onClick={close} aria-label="Fermer" style={{ width: 44, height: 44, flex: "0 0 auto", border: "1px solid var(--c-80)", color: "#fff", fontSize: 16, background: "var(--c-90)" }}>✕</button>
              </div>
            </div>
            {!done ? (
              <form onSubmit={(ev) => { ev.preventDefault(); setDone(true); }} style={{ padding: 26 }}>
                <label className="label-mono">{t.evt.fullName}</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="field" style={{ marginBottom: 13, background: "var(--c-10)" }} />
                <label className="label-mono">{t.mgp.email}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="field" style={{ marginBottom: 13, background: "var(--c-10)" }} />
                <label className="label-mono">{t.evt.orgOptional}</label>
                <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="field" style={{ marginBottom: 20, background: "var(--c-10)" }} />
                <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>{t.evt.register}<span className="arrow">→</span></button>
              </form>
            ) : (
              <div style={{ padding: "36px 26px", textAlign: "center", animation: "revFade .3s both" }}>
                <div style={{ width: 54, height: 54, margin: "0 auto 20px", background: "var(--ok-bg)", border: "1px solid var(--ok-bd)", color: "var(--ok-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{t.evt.regDoneTitle}</div>
                <p style={{ margin: "12px auto 0", maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: "var(--c-70)" }}>{t.evt.regDoneText}</p>
                <button onClick={close} className="btn btn--outline" style={{ marginTop: 22 }}>OK</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

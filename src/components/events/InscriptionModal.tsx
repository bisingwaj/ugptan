"use client";

/**
 * Demande de participation — la modale d'origine, désormais reliée à la base.
 *
 * Le visuel est repris tel quel (bandeau noir dégradé, champs sur fond clair,
 * accusé de réception centré) : seul le fond change, la demande étant
 * réellement enregistrée (cf. actions/evenements-inscription.ts) au lieu
 * d'afficher une confirmation sans suite.
 *
 * ⚠️ UN SEUL exemplaire de ce composant existe, monté par la grille comme par
 * la fiche de détail. C'est ce qui garantit que les deux points d'entrée
 * ouvrent exactement le même formulaire : deux copies auraient divergé au
 * premier champ ajouté, et l'une des deux aurait fini par ne plus enregistrer
 * la même chose.
 *
 * L'envoi passe par `useActionState`, donc le formulaire fonctionne aussi
 * pendant l'hydratation : c'est un vrai `<form action={…}>`, pas un
 * gestionnaire de clic.
 */
import { useActionState, useEffect, useId, useRef } from "react";
import { inscrireAction } from "@/actions/evenements-inscription";
import { dict } from "@/content/i18n";
import type { EvtVue } from "@/lib/events/query";
import { INSCRIPTION_INITIALE, INSCRIPTION_LIMITES } from "@/lib/events/inscription";
import type { Lang } from "@/lib/pick";
import { BoutonAction } from "@/components/ui/BoutonAction";

export function InscriptionModal({
  evt,
  lang,
  onClose,
}: {
  evt: EvtVue;
  lang: Lang;
  onClose: () => void;
}) {
  const t = dict(lang).evt;
  const [etat, action, enCours] = useActionState(inscrireAction, INSCRIPTION_INITIALE);
  const idBase = useId();
  const fermerRef = useRef<HTMLButtonElement>(null);

  // Échappement : la modale se ferme comme toutes celles du site.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Le focus entre dans la modale à l'ouverture : sans cela, la navigation au
  // clavier resterait derrière, sur la page qu'on vient de recouvrir.
  useEffect(() => { fermerRef.current?.focus(); }, []);

  const titreId = `${idBase}-titre`;

  return (
    <div className="scrim scrim--center" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        data-lenis-prevent
        style={{ width: "100%", maxWidth: 480, background: "#fff", border: "1px solid var(--c-80)" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div style={{ background: "var(--c-black)", color: "#fff", padding: "24px 26px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 90% 0%, rgba(15,98,254,.34), transparent 55%)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ac-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                {t.regTitle}
              </div>
              <div id={titreId} style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{evt.title}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--c-40)", marginTop: 8 }}>
                {evt.dateLabel}{evt.lieu ? ` · ${evt.lieu}` : ""}
              </div>
            </div>
            <button
              ref={fermerRef}
              type="button"
              onClick={onClose}
              aria-label={t.fermer}
              style={{ width: 44, height: 44, flex: "0 0 auto", border: "1px solid var(--c-80)", color: "#fff", fontSize: 16, background: "var(--c-90)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {!etat.ok ? (
          <form action={action} style={{ padding: 26 }}>
            <input type="hidden" name="evenementId" value={evt.id} />
            <input type="hidden" name="lang" value={lang} />

            {etat.error && (
              <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>{etat.error}</div>
            )}

            <label className="label-mono" htmlFor={`${idBase}-nom`}>{t.fullName}</label>
            <input
              id={`${idBase}-nom`}
              name="nom"
              required
              maxLength={INSCRIPTION_LIMITES.nom}
              autoComplete="name"
              className="field"
              style={{ marginBottom: 13, background: "var(--c-10)" }}
            />

            <label className="label-mono" htmlFor={`${idBase}-email`}>{t.email}</label>
            <input
              id={`${idBase}-email`}
              name="email"
              type="email"
              required
              maxLength={INSCRIPTION_LIMITES.email}
              autoComplete="email"
              className="field"
              style={{ marginBottom: 13, background: "var(--c-10)" }}
            />

            <label className="label-mono" htmlFor={`${idBase}-org`}>{t.orgOptional}</label>
            <input
              id={`${idBase}-org`}
              name="organisation"
              maxLength={INSCRIPTION_LIMITES.organisation}
              autoComplete="organization"
              className="field"
              style={{ marginBottom: 13, background: "var(--c-10)" }}
            />

            <label className="label-mono" htmlFor={`${idBase}-tel`}>{t.phoneOptional}</label>
            <input
              id={`${idBase}-tel`}
              name="telephone"
              type="tel"
              maxLength={INSCRIPTION_LIMITES.telephone}
              autoComplete="tel"
              className="field"
              style={{ marginBottom: 13, background: "var(--c-10)" }}
            />

            <label className="label-mono" htmlFor={`${idBase}-msg`}>{t.messageOptional}</label>
            <textarea
              id={`${idBase}-msg`}
              name="message"
              rows={3}
              maxLength={INSCRIPTION_LIMITES.message}
              className="field"
              placeholder={t.messagePlaceholder}
              style={{ marginBottom: 20, background: "var(--c-10)" }}
            />

            <BoutonAction
              type="submit"
              pending={enCours}
              labelPending={t.regSending}
              className="btn--primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t.register}
              <span className="arrow">→</span>
            </BoutonAction>

            <p className="adm-hint" style={{ marginTop: 14, fontSize: 12, lineHeight: 1.55 }}>{t.regPrivacy}</p>
          </form>
        ) : (
          <div style={{ padding: "36px 26px", textAlign: "center", animation: "revFade .3s both" }} role="status">
            <div style={{ width: 54, height: 54, margin: "0 auto 20px", background: "var(--ok-bg)", border: "1px solid var(--ok-bd)", color: "var(--ok-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{t.regDoneTitle}</div>
            <p style={{ margin: "12px auto 0", maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: "var(--c-70)" }}>
              {etat.message ?? t.regDoneText}
            </p>
            <button onClick={onClose} className="btn btn--outline" style={{ marginTop: 22 }}>OK</button>
          </div>
        )}
      </div>
    </div>
  );
}

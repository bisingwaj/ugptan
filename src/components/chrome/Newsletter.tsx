"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { subscribeNewsletter, type SubscribeError } from "@/actions/newsletter";
import { HONEYPOT_FIELD } from "@/lib/newsletter/model";

/** Ce que l'écran affiche après l'appel : rien, un succès, ou un refus. */
type Etat =
  | { kind: "idle" }
  /** Adresse enregistrée, ou déjà active : même écran, à dessein. */
  | { kind: "done" }
  /** Adresse désabonnée resoumise : un lien de confirmation est parti. */
  | { kind: "confirm" }
  | { kind: "error"; code: SubscribeError };

/**
 * Bloc d'inscription à la lettre d'information, présent au pied de chaque page
 * publique.
 *
 * Trois protections cohabitent, chacune sans friction pour le visiteur :
 * un champ leurre (`HONEYPOT_FIELD`), une minuterie de remplissage, et une
 * limite de débit par adresse IP posée côté serveur. Les deux premières se
 * contournent, la troisième ralentit : elles ne valent que cumulées, et aucune
 * n'impose de test au visiteur légitime.
 *
 * ⚠️ Aucun contrôle fait ici ne décide de quoi que ce soit. L'adresse est
 * revalidée par l'action serveur, seule autorité (cf. actions/newsletter.ts) ;
 * `type="email"` n'est qu'un confort de saisie.
 */
export function Newsletter({ lang }: { lang: Lang }) {
  const t = dict(lang).nl;
  const [email, setEmail] = useState("");
  const [piege, setPiege] = useState("");
  const [etat, setEtat] = useState<Etat>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  /* Instant d'affichage du formulaire, posé après hydratation : c'est lui qui
     donne le délai de remplissage transmis au serveur. */
  const affiche = useRef(0);
  useEffect(() => {
    affiche.current = Date.now();
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    startTransition(async () => {
      const resultat = await subscribeNewsletter({
        email,
        lang,
        piege,
        // `-1` quand l'effet n'a pas encore couru : une valeur négative n'est
        // pas comparée à la minuterie, plutôt que de refuser à tort.
        delai: affiche.current ? Date.now() - affiche.current : -1,
      });

      if (!resultat.ok) {
        setEtat({ kind: "error", code: resultat.error });
        return;
      }

      setEtat({ kind: resultat.code === "confirm" ? "confirm" : "done" });
      setEmail("");
    });
  };

  const succes = etat.kind === "done" || etat.kind === "confirm";

  return (
    <section className="section--dark px-(--pad-x) py-[clamp(56px,7vw,96px)]">
      <div className="cols2 cols2--center mx-auto max-w-(--maxw) gap-[clamp(28px,5vw,64px)]">
        <div>
          <div className="kicker kicker--light">{t.label}</div>
          <h2 className="h2--sm mb-3">{t.title}</h2>
          <p className="max-w-[480px] text-[15.5px] leading-[1.6] text-c-40">{t.lead}</p>
        </div>
        <div>
          {!succes ? (
            <>
              {/* `.stack-sm` bascule le formulaire en colonne pleine largeur ≤ 760px. */}
              <form onSubmit={submit} className="stack-sm flex flex-wrap gap-2.5" noValidate>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.label}
                  required
                  className="field field--dark min-w-[200px] flex-1 px-4 py-[15px] text-[15px]"
                />

                {/* Champ leurre. Sorti du flux plutôt que masqué par `display:none` :
                    un robot un peu soigneux ignore ce qui est explicitement caché,
                    mais remplit ce qu'il croit être un champ ordinaire. Retiré de
                    la tabulation et de l'arbre d'accessibilité, il reste invisible
                    pour un lecteur d'écran comme pour l'œil. */}
                <div aria-hidden className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden">
                  <label htmlFor={HONEYPOT_FIELD}>Site web</label>
                  <input
                    id={HONEYPOT_FIELD}
                    name={HONEYPOT_FIELD}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={piege}
                    onChange={(e) => setPiege(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn--primary whitespace-nowrap" disabled={pending}>
                  {pending ? t.submitting : t.btn}
                  <span className="arrow">→</span>
                </button>
              </form>

              {etat.kind === "error" ? (
                <p
                  role="alert"
                  className="mt-3.5 border border-[#5c1a1a] border-l-[3px] bg-[#2e0a0a] px-[14px] py-3 text-[13.5px] leading-[1.55] text-[#ffb3ab]"
                >
                  {t.erreurs[etat.code]}
                </p>
              ) : (
                <p className="mt-3.5 font-mono text-[11px] text-c-60">{t.privacy}</p>
              )}
            </>
          ) : (
            <div
              role="status"
              className="flex animate-[revFade_.3s_both] items-center gap-3.5 border border-[#0e6027] bg-[#0a2e16] px-[22px] py-5"
            >
              <span className="flex size-[38px] flex-none items-center justify-center bg-green-soft text-[18px] text-c-black">✓</span>
              <div>
                <div className="text-[16px] font-semibold text-white">
                  {etat.kind === "confirm" ? t.confirmTitle : t.doneTitle}
                </div>
                <div className="mt-1 text-[13.5px] leading-[1.5] text-c-40">
                  {etat.kind === "confirm" ? t.confirmText : t.doneText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

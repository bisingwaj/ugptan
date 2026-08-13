"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { route } from "@/lib/routes";
import {
  confirmByToken,
  requestUnsubscribeLink,
  unsubscribeByToken,
  type TokenCode,
} from "@/actions/newsletter";

/**
 * Pages publiques de gestion d'abonnement : désabonnement, confirmation de
 * réinscription, et renvoi du lien à qui l'a perdu.
 *
 * ⚠️ RIEN NE S'EXÉCUTE AU CHARGEMENT. Chaque opération demande un clic, y
 * compris le désabonnement par lien : les antivirus de messagerie et les
 * générateurs d'aperçu SUIVENT les URL qu'ils trouvent dans un e-mail, et
 * désabonneraient les gens à leur insu. Le lien mène donc à une page, et c'est
 * le bouton qui agit.
 */

/* --- Panneau de résultat -------------------------------------------------- */

type Ton = "ok" | "neutre" | "erreur";

const BORDURE: Record<Ton, string> = {
  ok: "var(--ok-bd)",
  neutre: "var(--c-30)",
  erreur: "var(--red)",
};

const FOND: Record<Ton, string> = {
  ok: "var(--ok-bg)",
  neutre: "var(--c-10)",
  erreur: "#fff1f1",
};

/** Encart de résultat, partagé par les deux pages et par les deux issues. */
export function Panneau({
  ton,
  titre,
  texte,
  lang,
  retour = true,
}: {
  ton: Ton;
  titre: string;
  texte: string;
  lang: Lang;
  /** Le lien de retour n'a de sens qu'une fois l'opération terminée. */
  retour?: boolean;
}) {
  const t = dict(lang).nlp;

  return (
    <div
      role="status"
      style={{
        border: `1px solid ${BORDURE[ton]}`,
        borderLeft: `3px solid ${BORDURE[ton]}`,
        background: FOND[ton],
        padding: "clamp(20px,2.6vw,28px)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "clamp(17px,1.9vw,21px)", fontWeight: 600, letterSpacing: "-0.01em" }}>
        {titre}
      </h2>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "var(--c-70)", maxWidth: 640 }}>
        {texte}
      </p>
      {retour && (
        <Link href={route(lang)} className="btn btn--outline btn--sm" style={{ marginTop: 20 }}>
          {t.back} <span className="arrow">→</span>
        </Link>
      )}
    </div>
  );
}

/* --- Action par jeton ----------------------------------------------------- */

/**
 * Bouton d'exécution du désabonnement ou de la confirmation.
 *
 * Le serveur a déjà vérifié que le jeton correspond à un abonnement, et dans
 * quel état il se trouve : ce composant ne décide de rien, il déclenche et
 * rapporte. Le second contrôle a lieu dans l'action, seule autorité.
 */
export function ActionAbonnement({
  lang,
  token,
  emailMasque,
  mode,
}: {
  lang: Lang;
  token: string;
  emailMasque: string;
  mode: "desabonnement" | "confirmation";
}) {
  const t = dict(lang).nlp;
  const [code, setCode] = useState<TokenCode | null>(null);
  const [pending, startTransition] = useTransition();

  const executer = () => {
    startTransition(async () => {
      const resultat = mode === "desabonnement"
        ? await unsubscribeByToken(token)
        : await confirmByToken(token);
      setCode(resultat.code);
    });
  };

  if (code) {
    const panneaux: Record<TokenCode, { ton: Ton; titre: string; texte: string }> = {
      done: mode === "desabonnement"
        ? { ton: "ok", titre: t.unsubDoneTitle, texte: t.unsubDoneText }
        : { ton: "ok", titre: t.confirmDoneTitle, texte: t.confirmDoneText },
      already: mode === "desabonnement"
        ? { ton: "neutre", titre: t.unsubAlreadyTitle, texte: t.unsubAlreadyText }
        : { ton: "neutre", titre: t.confirmAlreadyTitle, texte: t.confirmAlreadyText },
      invalid: { ton: "erreur", titre: t.invalidTitle, texte: t.invalidText },
      server: { ton: "erreur", titre: t.serverTitle, texte: t.serverText },
    };

    const panneau = panneaux[code];
    return <Panneau lang={lang} ton={panneau.ton} titre={panneau.titre} texte={panneau.texte} />;
  }

  return (
    <div style={{ border: "1px solid var(--c-20)", background: "#fff", padding: "clamp(22px,2.8vw,32px)" }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-50)" }}>
        {t.unsubFor}
      </div>
      <div className="mono" style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: "var(--c-black)", wordBreak: "break-all" }}>
        {emailMasque}
      </div>

      <button
        type="button"
        onClick={executer}
        disabled={pending}
        className={mode === "desabonnement" ? "btn btn--outline" : "btn btn--primary"}
        style={{ marginTop: 22 }}
      >
        {pending
          ? t.unsubPending
          : mode === "desabonnement"
            ? t.unsubBtn
            : t.confirmBtn}
        <span className="arrow">→</span>
      </button>
    </div>
  );
}

/* --- Demande de lien ------------------------------------------------------ */

/**
 * Formulaire de renvoi du lien de désabonnement, servi quand la page est
 * ouverte sans jeton.
 *
 * ⚠️ La réponse est la même que l'adresse figure ou non sur la liste, et le
 * lien part par courriel : cette page ne dit jamais qui est abonné, et ne
 * permet pas de désabonner l'adresse d'un tiers (cf. actions/newsletter.ts).
 */
export function DemandeLien({ lang }: { lang: Lang }) {
  const t = dict(lang).nlp;
  const tn = dict(lang).nl;
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<"invalid" | "rate" | "mail" | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    startTransition(async () => {
      const resultat = await requestUnsubscribeLink(email, lang);
      if (resultat.ok) {
        setErreur(null);
        setEnvoye(true);
      } else {
        setErreur(resultat.error);
      }
    });
  };

  if (envoye) {
    return <Panneau lang={lang} ton="ok" titre={t.askDoneTitle} texte={t.askDoneText} />;
  }

  return (
    <div style={{ border: "1px solid var(--c-20)", background: "#fff", padding: "clamp(22px,2.8vw,32px)" }}>
      <h2 style={{ margin: 0, fontSize: "clamp(17px,1.9vw,21px)", fontWeight: 600, letterSpacing: "-0.01em" }}>
        {t.askTitle}
      </h2>
      <p style={{ margin: "10px 0 20px", fontSize: 14, lineHeight: 1.65, color: "var(--c-70)", maxWidth: 560 }}>
        {t.askLead}
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10 }} noValidate>
        <label
          htmlFor="nl-unsub-email"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" }}
        >
          {t.askTitle}
        </label>
        <input
          id="nl-unsub-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tn.placeholder}
          required
          className="field"
          style={{ flex: "1 1 240px", minWidth: 200 }}
        />
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? t.askPending : t.askBtn}
          <span className="arrow">→</span>
        </button>
      </form>

      {erreur && (
        <p
          role="alert"
          style={{
            margin: "16px 0 0",
            border: "1px solid var(--red)",
            borderLeft: "3px solid var(--red)",
            background: "#fff1f1",
            color: "#a2191f",
            padding: "12px 14px",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {tn.erreurs[erreur]}
        </p>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/pick";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { db } from "@/lib/db";
import { estToken, masqueEmail } from "@/lib/newsletter/model";
import { empreinteJeton } from "@/lib/newsletter/liens";
import { PageHero } from "@/components/ui/PageHero";
import { ActionAbonnement, Panneau } from "@/components/newsletter/GestionAbonnement";

/**
 * Confirmation d'une inscription à la lettre d'information (double
 * confirmation), qu'il s'agisse d'une première inscription ou d'un retour.
 *
 * Cette page n'existe que pour une raison : aucune adresse n'entre sur la
 * liste parce que quelqu'un l'a tapée dans le formulaire public. Le lien qui
 * mène ici a été envoyé à l'adresse elle-même, et le clic sur le bouton est le
 * consentement (§4 du cahier des charges).
 *
 * Le jeton de l'URL est le jeton de CONFIRMATION, à usage unique et
 * périssable, retrouvé par son empreinte (cf.
 * `NewsletterSubscriber.confirmTokenHash`) ; ce n'est pas le jeton de gestion
 * qui sert au désabonnement.
 *
 * Elle ne propose aucun repli en cas de jeton absent ou périmé : une
 * inscription ne se demande pas depuis cette page, elle passe par le
 * formulaire du site, qui enverra un nouveau lien.
 */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = dict(asLang(params.lang)).nlp;

  return {
    title: t.confirmTitle,
    description: t.confirmLead,
    robots: { index: false, follow: false },
  };
}

async function corps(lang: Lang, token: string): Promise<ReactNode> {
  const t = dict(lang).nlp;

  if (!estToken(token)) {
    return <Panneau lang={lang} ton="erreur" titre={t.invalidTitle} texte={t.invalidText} />;
  }

  let abonne: { email: string; status: string; confirmExpiresAt: Date | null } | null;
  try {
    abonne = await db().newsletterSubscriber.findUnique({
      where: { confirmTokenHash: empreinteJeton(token) },
      select: { email: true, status: true, confirmExpiresAt: true },
    });
  } catch (error) {
    console.error("[newsletter] lecture d'un abonnement impossible", error);
    return <Panneau lang={lang} ton="erreur" titre={t.serverTitle} texte={t.serverText} />;
  }

  /* Jeton inconnu : déjà utilisé (l'empreinte est effacée au clic), remplacé
     par un envoi plus récent, ou tronqué. Le texte couvre les trois cas sans
     dire lequel : il n'y a rien à apprendre de plus à qui tient le lien. */
  if (!abonne) {
    return <Panneau lang={lang} ton="erreur" titre={t.invalidTitle} texte={t.confirmInvalidText} />;
  }

  if (abonne.status === "ACTIVE") {
    return <Panneau lang={lang} ton="neutre" titre={t.confirmAlreadyTitle} texte={t.confirmAlreadyText} />;
  }

  // Pré-contrôle d'affichage seulement : l'action revérifie l'échéance.
  if (!abonne.confirmExpiresAt || abonne.confirmExpiresAt <= new Date()) {
    return <Panneau lang={lang} ton="erreur" titre={t.expiredTitle} texte={t.expiredText} />;
  }

  return (
    <ActionAbonnement lang={lang} token={token} emailMasque={masqueEmail(abonne.email)} mode="confirmation" />
  );
}

export default async function NewsletterConfirmPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang).nlp;
  const token = typeof searchParams.t === "string" ? searchParams.t.trim() : "";

  return (
    <div>
      <PageHero crumb={<>UGPTN / {t.crumb}</>} title={t.confirmTitle} lead={t.confirmLead} />

      <section style={{ padding: "clamp(40px,5vw,72px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner" style={{ maxWidth: 780 }}>
          {await corps(lang, token)}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/pick";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { db } from "@/lib/db";
import { estToken, masqueEmail } from "@/lib/newsletter/model";
import { PageHero } from "@/components/ui/PageHero";
import { ActionAbonnement, Panneau } from "@/components/newsletter/GestionAbonnement";

/**
 * Confirmation d'une réinscription à la lettre d'information.
 *
 * Cette page n'existe que pour une raison : une adresse désabonnée ne revient
 * jamais sur la liste parce que quelqu'un l'a tapée dans le formulaire public.
 * Le lien qui mène ici a été envoyé à l'adresse elle-même, et le clic sur le
 * bouton est le consentement (§4 du cahier des charges).
 *
 * Elle ne propose aucun repli en cas de jeton absent : contrairement au
 * désabonnement, une réinscription ne se demande pas depuis une page publique,
 * elle passe par le formulaire du site.
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

  let abonne: { email: string; status: string } | null;
  try {
    abonne = await db().newsletterSubscriber.findUnique({
      where: { token },
      select: { email: true, status: true },
    });
  } catch (error) {
    console.error("[newsletter] lecture d'un abonnement impossible", error);
    return <Panneau lang={lang} ton="erreur" titre={t.serverTitle} texte={t.serverText} />;
  }

  if (!abonne) {
    return <Panneau lang={lang} ton="erreur" titre={t.invalidTitle} texte={t.invalidText} />;
  }

  if (abonne.status === "ACTIVE") {
    return <Panneau lang={lang} ton="neutre" titre={t.confirmAlreadyTitle} texte={t.confirmAlreadyText} />;
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

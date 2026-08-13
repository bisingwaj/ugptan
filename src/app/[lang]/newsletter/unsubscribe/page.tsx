import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/pick";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { db } from "@/lib/db";
import { estToken, masqueEmail } from "@/lib/newsletter/model";
import { PageHero } from "@/components/ui/PageHero";
import { ActionAbonnement, DemandeLien, Panneau } from "@/components/newsletter/GestionAbonnement";

/**
 * Page de désabonnement de la lettre d'information.
 *
 * Elle sert deux arrivées : depuis le lien d'un e-mail, jeton en main, et sans
 * jeton, pour qui a perdu le message. Dans les deux cas, RIEN n'est écrit par
 * le simple affichage de la page (cf. components/newsletter/GestionAbonnement).
 *
 * Le jeton est résolu ici, côté serveur, pour n'afficher un bouton d'action que
 * s'il correspond à un abonnement encore actif. L'action le revérifie : ce
 * pré-contrôle est un confort d'affichage, pas une autorisation.
 */
export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = dict(asLang(params.lang)).nlp;

  return {
    title: t.unsubTitle,
    description: t.unsubLead,
    // Page de service atteinte par un lien nominatif : elle n'a rien à faire
    // dans un index de moteur de recherche, et ne figure pas au sitemap.
    robots: { index: false, follow: false },
  };
}

/** Ce que la page affiche, selon ce que vaut le jeton reçu. */
async function corps(lang: Lang, token: string): Promise<ReactNode> {
  const t = dict(lang).nlp;

  // Aucun jeton dans l'URL : on propose l'envoi du lien par courriel, seul
  // chemin qui ne permette pas de désabonner l'adresse d'un tiers.
  if (!token) return <DemandeLien lang={lang} />;

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

  if (abonne.status === "UNSUBSCRIBED") {
    return <Panneau lang={lang} ton="neutre" titre={t.unsubAlreadyTitle} texte={t.unsubAlreadyText} />;
  }

  return (
    <ActionAbonnement lang={lang} token={token} emailMasque={masqueEmail(abonne.email)} mode="desabonnement" />
  );
}

export default async function NewsletterUnsubscribePage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang).nlp;
  const token = typeof searchParams.t === "string" ? searchParams.t.trim() : "";

  return (
    <div>
      <PageHero crumb={<>UGPTN / {t.crumb}</>} title={t.unsubTitle} lead={t.unsubLead} />

      <section style={{ padding: "clamp(40px,5vw,72px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner" style={{ maxWidth: 780 }}>
          {await corps(lang, token)}
        </div>
      </section>
    </div>
  );
}

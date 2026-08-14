import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { confidentialite } from "@/content/legal";
import { NAV } from "@/lib/routes";
import { LegalDocument } from "@/components/legal/LegalDocument";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const title = pick(confidentialite.titre, lang);
  const description = pick(confidentialite.chapeau, lang);
  const path = `/${lang}${NAV.confidentialite}`;
  return {
    title,
    description,
    openGraph: { title, description, url: path, type: "article" },
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.confidentialite}`, en: `/en${NAV.confidentialite}` },
    },
  };
}

export default async function ConfidentialitePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <LegalDocument doc={confidentialite} lang={asLang(params.lang)} />;
}

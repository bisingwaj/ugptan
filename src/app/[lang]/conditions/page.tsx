import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { conditions } from "@/content/legal";
import { NAV } from "@/lib/routes";
import { LegalDocument } from "@/components/legal/LegalDocument";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const title = pick(conditions.titre, lang);
  const description = pick(conditions.chapeau, lang);
  const path = `/${lang}${NAV.conditions}`;
  return {
    title,
    description,
    openGraph: { title, description, url: path, type: "article" },
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.conditions}`, en: `/en${NAV.conditions}` },
    },
  };
}

export default async function ConditionsPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <LegalDocument doc={conditions} lang={asLang(params.lang)} />;
}

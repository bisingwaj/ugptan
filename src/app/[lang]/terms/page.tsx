import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { conditions } from "@/content/legal";
import { NAV } from "@/lib/routes";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { metaPage } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  return metaPage({
    lang,
    path: NAV.conditions,
    title: pick(conditions.titre, lang),
    description: pick(conditions.chapeau, lang),
    type: "article",
  });
}

export default async function ConditionsPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <LegalDocument doc={conditions} lang={asLang(params.lang)} />;
}

import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { ConnexionClient } from "@/components/connexion/ConnexionClient";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).connexion.bidderSpace };
}

export default async function ConnexionPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <ConnexionClient lang={asLang(params.lang)} />;
}

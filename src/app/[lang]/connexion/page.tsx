import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { ConnexionClient } from "@/components/connexion/ConnexionClient";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).connexion.bidderSpace };
}

export default function ConnexionPage({ params }: { params: { lang: string } }) {
  return <ConnexionClient lang={asLang(params.lang)} />;
}

"use client";

/**
 * Liste des marchés dont `?avis=<référence>` déplie un avis au chargement.
 *
 * C'est par ce paramètre que reviennent les anciennes adresses publiques de
 * DigiProcure, redirigées ici : sans lui, un lien d'additif déjà diffusé
 * retomberait sur la liste et le candidat devrait chercher son avis. Il est lu
 * ici, sous `<Suspense>`, pour que la page Marchés reste prérendue
 * (cf. ./useParametre.ts) — une valeur répétée (`?avis=a&avis=b`) ouvre la
 * première, comme le faisait la page serveur.
 */
import { Suspense } from "react";
import type { Lang } from "@/lib/pick";
import type { Marche } from "@/content/types";
import { MarchesClient } from "@/components/marches/MarchesClient";
import { useParametre } from "./useParametre";

type Props = { lang: Lang; marches: Marche[] };

function AvecAvis(props: Props) {
  return <MarchesClient {...props} ouvrir={useParametre("avis")} />;
}

export function MarchesClientUrl(props: Props) {
  return (
    <Suspense fallback={<MarchesClient {...props} ouvrir={null} />}>
      <AvecAvis {...props} />
    </Suspense>
  );
}

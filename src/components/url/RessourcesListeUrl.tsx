"use client";

/**
 * Liste des rapports et analyses dont `?doc=<id>` ouvre la fiche au chargement.
 * Le paramètre est lu ici, sous `<Suspense>`, pour que la page reste prérendue
 * (cf. ./useParametre.ts).
 */
import { Suspense } from "react";
import type { Lang } from "@/lib/pick";
import type { DocVue } from "@/lib/docs/query";
import { RessourcesListe } from "@/components/docs/RessourcesListe";
import { useParametre } from "./useParametre";

type Props = { documents: DocVue[]; lang: Lang };

function AvecDoc(props: Props) {
  return <RessourcesListe {...props} ouvertParDefaut={useParametre("doc")} />;
}

export function RessourcesListeUrl(props: Props) {
  return (
    <Suspense fallback={<RessourcesListe {...props} ouvertParDefaut={null} />}>
      <AvecDoc {...props} />
    </Suspense>
  );
}

"use client";

/**
 * Mosaïque de la galerie dont `?media=<id>` ouvre la visionneuse au chargement.
 * Le paramètre est lu ici, sous `<Suspense>`, pour que les pages Galerie et
 * Album restent prérendues (cf. ./useParametre.ts).
 */
import { Suspense } from "react";
import type { Lang } from "@/lib/pick";
import type { GalerieVue } from "@/lib/galerie/query";
import { GalerieGrille } from "@/components/galerie/GalerieGrille";
import { useParametre } from "./useParametre";

type Props = { items: GalerieVue[]; lang: Lang };

function AvecMedia(props: Props) {
  return <GalerieGrille {...props} ouvertParDefaut={useParametre("media")} />;
}

export function GalerieGrilleUrl(props: Props) {
  return (
    <Suspense fallback={<GalerieGrille {...props} ouvertParDefaut={null} />}>
      <AvecMedia {...props} />
    </Suspense>
  );
}

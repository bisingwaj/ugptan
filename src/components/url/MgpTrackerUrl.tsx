"use client";

/**
 * Formulaire de suivi d'une plainte dont `?ref=<numéro>` lance la recherche.
 *
 * Numéro transmis par l'accusé de réception : la recherche part seule. Il est
 * lu ici, sous `<Suspense>`, pour que la page de suivi reste prérendue
 * (cf. ./useParametre.ts). La coupe à 60 caractères est celle que pratiquait
 * la page serveur.
 *
 * Placé hors de components/mgp, qui ne dépend pas de ce mécanisme : le suivi
 * reste utilisable tel quel avec un `initialRef` fourni autrement.
 */
import { Suspense } from "react";
import type { Lang } from "@/lib/pick";
import { MgpTracker } from "@/components/mgp/MgpTracker";
import { useParametre } from "./useParametre";

function AvecRef({ lang }: { lang: Lang }) {
  return <MgpTracker lang={lang} initialRef={useParametre("ref", 60) ?? ""} />;
}

export function MgpTrackerUrl({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<MgpTracker lang={lang} initialRef="" />}>
      <AvecRef lang={lang} />
    </Suspense>
  );
}

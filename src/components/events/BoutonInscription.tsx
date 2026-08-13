"use client";

/**
 * Bouton « S'inscrire » de la fiche d'un événement.
 *
 * Îlot client minimal posé dans une page serveur : il ne porte que l'état
 * « la modale est-elle ouverte ». Le formulaire lui-même est le composant
 * partagé avec la grille (cf. InscriptionModal), pour que la carte et la fiche
 * ouvrent exactement la même chose.
 *
 * La décision d'afficher ou non ce bouton n'est PAS prise ici : elle appartient
 * à la fiche, qui sait déjà si l'événement est passé ou si l'inscription se
 * fait sur un service externe (cf. EvenementVue).
 */
import { useState } from "react";
import { dict } from "@/content/i18n";
import type { EvtVue } from "@/lib/events/query";
import type { Lang } from "@/lib/pick";
import { InscriptionModal } from "@/components/events/InscriptionModal";

export function BoutonInscription({ evt, lang }: { evt: EvtVue; lang: Lang }) {
  const t = dict(lang).evt;
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button type="button" className="btn btn--primary" onClick={() => setOuvert(true)}>
        {t.register}<span className="arrow">→</span>
      </button>

      {ouvert && <InscriptionModal evt={evt} lang={lang} onClose={() => setOuvert(false)} />}
    </>
  );
}

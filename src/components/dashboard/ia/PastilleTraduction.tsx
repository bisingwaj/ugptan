/**
 * L'état d'assistance d'une langue, en trois mots.
 *
 * Se pose à côté de l'état de traduction existant (« traduit », « incomplet »,
 * « à traduire ») dans les onglets et les cartes. Les deux ne disent pas la
 * même chose et ne se remplacent pas : l'un dit si la langue EXISTE, l'autre
 * d'où elle VIENT et si quelqu'un l'a lue.
 *
 * Ne rend rien pour une langue relue : une version validée par une personne est
 * l'état normal du site, et ne mérite pas de signalement. La pastille ne
 * s'allume donc que là où il reste quelque chose à faire.
 */
import { STATUT_COURT, tonDe, type EtatVue } from "@/lib/ia/statut";

const CLASSE: Record<string, string> = {
  attente: "adm-ia-pastille",
  cours: "adm-ia-pastille adm-ia-pastille--cours",
  relire: "adm-ia-pastille adm-ia-pastille--relire",
  echec: "adm-ia-pastille adm-ia-pastille--echec",
};

export function PastilleTraduction({ etat }: { etat: EtatVue | undefined }) {
  if (!etat || etat.statut === "RELUE") return null;

  const ton = tonDe(etat.statut, etat.interrompue);
  const libelle =
    etat.statut === "EN_COURS" && etat.interrompue ? "IA · à reprendre" : STATUT_COURT[etat.statut];

  return (
    <span
      className={CLASSE[ton] ?? "adm-ia-pastille"}
      title={
        etat.statut === "GENEREE"
          ? `Composée depuis le ${etat.sourceLocale.toUpperCase()}${etat.modele ? ` par ${etat.modele}` : ""}. Aucune relecture enregistrée.`
          : (etat.erreur ?? undefined)
      }
    >
      {libelle}
    </span>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { cloudinaryActif } from "@/lib/cloudinary";
import { ensureRubriquesGalerie } from "@/lib/galerie/bootstrap";
import { chargerReferentielsGalerie, galerieVierge } from "@/lib/galerie/edition";
import { isGalType } from "@/lib/galerie/statut";
import { GalerieAjout } from "@/components/dashboard/galerie/GalerieAjout";

export const metadata: Metadata = { title: ADMIN_GALERIE.nouvellePhoto };

type Recherche = { type?: string; album?: string };

/**
 * Écran d'ajout, paramétré par la NATURE du contenu.
 *
 * Le type arrive par l'URL et non par un sélecteur du formulaire : les deux
 * écrans ne demandent pas la même chose — une photographie exige son image, une
 * vidéo exige une source de lecture — et un sélecteur au milieu du formulaire
 * ferait changer les champs sous les doigts de la personne qui saisit.
 */
export default async function NouveauContenuGaleriePage(props: {
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("videos");
  await ensureRubriquesGalerie();

  const params = await props.searchParams;
  const type = params.type && isGalType(params.type) ? params.type : "PHOTO";
  const t = ADMIN_GALERIE;

  const referentiels = await chargerReferentielsGalerie();

  /* Album pré-sélectionné quand on arrive depuis sa fiche. Vérifié contre la
     liste réelle : un identifiant inventé dans l'URL doit retomber sur « hors
     album » plutôt que d'être posé tel quel dans le formulaire. */
  const albumId = referentiels.albums.some((album) => album.id === params.album)
    ? (params.album as string)
    : "";

  return (
    <>
      <Link href={adminPath("/gallery")} className="adm-back">← {t.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>
        {type === "VIDEO" ? t.nouvelleVideo : t.nouvellePhoto}
      </h1>
      <p className="adm__lead">
        {type === "VIDEO"
          ? "Le film peut venir de trois endroits : un fichier téléversé ici, une adresse de fichier déjà déposé sur le compte Cloudinary du Projet, ou la chaîne YouTube. Le contenu est créé masqué : vous pourrez vérifier la lecture avant de le montrer."
          : "L'image part sur le stockage du projet ; la base n'enregistre que son adresse et les informations que vous saisissez ici. Le contenu est créé masqué : vous pourrez vérifier le rendu avant de le montrer."}
      </p>

      <div style={{ marginTop: 26 }}>
        {/* Lu côté serveur : les identifiants de stockage n'ont rien à faire
            dans le navigateur, seule leur PRÉSENCE y est utile. */}
        <GalerieAjout
          item={galerieVierge(type, albumId)}
          referentiels={referentiels}
          stockageActif={cloudinaryActif()}
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { cloudinaryActif } from "@/lib/cloudinary";
import { NAV } from "@/lib/routes";
import { chargerGalerieItem, chargerReferentielsGalerie } from "@/lib/galerie/edition";
import { GAL_STATUT_LABEL, GAL_TYPE_LABEL } from "@/lib/galerie/statut";
import { GalerieActions } from "@/components/dashboard/galerie/GalerieActions";
import { GalerieEditeur } from "@/components/dashboard/galerie/GalerieEditeur";
import { GalerieVideo } from "@/components/dashboard/galerie/GalerieVideo";
import { GalerieVisuel } from "@/components/dashboard/galerie/GalerieVisuel";

export const metadata: Metadata = { title: ADMIN_GALERIE.modifier };

type Recherche = { ajoute?: string };

export default async function ModifierContenuGaleriePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("videos");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_GALERIE;

  const [item, referentiels] = await Promise.all([
    chargerGalerieItem(id),
    chargerReferentielsGalerie(),
  ]);
  if (!item) notFound();

  const visible = item.status === "PUBLISHED";
  const video = item.type === "VIDEO";
  const rubriqueNom =
    referentiels.categories.find((rubrique) => rubrique.id === item.categoryId)?.nom ?? null;

  /**
   * Lien vers la galerie publique.
   *
   * Il n'existe que si le contenu est visible : un lien mort sur une entrée
   * masquée donnerait à croire qu'elle est déjà servie. Le paramètre `media`
   * ouvre la visionneuse directement sur ce contenu — la galerie n'a pas de page
   * par média, sa fiche est un panneau (cf. components/galerie/GalerieGrille.tsx).
   */
  const publicUrl = visible ? `/fr${NAV.galerie}?media=${item.id}` : null;

  return (
    <>
      <Link href={adminPath("/gallery")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{item.titreFr || "(sans titre)"}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${visible ? "published" : "draft"}`}>
              {GAL_STATUT_LABEL[item.status]}
            </span>

            <span className="adm-badge adm-badge--info">{GAL_TYPE_LABEL[item.type].fr}</span>

            {item.lieu && <span className="adm-hint">{item.lieu}</span>}
            {rubriqueNom && <span className="adm-hint">{rubriqueNom}</span>}
            {item.majLe && <span className="mono adm-hint">Modifié le {item.majLe}</span>}

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                Voir sur le site ↗
              </a>
            )}
          </div>
        </div>

        <GalerieActions id={item.id} visible={visible} />
      </div>

      {params.ajoute && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.ajouteOk}</div>}

      {/* Le visuel et la source vidéo ont chacun leur formulaire, posés AVANT
          celui de la fiche : deux `<form>` ne peuvent pas s'imbriquer, et
          remplacer une image n'a rien à voir avec l'enregistrement d'une
          légende (cf. actions/admin-galerie.ts). */}
      <div style={{ marginTop: 26 }}>
        <GalerieVisuel
          id={item.id}
          visuel={item.visuel}
          alt={item.altFr || item.titreFr}
          vignette={video}
          stockageActif={cloudinaryActif()}
        />
      </div>

      {video && (
        <div style={{ marginTop: 18 }}>
          <GalerieVideo id={item.id} video={item.video} stockageActif={cloudinaryActif()} />
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <GalerieEditeur item={item} referentiels={referentiels} publicUrl={publicUrl} />
      </div>
    </>
  );
}

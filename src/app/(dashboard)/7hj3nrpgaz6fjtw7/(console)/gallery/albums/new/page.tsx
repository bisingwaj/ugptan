import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureRubriquesGalerie } from "@/lib/galerie/bootstrap";
import { albumVierge, chargerReferentielsGalerie } from "@/lib/galerie/edition";
import { AlbumEditeur } from "@/components/dashboard/galerie/AlbumEditeur";

export const metadata: Metadata = { title: ADMIN_GALERIE.albumNouveau };

export default async function NouvelAlbumPage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("videos");
  await ensureRubriquesGalerie();

  const t = ADMIN_GALERIE;
  const referentiels = await chargerReferentielsGalerie();

  return (
    <>
      <Link href={adminPath("/gallery/albums")} className="adm-back">← {t.albumRetour}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{t.albumNouveau}</h1>
      <p className="adm__lead">
        Un album rassemble les photos et les vidéos d&apos;un même événement, et lui donne sa propre page sur
        le site. Nommez-le d&apos;abord : vous y verserez les contenus depuis sa fiche, où un versement en série
        permet d&apos;envoyer plusieurs photos d&apos;un coup.
      </p>

      <div style={{ marginTop: 26 }}>
        <AlbumEditeur album={albumVierge()} referentiels={referentiels} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { ADMIN_ACTUS } from "@/content/admin";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/lib/admin";
import { MediaLibrary, type MediaAvecUsage } from "@/components/dashboard/actus/MediaLibrary";

export const metadata: Metadata = { title: ADMIN_ACTUS.mediasTitle };

export default async function MediasPage() {
  // Deux permissions ouvrent cet écran : le module « Médias », et celui des
  // actualités — un rédacteur doit pouvoir gérer les visuels de ses articles.
  // Le garde du layout ne suffit pas : layouts et pages rendent en parallèle.
  const user = await requireAdmin();
  if (!can(user, "medias") && !can(user, "actualites")) redirect(ADMIN_HOME);

  const medias = await db().mediaAsset.findMany({
    // ⚠️ `data` exclu : la colonne porte le binaire des fichiers téléversés.
    select: {
      id: true, filename: true, mimeType: true, size: true,
      width: true, height: true, url: true, altFr: true, altEn: true, legende: true,
      _count: { select: { couvertures: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const liste: MediaAvecUsage[] = medias.map(({ _count, ...media }) => ({
    ...media,
    usage: _count.couvertures,
  }));

  return (
    <>
      <h1 className="adm__title">{ADMIN_ACTUS.mediasTitle}</h1>
      <p className="adm__lead">{ADMIN_ACTUS.mediasLead}</p>

      <div style={{ marginTop: 26 }}>
        <MediaLibrary medias={liste} />
      </div>
    </>
  );
}

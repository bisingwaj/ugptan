"use client";

/* Grille de témoignages — l'ancien `components/home/Histoires.tsx`, désormais
   alimenté par le CMS plutôt que par `content/carbon.ts`.

   Composant CLIENT, et il doit le rester : le portrait ouvre la vidéo dans la
   lightbox du site (`useVideo`), ce qui suppose un gestionnaire d'événement.

   Le balisage est repris à l'identique — `grid-auto`, vignette `duo` en 4/3
   teintée par `--duo`, pastille de lecture en bas à gauche, puis nom, rôle en
   mono coloré et citation qui pousse la carte à hauteur égale.

   ⚠️ Une entrée sans vidéo ne doit pas afficher de bouton : un ▶ qui n'ouvre
   rien est pire qu'une image muette. La carte devient alors une simple
   vignette, et le reste du dessin ne bouge pas. */
import type { Lang } from "@/lib/pick";
import type { ImpactItemVue } from "@/lib/impact/query";
import { lienPublic } from "@/lib/routes";
import { Photo } from "@/components/ui/Photo";
import { useVideo } from "@/components/video/VideoProvider";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocTemoignages({
  items,
  lang,
  watchLabel,
}: {
  items: ImpactItemVue[];
  lang: Lang;
  /** « Voir le témoignage » (cf. t.home.watchStory). */
  watchLabel: string;
}) {
  const openVideo = useVideo();

  return (
    <RevealGroup className="grid-auto" gap={0.045}>
      {items.map((item) => {
        const accent = item.color ?? "var(--ac)";
        const visuel = (
          <>
            <Photo
              src={item.visuel?.src ?? ""}
              alt={item.visuel?.alt ?? item.titre ?? ""}
              unoptimized={item.visuel?.unoptimized}
            />
            {item.videoYt && (
              <span
                style={{
                  position: "absolute", left: 14, bottom: 14, display: "inline-flex",
                  alignItems: "center", gap: 9, color: "#fff", fontSize: 12.5, fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 34, height: 34, background: "rgba(255,255,255,.92)", color: "var(--c-black)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, paddingLeft: 2,
                  }}
                >
                  ▶
                </span>
                {watchLabel}
              </span>
            )}
          </>
        );

        return (
          <RevealItem
            key={item.id}
            style={{
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              ...(item.featured ? { boxShadow: `inset 0 3px 0 ${accent}` } : {}),
            }}
          >
            {item.videoYt ? (
              <button
                onClick={() => openVideo(item.videoYt ?? undefined, {
                  titre: item.titre ?? undefined,
                  source: item.surtitre ?? undefined,
                })}
                className="duo"
                data-video-slot={`Témoignage — ${item.titre ?? ""}`}
                data-slot-ratio="16:9"
                style={{ aspectRatio: "4/3", display: "block", width: "100%", padding: 0, ["--duo" as string]: accent }}
              >
                {visuel}
              </button>
            ) : (
              <div className="duo" style={{ aspectRatio: "4/3", width: "100%", ["--duo" as string]: accent }}>
                {visuel}
              </div>
            )}

            <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
              {item.titre && <div style={{ fontSize: 16.5, fontWeight: 600 }}>{item.titre}</div>}
              {item.surtitre && (
                <div className="mono" style={{ fontSize: 11.5, color: accent, marginTop: 5 }}>{item.surtitre}</div>
              )}
              {item.texte && (
                <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--c-80)", flex: 1 }}>
                  {item.texte}
                </p>
              )}
              {item.lienUrl && item.lienLabel && (
                <a
                  href={lienPublic(item.lienUrl, lang)}
                  className="mono"
                  style={{ marginTop: 16, fontSize: 12, color: accent, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {item.lienLabel} →
                </a>
              )}
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

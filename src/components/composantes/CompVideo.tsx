/* Emplacement « vidéo de présentation » d'une composante (16:9, pleine largeur).
   Trois états possibles, jamais de zone vide :
   • vidéo fournie (video.yt ou video.src) → affiche + bouton de lecture (lightbox) ;
   • vidéo non fournie → état « à venir » assumé, avec le format attendu ;
   • pas d'emplacement déclaré → le composant ne rend rien. */
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { media } from "@/content/media";
import type { CompVideoSlot } from "@/content/types";
import { Photo } from "@/components/ui/Photo";
import { VideoButton } from "@/components/video/VideoButton";
import { Reveal } from "@/components/motion/Reveal";

export function CompVideo({ video, code, lang }: { video?: CompVideoSlot; code: string; lang: Lang }) {
  if (!video) return null;
  const t = dict(lang).comp;
  const src = video.src || video.yt;
  const titre = pick(video.titre, lang);

  return (
    <section className="section section--sm" id="video" data-anchor>
      <div className="section__inner">
        <Reveal>
          <div className="comp-video" style={{ ["--duo" as string]: "var(--comp)" }}>
            <div className="duo comp-video__stage">
              <Photo
                src={media.img[video.poster]}
                alt={titre}
                sizes="(max-width: 760px) 100vw, 1200px"
              />
              <div className="comp-video__overlay">
                <div className="mono comp-video__label">
                  {code} · {t.videoLabel}
                  {video.duree ? ` · ${video.duree}` : ""}
                </div>
                <div className="comp-video__title">{titre}</div>

                {src ? (
                  <VideoButton
                    id={src}
                    className="btn btn--primary comp-video__btn"
                    meta={{ titre, source: `UGPTN · ${code}` }}
                    dataSlot={`Vidéo de présentation — ${code}`}
                    dataRatio="16:9"
                  >
                    <span className="comp-video__play" aria-hidden>▶</span>
                    {t.videoPlay}
                  </VideoButton>
                ) : (
                  <div className="comp-video__soon">
                    <span className="mono comp-video__soon-badge">{t.videoSoon}</span>
                    <p className="comp-video__soon-note">{t.videoSoonNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

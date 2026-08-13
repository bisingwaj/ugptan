/* Carte d'actualité — reprise fidèle du visuel d'origine (vignette duotone,
   pastille de catégorie, ligne mono date · lieu, titre, appel de lecture), avec
   deux changements : c'est désormais un LIEN vers une page d'article, et non un
   bouton ouvrant un tiroir, et l'extrait y apparaît.

   Composant serveur : rien à hydrater, la carte n'a aucun état. */
import Link from "next/link";
import type { ActuVue } from "@/lib/actus/query";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import { Photo } from "@/components/ui/Photo";

export const cheminArticle = (lang: Lang, slug: string) => `${route(lang, NAV.actualites)}/${slug}`;

export function ActuCard({ actu, lang, priority = false }: { actu: ActuVue; lang: Lang; priority?: boolean }) {
  const t = dict(lang).actus;
  const accent = actu.categorie?.color ?? "var(--ac)";

  return (
    <Link
      href={cheminArticle(lang, actu.slug)}
      className="actu-card"
      style={{ background: "#fff", display: "flex", flexDirection: "column", width: "100%" }}
    >
      <div className="duo" style={{ aspectRatio: "16/9" }}>
        <Photo src={actu.visuel.src} alt={actu.visuel.alt} priority={priority} unoptimized={actu.visuel.unoptimized} />
        {actu.categorie && (
          <span
            className="mono"
            style={{
              position: "absolute", top: 12, left: 12, fontSize: 10.5, color: "#fff",
              background: accent, padding: "5px 10px", textTransform: "uppercase", letterSpacing: "0.04em",
            }}
          >
            {actu.categorie.nom}
          </span>
        )}
        {actu.featured && (
          <span
            className="mono"
            style={{
              position: "absolute", top: 12, right: 12, fontSize: 10.5, color: "#fff",
              border: "1px solid rgba(255,255,255,.55)", padding: "4px 9px",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}
          >
            {t.aLaUne}
          </span>
        )}
      </div>

      <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>
          {actu.dateLabel}{actu.lieu ? ` · ${actu.lieu}` : ""}
        </div>

        <h3 style={{ margin: "12px 0 0", fontSize: 17.5, fontWeight: 600, lineHeight: 1.32 }}>{actu.title}</h3>

        {actu.excerpt && (
          <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--c-70)", flex: 1 }}>
            {actu.excerpt}
          </p>
        )}

        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18,
            fontSize: 13, fontWeight: 600, color: "var(--ac)",
          }}
        >
          {t.readArticle} →
        </span>
      </div>
    </Link>
  );
}

/* En-tête de la grille d'équipe — page « L'UGPTN ».

   Balisage repris de `app/[lang]/ugptn/page.tsx` : le titre à gauche, le chapô
   et le compte de fiches à droite, puis la grille.

   L'en-tête est dessiné ICI et non par le rendu commun, parce qu'il ne coiffe
   pas la grille : il se partage en deux colonnes, et le chapô y est un texte
   secondaire aligné en bas, pas un chapeau de section.

   Les fiches viennent du module « L'équipe » — elles ne se saisissent pas dans
   cette section. Le compte affiché est celui des fiches PUBLIÉES, ce qu'il est
   réellement : le titre annonçait autrefois « 21 rôles » en dur, au-dessus
   d'une grille qui n'en montrait pas autant. */
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { membresEquipe } from "@/lib/equipe/query";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { GrilleEquipe } from "@/components/equipe/GrilleEquipe";

export async function BlocEquipe({
  kicker,
  titre,
  lead,
  lang,
}: {
  kicker: string | null;
  titre: string | null;
  lead: string | null;
  lang: Lang;
}) {
  const t = dict(lang);
  const membres = await membresEquipe(lang);

  return (
    <>
      <Reveal
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          marginBottom: 42,
        }}
      >
        <div>
          {kicker && <Kicker>{kicker}</Kicker>}
          {titre && <h2 className="h2--sm">{titre}</h2>}
        </div>
        <div style={{ maxWidth: 360 }}>
          {lead && (
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--c-60)", margin: 0 }}>{lead}</p>
          )}
          {membres.length > 0 && (
            <div className="mono" style={{ marginTop: 10, fontSize: 12, color: "var(--ac)" }}>
              {membres.length} {t.ugptn.membres}
            </div>
          )}
        </div>
      </Reveal>
      <GrilleEquipe membres={membres} variante="unite" />
    </>
  );
}

/* Contexte à deux colonnes — l'ouverture de la page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : le texte et ses chiffres
   à gauche, un aplat au format 4/3 à droite, le tout dans un `section__inner`
   qui porte `cols2 cols2--center`.

   ⚠️ Ce gabarit dessine SA PROPRE section : l'en-tête n'est pas au-dessus de la
   grille mais dans la colonne de gauche, et le conteneur interne porte des
   classes que le rendu commun ne connaît pas.

   L'aplat portait un badge « C1 » qui n'était cliquable nulle part et
   n'annonçait rien de ce que la section dit. Il ne reste que sa légende, qui
   était jusqu'ici le seul texte de la page écrit hors du dictionnaire. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocContexte({
  kicker,
  titre,
  lead,
  note,
  items,
}: {
  kicker: string | null;
  titre: string | null;
  lead: string | null;
  note: string | null;
  items: ImpactItemVue[];
}) {
  return (
    <section className="section">
      <div className="section__inner cols2 cols2--center">
        <div>
          <Reveal>
            {kicker && <Kicker>{kicker}</Kicker>}
            {titre && <h2 className="h2--sm">{titre}</h2>}
            {lead && (
              <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--c-70)" }}>
                {lead}
              </p>
            )}
          </Reveal>

          {items.length > 0 && (
            <RevealGroup className="grid-3" style={{ marginTop: 34 }} gap={0.05}>
              {items.map((item) => (
                <RevealItem key={item.id} className="cell" style={{ padding: "18px 16px" }}>
                  <div className="mono" style={{ fontWeight: 600, fontSize: 26 }}>
                    {item.valeur}
                    {item.surtitre && (
                      <span style={{ fontSize: 12, color: item.color ?? "var(--ac)", marginLeft: 3 }}>
                        {item.surtitre}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--c-60)", marginTop: 8, lineHeight: 1.4 }}>
                    {item.texte}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>

        <div
          style={{
            aspectRatio: "4/3",
            background: "linear-gradient(140deg, #0a1330 0%, #16315f 55%, #0f62fe 130%)",
            border: "1px solid var(--c-20)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-end",
            padding: 22,
          }}
        >
          {note && (
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.9)",
                lineHeight: 1.5,
              }}
            >
              {note}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

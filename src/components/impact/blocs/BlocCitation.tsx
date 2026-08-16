/* Citation en bandeau — l'engagement qui ouvre la page « L'UGPTN ».

   Le balisage reproduit exactement celui qui vivait dans `app/[lang]/ugptn/
   page.tsx` : bande `.section--accent` à son propre rembourrage, citation en
   graisse 300 sur une échelle fluide, puis une ligne mono de références.

   ⚠️ Ce gabarit dessine SA PROPRE bande et ignore le fond choisi sur la fiche :
   la citation est en accent, c'est ce qui la distingue du reste de la page. Le
   réglage de fond reste sans effet ici, et la console le dit.

   Les guillemets sont posés par le dessin, non par le texte : la rédaction
   saisit la phrase seule, comme dans le contenu d'origine. */
import { Reveal } from "@/components/motion/Reveal";

export function BlocCitation({ citation, note }: { citation: string | null; note: string | null }) {
  if (!citation) return null;

  /* Les segments de références se séparent au point médian, tel qu'il est
     saisi : le dessin d'origine posait entre eux un point atténué et un
     espacement propre, que reproduit la boucle ci-dessous. */
  const segments = (note ?? "")
    .split("·")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  return (
    <section className="section--accent" style={{ padding: "clamp(56px,7vw,104px) var(--pad-x)" }}>
      <Reveal variant="up" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(22px,3vw,38px)",
            lineHeight: 1.35,
            letterSpacing: "-0.02em",
            fontWeight: 300,
          }}
        >
          « {citation} »
        </p>
        {segments.length > 0 && (
          <div
            className="mono"
            style={{
              marginTop: 32,
              display: "flex",
              flexWrap: "wrap",
              gap: "14px 32px",
              fontSize: 12.5,
              color: "var(--ac-line)",
            }}
          >
            {segments.map((segment, index) => (
              <span key={segment} style={{ display: "contents" }}>
                {index > 0 && <span style={{ opacity: 0.6 }}>·</span>}
                <span>{segment}</span>
              </span>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

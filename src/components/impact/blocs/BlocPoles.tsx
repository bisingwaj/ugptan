/* Organigramme — les pôles de l'arrêté, page « L'UGPTN ».

   Balisage repris de `app/[lang]/ugptn/page.tsx` : une ligne par pôle, liseré
   gauche à sa couleur, le nom et ce dont il répond à gauche, ses sous-rôles et
   son dossier en cours à droite.

   ⚠️ Ces pôles ne sont PAS ceux du module « L'équipe ». L'arrêté ministériel en
   compte cinq ; le classement des fiches en distingue neuf, plus fin, parce
   qu'il sert à ranger des personnes et non à décrire une structure. Les deux
   listes sont tenues séparément, à dessein : les confondre obligerait à trancher
   ici un arbitrage qui appartient à l'Unité.

   Le compte de sous-rôles affiché est celui des pastilles réellement saisies,
   pôle par pôle. La page n'avance aucun total général, et n'a pas à en avancer :
   l'Unité compte vingt et un rôles, dix-neuf sont renseignés à ce jour, et les
   deux manquants s'ajouteront depuis la console. Un total écrit en dur aurait
   annoncé vingt et un au-dessus d'une liste qui en montre dix-neuf ; un total
   calculé se corrige tout seul le jour où les fiches arrivent. */
import type { ImpactItemVue } from "@/lib/impact/query";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocPoles({ items, lang }: { items: ImpactItemVue[]; lang: Lang }) {
  const t = dict(lang);

  return (
    <RevealGroup className="poles" gap={0.045}>
      {items.map((item) => (
        <RevealItem
          key={item.id}
          className="pole-row"
          style={{ borderLeft: `3px solid ${item.color ?? "var(--ac)"}` }}
        >
          <div>
            {item.titre && <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{item.titre}</h3>}
            {item.surtitre && (
              <div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 6, lineHeight: 1.4 }}>
                {item.surtitre}
              </div>
            )}
            {item.texte && <p className="pole-row__mission">{item.texte}</p>}
            {item.tags.length > 0 && (
              <div className="mono" style={{ fontSize: 11, color: "var(--ac)", marginTop: 12 }}>
                {item.tags.length} {t.words.roles}
              </div>
            )}
          </div>

          <div>
            {item.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12.5,
                      color: "var(--c-80)",
                      background: "var(--c-10)",
                      border: "1px solid var(--c-20)",
                      padding: "6px 11px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {item.texteSecondaire && (
              <div className="pole-row__dossier">
                <span className="blink" style={{ background: item.color ?? "var(--ac)" }} />
                <span>
                  <span className="mono pole-row__k">{t.ugptn.orgEnCours}</span>
                  {item.texteSecondaire}
                </span>
              </div>
            )}
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

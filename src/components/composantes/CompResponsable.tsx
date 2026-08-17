/* Profil du responsable de la composante. Sans nom publié, on affiche l'intitulé
   du poste avec une pastille d'initiales — même traitement que la grille d'équipe.

   La fiche provient du module « L'équipe de l'Unité » (cf. src/lib/equipe/query.ts),
   et non plus de `content/composantes-detail.ts` : c'est la MÊME personne que
   celle de la grille de l'accueil, elle n'a donc plus lieu d'être saisie ici une
   seconde fois. Le dessin, lui, est repris à l'identique. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { contact } from "@/content/carbon";
import type { MembreEquipe } from "@/lib/equipe/query";
import type { ComposanteVue } from "@/lib/projet/query";
import { NAV, route } from "@/lib/routes";
import { initials } from "@/lib/format";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";

export function CompResponsable({
  membre,
  comp,
  lang,
}: {
  membre?: MembreEquipe | null;
  comp: ComposanteVue;
  lang: Lang;
}) {
  if (!membre) return null;
  const t = dict(lang).comp;
  const mail = membre.email || contact.email;
  const photo = membre.portrait.src;

  return (
    <section className="section section--grey" id="responsable" data-anchor>
      <div className="section__inner">
        <Reveal>
          <Kicker>{t.secResponsable}</Kicker>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="comp-resp">
            <div className="comp-resp__media">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={membre.portrait.alt} loading="lazy" decoding="async" />
              ) : (
                <span className="mono comp-resp__initials">{initials(membre.nom || membre.role)}</span>
              )}
            </div>

            <div className="comp-resp__body">
              <div className="mono comp-resp__code">{comp.code}</div>
              {membre.nom ? (
                <h3 className="comp-resp__nom">{membre.nom}</h3>
              ) : (
                <h3 className="comp-resp__nom comp-resp__nom--vacant">{t.respSoon}</h3>
              )}
              <div className="comp-resp__role">{membre.role}</div>

              {membre.bio && <p className="comp-resp__bio">{membre.bio}</p>}

              {membre.verbatim && (
                <blockquote className="comp-resp__verbatim">« {membre.verbatim} »</blockquote>
              )}

              {comp.sous.length > 0 && (
                <div className="comp-resp__perimetre">
                  <div className="mono label-mono" style={{ marginBottom: 10 }}>{t.respPerimetre}</div>
                  <ul>
                    {comp.sous.map((s) => (
                      <li key={s.id}>
                        {s.reference && <span className="mono">{s.reference}</span>} {s.titre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="comp-resp__actions">
                <Link href={route(lang, NAV.contact)} className="btn btn--primary btn--sm">
                  {t.respContact} <span className="arrow">→</span>
                </Link>
                <a href={`mailto:${mail}`} className="mono comp-resp__mail">{mail}</a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

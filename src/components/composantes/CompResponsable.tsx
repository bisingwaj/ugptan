/* Profil du responsable de la composante. Sans nom publié, on affiche l'intitulé
   du poste avec une pastille d'initiales — même traitement que la grille d'équipe. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { contact } from "@/content/carbon";
import type { Composante, CompResponsable as Resp } from "@/content/types";
import { NAV, route } from "@/lib/routes";
import { initials } from "@/lib/format";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";

export function CompResponsable({
  resp,
  comp,
  lang,
}: {
  resp?: Resp;
  comp: Composante;
  lang: Lang;
}) {
  if (!resp) return null;
  const t = dict(lang).comp;
  const role = pick(resp.role, lang);
  const mail = resp.email || contact.email;

  return (
    <section className="section section--grey" id="responsable" data-anchor>
      <div className="section__inner">
        <Reveal>
          <Kicker>{t.secResponsable}</Kicker>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="comp-resp">
            <div className="comp-resp__media">
              {resp.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resp.img} alt={resp.nom ? `${resp.nom} — ${role}` : role} loading="lazy" decoding="async" />
              ) : (
                <span className="mono comp-resp__initials">{initials(resp.nom || role)}</span>
              )}
            </div>

            <div className="comp-resp__body">
              <div className="mono comp-resp__code">{comp.code}</div>
              {resp.nom ? (
                <h3 className="comp-resp__nom">{resp.nom}</h3>
              ) : (
                <h3 className="comp-resp__nom comp-resp__nom--vacant">{t.respSoon}</h3>
              )}
              <div className="comp-resp__role">{role}</div>

              {resp.bio && <p className="comp-resp__bio">{pick(resp.bio, lang)}</p>}

              {resp.verbatim && (
                <blockquote className="comp-resp__verbatim">« {pick(resp.verbatim, lang)} »</blockquote>
              )}

              {comp.sous.length > 0 && (
                <div className="comp-resp__perimetre">
                  <div className="mono label-mono" style={{ marginBottom: 10 }}>{t.respPerimetre}</div>
                  <ul>
                    {comp.sous.map((s) => (
                      <li key={s.ref}>
                        <span className="mono">{s.ref}</span> {pick(s.text, lang)}
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

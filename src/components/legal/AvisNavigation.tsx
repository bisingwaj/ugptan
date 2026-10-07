/* Avis d'utilisation — bandeau bas de page, première visite (partie serveur).

   Deux régimes distincts, que l'avis ne doit pas confondre. Le Code du
   numérique s'applique du seul fait de l'accès : aucun clic ne le déclenche ni
   ne l'écarte. Les conditions d'utilisation, elles, s'acceptent, et l'article
   « Objet et acceptation » dit que cette acceptation résulte de l'accès. Le
   bouton ne crée donc pas l'acceptation, il la constate et la date côté
   visiteur, pour ne pas reposer la question à chaque page.

   Pourquoi un composant serveur en tête : l'avis est monté sur TOUTES les
   pages. Importer `@/content/i18n` et `@/content/legal` depuis le composant
   client faisait partir ces deux dictionnaires complets (FR + EN, plus de
   160 Ko de source) dans le JavaScript commun du site. Ici, on n'en extrait
   que les quelques chaînes du bandeau, dans la langue courante, et seules
   elles traversent la frontière client.

   Pourquoi un bandeau et plus un encart : l'encart (titre, deux paragraphes,
   trois actions) mesurait près de 600 px de haut sur téléphone, soit l'écran
   entier, et la moitié du héros sur ordinateur. L'avis informe, il ne
   conditionne rien : deux lignes et une action suffisent, le texte complet
   reste à un clic, dans les conditions d'utilisation. */
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { avisNavigation } from "@/content/legal";
import { NAV, route } from "@/lib/routes";
import { AvisBandeau, type LibellesAvis } from "./AvisBandeau";

/* Texte court du bandeau. La seconde phrase est celle de l'article « Objet et
   acceptation » des conditions d'utilisation, reprise mot pour mot comme dans
   `avisNavigation.corps` : un avis qui annonce autre chose que ce que dit le
   texte qu'il fait accepter n'a aucune valeur. Le lien porte les derniers mots,
   pour que la phrase se lise d'un trait avec ou sans lecteur d'écran.
   À terme, ces chaînes ont leur place dans `avisNavigation` (src/content/legal.ts). */
const RESUME = {
  avant: {
    fr: "Ce site est régi par le droit congolais, notamment par le Code du numérique. L'accès au site et l'usage de ses services valent acceptation pleine et sans réserve des ",
    en: "This site is governed by Congolese law, in particular by the Digital Code. Accessing the site and using its services constitute full and unreserved acceptance of the ",
  },
  lien: { fr: "conditions d'utilisation", en: "terms of use" },
  apres: { fr: ".", en: "." },
  compris: { fr: "J'ai compris", en: "Got it" },
};

export function AvisNavigation({ lang }: { lang: Lang }) {
  const libelles: LibellesAvis = {
    region: pick(avisNavigation.kicker, lang),
    avant: pick(RESUME.avant, lang),
    lien: pick(RESUME.lien, lang),
    apres: pick(RESUME.apres, lang),
    compris: pick(RESUME.compris, lang),
    refuser: pick(avisNavigation.refuser, lang),
    refuserAide: pick(avisNavigation.refuserAide, lang),
  };
  return <AvisBandeau libelles={libelles} hrefConditions={route(lang, NAV.conditions)} />;
}

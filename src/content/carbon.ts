/* ============================================================================
   Contenu spécifique à la direction « Carbon » — désormais migré ici depuis le
   renderVals() codé en dur (cf. guide §6/§8 : une seule source de vérité).
   ========================================================================== */
import type {
  Evenement, GouvActivite, Partner,
  Ressource, GalleryItem, Contact,
} from "./types";

/* ⚠️ Quatre jeux de données ont quitté ce fichier : les témoignages de
   bénéficiaires, les chiffres d'impact humain, les diptyques avant/après et les
   dialogues sectoriels. Ils sont désormais administrés depuis la console
   (module « Histoires & impact »), et leur état initial vit dans
   `src/content/impact.ts`. En garder une copie ici aurait garanti la dérive :
   deux sources pour un même texte, dont une seule est corrigée. */

/* ⚠️ `projVideos` a également quitté ce fichier. La section « Le projet en
   vidéos » de « Résultats » affichait cinq cartes portant un gros bouton de
   lecture et une durée, alors qu'aucune vidéo n'est fournie : le clic menait à
   l'ancre `#video` d'une page de composante, où s'affiche « à venir » — et pour
   C5, à une ancre qui n'existe pas, la composante n'ayant pas de bloc vidéo. La
   table recopiait par ailleurs `composantes[].titre`, `compColors` et `compImg`,
   avec deux valeurs qui avaient déjà divergé (C5 en vert au lieu du gris, durée
   3:20 introuvable ailleurs). L'emplacement des films reste celui de chaque page
   de composante, suivi par `content/videos.ts`. */

/* --- Événements ------------------------------------------------------------ */
export const events: Evenement[] = [
  { id: "forum", date: { fr: "12 sept. 2026", en: "12 Sep 2026" }, type: { fr: "Forum", en: "Forum" }, lieu: { fr: "Kinshasa", en: "Kinshasa" }, color: "#0f62fe", statut: "avenir", img: "hub", titre: { fr: "Forum national de la transformation numérique", en: "National Digital Transformation Forum" }, desc: { fr: "Une journée d'échange entre gouvernement, bailleurs, secteur privé et citoyens.", en: "A day of exchange between government, donors, the private sector and citizens." }, places: { fr: "320 places", en: "320 seats" } },
  { id: "femmes", date: { fr: "3 oct. 2026", en: "3 Oct 2026" }, type: { fr: "Atelier", en: "Workshop" }, lieu: { fr: "Goma", en: "Goma" }, color: "#8a3ffc", statut: "avenir", img: "femmes", titre: { fr: "Atelier — compétences numériques pour les femmes", en: "Workshop — digital skills for women" }, desc: { fr: "Formation pratique et mentorat, dans le cadre du volet inclusion des femmes.", en: "Hands-on training and mentoring, part of the women's inclusion strand." }, places: { fr: "80 places", en: "80 seats" } },
  { id: "webinaire", date: { fr: "25 août 2026", en: "25 Aug 2026" }, type: { fr: "Webinaire", en: "Webinar" }, lieu: { fr: "En ligne", en: "Online" }, color: "#009d9a", statut: "avenir", img: "data", titre: { fr: "Webinaire soumissionnaires — répondre à un AOI", en: "Bidders' webinar — how to respond to an ICB" }, desc: { fr: "Une session pratique pour les entreprises candidates aux marchés du Projet.", en: "A practical session for companies bidding on Project contracts." }, places: { fr: "Illimité", en: "Unlimited" } },
  { id: "consultation", date: { fr: "20 oct. 2026", en: "20 Oct 2026" }, type: { fr: "Consultation publique", en: "Public consultation" }, lieu: { fr: "Goma — provinces de l'Est", en: "Goma — Eastern provinces" }, color: "#ff832b", statut: "avenir", img: "ville", titre: { fr: "Consultation publique — sauvegardes E&S (Est)", en: "Public consultation — E&S safeguards (East)" }, desc: { fr: "Écouter les communautés affectées avant les travaux fibre de l'Est.", en: "Listening to affected communities ahead of the Eastern fibre works." }, places: { fr: "Ouvert à tous", en: "Open to all" } },
  { id: "lancement", date: { fr: "oct. 2025", en: "Oct 2025" }, type: { fr: "Jalon", en: "Milestone" }, lieu: { fr: "Kinshasa", en: "Kinshasa" }, color: "#6f6f6f", statut: "passe", img: "hero", titre: { fr: "Lancement officiel du PTN-RDC", en: "Official launch of the DRC Digital Transformation Project" }, desc: { fr: "Le Projet est entré en vigueur — décaissements et premiers marchés lancés.", en: "The Project became effective — disbursements and first contracts began." }, places: { fr: "", en: "" } },
];

/* --- Gouvernance : activité récente ---------------------------------------- */
export const gouvActivites: GouvActivite[] = [
  { date: { fr: "Juin 2026", en: "Jun 2026" }, org: "COPIL", color: "#0f62fe", titre: { fr: "Le COPIL valide le plan de passation 2026", en: "Steering Committee endorses the 2026 procurement plan" }, note: { fr: "Orientations stratégiques confirmées ; premiers marchés structurants autorisés.", en: "Strategic orientations confirmed; first structuring contracts authorised." } },
  { date: { fr: "Mai 2026", en: "May 2026" }, org: "CTP", color: "#009d9a", titre: { fr: "Le CTP examine le cadre de sauvegardes", en: "Technical Committee reviews the safeguards framework" }, note: { fr: "Instruments environnementaux & sociaux validés avant travaux.", en: "Environmental & social instruments cleared ahead of works." } },
  { date: { fr: "Avril 2026", en: "Apr 2026" }, org: "Coordination", color: "#8a3ffc", titre: { fr: "Mission de supervision conjointe Banque mondiale & AFD", en: "Joint supervision mission with the World Bank & AFD" }, note: { fr: "Revue terrain de l'état de préparation dans trois provinces de l'Est.", en: "Field review of readiness in three eastern provinces." } },
  { date: { fr: "Mars 2026", en: "Mar 2026" }, org: "COPIL", color: "#0f62fe", titre: { fr: "Adoption du rapport d'avancement T1", en: "Q1 progress report adopted" }, note: { fr: "Indicateurs de décaissement et de résultats revus au regard des cibles.", en: "Disbursement and results indicators reviewed against targets." } },
  { date: { fr: "Février 2026", en: "Feb 2026" }, org: "Coordination", color: "#198038", titre: { fr: "Activation du réseau de points focaux provinciaux", en: "Provincial focal points network activated" }, note: { fr: "26 provinces reliées au dispositif de plaintes et de liaison.", en: "26 provinces connected to the grievance and liaison system." } },
];

/* --- Gouvernance : rôles de coordination ----------------------------------- */
/* ⚠️ Les cartes de coordination ne sont plus ici : elles affichent les fiches
   marquées « mise en avant » dans le module « L'équipe de l'Unité », dont
   l'état initial vit dans `src/content/equipe.ts`. Ces quatre cartes n'étaient
   pas quatre personnes de plus — c'étaient le coordonnateur, son adjoint, la
   passation et le suivi-évaluation, déjà présents dans la grille de l'accueil
   sous un intitulé voisin. */

/* ⚠️ `ugptnMission` et `polesAction` ont quitté ce fichier, pour la même raison
   que ci-dessus : ils décrivaient une seconde fois ce que `data.ts` décrivait
   déjà, dans une autre section de la même page.

   · `ugptnMission` reprenait le mandat sous trois verbes, dont deux (coordonner,
     exécuter) étaient les intitulés 01 et 02 de `mandat`. Le troisième, rendre
     compte, y est désormais la fonction 05.
   · `polesAction` nommait CINQ pôles différents des cinq de l'organigramme, si
     bien que la page en annonçait cinq, puis cinq autres. Mission et dossier en
     cours sont maintenant portés par `poles[]` dans `data.ts`, seule taxonomie
     de référence. Le préfixe « En cours : » a quitté les textes pour devenir un
     libellé traduisible (`t.ugptn.orgEnCours`). */

/* ⚠️ Les blocs de la page « L'UGPTN » (méthode, engagements, glossaire, foire
   aux questions) et ceux de la page « Le projet » (publics visés, questions
   citoyennes) ne sont plus ici : ils sont administrés depuis la console, et
   leur état initial vit dans `src/content/impact/`. */
/* --- Accueil : partenaires (logos placeholders) ---------------------------- */
export const partners: Partner[] = [
  { name: "Banque mondiale", kind: { fr: "Bailleur · IDA", en: "Donor · IDA" }, logo: "/partenaires/banque-mondiale.png" },
  { name: "AFD", kind: { fr: "Bailleur", en: "Donor" }, logo: "/partenaires/afd.png" },
  { name: "MPTN", kind: { fr: "Tutelle", en: "Supervision" }, logo: "/partenaires/mptn.png" },
  { name: "Ministère de l'Économie Numérique", kind: { fr: "Ministère", en: "Ministry" }, logo: "/partenaires/economie-numerique.png" },
  { name: "ARPTC", kind: { fr: "Régulateur", en: "Regulator" }, logo: "/partenaires/arptc.png" },
  { name: "ADN", kind: { fr: "Agence du Numérique", en: "Digital Agency" }, logo: "/partenaires/adn.png" },
  { name: "ONIP", kind: { fr: "Identité", en: "Identity" }, logo: "/partenaires/onip.png" },
  { name: "MESU", kind: { fr: "Enseignement sup.", en: "Higher education" }, logo: "/partenaires/mesu.png" },
  { name: "MEPME", kind: { fr: "PME", en: "PME" }, logo: "/partenaires/mepme.png" },
];

/* --- Ressources & publications --------------------------------------------- */
export const ressources: Ressource[] = [
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Accès & inclusion", en: "Access & inclusion" }, comp: "C1", date: { fr: "Juin 2026", en: "Jun 2026" }, titre: { fr: "Réduire la fracture rurale : cadre de priorisation", en: "Closing the rural connectivity gap: prioritisation framework" }, meta: "PDF · 1,8 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Fondations & confiance", en: "Foundations & trust" }, comp: "C2", date: { fr: "Mai 2026", en: "May 2026" }, titre: { fr: "Identité numérique & interopérabilité : principes de conception", en: "Digital identity & interoperability: design principles" }, meta: "PDF · 2,2 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Compétences & innovation", en: "Skills & innovation" }, comp: "C3", date: { fr: "Avril 2026", en: "Apr 2026" }, titre: { fr: "Compétences avancées : aligner la formation au marché de l'emploi", en: "Advanced digital skills: aligning training with the job market" }, meta: "PDF · 1,4 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, comp: "C4", date: { fr: "T1 2026", en: "Q1 2026" }, titre: { fr: "Rapport d'avancement trimestriel — T1 2026", en: "Quarterly implementation report — Q1 2026" }, meta: "PDF · 3,6 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, comp: "C4", date: { fr: "2025", en: "2025" }, titre: { fr: "Rapport annuel du projet 2025", en: "Annual project report 2025" }, meta: "PDF · 5,1 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Suivi-évaluation", en: "M&E" }, comp: "C4", date: { fr: "Mars 2026", en: "Mar 2026" }, titre: { fr: "Analyse coûts-bénéfices du backbone fibre Est", en: "Cost-benefit analysis of the Eastern fibre backbone" }, meta: "PDF · 2,9 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Sauvegardes", en: "Safeguards" }, comp: "C4", date: { fr: "Février 2026", en: "Feb 2026" }, titre: { fr: "Étude de référence environnementale & sociale", en: "Environmental & social baseline study" }, meta: "PDF · 4,3 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Passation & fiduciaire", en: "Procurement & fiduciary" }, comp: "C4", date: { fr: "Janvier 2026", en: "Jan 2026" }, titre: { fr: "Passation ouverte et traçable : application des règles de la Banque mondiale", en: "Open, traceable procurement: applying World Bank rules" }, meta: "PDF · 1,1 Mo" },
];

/* ⚠️ `uniteStats` a quitté ce fichier. Les six tuiles « L'Unité en bref »
   répétaient ce que la page disait déjà autour d'elles : « 5 pôles » et
   « 21 sous-rôles » figuraient dans les deux sections voisines, « 2025 créée
   par arrêté » dans le bandeau d'engagement, tandis que « 26 provinces » et
   « 2029 » relèvent du projet et non de l'Unité, et sont servis par l'accueil,
   « Le Projet » et chaque page de composante.

   Les deux valeurs qui restaient utiles sont désormais DÉRIVÉES, dans la page :
   `poles.length` et `gouvernance.length`. Le total de sous-rôles n'est plus
   affiché du tout, faute d'un chiffre que les données confirment (cf. la note
   de `polesSousRoles` dans `data.ts`). */

/* --- Accueil : galerie par province ---------------------------------------- */
export const galleryProvinces: GalleryItem[] = [
  { nom: "Kinshasa", img: "ville" },
  { nom: "Nord-Kivu · Goma", img: "tour" },
  { nom: "Haut-Katanga · Lubumbashi", img: "hub" },
  { nom: "Tshopo · Kisangani", img: "fibre" },
  { nom: "Kongo Central · Matadi", img: "datacenter" },
  { nom: "Ituri · Bunia", img: "citoyens" },
  { nom: "Kasaï · Kananga", img: "formation" },
  { nom: "Sud-Kivu · Bukavu", img: "femmes" },
];

/* --- Contact + footer : coordonnées officielles ---------------------------- */
export const contact: Contact = {
  adresse: "15, Avenue Pumbu — Immeuble H, Bâtiment B, 4ᵉ étage",
  quartier: "Gombe, Kinshasa — République Démocratique du Congo",
  tel: "+243 810 000 355",
  email: "info@ugptn.cd",
  tutelles: ["Ministère des Postes et Télécommunications", "Ministère de l'Économie Numérique"],
  numeroVert: "XXX",
};

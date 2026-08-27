/* ============================================================================
   TEXTES JURIDIQUES DU SITE — politique de confidentialité, conditions
   d'utilisation, avis de première visite.

   CADRE MOBILISÉ
   • Ordonnance-loi n° 23/010 du 13 mars 2023 portant Code du numérique (RDC).
   • Constitution du 18 février 2006, article 31 (vie privée, secret des
     communications).
   • Cadre environnemental et social de la Banque mondiale — NES n° 1 et
     NES n° 10 (mobilisation des parties prenantes, mécanisme de gestion des
     plaintes, approche centrée sur la personne survivante pour l'EAS/HS).
   • Directives de la Banque mondiale en matière de fraude et de corruption ;
     Règlement de passation des marchés applicable au financement.
   • Politique de maîtrise des risques environnementaux et sociaux de l'AFD.

   >>> À VALIDER avant publication par la direction de l'Unité, le spécialiste
       sauvegardes (article EAS/HS) et le conseil juridique : les DURÉES DE
       CONSERVATION et les DÉLAIS DE RÉPONSE ci-dessous sont des engagements
       que l'Unité prend, pas des faits constatés. <<<
   ========================================================================== */
import type { LegalDoc } from "./types";

/** Date de dernière révision, affichée en tête des deux documents. */
const MAJ = { fr: "12 août 2026", en: "12 August 2026" };

/* ==========================================================================
   POLITIQUE DE CONFIDENTIALITÉ
   ========================================================================== */

export const confidentialite: LegalDoc = {
  slug: "confidentialite",
  maj: MAJ,
  titre: { fr: "Politique de confidentialité", en: "Privacy policy" },
  chapeau: {
    fr: "Ce site recueille peu de données, et seulement lorsqu'une démarche l'exige : déposer une plainte, candidater à un marché, poser une question, recevoir les publications de l'Unité. Cette politique dit lesquelles, pourquoi elles sont traitées, qui y accède, combien de temps elles sont conservées et comment en obtenir la rectification ou la suppression.",
    en: "This site collects little data, and only where a specific step requires it: filing a grievance, bidding for a contract, asking a question, subscribing to the Unit's publications. This policy sets out which data, why it is processed, who has access to it, how long it is kept and how to have it corrected or erased.",
  },
  sections: [
    {
      id: "responsable",
      titre: { fr: "Qui répond du traitement", en: "Who is accountable for the processing" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "L'Unité de Gestion du Projet de Transformation Numérique (UGPTN), unité d'exécution du Projet de Transformation Numérique de la République Démocratique du Congo (PTN-RDC, P180495/CCD1198) placée sous la tutelle du Ministère des Postes, Télécommunications et Numérique, détermine les finalités et les moyens des traitements opérés sur ce site. Elle en répond en qualité de responsable du traitement.",
            en: "The Digital Transformation Project Management Unit (UGPTN), the implementing unit of the Democratic Republic of the Congo Digital Transformation Project (PTN-RDC, P180495/CCD1198) under the authority of the Ministry of Posts, Telecommunications and Digital Affairs, determines the purposes and means of the processing carried out on this site. It is accountable for that processing as data controller.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Ces traitements s'exercent dans le cadre fixé par l'Ordonnance-loi n° 23/010 du 13 mars 2023 portant Code du numérique, par l'article 31 de la Constitution qui garantit le respect de la vie privée et le secret des communications, et par les engagements souscrits envers les partenaires techniques et financiers du projet — l'Association internationale de développement du Groupe de la Banque mondiale et l'Agence française de développement.",
            en: "This processing is governed by Ordinance-Law No. 23/010 of 13 March 2023 enacting the Digital Code, by article 31 of the Constitution, which guarantees respect for private life and the confidentiality of communications, and by the undertakings given to the project's technical and financial partners — the International Development Association of the World Bank Group and the Agence française de développement.",
          },
        },
        {
          k: "liste",
          items: [
            {
              t: { fr: "Responsable du traitement", en: "Data controller" },
              d: { fr: "Unité de Gestion du Projet de Transformation Numérique (UGPTN)", en: "Digital Transformation Project Management Unit (UGPTN)" },
            },
            {
              t: { fr: "Siège", en: "Registered office" },
              d: {
                fr: "15, Avenue Pumbu — Immeuble H, Bâtiment B, 4ᵉ étage, Gombe, Kinshasa, République Démocratique du Congo",
                en: "15 Avenue Pumbu — Immeuble H, Building B, 4th floor, Gombe, Kinshasa, Democratic Republic of the Congo",
              },
            },
            {
              t: { fr: "Écrire au responsable du traitement", en: "Contacting the data controller" },
              d: { fr: "info@ugptn.cd — mention « protection des données » en objet", en: "info@ugptn.cd — with “data protection” in the subject line" },
            },
          ],
        },
      ],
    },

    {
      id: "donnees",
      titre: { fr: "Ce qui est collecté, service par service", en: "What is collected, service by service" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Aucune donnée n'est demandée pour lire ce site. Chaque collecte correspond à une démarche engagée par l'usager et se limite à ce que cette démarche exige pour aboutir.",
            en: "No data is requested in order to read this site. Each collection corresponds to a step initiated by the user and is limited to what that step requires in order to reach an outcome.",
          },
        },
        {
          k: "liste",
          items: [
            {
              t: { fr: "Mécanisme de gestion des plaintes (MGP)", en: "Grievance redress mechanism (GRM)" },
              d: {
                fr: "Identité si le plaignant choisit de la donner, coordonnées de rappel, province, objet et récit de la plainte, pièces jointes. La plainte anonyme est recevable : l'identification n'est jamais une condition d'instruction. Ces données servent à instruire le dossier, à l'orienter vers l'entité compétente et à notifier la suite donnée.",
                en: "Identity where the complainant chooses to give it, contact details, province, subject and account of the grievance, attachments. Anonymous grievances are admissible: identification is never a condition for a case to be examined. The data is used to examine the case, refer it to the competent body and notify the outcome.",
              },
            },
            {
              t: { fr: "Suivi d'une plainte", en: "Tracking a grievance" },
              d: {
                fr: "Le seul numéro de référence remis lors du dépôt. Il ne révèle pas l'identité du plaignant et ne permet pas de la reconstituer.",
                en: "The reference number issued at filing, and nothing else. It does not disclose the complainant's identity and does not allow it to be reconstructed.",
              },
            },
            {
              t: { fr: "Portail des marchés", en: "Tenders portal" },
              d: {
                fr: "Identité de l'entreprise et de son représentant, coordonnées, pièces administratives et fiscales, questions posées sur un avis. Ces données servent à l'enregistrement des soumissionnaires, à la traçabilité des échanges pendant la période de préparation des offres et à l'évaluation.",
                en: "Identity of the firm and of its representative, contact details, administrative and tax documents, questions raised on a notice. The data is used to register bidders, to keep an auditable record of exchanges during bid preparation, and to evaluate offers.",
              },
            },
            {
              t: { fr: "Formulaire de contact", en: "Contact form" },
              d: {
                fr: "Nom, coordonnées et objet de la demande, aux seules fins d'y répondre.",
                en: "Name, contact details and subject of the request, for the sole purpose of replying to it.",
              },
            },
            {
              t: { fr: "Lettre d'information", en: "Newsletter" },
              d: {
                fr: "Adresse électronique et langue de lecture, conservées jusqu'à la désinscription.",
                en: "Email address and reading language, kept until unsubscription.",
              },
            },
            {
              t: { fr: "Journaux techniques", en: "Technical logs" },
              d: {
                fr: "Adresse IP, horodatage, page consultée et type de terminal, produits automatiquement par les serveurs. Ils servent à la sécurité et à la disponibilité du service, non à l'analyse du comportement des visiteurs.",
                en: "IP address, timestamp, page requested and device type, generated automatically by the servers. They serve the security and availability of the service, not the analysis of visitor behaviour.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "fondement",
      titre: { fr: "Sur quel fondement", en: "On what basis" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Chaque traitement repose sur l'un des trois fondements suivants, et sur un seul à la fois :",
            en: "Each processing operation rests on one of the following three bases, and on one only:",
          },
        },
        {
          k: "puces",
          items: [
            {
              fr: "L'exécution d'une mission d'intérêt public — le mécanisme de gestion des plaintes, la publication des avis de marchés et l'instruction des candidatures découlent des obligations d'exécution du projet et des règles de passation applicables aux financements de la Banque mondiale.",
              en: "The performance of a public-interest task — the grievance mechanism, the publication of procurement notices and the processing of applications arise from the project's implementation obligations and from the procurement rules applicable to World Bank financing.",
            },
            {
              fr: "Le consentement — l'abonnement à la lettre d'information et l'usage du formulaire de contact procèdent d'une démarche volontaire, révocable à tout moment, sans justification et sans conséquence sur l'accès aux autres services.",
              en: "Consent — subscribing to the newsletter and using the contact form are voluntary steps, revocable at any time, without justification and without consequence for access to the other services.",
            },
            {
              fr: "L'obligation de sécurité — les journaux techniques et les mesures de protection des systèmes d'information répondent aux obligations posées par le Code du numérique en matière de sécurité des systèmes et de continuité de service.",
              en: "The security obligation — technical logs and information-system protection measures answer the requirements of the Digital Code on system security and service continuity.",
            },
          ],
        },
      ],
    },

    {
      id: "eas",
      titre: {
        fr: "Le régime renforcé des signalements EAS/HS",
        en: "The reinforced regime for SEA/SH reports",
      },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les signalements relevant de l'exploitation et des abus sexuels ou du harcèlement sexuel (EAS/HS) obéissent à un régime distinct, plus strict que celui des autres plaintes. Il applique l'approche centrée sur la personne survivante retenue par le Cadre environnemental et social de la Banque mondiale, aux normes environnementales et sociales n° 1 et n° 10.",
            en: "Reports concerning sexual exploitation and abuse or sexual harassment (SEA/SH) follow a distinct regime, stricter than the one applied to other grievances. It implements the survivor-centred approach set out in the World Bank Environmental and Social Framework, under Environmental and Social Standards 1 and 10.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Le circuit de signalement n'enregistre que quatre éléments : la nature de l'incident tel que la personne le décrit d'elle-même, l'indication de savoir si l'auteur présumé est lié au projet, l'âge et le sexe de la personne survivante, et la mention d'une orientation vers des services de prise en charge. Aucune question n'est posée sur les circonstances des faits et aucun élément de preuve n'est demandé.",
            en: "The reporting channel records four items only: the nature of the incident as the person describes it in their own words, whether to their knowledge the alleged perpetrator is associated with the project, the age and sex of the survivor, and whether a referral to support services was made. No question is asked about the circumstances of the incident and no evidence is requested.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "L'identité de la personne survivante n'est ni recherchée, ni conservée, ni communiquée à l'Unité, au ministère de tutelle ou aux bailleurs. Les dossiers sont détenus séparément de toute autre plainte, sous accès nominatif restreint au spécialiste des sauvegardes sociales, et ne peuvent fonder aucune procédure disciplinaire ou contractuelle sans le consentement libre et éclairé de la personne concernée.",
            en: "The survivor's identity is neither sought, nor retained, nor disclosed to the Unit, to the supervising ministry or to the funders. Case files are held separately from all other grievances, under named access restricted to the social safeguards specialist, and may not ground any disciplinary or contractual proceedings without the free and informed consent of the person concerned.",
          },
        },
        {
          k: "note",
          texte: {
            fr: "Une orientation vers des services médicaux, psychosociaux et juridiques est proposée dans tous les cas, quelle que soit la suite donnée au signalement et sans que la personne ait à s'engager dans une procédure.",
            en: "A referral to medical, psychosocial and legal services is offered in every case, whatever the outcome of the report and without the person having to enter into any proceedings.",
          },
        },
      ],
    },

    {
      id: "acces",
      titre: { fr: "Qui accède aux données", en: "Who has access to the data" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les données ne sont ni vendues, ni louées, ni cédées à des fins commerciales ou publicitaires. L'accès est ouvert au cas par cas, aux seules personnes dont l'instruction du dossier exige qu'elles en disposent.",
            en: "Data is neither sold, nor rented, nor transferred for commercial or advertising purposes. Access is granted case by case, only to those whose handling of the file requires it.",
          },
        },
        {
          k: "liste",
          items: [
            {
              t: { fr: "Agents de l'Unité", en: "Unit staff" },
              d: {
                fr: "Accès limité au pôle compétent : sauvegardes pour les plaintes, passation pour les marchés, communication pour la lettre d'information. Les habilitations sont nominatives et revues à chaque mouvement d'agent.",
                en: "Access limited to the relevant cluster: safeguards for grievances, procurement for tenders, communications for the newsletter. Authorisations are personal and reviewed whenever a staff member changes post.",
              },
            },
            {
              t: { fr: "Ministère de tutelle et Comité de pilotage", en: "Supervising ministry and Steering Committee" },
              d: {
                fr: "Statistiques agrégées et dossiers dont l'arbitrage leur revient. En aucun cas les signalements EAS/HS.",
                en: "Aggregate statistics and the files on which they are called to decide. Under no circumstances SEA/SH reports.",
              },
            },
            {
              t: { fr: "Banque mondiale et Agence française de développement", en: "World Bank and Agence française de développement" },
              d: {
                fr: "Dans l'exercice de leurs missions de supervision, d'audit et de revue a posteriori des passations de marchés, conformément aux accords de financement. Les données de plaintes leur sont transmises sous forme agrégée, sauf lorsque l'instruction d'un cas précis l'exige.",
                en: "In the exercise of their supervision, audit and post-review functions over procurement, in accordance with the financing agreements. Grievance data is transmitted to them in aggregate form, save where the examination of a specific case requires otherwise.",
              },
            },
            {
              t: { fr: "Prestataires techniques", en: "Technical service providers" },
              d: {
                fr: "Hébergement et acheminement des courriels, liés par des engagements de confidentialité et dépourvus de tout droit d'usage propre sur les données.",
                en: "Hosting and email delivery, bound by confidentiality undertakings and holding no right of their own to use the data.",
              },
            },
            {
              t: { fr: "Autorités judiciaires", en: "Judicial authorities" },
              d: {
                fr: "Sur réquisition régulière, dans les formes prévues par la loi et dans la limite de son objet.",
                en: "Upon a duly issued request, in the forms prescribed by law and within the limits of its subject matter.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "hebergement",
      titre: { fr: "Hébergement et transferts hors du territoire", en: "Hosting and transfers outside the country" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le site est hébergé par Netlify, Inc. (San Francisco, États-Unis d'Amérique) sur une infrastructure répartie. Une partie des données transite donc hors du territoire national et y est traitée.",
            en: "The site is hosted by Netlify, Inc. (San Francisco, United States of America) on a distributed infrastructure. Part of the data therefore transits and is processed outside the national territory.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Ces transferts sont limités à ce qu'exige le fonctionnement du service et encadrés par les engagements contractuels souscrits auprès des prestataires. La localisation des traitements publics n'est pas un point de détail : la souveraineté des données figure parmi les objectifs de la composante consacrée aux fondations numériques, et la migration des services publics vers l'infrastructure nationale d'hébergement fait partie du programme d'investissement du projet. Cette politique sera révisée à mesure que cette migration s'opère.",
            en: "These transfers are limited to what the operation of the service requires and are framed by the contractual undertakings entered into with the providers. Where public processing takes place is not a matter of detail: data sovereignty is one of the objectives of the digital foundations component, and the migration of public services to national hosting infrastructure is part of the project's investment programme. This policy will be revised as that migration proceeds.",
          },
        },
      ],
    },

    {
      id: "conservation",
      titre: { fr: "Combien de temps les données sont conservées", en: "How long data is kept" },
      blocs: [
        {
          k: "liste",
          items: [
            {
              t: { fr: "Plaintes instruites par le MGP", en: "Grievances handled by the GRM" },
              d: {
                fr: "Trois ans à compter de la clôture du dossier, puis versement aux archives du projet sous forme anonymisée pour les besoins du suivi et de l'évaluation.",
                en: "Three years from the closure of the case, then transfer to the project archives in anonymised form for monitoring and evaluation purposes.",
              },
            },
            {
              t: { fr: "Dossiers de passation et comptes soumissionnaires", en: "Procurement files and bidder accounts" },
              d: {
                fr: "Pendant toute l'exécution du projet et au moins deux ans après la date de clôture du financement, conformément aux obligations d'archivage attachées aux financements de la Banque mondiale et aux besoins de l'audit.",
                en: "Throughout project implementation and for at least two years after the closing date of the financing, in accordance with the record-keeping obligations attached to World Bank financing and with audit requirements.",
              },
            },
            {
              t: { fr: "Demandes adressées par le formulaire de contact", en: "Requests sent through the contact form" },
              d: { fr: "Douze mois après la dernière réponse apportée.", en: "Twelve months after the last reply given." },
            },
            {
              t: { fr: "Lettre d'information", en: "Newsletter" },
              d: { fr: "Jusqu'à la désinscription, qui prend effet immédiatement et sans condition.", en: "Until unsubscription, which takes effect immediately and unconditionally." },
            },
            {
              t: { fr: "Journaux techniques", en: "Technical logs" },
              d: { fr: "Six mois, sauf incident de sécurité en cours d'instruction.", en: "Six months, unless a security incident is under investigation." },
            },
            {
              t: { fr: "Signalements EAS/HS", en: "SEA/SH reports" },
              d: {
                fr: "Selon le protocole de sauvegardes du projet, sous la responsabilité exclusive du spécialiste dédié et séparément de tout autre fichier.",
                en: "In accordance with the project's safeguards protocol, under the sole responsibility of the dedicated specialist and separately from any other file.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "securite",
      titre: { fr: "Sécurité", en: "Security" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le site est servi exclusivement en HTTPS. Les formulaires sont protégés contre la soumission automatisée, les accès aux dossiers sont nominatifs et journalisés, et les pièces jointes sont analysées avant tout enregistrement.",
            en: "The site is served exclusively over HTTPS. Forms are protected against automated submission, access to case files is personal and logged, and attachments are scanned before being stored.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Aucune mesure ne rend un système inviolable. En cas de violation de données susceptible de porter atteinte aux droits des personnes concernées, l'Unité en informe dans les meilleurs délais l'autorité publique compétente désignée par le Code du numérique et, lorsque le risque le justifie, les personnes concernées elles-mêmes.",
            en: "No measure makes a system impregnable. In the event of a data breach liable to affect the rights of the persons concerned, the Unit will inform, as soon as possible, the competent public authority designated under the Digital Code and, where the risk warrants it, the persons concerned themselves.",
          },
        },
      ],
    },

    {
      id: "droits",
      titre: { fr: "Vos droits, et comment les exercer", en: "Your rights, and how to exercise them" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Toute personne dont les données sont traitées par l'Unité peut, sans frais :",
            en: "Any person whose data is processed by the Unit may, free of charge:",
          },
        },
        {
          k: "puces",
          items: [
            { fr: "obtenir la confirmation qu'elle fait l'objet d'un traitement, en connaître la finalité et en recevoir une copie ;", en: "obtain confirmation that their data is being processed, be told the purpose, and receive a copy of it;" },
            { fr: "faire rectifier une donnée inexacte, incomplète ou périmée ;", en: "have inaccurate, incomplete or outdated data corrected;" },
            { fr: "obtenir l'effacement d'une donnée dont la conservation n'est plus justifiée ;", en: "obtain the erasure of data whose retention is no longer justified;" },
            { fr: "s'opposer à un traitement pour un motif tenant à sa situation particulière ;", en: "object to a processing operation on grounds relating to their particular situation;" },
            { fr: "retirer un consentement précédemment donné, sans que ce retrait remette en cause ce qui a été fait avant.", en: "withdraw a consent previously given, without that withdrawal affecting what was done before it." },
          ],
        },
        {
          k: "p",
          texte: {
            fr: "La demande s'exerce par écrit à l'adresse figurant en tête de cette politique, accompagnée d'un élément permettant de s'assurer de l'identité du demandeur. Une réponse est apportée dans un délai de trente jours à compter de la réception. Tout refus est motivé et indique les voies de recours ouvertes.",
            en: "Requests are made in writing to the address given at the head of this policy, together with an element allowing the requester's identity to be established. A reply is provided within thirty days of receipt. Any refusal is reasoned and states the available avenues of recourse.",
          },
        },
        {
          k: "note",
          texte: {
            fr: "Le droit d'effacement ne s'étend pas aux pièces dont la conservation est imposée par les règles d'archivage des marchés publics, par une obligation d'audit ou par une procédure en cours.",
            en: "The right to erasure does not extend to records whose retention is required by public procurement archiving rules, by an audit obligation or by ongoing proceedings.",
          },
        },
      ],
    },

    {
      id: "traceurs",
      titre: { fr: "Cookies et traceurs", en: "Cookies and trackers" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Ce site ne dépose aucun cookie publicitaire, n'utilise aucun outil de mesure d'audience tierce et ne pratique aucun profilage. Il n'appartient à aucune régie et ne partage aucune donnée de navigation à des fins commerciales.",
            en: "This site sets no advertising cookies, uses no third-party audience measurement tool and carries out no profiling. It belongs to no advertising network and shares no browsing data for commercial purposes.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Une seule information est conservée dans le navigateur : le fait que l'avis d'utilisation présenté au premier accès a été lu, afin de ne pas le réafficher à chaque page. Elle reste sur le terminal, n'est jamais transmise au serveur et disparaît avec les données du navigateur. La langue d'affichage, elle, figure dans l'adresse de la page et ne fait l'objet d'aucun enregistrement.",
            en: "A single item is stored in the browser: the fact that the usage notice shown on first access has been read, so that it is not displayed again on every page. It remains on the device, is never transmitted to the server and disappears with the browser's data. The display language is carried in the page address and is not recorded at all.",
          },
        },
      ],
    },

    {
      id: "recours",
      titre: { fr: "Voies de recours", en: "Avenues of recourse" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Un désaccord sur le traitement de données se règle d'abord avec l'Unité. Les voies suivantes restent ouvertes, sans que l'une conditionne l'autre :",
            en: "A disagreement about the processing of data is first settled with the Unit. The following avenues remain open, none of them conditional on another:",
          },
        },
        {
          k: "liste",
          items: [
            {
              t: { fr: "Le mécanisme de gestion des plaintes du projet", en: "The project's grievance redress mechanism" },
              d: {
                fr: "Voie interne formalisée : accusé de réception, instruction par le pôle compétent, réponse motivée dans le délai annoncé.",
                en: "A formalised internal route: acknowledgement of receipt, examination by the relevant cluster, and a reasoned reply within the stated deadline.",
              },
            },
            {
              t: { fr: "L'autorité publique compétente en matière de protection des données", en: "The competent public data protection authority" },
              d: {
                fr: "Désignée par le Code du numérique, elle peut être saisie de toute réclamation, de même que les juridictions congolaises.",
                en: "Designated under the Digital Code, it may receive any complaint, as may the Congolese courts.",
              },
            },
            {
              t: { fr: "Le Service de règlement des plaintes de la Banque mondiale", en: "The World Bank's Grievance Redress Service" },
              d: {
                fr: "Ouvert aux personnes qui s'estiment lésées par un projet financé par la Banque. Le Panel d'inspection peut en outre être saisi lorsque les politiques de la Banque sont en cause.",
                en: "Open to persons who consider themselves adversely affected by a Bank-financed project. The Inspection Panel may in addition be seized where the Bank's own policies are at issue.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "revision",
      titre: { fr: "Révision de cette politique", en: "Revision of this policy" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Cette politique est révisée à chaque évolution des services du site, du cadre juridique applicable ou des exigences des bailleurs. La date de dernière révision figure en tête de page. Toute modification substantielle est annoncée sur la page d'accueil pendant trente jours avant de prendre effet.",
            en: "This policy is revised whenever the site's services, the applicable legal framework or the funders' requirements change. The date of last revision appears at the head of the page. Any substantial amendment is announced on the home page for thirty days before taking effect.",
          },
        },
      ],
    },
  ],
};

/* ==========================================================================
   CONDITIONS D'UTILISATION
   ========================================================================== */

export const conditions: LegalDoc = {
  slug: "conditions",
  maj: MAJ,
  titre: { fr: "Conditions d'utilisation", en: "Terms of use" },
  chapeau: {
    fr: "Ce site publie l'information officielle du Projet de Transformation Numérique : avis de marchés, documents de sauvegarde, résultats, actualités. Les présentes conditions fixent ce que l'Unité s'engage à publier, ce que l'usager s'engage à ne pas faire, et la valeur juridique exacte de ce qui est mis en ligne.",
    en: "This site publishes the official information of the Digital Transformation Project: procurement notices, safeguard documents, results and news. These terms set out what the Unit undertakes to publish, what users undertake not to do, and the precise legal weight of what is placed online.",
  },
  sections: [
    {
      id: "objet",
      titre: { fr: "Objet et acceptation", en: "Purpose and acceptance" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les présentes conditions régissent l'accès au site www.ugptn.cd et l'usage de ses services en ligne : consultation des publications, dépôt et suivi d'une plainte, enregistrement d'un soumissionnaire et participation aux procédures de passation, demande d'information, abonnement à la lettre d'information.",
            en: "These terms govern access to www.ugptn.cd and the use of its online services: consulting publications, filing and tracking a grievance, registering as a bidder and taking part in procurement procedures, requesting information, and subscribing to the newsletter.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "L'accès au site vaut acceptation pleine et sans réserve de ces conditions. L'usager qui ne les accepte pas cesse d'utiliser le site ; les documents publics du projet lui sont alors communiqués sur demande écrite adressée au siège de l'Unité.",
            en: "Accessing the site constitutes full and unreserved acceptance of these terms. A user who does not accept them shall stop using the site; the project's public documents are then made available to them upon written request addressed to the Unit's offices.",
          },
        },
      ],
    },

    {
      id: "cadre",
      titre: { fr: "Le cadre juridique de votre navigation", en: "The legal framework of your visit" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Ce site est un service de communication au public en ligne établi en République Démocratique du Congo. Sa fourniture et son usage relèvent de l'Ordonnance-loi n° 23/010 du 13 mars 2023 portant Code du numérique, qui régit les communications électroniques, les échanges par voie électronique, la protection des données à caractère personnel et la répression des infractions commises au moyen des systèmes d'information.",
            en: "This site is an online public communication service established in the Democratic Republic of the Congo. Its provision and its use fall under Ordinance-Law No. 23/010 of 13 March 2023 enacting the Digital Code, which governs electronic communications, electronic transactions, the protection of personal data and the punishment of offences committed by means of information systems.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "En accédant au site, depuis le territoire national ou depuis l'étranger, l'usager se place sous l'empire de ce texte pour tout acte qu'il y accomplit. S'y ajoutent les obligations souscrites envers la Banque mondiale et l'Agence française de développement au titre des accords de financement, notamment en matière de publication de l'information, de passation des marchés et de lutte contre la fraude et la corruption.",
            en: "By accessing the site, whether from within the country or from abroad, the user comes under that instrument for every act performed on it. To this are added the undertakings given to the World Bank and the Agence française de développement under the financing agreements, in particular as regards disclosure of information, procurement, and the fight against fraud and corruption.",
          },
        },
      ],
    },

    {
      id: "editeur",
      titre: { fr: "Éditeur, publication, hébergement", en: "Publisher, publication, hosting" },
      blocs: [
        {
          k: "liste",
          items: [
            {
              t: { fr: "Éditeur", en: "Publisher" },
              d: {
                fr: "Unité de Gestion du Projet de Transformation Numérique (UGPTN), sous la tutelle du Ministère des Postes, Télécommunications et Numérique — 15, Avenue Pumbu, Immeuble H, Bâtiment B, 4ᵉ étage, Gombe, Kinshasa.",
                en: "Digital Transformation Project Management Unit (UGPTN), under the authority of the Ministry of Posts, Telecommunications and Digital Affairs — 15 Avenue Pumbu, Immeuble H, Building B, 4th floor, Gombe, Kinshasa.",
              },
            },
            {
              t: { fr: "Directeur de publication", en: "Director of publication" },
              d: { fr: "Le Coordonnateur national de l'Unité, Noël Jean-David Litanga.", en: "The Unit's National Coordinator, Noël Jean-David Litanga." },
            },
            {
              t: { fr: "Contact", en: "Contact" },
              d: { fr: "info@ugptn.cd — +243 810 000 355", en: "info@ugptn.cd — +243 810 000 355" },
            },
            {
              t: { fr: "Hébergeur", en: "Host" },
              d: { fr: "Netlify, Inc., San Francisco, États-Unis d'Amérique.", en: "Netlify, Inc., San Francisco, United States of America." },
            },
            {
              t: { fr: "Financement du projet", en: "Project financing" },
              d: {
                fr: "Association internationale de développement (Groupe de la Banque mondiale) et Agence française de développement — projet P180495/CCD1198.",
                en: "International Development Association (World Bank Group) and Agence française de développement — project P180495/CCD1198.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "valeur",
      titre: { fr: "Valeur juridique des informations publiées", en: "Legal weight of the information published" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le site présente l'information du projet sous une forme lisible et hiérarchisée. Cette présentation est un travail éditorial : elle n'a pas valeur d'acte et ne se substitue à aucun document officiel.",
            en: "The site presents the project's information in a readable and structured form. That presentation is editorial work: it has no legal force of its own and replaces no official document.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "En cas de divergence entre une page de ce site et un document officiel, le document officiel prévaut. Font seuls foi l'accord de financement et ses avenants, le Manuel d'exécution du projet, les avis de marchés et dossiers d'appel d'offres dans leur version publiée et signée, les décisions d'attribution notifiées aux soumissionnaires, et les documents environnementaux et sociaux approuvés par les bailleurs.",
            en: "In the event of a discrepancy between a page of this site and an official document, the official document prevails. Only the following are authoritative: the financing agreement and its amendments, the Project Implementation Manual, procurement notices and bidding documents in their published and signed version, award decisions notified to bidders, and the environmental and social documents cleared by the funders.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Les valeurs prospectives publiées — cibles, horizons, ordres de grandeur signalés comme tels — décrivent l'ambition inscrite au cadre de résultats du projet. Elles ne constituent ni un engagement contractuel, ni une promesse de résultat, et peuvent être révisées selon les procédures de restructuration prévues par l'accord de financement.",
            en: "Forward-looking figures published here — targets, horizons and orders of magnitude flagged as such — describe the ambition set out in the project's results framework. They constitute neither a contractual commitment nor a promise of outcome, and may be revised under the restructuring procedures provided for in the financing agreement.",
          },
        },
      ],
    },

    {
      id: "usages",
      titre: { fr: "Ce que vous pouvez faire du contenu", en: "What you may do with the content" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "La consultation, la citation et la reproduction des contenus sont libres pour un usage d'information, d'enseignement, de recherche ou de contrôle citoyen, sous trois réserves : indiquer la source (« UGPTN — PTN-RDC ») et la date de consultation, ne pas altérer le sens du contenu repris, et ne pas présenter l'extrait comme une position de l'Unité lorsqu'il en est détaché.",
            en: "Consulting, quoting and reproducing the content is free for purposes of information, teaching, research or citizen oversight, subject to three conditions: state the source (“UGPTN — PTN-RDC”) and the date of consultation, do not distort the meaning of what is reproduced, and do not present an extract as a position of the Unit once detached from its context.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Sont subordonnés à une autorisation écrite préalable : toute réutilisation commerciale, toute extraction systématique du contenu par moisson automatisée, et tout usage de nature à faire croire à un partenariat, à un agrément ou à une recommandation de l'Unité.",
            en: "The following require prior written authorisation: any commercial reuse, any systematic extraction of the content by automated harvesting, and any use liable to suggest a partnership with, an approval by or a recommendation from the Unit.",
          },
        },
      ],
    },

    {
      id: "interdits",
      titre: { fr: "Ce qui est interdit", en: "What is prohibited" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les comportements suivants exposent leur auteur aux sanctions prévues par le Code du numérique et par la loi pénale, sans préjudice des actions civiles de l'Unité :",
            en: "The following conduct exposes its author to the penalties provided for by the Digital Code and by criminal law, without prejudice to any civil action by the Unit:",
          },
        },
        {
          k: "puces",
          items: [
            { fr: "l'accès ou le maintien frauduleux dans tout ou partie des systèmes d'information du site, ainsi que l'entrave à leur fonctionnement ;", en: "fraudulently accessing or remaining within all or part of the site's information systems, and impeding their operation;" },
            { fr: "l'introduction, la suppression ou la modification frauduleuse de données ;", en: "fraudulently entering, deleting or altering data;" },
            { fr: "l'usurpation de l'identité d'une personne, d'une entreprise ou de l'Unité elle-même, y compris par la création de sites, de comptes ou d'adresses imitant les siens ;", en: "impersonating a person, a firm or the Unit itself, including by creating sites, accounts or addresses imitating its own;" },
            { fr: "le dépôt d'une plainte sciemment mensongère au mécanisme de gestion des plaintes, et l'usage de ce mécanisme pour porter atteinte à l'honneur d'une personne ;", en: "filing a knowingly false grievance with the grievance mechanism, and using that mechanism to harm a person's reputation;" },
            { fr: "la transmission de contenus illicites, de logiciels malveillants ou de sollicitations non désirées ;", en: "transmitting unlawful content, malicious software or unsolicited communications;" },
            { fr: "toute manœuvre destinée à fausser une procédure de passation de marché ou à en détourner le calendrier.", en: "any manoeuvre intended to distort a procurement procedure or to subvert its timetable." },
          ],
        },
      ],
    },

    {
      id: "marches",
      titre: { fr: "Portail des marchés : ce à quoi s'engage un soumissionnaire", en: "Tenders portal: what a bidder undertakes" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "L'enregistrement sur le portail et le dépôt d'une offre emportent des engagements propres, distincts de ceux qui s'attachent à la simple consultation du site.",
            en: "Registering on the portal and submitting a bid entail specific undertakings, distinct from those attaching to mere consultation of the site.",
          },
        },
        {
          k: "liste",
          items: [
            {
              t: { fr: "Exactitude des déclarations", en: "Accuracy of declarations" },
              d: {
                fr: "Les informations et pièces déclarées engagent l'entreprise et son représentant. Une déclaration inexacte entraîne le rejet de l'offre et peut fonder une exclusion des procédures ultérieures.",
                en: "The information and documents declared bind the firm and its representative. An inaccurate declaration leads to the rejection of the bid and may ground exclusion from subsequent procedures.",
              },
            },
            {
              t: { fr: "Fraude et corruption", en: "Fraud and corruption" },
              d: {
                fr: "Les procédures sont soumises aux directives de la Banque mondiale en matière de prévention et de lutte contre la fraude et la corruption dans les projets qu'elle finance. Les pratiques de corruption, frauduleuses, collusoires, coercitives et obstructives y sont définies et sanctionnées.",
                en: "Procedures are subject to the World Bank's guidelines on preventing and combating fraud and corruption in the projects it finances. Corrupt, fraudulent, collusive, coercive and obstructive practices are defined and sanctioned therein.",
              },
            },
            {
              t: { fr: "Éligibilité", en: "Eligibility" },
              d: {
                fr: "Une entreprise ou une personne exclue par la Banque mondiale, ou par une institution liée à elle par un accord d'exclusion croisée, n'est pas éligible. La liste des entités exclues est publique et vérifiée avant attribution.",
                en: "A firm or individual debarred by the World Bank, or by an institution bound to it by a cross-debarment agreement, is not eligible. The list of debarred entities is public and is checked before award.",
              },
            },
            {
              t: { fr: "Égalité de traitement", en: "Equal treatment" },
              d: {
                fr: "Les réponses aux questions posées sur un avis sont publiées à l'attention de tous les soumissionnaires. Aucune information de nature à conférer un avantage n'est délivrée individuellement, quelle qu'en soit la voie.",
                en: "Replies to questions raised on a notice are published to all bidders. No information capable of conferring an advantage is given individually, by whatever channel.",
              },
            },
            {
              t: { fr: "Contestations", en: "Challenges" },
              d: {
                fr: "Les contestations relatives à une procédure suivent le mécanisme de traitement des plaintes prévu par le règlement de passation applicable au financement, dans les délais qu'il fixe. Le dépôt d'une plainte au MGP ne suspend pas ces délais.",
                en: "Challenges relating to a procedure follow the complaints mechanism laid down in the procurement regulations applicable to the financing, within the deadlines it prescribes. Filing a grievance with the GRM does not suspend those deadlines.",
              },
            },
          ],
        },
      ],
    },

    {
      id: "propriete",
      titre: { fr: "Propriété intellectuelle", en: "Intellectual property" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les textes, la charte graphique, les schémas et les développements de ce site appartiennent à l'Unité ou lui ont été concédés. Les armoiries de la République, les emblèmes du ministère de tutelle et les logotypes de la Banque mondiale et de l'Agence française de développement demeurent la propriété de leurs titulaires et ne peuvent être reproduits sans leur autorisation propre.",
            en: "The texts, visual identity, diagrams and developments of this site belong to the Unit or have been licensed to it. The arms of the Republic, the emblems of the supervising ministry and the logotypes of the World Bank and of the Agence française de développement remain the property of their holders and may not be reproduced without their own authorisation.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Les portraits des membres de l'équipe et les photographies prises sur le terrain sont publiés avec l'accord des personnes représentées, pour les seuls besoins de la communication du projet. Leur réutilisation hors de ce cadre est interdite.",
            en: "Portraits of team members and photographs taken in the field are published with the agreement of the persons shown, for the sole purposes of the project's communication. Their reuse outside that framework is prohibited.",
          },
        },
      ],
    },

    {
      id: "liens",
      titre: { fr: "Liens et contenus tiers", en: "Links and third-party content" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le site renvoie vers des ressources tenues par des tiers : bailleurs, ministères, plateformes documentaires, portails de données. L'Unité ne maîtrise ni leur contenu, ni leur disponibilité, ni leurs pratiques en matière de données, et n'en répond pas. Un lien ne vaut ni approbation, ni garantie.",
            en: "The site links to resources maintained by third parties: funders, ministries, document platforms, data portals. The Unit controls neither their content, nor their availability, nor their data practices, and is not answerable for them. A link constitutes neither endorsement nor warranty.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "La mise en lien vers ce site est libre, à l'exclusion des sites dont le contenu porte atteinte aux intérêts de la République, à l'ordre public ou à la dignité des personnes.",
            en: "Linking to this site is free, save from sites whose content is prejudicial to the interests of the Republic, to public order or to the dignity of persons.",
          },
        },
      ],
    },

    {
      id: "responsabilite",
      titre: { fr: "Disponibilité et responsabilité", en: "Availability and liability" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le service est fourni en l'état. L'Unité s'attache à l'exactitude et à l'actualité des informations publiées et corrige dans les meilleurs délais toute erreur qui lui est signalée ; elle ne garantit ni l'absence d'interruption, ni l'absence d'erreur.",
            en: "The service is provided as is. The Unit strives for the accuracy and currency of the information published and corrects, as soon as possible, any error brought to its attention; it warrants neither uninterrupted operation nor freedom from error.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "La responsabilité de l'Unité ne saurait être engagée à raison d'un dommage résultant d'une interruption du service, d'une décision prise sur la seule foi d'une page de ce site sans vérification du document officiel correspondant, ou d'un usage du site contraire aux présentes conditions.",
            en: "The Unit shall not be liable for any damage arising from an interruption of the service, from a decision taken on the strength of a page of this site alone without checking the corresponding official document, or from a use of the site contrary to these terms.",
          },
        },
        {
          k: "note",
          texte: {
            fr: "Aucune disposition des présentes ne porte atteinte aux privilèges et immunités de la Banque mondiale et de ses institutions, ni n'emporte renonciation à ceux-ci.",
            en: "Nothing in these terms affects, or constitutes a waiver of, the privileges and immunities of the World Bank and its institutions.",
          },
        },
      ],
    },

    {
      id: "donnees",
      titre: { fr: "Données personnelles", en: "Personal data" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Le traitement des données recueillies sur ce site est décrit dans la politique de confidentialité, qui fait partie intégrante des présentes conditions. Elle précise ce qui est collecté pour chaque démarche, qui y accède, combien de temps les données sont conservées, et comment en obtenir la rectification ou l'effacement. Les signalements d'exploitation, d'abus et de harcèlement sexuels y font l'objet d'un régime renforcé.",
            en: "The processing of data collected on this site is described in the privacy policy, which forms an integral part of these terms. It specifies what is collected for each step, who has access to it, how long it is kept, and how to obtain its correction or erasure. Reports of sexual exploitation, abuse and harassment are subject to a reinforced regime set out therein.",
          },
        },
      ],
    },

    {
      id: "droit",
      titre: { fr: "Droit applicable et règlement des différends", en: "Governing law and settlement of disputes" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Les présentes conditions sont régies par le droit de la République Démocratique du Congo.",
            en: "These terms are governed by the law of the Democratic Republic of the Congo.",
          },
        },
        {
          k: "p",
          texte: {
            fr: "Tout différend né de leur interprétation ou de leur exécution est d'abord porté par écrit devant l'Unité, en vue d'un règlement amiable dans un délai de trente jours à compter de la saisine. À défaut d'accord dans ce délai, il relève des juridictions compétentes de Kinshasa/Gombe.",
            en: "Any dispute arising from their interpretation or performance shall first be submitted in writing to the Unit with a view to an amicable settlement within thirty days of referral. Failing agreement within that period, it falls to the competent courts of Kinshasa/Gombe.",
          },
        },
      ],
    },

    {
      id: "evolution",
      titre: { fr: "Évolution des présentes conditions", en: "Amendment of these terms" },
      blocs: [
        {
          k: "p",
          texte: {
            fr: "Ces conditions peuvent être modifiées pour tenir compte d'une évolution du site, de la réglementation applicable ou des exigences des bailleurs. La version opposable est celle publiée à la date de l'accès ; la date de dernière révision figure en tête de page.",
            en: "These terms may be amended to reflect changes to the site, to the applicable regulations or to the funders' requirements. The version that applies is the one published on the date of access; the date of last revision appears at the head of the page.",
          },
        },
      ],
    },
  ],
};

export const legalDocs = { confidentialite, conditions };

/* ==========================================================================
   AVIS DE PREMIÈRE VISITE — bandeau bas de page
   Informe, il ne recueille pas de consentement : la soumission au Code du
   numérique découle de la loi, non d'un clic. Le bouton acquitte la lecture.
   ========================================================================== */

export const avisNavigation = {
  kicker: { fr: "Avis d'utilisation", en: "Usage notice" },
  titre: { fr: "Avant de poursuivre votre navigation", en: "Before you continue" },
  /* La formule est celle de l'article « Objet et acceptation » des conditions
     d'utilisation, reprise mot pour mot : un avis qui annonce autre chose que
     ce que dit le texte qu'il fait accepter n'a aucune valeur. */
  corps: {
    fr: "Ce site est édité par l'UGPTN, unité d'exécution du Projet de Transformation Numérique de la République Démocratique du Congo. Il est régi par le droit congolais, notamment par l'Ordonnance-loi n° 23/010 du 13 mars 2023 portant Code du numérique. L'accès au site et l'usage de ses services valent acceptation pleine et sans réserve des conditions d'utilisation.",
    en: "This site is published by the UGPTN, the implementing unit of the Democratic Republic of the Congo Digital Transformation Project. It is governed by Congolese law, in particular by Ordinance-Law No. 23/010 of 13 March 2023 enacting the Digital Code. Accessing the site and using its services constitute full and unreserved acceptance of the terms of use.",
  },
  precision: {
    fr: "Aucun traceur publicitaire n'est déposé sur votre terminal et aucune mesure d'audience n'est effectuée. Les données transmises au moyen d'une plainte, d'une candidature ou d'une demande d'information sont traitées aux fins et selon les modalités énoncées par la politique de confidentialité.",
    en: "No advertising tracker is placed on your device and no audience measurement is carried out. Data submitted through a grievance, an application or an information request is processed for the purposes and in the manner set out in the privacy policy.",
  },
  accepter: { fr: "J'accepte et je poursuis", en: "I accept and continue" },
  refuser: { fr: "Refuser et quitter le site", en: "Decline and leave the site" },
  /* Le refus n'est pas une impasse : les conditions d'utilisation prévoient
     elles-mêmes la voie de repli, et la rappeler ici évite qu'un usager qui
     refuse perde l'accès à l'information publique du projet. */
  refuserAide: {
    fr: "Le refus vous fait quitter le site et n'y conserve aucune trace de votre passage. Les documents publics du projet restent communicables sur demande écrite adressée au siège de l'Unité.",
    en: "Declining takes you off the site and keeps no record of your visit. The project's public documents remain available on written request addressed to the Unit's offices.",
  },
  fermer: { fr: "Fermer l'avis", en: "Dismiss notice" },
};

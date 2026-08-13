-- =============================================================================
-- Sauvegarde du module « Impact » — 13 août 2026
--
-- Ces quatre tables existaient en base sans figurer au schéma Prisma ni dans
-- aucun commit : `prisma db push` les aurait supprimées avec leur contenu.
-- Le fichier permet de tout recréer, structure et données comprises.
--
-- Restauration :
--   pnpm exec prisma db execute --file prisma/backups/impact-2026-08-13.sql
--
-- ⚠️ Les INSERT échouent si les tables contiennent déjà ces lignes : c'est une
-- restauration après suppression, pas une synchronisation.
-- =============================================================================

-- CreateEnum
CREATE TYPE "public"."ImpactEmplacement" AS ENUM ('ACCUEIL_IMPACT', 'ACCUEIL_HISTOIRES', 'RESULTATS_DIALOGUES', 'RESULTATS_HISTOIRES', 'PROJET_CHANGEMENTS', 'PROJET_JALONS');

-- CreateEnum
CREATE TYPE "public"."ImpactLayout" AS ENUM ('STATS', 'TEMOIGNAGES', 'CARTES', 'AVANT_APRES', 'JALONS');

-- CreateEnum
CREATE TYPE "public"."ImpactStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."ImpactTheme" AS ENUM ('CLAIR', 'GRIS', 'PALE', 'SOMBRE');

-- CreateTable
CREATE TABLE "public"."ImpactItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ImpactStatus" NOT NULL DEFAULT 'PUBLISHED',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "valeur" TEXT,
    "color" TEXT,
    "videoYt" TEXT,
    "lienUrl" TEXT,
    "dateAt" TIMESTAMP(3),
    "coverMediaId" TEXT,
    "coverKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactItemTranslation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "surtitre" TEXT,
    "titre" TEXT,
    "texte" TEXT,
    "texteSecondaire" TEXT,
    "lienLabel" TEXT,
    "mediaAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "emplacement" "public"."ImpactEmplacement" NOT NULL,
    "layout" "public"."ImpactLayout" NOT NULL,
    "theme" "public"."ImpactTheme" NOT NULL DEFAULT 'CLAIR',
    "status" "public"."ImpactStatus" NOT NULL DEFAULT 'DRAFT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "numero" TEXT,
    "compact" BOOLEAN NOT NULL DEFAULT false,
    "grandTitre" BOOLEAN NOT NULL DEFAULT false,
    "ctaUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "limite" INTEGER,
    "sourceId" TEXT,

    CONSTRAINT "ImpactSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactSectionTranslation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "kicker" TEXT,
    "titre" TEXT,
    "lead" TEXT,
    "ctaLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpactItem_sectionId_position_idx" ON "public"."ImpactItem"("sectionId" ASC, "position" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ImpactItemTranslation_itemId_locale_key" ON "public"."ImpactItemTranslation"("itemId" ASC, "locale" ASC);

-- CreateIndex
CREATE INDEX "ImpactItemTranslation_locale_idx" ON "public"."ImpactItemTranslation"("locale" ASC);

-- CreateIndex
CREATE INDEX "ImpactSection_emplacement_position_idx" ON "public"."ImpactSection"("emplacement" ASC, "position" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ImpactSection_key_key" ON "public"."ImpactSection"("key" ASC);

-- CreateIndex
CREATE INDEX "ImpactSection_status_idx" ON "public"."ImpactSection"("status" ASC);

-- CreateIndex
CREATE INDEX "ImpactSectionTranslation_locale_idx" ON "public"."ImpactSectionTranslation"("locale" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ImpactSectionTranslation_sectionId_locale_key" ON "public"."ImpactSectionTranslation"("sectionId" ASC, "locale" ASC);

-- AddForeignKey
ALTER TABLE "public"."ImpactItem" ADD CONSTRAINT "ImpactItem_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "public"."MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactItem" ADD CONSTRAINT "ImpactItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."ImpactSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactItemTranslation" ADD CONSTRAINT "ImpactItemTranslation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."ImpactItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactSection" ADD CONSTRAINT "ImpactSection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactSection" ADD CONSTRAINT "ImpactSection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ImpactSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactSectionTranslation" ADD CONSTRAINT "ImpactSectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."ImpactSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- --- Données ---------------------------------------------------------------

-- ImpactSection : 6 lignes
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqhxa20000ntc0y3llpc11', 'accueil-impact-humain', 'ACCUEIL_IMPACT', 'STATS', 'GRIS', 'PUBLISHED', 0, NULL, FALSE, TRUE, '/projet', NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z', NULL, NULL);
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqi0np000fntc0c668grth', 'resultats-histoires', 'RESULTATS_HISTOIRES', 'TEMOIGNAGES', 'GRIS', 'PUBLISHED', 0, NULL, FALSE, FALSE, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z', NULL, NULL);
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqi3tk000untc0ck3seovl', 'resultats-dialogues', 'RESULTATS_DIALOGUES', 'CARTES', 'CLAIR', 'PUBLISHED', 0, NULL, FALSE, FALSE, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z', NULL, NULL);
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqic3t0020ntc0n8xc6mf4', 'projet-jalons', 'PROJET_JALONS', 'JALONS', 'CLAIR', 'PUBLISHED', 0, NULL, FALSE, FALSE, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z', NULL, NULL);
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqi7xn001fntc00ugutegv', 'projet-changements', 'PROJET_CHANGEMENTS', 'AVANT_APRES', 'GRIS', 'PUBLISHED', 0, NULL, FALSE, FALSE, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:32:15.557Z', NULL, NULL);
INSERT INTO "ImpactSection" ("id", "key", "emplacement", "layout", "theme", "status", "position", "numero", "compact", "grandTitre", "ctaUrl", "createdById", "createdAt", "updatedAt", "limite", "sourceId") VALUES ('cmsrqigp7002ontc0wuf6renv', 'accueil-histoires', 'ACCUEIL_HISTOIRES', 'TEMOIGNAGES', 'CLAIR', 'PUBLISHED', 0, NULL, TRUE, TRUE, '/resultats', NULL, '2026-08-13T15:30:33.739Z', '2026-08-13T15:32:20.043Z', NULL, 'cmsrqi0np000fntc0c668grth');

-- ImpactSectionTranslation : 12 lignes
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqhxih0001ntc0vtyke3s8', 'cmsrqhxa20000ntc0y3llpc11', 'fr', 'Impact humain', 'Ce que ces ambitions représentent, une fois traduites.', 'Ces ambitions ne sont pas des abstractions — ce sont des écoles en ligne, des femmes dans les métiers du numérique et des villages raccordés.', 'Découvrir le projet', '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqhxih0002ntc02v5yx36t', 'cmsrqhxa20000ntc0y3llpc11', 'en', 'Human impact', 'What these ambitions mean, once translated.', 'These ambitions are not abstractions — they are schools online, women in digital careers and villages brought onto the network.', 'Discover the project', '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi0wx000gntc0wy456fhc', 'cmsrqi0np000fntc0c668grth', 'fr', 'Histoires & impact', 'Au-delà des chiffres, des vies qui changent.', 'Celles et ceux pour qui le Projet existe — des visages, des métiers, des territoires.', NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi0wx000hntc0bslewaly', 'cmsrqi0np000fntc0c668grth', 'en', 'Stories & impact', 'Beyond the numbers, lives that change.', 'The people the Project is for — faces, trades and places across the country.', NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi41x000vntc0482zjgmy', 'cmsrqi3tk000untc0ck3seovl', 'fr', 'Dialogues sectoriels', 'Le numérique n''est utile qu''appliqué à un métier.', 'Une infrastructure ne produit d''effet qu''à travers les politiques sectorielles qui s''en saisissent. Ces dialogues servent à identifier, avec chaque ministère et chaque profession, l''usage précis qui justifie l''investissement.', NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi41x000wntc0uo19na78', 'cmsrqi3tk000untc0ck3seovl', 'en', 'Sector dialogues', 'Digital is only useful when applied to a trade.', 'Infrastructure only produces effects through the sector policies that take hold of it. These dialogues serve to identify, with each ministry and each profession, the precise use that justifies the investment.', NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi87a001gntc0eubrvq9z', 'cmsrqi7xn001fntc00ugutegv', 'fr', 'Ce que ça change pour vous', 'Ce qui change vraiment tient souvent à une seule chose : ne plus avoir à se déplacer pour prouver ce que l''administration sait déjà.', 'Un projet d''infrastructure ne se juge pas à ce qu''il installe, mais à ce qu''il rend possible — et à ce qu''il cesse d''imposer. Voici, secteur par secteur, la contrainte d''aujourd''hui et le mécanisme précis qui la lève.', NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqi87a001hntc0n1kjbb8y', 'cmsrqi7xn001fntc00ugutegv', 'en', 'What it changes for you', 'What really changes often comes down to one thing: no longer travelling to prove what the administration already knows.', 'An infrastructure project is judged not by what it installs, but by what it makes possible — and by what it stops imposing. Here, sector by sector, is today''s constraint and the precise mechanism that lifts it.', NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqicc50021ntc0e7cgwfup', 'cmsrqic3t0020ntc0n8xc6mf4', 'fr', 'Calendrier & jalons', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqigxl002pntc0mijsmclu', 'cmsrqigp7002ontc0wuf6renv', 'fr', 'Histoires & impact', 'Au-delà des chiffres, des vies qui changent.', 'Celles et ceux pour qui le Projet existe — des visages, des métiers, des territoires.', 'Voir toutes les histoires & vidéos', '2026-08-13T15:30:33.739Z', '2026-08-13T15:30:33.739Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqigxl002qntc0pmy9ksea', 'cmsrqigp7002ontc0wuf6renv', 'en', 'Stories & impact', 'Beyond the numbers, lives that change.', 'The people the Project is for — faces, trades and places across the country.', 'See all stories & videos', '2026-08-13T15:30:33.739Z', '2026-08-13T15:30:33.739Z');
INSERT INTO "ImpactSectionTranslation" ("id", "sectionId", "locale", "kicker", "titre", "lead", "ctaLabel", "createdAt", "updatedAt") VALUES ('cmsrqkhf80001v5c00r6ifnpc', 'cmsrqic3t0020ntc0n8xc6mf4', 'en', 'Timeline & milestones', NULL, NULL, NULL, '2026-08-13T15:32:07.988Z', '2026-08-13T15:32:07.988Z');

-- ImpactItem : 27 lignes
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqhxqs0003ntc0s40dbgb2', 'cmsrqhxa20000ntc0y3llpc11', 0, 'PUBLISHED', FALSE, '30 M', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqhy760006ntc0m644mkow', 'cmsrqhxa20000ntc0y3llpc11', 1, 'PUBLISHED', FALSE, '1 000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqhypk0009ntc0xswo03hj', 'cmsrqhxa20000ntc0y3llpc11', 2, 'PUBLISHED', FALSE, '1 000', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqhz5x000cntc0fi33nmc9', 'cmsrqhxa20000ntc0y3llpc11', 3, 'PUBLISHED', FALSE, '180', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi15c000intc0wk31mys2', 'cmsrqi0np000fntc0c668grth', 0, 'PUBLISHED', FALSE, NULL, '#8a3ffc', 'lLIB8fyagio', NULL, NULL, NULL, 'formation', '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi1lx000lntc04itvgn21', 'cmsrqi0np000fntc0c668grth', 1, 'PUBLISHED', FALSE, NULL, '#0f62fe', 'xQpTar5oOgA', NULL, NULL, NULL, 'citoyens', '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi24v000ontc02agh0t5y', 'cmsrqi0np000fntc0c668grth', 2, 'PUBLISHED', FALSE, NULL, '#009d9a', '2ZJGxoF610c', NULL, NULL, NULL, 'sante', '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi2li000rntc0ilk7toeb', 'cmsrqi0np000fntc0c668grth', 3, 'PUBLISHED', FALSE, NULL, '#198038', '1MKgrHH04dM', NULL, NULL, NULL, 'agri', '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi4a4000xntc0cuevhxci', 'cmsrqi3tk000untc0ck3seovl', 0, 'PUBLISHED', FALSE, NULL, '#da1e28', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi4sp0010ntc0dk1n6kzh', 'cmsrqi3tk000untc0ck3seovl', 1, 'PUBLISHED', FALSE, NULL, '#8a3ffc', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi59u0013ntc03wff3xq4', 'cmsrqi3tk000untc0ck3seovl', 2, 'PUBLISHED', FALSE, NULL, '#198038', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi5rt0016ntc0g1ew0j0b', 'cmsrqi3tk000untc0ck3seovl', 3, 'PUBLISHED', FALSE, NULL, '#0f62fe', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi68t0019ntc0hlp18tn1', 'cmsrqi3tk000untc0ck3seovl', 4, 'PUBLISHED', FALSE, NULL, '#009d9a', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi6pk001cntc0agvjay8l', 'cmsrqi3tk000untc0ck3seovl', 5, 'PUBLISHED', FALSE, NULL, '#ff832b', NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi8g4001intc0dzy6e78j', 'cmsrqi7xn001fntc00ugutegv', 0, 'PUBLISHED', FALSE, '01', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi8x1001lntc07o1kzwco', 'cmsrqi7xn001fntc00ugutegv', 1, 'PUBLISHED', FALSE, '02', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi9ey001ontc0c5wig0k0', 'cmsrqi7xn001fntc00ugutegv', 2, 'PUBLISHED', FALSE, '03', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqi9vu001rntc0tgz8rgo6', 'cmsrqi7xn001fntc00ugutegv', 3, 'PUBLISHED', FALSE, '04', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqiacs001untc05d2hp9mg', 'cmsrqi7xn001fntc00ugutegv', 4, 'PUBLISHED', FALSE, '05', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqiav5001xntc0tkyut87h', 'cmsrqi7xn001fntc00ugutegv', 5, 'PUBLISHED', FALSE, '06', NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqickt0023ntc05sjemfda', 'cmsrqic3t0020ntc0n8xc6mf4', 0, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2024-11-25T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqid200026ntc0awszibqa', 'cmsrqic3t0020ntc0n8xc6mf4', 1, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2025-03-14T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqidj20029ntc0nx08d6wz', 'cmsrqic3t0020ntc0n8xc6mf4', 2, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2025-04-15T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqie04002cntc0u60ou8ks', 'cmsrqic3t0020ntc0n8xc6mf4', 3, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2025-06-23T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqieic002fntc0xvwclxxc', 'cmsrqic3t0020ntc0n8xc6mf4', 4, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2025-10-31T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqiez5002intc0eugp3jf9', 'cmsrqic3t0020ntc0n8xc6mf4', 5, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2029-12-31T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');
INSERT INTO "ImpactItem" ("id", "sectionId", "position", "status", "featured", "valeur", "color", "videoYt", "lienUrl", "dateAt", "coverMediaId", "coverKey", "createdAt", "updatedAt") VALUES ('cmsrqifhf002lntc0ierdxuq1', 'cmsrqic3t0020ntc0n8xc6mf4', 6, 'PUBLISHED', FALSE, NULL, NULL, NULL, NULL, '2030-04-30T07:00:00.000Z', NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:32:12.035Z');

-- ImpactItemTranslation : 54 lignes
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhxyz0004ntc0dg9v5efb', 'cmsrqhxqs0003ntc0s40dbgb2', 'fr', 'utilisateurs visés', NULL, '— l''ambition d''un Congolais sur trois en ligne à l''horizon du projet.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhxyz0005ntc0nuojbqvh', 'cmsrqhxqs0003ntc0s40dbgb2', 'en', 'users targeted', NULL, '— the ambition of one Congolese in three online over the project horizon.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhyhk0007ntc0vpurflkj', 'cmsrqhy760006ntc0m644mkow', 'fr', 'institutions', NULL, 'écoles, hôpitaux et administrations à raccorder progressivement.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhyhk0008ntc04vyc7tgq', 'cmsrqhy760006ntc0m644mkow', 'en', 'institutions', NULL, 'schools, hospitals and public offices to be connected progressively.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhyxm000antc0lie6yiza', 'cmsrqhypk0009ntc0xswo03hj', 'fr', 'femmes', NULL, 'visées parmi les diplômés du programme de compétences numériques avancées.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhyxm000bntc07mkcbr1g', 'cmsrqhypk0009ntc0xswo03hj', 'en', 'women', NULL, 'targeted among the graduates of the advanced digital skills programme.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhzqc000dntc0aqxb89ba', 'cmsrqhz5x000cntc0fi33nmc9', 'fr', 'communautés', NULL, 'rurales non desservies visées par les premiers lots de déploiement.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqhzqc000entc05gyavh0g', 'cmsrqhz5x000cntc0fi33nmc9', 'en', 'communities', NULL, 'underserved rural communities targeted by the first deployment lots.', NULL, NULL, NULL, '2026-08-13T15:30:08.570Z', '2026-08-13T15:30:08.570Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi1dl000jntc0x741uwvk', 'cmsrqi15c000intc0wk31mys2', 'fr', 'Étudiante — Goma', 'Esther, 24 ans', '« Avant, on se partageait un manuel rare. Aujourd''hui je suis des cours en ligne — et j''ai commencé à coder. »', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi1dl000kntc0eo9yvr9l', 'cmsrqi15c000intc0wk31mys2', 'en', 'Student — Goma', 'Esther, 24', '“I used to share one rare textbook. Now I follow courses online — and I''ve started to code.”', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi1um000mntc04dy3pmcg', 'cmsrqi1lx000lntc04itvgn21', 'fr', 'Commerçant — Tshikapa', 'Jean-Pierre', '« Je vends maintenant dans tout le pays et j''encaisse par mobile. »', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi1um000nntc0cy028zo9', 'cmsrqi1lx000lntc04itvgn21', 'en', 'Trader — Tshikapa', 'Jean-Pierre', '“I now sell across the whole country and get paid by mobile money.”', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi2d8000pntc0o6oa0m3f', 'cmsrqi24v000ontc02agh0t5y', 'fr', 'Médecin — Kindu', 'Dr Mwamba', '« Le dossier partagé et la téléconsultation changent la prise en charge des patients. »', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi2d8000qntc0g2b9p09p', 'cmsrqi24v000ontc02agh0t5y', 'en', 'Doctor — Kindu', 'Dr Mwamba', '“Shared records and tele-consultation are changing how we care for patients.”', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi2tt000sntc0z2qipd3t', 'cmsrqi2li000rntc0ilk7toeb', 'fr', 'Agricultrice — Butembo', 'Mama Kavira', '« Je connais enfin les vrais prix du marché — en temps réel, avant de vendre. »', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi2tt000tntc0rz8k44ma', 'cmsrqi2li000rntc0ilk7toeb', 'en', 'Farmer — Butembo', 'Mama Kavira', '“I finally know the real market prices — in real time, before I sell.”', NULL, NULL, NULL, '2026-08-13T15:30:12.949Z', '2026-08-13T15:30:12.949Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi4k5000yntc0dab8jwrh', 'cmsrqi4a4000xntc0cuevhxci', 'fr', 'Santé', 'Santé numérique & établissements connectés', 'Rendre l''antériorité médicale portable d''un établissement à l''autre, et permettre l''avis spécialisé sans déplacer le patient — ce qui suppose un identifiant fiable avant tout dossier partagé.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi51d0011ntc0txkq1hbc', 'cmsrqi4sp0010ntc0dk1n6kzh', 'fr', 'Éducation', 'Écoles connectées & apprentissage en ligne', 'Raccorder les établissements pour que l''accès aux fonds documentaires ne dépende plus du nombre d''exemplaires physiques disponibles sur place.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi51d0012ntc020mg3spy', 'cmsrqi4sp0010ntc0dk1n6kzh', 'en', 'Education', 'Connected schools & online learning', 'Connecting institutions so that access to collections no longer depends on how many physical copies are available on site.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi5i20014ntc0hzwh04qq', 'cmsrqi59u0013ntc03wff3xq4', 'fr', 'Agriculture', 'Prix du marché & services ruraux', 'Réduire l''asymétrie d''information entre le producteur et l''acheteur : connaître le prix pratiqué ailleurs change la position de négociation avant la vente.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi5i20015ntc0ei4achi9', 'cmsrqi59u0013ntc03wff3xq4', 'en', 'Agriculture', 'Market prices & rural services', 'Reducing the information asymmetry between producer and buyer: knowing the price paid elsewhere changes the bargaining position before the sale.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi60j0017ntc09ivi46o5', 'cmsrqi5rt0016ntc0g1ew0j0b', 'fr', 'Finance', 'Inclusion financière & mobile money', 'Lever l''obstacle d''entrée que constitue l''identification du client, puis transformer l''historique de transaction en preuve d''activité mobilisable pour un crédit.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi60j0018ntc0zc3oiuq6', 'cmsrqi5rt0016ntc0g1ew0j0b', 'en', 'Finance', 'Financial inclusion & mobile money', 'Removing the entry barrier of customer identification, then turning transaction history into evidence of activity that can support a loan.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi6h4001antc046sllqaw', 'cmsrqi68t0019ntc0hlp18tn1', 'fr', 'Administration', 'Services publics numériques par défaut', 'Cesser de demander à l''usager une information que l''administration détient déjà, ce qui suppose des registres capables de se vérifier mutuellement.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi6h4001bntc0xfcjmos5', 'cmsrqi68t0019ntc0hlp18tn1', 'en', 'Public services', 'Digital-by-default public services', 'Ceasing to ask users for information the administration already holds, which requires registries able to verify one another.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi6zr001dntc0j72gfqld', 'cmsrqi6pk001cntc0agvjay8l', 'fr', 'Secteur privé', 'Startups, hubs & économie numérique', 'Créer la demande locale sans laquelle les compétences formées quittent le pays : services, contenus et hébergement produits en RDC.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi6zr001entc0lykqg29d', 'cmsrqi6pk001cntc0agvjay8l', 'en', 'Private sector', 'Startups, hubs & the digital economy', 'Creating the local demand without which trained skills leave the country: services, content and hosting produced in the DRC.', NULL, NULL, NULL, '2026-08-13T15:30:17.048Z', '2026-08-13T15:30:17.048Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi8oh001jntc0idfo9mrc', 'cmsrqi8g4001intc0dzy6e78j', 'fr', NULL, 'Démarches administratives', 'Une information déjà détenue par l''administration est vérifiée à sa source, entre systèmes. Ce qui reste demandé à l''usager, c''est ce que l''État ne sait pas.', 'Le même justificatif est redemandé à chaque guichet, parce qu''aucun service ne peut vérifier ce que détient le service voisin. La charge de la preuve pèse sur l''usager.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi8oh001kntc0oj4vdrpz', 'cmsrqi8g4001intc0dzy6e78j', 'en', NULL, 'Administrative paperwork', 'Information the administration already holds is checked at source, system to system. What is still asked of the user is what the State does not know.', 'The same supporting document is demanded at every counter, because no office can check what the neighbouring office holds. The burden of proof falls on the user.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi95l001mntc0tm43tj09', 'cmsrqi8x1001lntc07o1kzwco', 'fr', NULL, 'École & université', 'Un établissement raccordé ouvre à tous ses étudiants les mêmes fonds documentaires, au même moment, quelle que soit la province.', 'L''accès aux ressources dépend d''exemplaires physiques rares et d''une bande passante partagée, quand le campus est raccordé. Le savoir circule à la vitesse du papier.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi95l001nntc0hhz72ygp', 'cmsrqi8x1001lntc07o1kzwco', 'en', NULL, 'School & university', 'A connected institution opens the same collections to all its students, at the same time, whatever the province.', 'Access to resources depends on scarce physical copies and shared bandwidth, where the campus is connected at all. Knowledge travels at the speed of paper.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi9n7001pntc0ekrnttwr', 'cmsrqi9ey001ontc0c5wig0k0', 'fr', NULL, 'Petite entreprise', 'La vente à distance élargit la clientèle, et l''historique de paiement devient un actif : une preuve d''activité opposable à un prêteur.', 'Le marché s''arrête où s''arrête le déplacement physique, et le paiement en espèces ne laisse aucune trace utilisable pour obtenir un crédit.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqi9n7001qntc03stoh8e7', 'cmsrqi9ey001ontc0c5wig0k0', 'en', NULL, 'Small business', 'Remote selling widens the customer base, and payment history becomes an asset: evidence of activity that a lender can rely on.', 'The market ends where physical travel ends, and cash payment leaves no record usable to obtain credit.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqia4h001sntc0c9li22yi', 'cmsrqi9vu001rntc0tgz8rgo6', 'fr', NULL, 'Santé', 'Un identifiant fiable et un dossier consultable à distance rendent l''antériorité portable, et permettent l''avis spécialisé sans déplacer le patient.', 'L''historique du patient reste dans l''établissement où il a été écrit. Un transfert, une épidémie ou un déplacement de population fait perdre l''antériorité médicale.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqia4h001tntc0loz2hduc', 'cmsrqi9vu001rntc0tgz8rgo6', 'en', NULL, 'Health', 'A reliable identifier and a remotely accessible record make that history portable, and allow specialist advice without moving the patient.', 'The patient''s history stays in the facility where it was written. A transfer, an epidemic or a population movement erases the medical record.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqiamk001vntc0n8aetxm9', 'cmsrqiacs001untc05d2hp9mg', 'fr', NULL, 'Inclusion financière', 'Une identité numérique inclusive lève cet obstacle d''entrée, et rend possibles l''épargne, le paiement et, progressivement, le crédit.', 'Sans identité vérifiable, l''ouverture d''un compte se heurte aux obligations de connaissance du client : l''exclusion est réglementaire autant qu''économique.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqiamk001wntc0uwu5ogz7', 'cmsrqiacs001untc05d2hp9mg', 'en', NULL, 'Financial inclusion', 'An inclusive digital identity removes that entry barrier, making saving, payment and, progressively, credit possible.', 'Without verifiable identity, opening an account runs into know-your-customer obligations: exclusion is regulatory as much as economic.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqib3q001yntc0rin4yt4g', 'cmsrqiav5001xntc0tkyut87h', 'fr', NULL, 'Zones rurales', 'Un appui ciblé au déploiement et des solutions énergétiques adaptées déplacent ce seuil, et rendent la couverture soutenable là où elle ne l''était pas.', 'La faible densité et le coût de l''énergie placent ces zones sous le seuil de rentabilité d''un déploiement commercial : le réseau s''y arrête, durablement.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqib3q001zntc05djfv51q', 'cmsrqiav5001xntc0tkyut87h', 'en', NULL, 'Rural areas', 'Targeted deployment support and adapted energy solutions move that threshold, making coverage sustainable where it was not.', 'Low density and energy costs place these areas below the profitability threshold for a commercial rollout: the network stops there, lastingly.', NULL, NULL, '2026-08-13T15:30:22.379Z', '2026-08-13T15:30:22.379Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqicsx0024ntc0fxweyuxg', 'cmsrqickt0023ntc05sjemfda', 'fr', NULL, NULL, 'Signature de l''accord avec la Banque mondiale', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqicsx0025ntc0ri9ovr0j', 'cmsrqickt0023ntc05sjemfda', 'en', NULL, NULL, 'Financing agreement signed with the World Bank', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqidam0027ntc0zkz0zr79', 'cmsrqid200026ntc0awszibqa', 'fr', NULL, NULL, 'Signature de la convention avec l''AFD', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqidan0028ntc0ppuh4hwa', 'cmsrqid200026ntc0awszibqa', 'en', NULL, NULL, 'Financing convention signed with AFD', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqidrg002antc053hezaj7', 'cmsrqidj20029ntc0nx08d6wz', 'fr', NULL, NULL, 'Création de l''UGPTN (arrêté ministériel)', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqidrh002bntc03r08pi5e', 'cmsrqidj20029ntc0nx08d6wz', 'en', NULL, NULL, 'Creation of the UGPTN (ministerial order)', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqie9p002dntc06lp39kr5', 'cmsrqie04002cntc0u60ou8ks', 'fr', NULL, NULL, 'Validation du Manuel d''Exécution (MEP)', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqie9p002entc0gkbgwux3', 'cmsrqie04002cntc0u60ou8ks', 'en', NULL, NULL, 'Validation of the Implementation Manual (PIM)', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqieqh002gntc0sapa7unc', 'cmsrqieic002fntc0xvwclxxc', 'fr', NULL, NULL, 'Entrée en vigueur du projet', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqieqh002hntc0cvduhr1x', 'cmsrqieic002fntc0xvwclxxc', 'en', NULL, NULL, 'Project effectiveness', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqif77002jntc001bcpu7u', 'cmsrqiez5002intc0eugp3jf9', 'fr', NULL, NULL, 'Achèvement technique', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqif77002kntc0evn7mvml', 'cmsrqiez5002intc0eugp3jf9', 'en', NULL, NULL, 'Technical completion', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqifpn002mntc0doxqzbs3', 'cmsrqifhf002lntc0ierdxuq1', 'fr', NULL, NULL, 'Date limite de décaissement IDA', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqifpn002nntc0rpzu2axo', 'cmsrqifhf002lntc0ierdxuq1', 'en', NULL, NULL, 'IDA disbursement deadline', NULL, NULL, NULL, '2026-08-13T15:30:27.785Z', '2026-08-13T15:30:27.785Z');
INSERT INTO "ImpactItemTranslation" ("id", "itemId", "locale", "surtitre", "titre", "texte", "texteSecondaire", "lienLabel", "mediaAlt", "createdAt", "updatedAt") VALUES ('cmsrqkdmn0000v5c0l9qe00kj', 'cmsrqi4a4000xntc0cuevhxci', 'en', 'Health', 'Digital health & connected facilities', 'Making a patient''s medical history portable between facilities, and enabling specialist advice without moving the patient — which requires a reliable identifier before any shared record.', NULL, NULL, NULL, '2026-08-13T15:32:03.071Z', '2026-08-13T15:32:03.071Z');

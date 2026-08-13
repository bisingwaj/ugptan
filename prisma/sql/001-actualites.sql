-- ===========================================================================
-- CMS d'actualités — création des tables, en ajout pur.
--
-- POURQUOI CE FICHIER PLUTÔT QUE `prisma db push`
-- La base pointée par DATABASE_URL a divergé de `prisma/schema.prisma` : elle
-- porte aujourd'hui des tables d'authentification (`Account`, `Session`,
-- `Verification`) et un module de plaintes (`Grievance*`) absents du schéma, et
-- sa table `User` n'a plus la colonne `passwordHash`. `prisma db push` refuse
-- donc de s'exécuter, et `--force-reset` détruirait ces données.
--
-- Ce script crée UNIQUEMENT les objets du module « Actualités ». Il ne touche
-- à aucune table existante : les seules références au reste du schéma sont des
-- clés étrangères vers `User(id)`, toutes en `ON DELETE SET NULL`.
--
-- Il est IDEMPOTENT : relançable sans effet sur une base déjà à jour.
--
-- Une fois la divergence de `User` réglée, `prisma db push` reprend son rôle et
-- ce fichier n'a plus lieu d'être.
--
-- Exécution :
--   npx prisma db execute --file prisma/sql/001-actualites.sql
--
-- Les noms de contraintes et d'index reproduisent exactement ceux que Prisma
-- aurait produits, pour qu'un `db push` ultérieur considère la base en phase.
-- ===========================================================================

DO $$ BEGIN
  CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MediaAsset" (
  "id"          TEXT NOT NULL,
  "filename"    TEXT NOT NULL,
  "mimeType"    TEXT NOT NULL,
  "size"        INTEGER NOT NULL DEFAULT 0,
  "width"       INTEGER,
  "height"      INTEGER,
  "data"        BYTEA,
  "url"         TEXT,
  "altFr"       TEXT,
  "altEn"       TEXT,
  "legende"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

CREATE TABLE IF NOT EXISTS "ArticleCategory" (
  "id"        TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "nomFr"     TEXT NOT NULL,
  "nomEn"     TEXT NOT NULL,
  "color"     TEXT,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleCategory_slug_key" ON "ArticleCategory"("slug");
CREATE INDEX IF NOT EXISTS "ArticleCategory_position_idx" ON "ArticleCategory"("position");

CREATE TABLE IF NOT EXISTS "Tag" (
  "id"        TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "nomFr"     TEXT NOT NULL,
  "nomEn"     TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

CREATE TABLE IF NOT EXISTS "Article" (
  "id"           TEXT NOT NULL,
  "status"       "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt"  TIMESTAMP(3),
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "lieu"         TEXT,
  "videoYt"      TEXT,
  "comps"        TEXT[] DEFAULT ARRAY[]::TEXT[],
  "categoryId"   TEXT,
  "coverMediaId" TEXT,
  "coverKey"     TEXT,
  "authorId"     TEXT,
  "authorName"   TEXT,
  "authorRole"   TEXT,
  "createdById"  TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_featured_idx" ON "Article"("featured");

CREATE TABLE IF NOT EXISTS "ArticleTranslation" (
  "id"             TEXT NOT NULL,
  "articleId"      TEXT NOT NULL,
  "locale"         TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "excerpt"        TEXT,
  "contentHtml"    TEXT NOT NULL DEFAULT '',
  "seoTitle"       TEXT,
  "seoDescription" TEXT,
  "coverAlt"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArticleTranslation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleTranslation_articleId_locale_key" ON "ArticleTranslation"("articleId", "locale");
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleTranslation_locale_slug_key" ON "ArticleTranslation"("locale", "slug");
CREATE INDEX IF NOT EXISTS "ArticleTranslation_locale_idx" ON "ArticleTranslation"("locale");

CREATE TABLE IF NOT EXISTS "ArticleTag" (
  "articleId" TEXT NOT NULL,
  "tagId"     TEXT NOT NULL,
  CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId", "tagId")
);
CREATE INDEX IF NOT EXISTS "ArticleTag_tagId_idx" ON "ArticleTag"("tagId");

-- Clés étrangères. `DO … EXCEPTION WHEN duplicate_object` : PostgreSQL n'admet
-- pas `ADD CONSTRAINT IF NOT EXISTS`.
DO $$ BEGIN
  ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_coverMediaId_fkey"
    FOREIGN KEY ("coverMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ArticleTranslation" ADD CONSTRAINT "ArticleTranslation_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Pièce jointe PDF des actualités (communiqués).
--
-- À appliquer AVANT le déploiement du code qui s'en sert : le client Prisma
-- régénéré lit ces colonnes à chaque lecture d'article, et une colonne absente
-- ferait tomber la page « Actualités ».
--
-- Purement additive : toutes les colonnes sont facultatives (ou ont une valeur
-- par défaut), aucune ligne existante n'est modifiée. Rejouable sans dommage
-- (IF NOT EXISTS), donc passable à la main dans la console SQL Neon aussi bien
-- que par `prisma migrate deploy`.

ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "fileUrl"      TEXT,
  ADD COLUMN IF NOT EXISTS "filePublicId" TEXT,
  ADD COLUMN IF NOT EXISTS "fileName"     TEXT,
  ADD COLUMN IF NOT EXISTS "fileMime"     TEXT,
  ADD COLUMN IF NOT EXISTS "fileSize"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "fileFormat"   TEXT;

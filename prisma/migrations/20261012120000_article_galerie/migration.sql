-- Galerie d'images des actualités.
--
-- À appliquer AVANT le déploiement du code qui s'en sert : la lecture des
-- articles joint désormais cette table, et son absence ferait tomber la page
-- « Actualités ».
--
-- Purement additive : une table neuve, aucune ligne existante modifiée.
-- Rejouable sans dommage (IF NOT EXISTS, contraintes posées seulement si elles
-- manquent), donc passable à la main dans la console SQL Neon aussi bien que
-- par `prisma migrate deploy`.

CREATE TABLE IF NOT EXISTS "ArticleImage" (
    "articleId" TEXT NOT NULL,
    "mediaId"   TEXT NOT NULL,
    "position"  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ArticleImage_pkey" PRIMARY KEY ("articleId", "mediaId")
);

CREATE INDEX IF NOT EXISTS "ArticleImage_mediaId_idx" ON "ArticleImage"("mediaId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleImage_articleId_fkey') THEN
    ALTER TABLE "ArticleImage" ADD CONSTRAINT "ArticleImage_articleId_fkey"
      FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArticleImage_mediaId_fkey') THEN
    ALTER TABLE "ArticleImage" ADD CONSTRAINT "ArticleImage_mediaId_fkey"
      FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

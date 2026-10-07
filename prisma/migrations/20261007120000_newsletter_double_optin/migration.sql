-- Double confirmation (double opt-in) de la lettre d'information.
--
-- ÉTAPE 1 SUR 2, à appliquer AVANT le déploiement du code qui s'en sert : le
-- client Prisma régénéré lit et écrit les colonnes ajoutées ici, et le code
-- crée les nouvelles inscriptions au statut PENDING.
--
-- Aucune ligne existante n'est modifiée : les abonnés ACTIVE le restent, les
-- désabonnés aussi. Les colonnes ajoutées sont toutes facultatives.
--
-- Écrit pour être rejouable sans dommage (IF NOT EXISTS partout) : le dépôt
-- synchronise d'ordinaire son schéma par `prisma db push`, et cette migration
-- peut donc être passée à la main (console SQL Neon) aussi bien que par
-- `prisma migrate deploy`.
--
-- La valeur par défaut de "status" n'est PAS changée ici, pour deux raisons :
--   1. PostgreSQL refuse d'utiliser une valeur d'enum dans la transaction qui
--      l'a créée (« unsafe use of new value ») ;
--   2. tant que l'ancien code tourne, il insère sans statut explicite : un
--      défaut PENDING ferait de chaque nouvel inscrit un abonné en attente
--      que rien ne viendrait confirmer.
-- Le changement de défaut fait l'objet de l'étape 2.

-- 1. Nouvel état « en attente de confirmation ».
ALTER TYPE "NewsletterStatus" ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE';

-- 2. Jeton de confirmation (empreinte), échéance, dernier envoi.
ALTER TABLE "NewsletterSubscriber"
  ADD COLUMN IF NOT EXISTS "confirmTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "confirmExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "confirmSentAt"    TIMESTAMP(3);

-- 3. Unicité de l'empreinte : c'est par elle que la page de confirmation
--    retrouve l'abonnement. Plusieurs NULL restent admis.
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_confirmTokenHash_key"
  ON "NewsletterSubscriber"("confirmTokenHash");

-- Double confirmation de la lettre d'information.
--
-- ÉTAPE 2 SUR 2, à appliquer APRÈS le déploiement du code de double
-- confirmation (cf. 20261007120000_newsletter_double_optin).
--
-- Une ligne insérée sans statut explicite naît désormais EN ATTENTE, jamais
-- active. Le code pose toujours le statut lui-même : ce défaut est un filet
-- (import manuel, script, outil d'administration de la base), pas le mécanisme.
-- Aucune ligne existante n'est touchée.
ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "status" SET DEFAULT 'PENDING';

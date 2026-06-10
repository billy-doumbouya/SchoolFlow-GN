-- Migration Prisma : GenuinePay → Djomy
-- Fichier : prisma/migrations/YYYYMMDD_migrate_guinepay_to_djomy/migration.sql
--
-- ⚠️ Appliquer avec : npx prisma migrate dev --name migrate_guinepay_to_djomy
-- ⚠️ Sauvegarder la base avant d'exécuter en production

-- 1. Ajouter les nouveaux champs Djomy
ALTER TABLE "Payment"
  ADD COLUMN "djomyTransactionId" TEXT,
  ADD COLUMN "djomyRef"           TEXT;

-- 2. Copier les données existantes (GenuinePay → Djomy)
--    Les anciens IDs GuinePay sont conservés dans les nouveaux champs
--    pour ne pas perdre l'historique
UPDATE "Payment"
  SET "djomyTransactionId" = "guinePayIntentId",
      "djomyRef"           = "guinePayRef"
  WHERE "guinePayIntentId" IS NOT NULL;

-- 3. Supprimer les anciens champs GenuinePay
--    ⚠️ Ne pas exécuter avant d'avoir validé que les données sont bien migrées
ALTER TABLE "Payment"
  DROP COLUMN IF EXISTS "guinePayIntentId",
  DROP COLUMN IF EXISTS "guinePayRef";

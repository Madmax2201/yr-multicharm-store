-- Add a human-readable URL slug to products, e.g. "Braun Pro 5" -> "braun-pro-5"
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Backfill from the product name: lowercase, non-alphanumeric runs -> "-", no leading/trailing dashes.
UPDATE "Product"
SET "slug" = trim(both '-' FROM lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')));

-- Guard against products whose names slugify to an empty string.
UPDATE "Product" SET "slug" = 'product-' || "id" WHERE "slug" IS NULL OR "slug" = '';

-- Resolve collisions deterministically (e.g. two products both named "IPL 02")
-- by appending -2, -3, ... in id order, so the unique index below cannot fail.
DO $$
DECLARE
  rec RECORD;
  base TEXT;
  candidate TEXT;
  n INT;
BEGIN
  FOR rec IN
    SELECT "id", "slug" FROM "Product" ORDER BY "slug", "id"
  LOOP
    base := rec."slug";
    candidate := base;
    n := 1;
    WHILE EXISTS (SELECT 1 FROM "Product" p WHERE p."slug" = candidate AND p."id" <> rec."id") LOOP
      n := n + 1;
      candidate := base || '-' || n;
    END LOOP;
    IF candidate <> rec."slug" THEN
      UPDATE "Product" SET "slug" = candidate WHERE "id" = rec."id";
    END IF;
  END LOOP;
END $$;

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

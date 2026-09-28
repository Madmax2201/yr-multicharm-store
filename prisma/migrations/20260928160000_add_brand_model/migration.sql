-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- Seed brands from the distinct Product.brand values.
-- "Product"."brand" is normalised to the slug below so brand filtering
-- works the same way category filtering does.
INSERT INTO "Brand" ("id", "name", "slug") VALUES
    (md5('brand:mlay'),            'MLAY',            'mlay'),
    (md5('brand:anlan'),           'ANLAN',           'anlan'),
    (md5('brand:acura'),           'Acura',           'acura'),
    (md5('brand:braun'),           'Braun',           'braun'),
    (md5('brand:dermrays'),        'DermRays',        'dermrays'),
    (md5('brand:ipl'),             'IPL',             'ipl'),
    (md5('brand:kodo'),            'KODO',            'kodo'),
    (md5('brand:philips'),         'Philips',         'philips'),
    (md5('brand:tria'),            'Tria',            'tria'),
    (md5('brand:yr-multicharm'),   'YR Multicharm',   'yr-multicharm')
ON CONFLICT ("slug") DO NOTHING;

-- Point each product at its brand slug
UPDATE "Product" SET "brand" = 'mlay'          WHERE "brand" = 'MLAY';
UPDATE "Product" SET "brand" = 'anlan'         WHERE "brand" = 'ANLAN';
UPDATE "Product" SET "brand" = 'acura'         WHERE "brand" = 'Acura';
UPDATE "Product" SET "brand" = 'braun'         WHERE "brand" = 'Braun';
UPDATE "Product" SET "brand" = 'dermrays'      WHERE "brand" = 'DermRays';
UPDATE "Product" SET "brand" = 'ipl'           WHERE "brand" = 'IPL';
UPDATE "Product" SET "brand" = 'kodo'          WHERE "brand" = 'KODO';
UPDATE "Product" SET "brand" = 'philips'       WHERE "brand" = 'Philips';
UPDATE "Product" SET "brand" = 'tria'          WHERE "brand" = 'Tria';
UPDATE "Product" SET "brand" = 'yr-multicharm' WHERE "brand" = 'YR Multicharm';

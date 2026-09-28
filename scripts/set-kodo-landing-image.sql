-- Point the KODO landing page at the dedicated 9:16 artwork.
INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
VALUES (
    'kodoLandingImage',
    'https://w4eimkemawe31c3q.public.blob.vercel-storage.com/products/kodo-landing.jpg',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP;

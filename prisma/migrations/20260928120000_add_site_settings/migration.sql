-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- Seed the homepage hero background with the current bundled asset
INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
VALUES ('heroImage', '/images/hero-bg.jpg', NOW())
ON CONFLICT ("key") DO NOTHING;

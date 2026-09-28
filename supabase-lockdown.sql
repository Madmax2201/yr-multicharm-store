-- ============================================================
-- YR Multicharm - lock down direct REST access
--
-- The app connects as the `postgres` owner, which bypasses RLS,
-- so Prisma keeps working. But the browser-visible anon/authenticated
-- roles get NO access, so order + user + coupon data can never be
-- read or written through the public Supabase key.
--
-- Run in Supabase > SQL Editor > New query > Run
-- ============================================================

BEGIN;

ALTER TABLE "Category"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CouponProduct"  ENABLE ROW LEVEL SECURITY;

-- also revoke default write grants from the public roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

COMMIT;

-- verify: every table should report rowsecurity = true
SELECT c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

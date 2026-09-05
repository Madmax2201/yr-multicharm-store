import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/account", "/wishlist"];
  const adminPaths = ["/admin"];
  const authPaths = ["/auth/login", "/auth/register"];

  const token = request.cookies.get("token")?.value;

  if (authPaths.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/wishlist/:path*", "/admin/:path*", "/auth/:path*"],
};

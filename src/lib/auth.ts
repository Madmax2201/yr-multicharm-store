import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookie = request.cookies.get("token");
  return cookie?.value || null;
}

export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export function getCurrentUser(): JWTPayload | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(request?: NextRequest): Promise<JWTPayload | null> {
  if (request) {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
  }
  return getCurrentUser();
}

export async function requireAdmin(request?: NextRequest): Promise<JWTPayload | null> {
  const user = await requireAuth(request);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

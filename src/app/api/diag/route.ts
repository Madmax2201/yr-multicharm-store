import { NextResponse } from "next/server";
import net from "node:net";
import dns from "node:dns/promises";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function tcpProbe(host: string, port: number, timeout = 8000) {
  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    const socket = net.connect({ host, port });
    const done = (r: { ok: boolean; error?: string }) => {
      socket.destroy();
      resolve(r);
    };
    socket.setTimeout(timeout);
    socket.on("connect", () => done({ ok: true }));
    socket.on("timeout", () => done({ ok: false, error: "TCP timeout" }));
    socket.on("error", (e) => {
      const code = (e as NodeJS.ErrnoException).code;
      done({ ok: false, error: `${code || e.message}` });
    });
  });
}

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  const report: Record<string, unknown> = {
    hasDatabaseUrl: Boolean(url),
    host: (() => {
      try { return new URL(url).hostname; } catch { return "UNPARSEABLE"; }
    })(),
    port: (() => {
      try { return new URL(url).port || "5432"; } catch { return "?"; }
    })(),
    looksLikeSupabase: (() => {
      try { return new URL(url).hostname.includes("supabase"); } catch { return false; }
    })(),
    looksLikeNeon: (() => {
      try { return new URL(url).hostname.includes("neon.tech"); } catch { return false; }
    })(),
  };

  try {
    report.dns = await dns.lookup(report.host as string);
  } catch (e) {
    report.dns = { error: (e as Error).message };
  }

  report.tcp = await tcpProbe(report.host as string, Number(report.port) || 5432);

  try {
    const n = await prisma.product.count();
    report.prisma = { ok: true, productCount: n };
  } catch (e) {
    const err = e as { name?: string; code?: string; message?: string; meta?: unknown };
    report.prisma = {
      ok: false,
      name: err.name,
      code: err.code,
      message: (err.message || "").slice(0, 400),
    };
  }

  return NextResponse.json(report, { status: 200 });
}

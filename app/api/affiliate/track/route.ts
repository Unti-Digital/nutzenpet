import { NextResponse, type NextRequest } from "next/server";
import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

export async function POST(request: NextRequest) {
  if (!isWordPressConfigured()) return NextResponse.json({ valid: false }, { status: 503 });
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ valid: false }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { code?: string; linkToken?: string };
  const code = String(body.code ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80);
  const linkToken = String(body.linkToken ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64);
  if (!code) return NextResponse.json({ valid: false }, { status: 400 });
  const upstream = await fetch(getWordPressApiUrl("nutzen/v1/affiliate/track"), { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ code, link_token: linkToken }), cache: "no-store" });
  const payload = await upstream.json().catch(() => ({ valid: false })) as { valid?: boolean; attribution_days?: number; link_id?: number };
  const response = NextResponse.json(payload, { status: upstream.status });
  if (upstream.ok && payload.valid) {
    const maxAge = 60 * 60 * 24 * Math.max(1, Math.min(365, Number(payload.attribution_days) || 30));
    response.cookies.set("nutzen_ref", code, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
    if (linkToken && payload.link_id) response.cookies.set("nutzen_affiliate_link", linkToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  }
  return response;
}

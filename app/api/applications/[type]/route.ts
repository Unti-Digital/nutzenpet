import { NextResponse, type NextRequest } from "next/server";
import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

const allowedTypes = new Set(["retailer", "affiliate", "subscription"]);

type RouteParams = { params: Promise<{ type: string }> };

export async function POST(request: NextRequest, context: RouteParams) {
  if (!isWordPressConfigured()) return NextResponse.json({ message: "WordPress is not configured." }, { status: 503 });
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  const { type } = await context.params;
  if (!allowedTypes.has(type)) return NextResponse.json({ message: "Tipo de candidatura inválido." }, { status: 404 });

  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const token = request.cookies.get("nutzen_session")?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const upstream = await fetch(getWordPressApiUrl(`nutzen/v1/applications/${type}`), { method: "POST", headers, body: await request.text(), cache: "no-store" });
  const payload = await upstream.json().catch(() => ({ message: "Resposta inválida do WordPress." })) as Record<string, unknown>;
  const issuedToken = typeof payload.token === "string" ? payload.token : null;
  delete payload.token;
  const response = NextResponse.json(payload, { status: upstream.status });
  if (issuedToken && upstream.ok) response.cookies.set("nutzen_session", issuedToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}

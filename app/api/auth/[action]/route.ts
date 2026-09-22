import { NextResponse, type NextRequest } from "next/server";
import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

const sessionCookie = "nutzen_session";
const routes: Record<string, { endpoint: string; methods: string[] }> = {
  login: { endpoint: "auth/login", methods: ["POST"] },
  register: { endpoint: "auth/register", methods: ["POST"] },
  logout: { endpoint: "auth/logout", methods: ["POST"] },
  me: { endpoint: "auth/me", methods: ["GET", "POST"] },
  orders: { endpoint: "customer/orders", methods: ["GET"] },
  addresses: { endpoint: "customer/addresses", methods: ["GET", "POST"] },
  subscriptions: { endpoint: "subscription/me", methods: ["GET"] },
  affiliate: { endpoint: "affiliate/me", methods: ["GET"] },
  commissions: { endpoint: "affiliate/commissions", methods: ["GET"] },
};

type RouteParams = { params: Promise<{ action: string }> };

function validMutationOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

async function proxyAccountRequest(request: NextRequest, context: RouteParams) {
  if (!isWordPressConfigured()) return NextResponse.json({ message: "WordPress is not configured." }, { status: 503 });

  const { action } = await context.params;
  const route = routes[action];
  if (!route || !route.methods.includes(request.method)) return NextResponse.json({ message: "Route not allowed." }, { status: 404 });
  if (request.method !== "GET" && !validMutationOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });

  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const token = request.cookies.get(sessionCookie)?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const upstream = await fetch(getWordPressApiUrl(`nutzen/v1/${route.endpoint}`), {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });
  const payload = await upstream.json().catch(() => ({ message: "Invalid WordPress response." })) as Record<string, unknown>;
  const issuedToken = typeof payload.token === "string" ? payload.token : null;
  delete payload.token;
  const response = NextResponse.json(payload, { status: upstream.status });

  if (issuedToken && upstream.ok) {
    response.cookies.set(sessionCookie, issuedToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  if (action === "logout") response.cookies.delete(sessionCookie);
  return response;
}

export const dynamic = "force-dynamic";
export const GET = proxyAccountRequest;
export const POST = proxyAccountRequest;

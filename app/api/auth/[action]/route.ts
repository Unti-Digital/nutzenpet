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
  withdrawals: { endpoint: "affiliate/withdrawals", methods: ["GET", "POST"] },
  "affiliate-dashboard": { endpoint: "affiliate/dashboard", methods: ["GET"] },
  "affiliate-campaigns": { endpoint: "affiliate/campaigns", methods: ["GET", "POST"] },
  "affiliate-links": { endpoint: "affiliate/links", methods: ["GET", "POST"] },
  "affiliate-pix": { endpoint: "affiliate/pix", methods: ["GET", "POST"] },
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
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-Nutzen-Session", token);
    headers.set("Cookie", `${sessionCookie}=${encodeURIComponent(token)}`);
  }

  let upstreamMethod = request.method;
  let upstreamBody: string | undefined;
  const upstreamUrl = getWordPressApiUrl(`nutzen/v1/${route.endpoint}`);

  if (request.method === "GET" && token) {
    // Some hosting proxies strip authentication headers and cookies from
    // server-to-server requests. WordPress officially supports POST requests
    // with a method override, which lets us carry the session in the body.
    upstreamMethod = "POST";
    upstreamUrl.searchParams.set("_method", "GET");
    headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    upstreamBody = new URLSearchParams({ _nutzen_session: token }).toString();
  } else if (request.method !== "GET") {
    const rawBody = await request.text();
    if (token) {
      let body: Record<string, unknown> = {};
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody) as unknown;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
        } catch {
          return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
        }
      }
      upstreamBody = JSON.stringify({ ...body, _nutzen_session: token });
    } else {
      upstreamBody = rawBody;
    }
  }

  const upstream = await fetch(upstreamUrl, {
    method: upstreamMethod,
    headers,
    body: upstreamBody,
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

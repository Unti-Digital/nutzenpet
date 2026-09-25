import { NextResponse, type NextRequest } from "next/server";
import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

const cartCookie = "nutzen_wc_cart_token";
const allowedRoutes = new Set([
  "cart",
  "cart/add-item",
  "cart/remove-item",
  "cart/update-item",
  "cart/apply-coupon",
  "cart/remove-coupon",
  "cart/select-shipping-rate",
  "cart/update-customer",
  "checkout",
]);

type RouteParams = { params: Promise<{ path: string[] }> };

async function ensureCartToken(existingToken?: string) {
  if (existingToken) return existingToken;

  const response = await fetch(getWordPressApiUrl("wc/store/v1/cart"), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Unable to initialize WooCommerce cart session");
  return response.headers.get("Cart-Token") ?? undefined;
}

async function proxyStoreRequest(request: NextRequest, context: RouteParams) {
  if (!isWordPressConfigured()) {
    return NextResponse.json({ code: "woocommerce_not_configured", message: "WooCommerce is not configured." }, { status: 503 });
  }

  const { path } = await context.params;
  const route = path.join("/");
  if (!allowedRoutes.has(route)) {
    return NextResponse.json({ code: "route_not_allowed", message: "Store API route is not allowed." }, { status: 404 });
  }

  try {
    const token = await ensureCartToken(request.cookies.get(cartCookie)?.value);
    const target = getWordPressApiUrl(`wc/store/v1/${route}`);
    request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

    const headers = new Headers({ Accept: "application/json" });
    if (token) headers.set("Cart-Token", token);
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const referral = request.cookies.get("nutzen_ref")?.value;
    const affiliateLink = request.cookies.get("nutzen_affiliate_link")?.value;
    const referralCookies = [
      referral ? `nutzen_ref=${encodeURIComponent(referral)}` : "",
      affiliateLink ? `nutzen_affiliate_link=${encodeURIComponent(affiliateLink)}` : "",
    ].filter(Boolean);
    if (referralCookies.length) headers.set("Cookie", referralCookies.join("; "));

    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body || undefined,
      cache: "no-store",
    });
    const responseBody = await upstream.text();
    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
    const nextToken = upstream.headers.get("Cart-Token") ?? token;
    if (nextToken) {
      response.cookies.set(cartCookie, nextToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ code: "woocommerce_unavailable", message: "WooCommerce is temporarily unavailable." }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const GET = proxyStoreRequest;
export const POST = proxyStoreRequest;
export const PUT = proxyStoreRequest;
export const DELETE = proxyStoreRequest;

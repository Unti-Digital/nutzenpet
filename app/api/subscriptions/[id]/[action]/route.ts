import { NextResponse, type NextRequest } from "next/server";
import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

const allowedActions = new Set(["pause", "cancel", "reactivate", "frequency"]);

export async function POST(request: NextRequest, context: { params: Promise<{ id: string; action: string }> }) {
  if (!isWordPressConfigured()) return NextResponse.json({ message: "WordPress is not configured." }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const { id, action } = await context.params;
  if (!/^\d+$/.test(id) || !allowedActions.has(action)) return NextResponse.json({ message: "Invalid subscription action." }, { status: 404 });
  const token = request.cookies.get("nutzen_session")?.value;
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });

  const upstream = await fetch(getWordPressApiUrl(`nutzen/v1/subscription/${id}/${action}`), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: action === "frequency" ? await request.text() : undefined,
    cache: "no-store",
  });
  const payload = await upstream.json().catch(() => ({ message: "Invalid WordPress response." }));
  return NextResponse.json(payload, { status: upstream.status });
}

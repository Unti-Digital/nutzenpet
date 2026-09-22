import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

function signaturesMatch(payload: string, received: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const secret = process.env.NUTZEN_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Webhook is not configured." }, { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("x-nutzen-signature") ?? "";
  if (!signaturesMatch(payload, signature, secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: { tags?: unknown };
  try {
    body = JSON.parse(payload) as { tags?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0 && tag.length <= 256)
    : [];
  if (tags.length === 0) return Response.json({ error: "No valid cache tags." }, { status: 400 });

  for (const tag of [...new Set(tags)]) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true, tags: [...new Set(tags)] });
}

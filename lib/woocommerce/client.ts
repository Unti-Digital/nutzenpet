import { getWordPressApiUrl, isWordPressConfigured } from "./config";

type StoreRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown>;
  revalidate?: number;
  tags?: string[];
};

export class WooCommerceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "WooCommerceError";
  }
}

export async function storeApiRequest<T>(path: string, options: StoreRequestOptions = {}): Promise<T> {
  const url = getWordPressApiUrl(`wc/store/v1/${path.replace(/^\//, "")}`);
  const headers = new Headers(options.headers);
  let body = options.body;

  headers.set("Accept", "application/json");
  if (body && !(body instanceof FormData) && !(body instanceof URLSearchParams) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    body: body as BodyInit | undefined,
    headers,
    next: options.revalidate === undefined && !options.tags
      ? undefined
      : { revalidate: options.revalidate, tags: options.tags },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { code?: string; message?: string } | null;
    throw new WooCommerceError(
      payload?.message ?? "WooCommerce request failed",
      response.status,
      payload?.code,
    );
  }

  return response.json() as Promise<T>;
}

export { isWordPressConfigured };

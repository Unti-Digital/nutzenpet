const configuredUrl = process.env.WORDPRESS_URL?.trim();

export const wordpressUrl = configuredUrl?.replace(/\/$/, "") ?? null;

export function isWordPressConfigured() {
  return wordpressUrl !== null;
}

export function getWordPressUrl() {
  if (!wordpressUrl) {
    throw new Error("WORDPRESS_URL is not configured");
  }

  return wordpressUrl;
}

export function getWordPressApiUrl(path: string) {
  const base = new URL(getWordPressUrl());
  const prefix = base.pathname.replace(/\/$/, "");
  const apiPath = path.replace(/^\//, "");
  const queryStart = apiPath.indexOf("?");
  const pathname = queryStart >= 0 ? apiPath.slice(0, queryStart) : apiPath;
  const search = queryStart >= 0 ? apiPath.slice(queryStart) : "";
  base.pathname = `${prefix}/wp-json/${pathname}`;
  base.search = search;
  base.hash = "";
  return base;
}

"use client";

import { useEffect } from "react";

export function AffiliateAttribution() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("ref");
    if (!code) return;
    const linkToken = url.searchParams.get("nl");
    void fetch("/api/affiliate/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, linkToken }) }).then((response) => {
      if (!response.ok) return;
      url.searchParams.delete("ref");
      url.searchParams.delete("nl");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }).catch(() => undefined);
  }, []);
  return null;
}

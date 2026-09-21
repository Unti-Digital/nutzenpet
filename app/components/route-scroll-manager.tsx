"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function RouteScrollManager() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    root.scrollTop = 0;
    body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;
  }, [pathname]);

  return null;
}

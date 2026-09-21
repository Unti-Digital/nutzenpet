"use client";

import { useEffect } from "react";

const revealSelector = ".reveal-up";

export function ScrollRevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("motion-ready");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => element.classList.add("is-visible"));
      return () => root.classList.remove("motion-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    const observeElement = (element: Element) => {
      if (element.matches(revealSelector) && !element.classList.contains("is-visible")) observer.observe(element);
      element.querySelectorAll<HTMLElement>(revealSelector).forEach((child) => {
        if (!child.classList.contains("is-visible")) observer.observe(child);
      });
    };

    document.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => observer.observe(element));

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          observeElement(mutation.target as Element);
          return;
        }

        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) observeElement(node);
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

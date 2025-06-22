"use client";

import { useCallback, useEffect } from "react";

export function useSmoothScroll(offset = 0, enabled = true) {
  const scrollToAnchor = useCallback(
    (hash: string) => {
      if (!hash.startsWith("#")) return;
      const el = document.querySelector(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: "smooth",
        });

        history.pushState(null, "", hash);
      }
    },
    [offset],
  );

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const isSamePath = anchor.pathname === window.location.pathname;
      if (isSamePath) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          scrollToAnchor(href);
        }
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [enabled, scrollToAnchor]);

  return scrollToAnchor;
}

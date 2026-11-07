"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

function getContactChannel(href: string) {
  if (href.startsWith("https://wa.me/")) return "whatsapp";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  if (href.includes("maps.google.com") || href.includes("maps.app.goo.gl")) return "directions";
  if (href.includes("g.page/") || href.includes("google.com/maps")) return "google_profile";
  if (href === "/review") return "review_page";
  return null;
}

export function ContactEventTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      const href = target?.getAttribute("href");
      if (!href) return;

      const channel = getContactChannel(href);
      if (!channel) return;

      track("contact_click", {
        channel,
        page: window.location.pathname,
        label: target?.textContent?.trim().slice(0, 60) || "unlabeled",
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

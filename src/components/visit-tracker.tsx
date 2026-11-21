"use client";

import { useEffect } from "react";
import { anonymousVisitor } from "@/lib/visitor";

export function VisitTracker() {
  useEffect(() => {
    try {
      const visitorId = anonymousVisitor(window.localStorage, () => crypto.randomUUID());
      if (visitorId) void fetch("/api/visit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }), keepalive: true,
      }).catch(() => {});
    } catch { /* Analytics must never block the page or order form. */ }
  }, []);
  return null;
}

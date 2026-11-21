// Imported only by server route handlers. These values never enter browser code.
export function trackingUrl(): string | null {
  try {
    const url = new URL(process.env.SITE_URL?.trim() || "https://led-lamp.onrender.com");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch { return null; }
}

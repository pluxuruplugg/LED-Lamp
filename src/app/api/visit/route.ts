import { NextResponse } from "next/server";
import { trackingUrl } from "@/lib/tracking";

export const runtime = "nodejs";
const reply = (status: number) => new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reply(415);
  if (Number(request.headers.get("content-length")) > 1024) return reply(413);
  const url = trackingUrl();
  const endpoint = process.env.CRM_LEADS_ENDPOINT?.trim();
  const key = process.env.LANDING_API_KEY?.trim();
  const productId = process.env.LANDING_PRODUCT_ID?.trim();
  if (!url || !endpoint || !key || !productId || productId.length > 120) return reply(503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(url).origin && origin !== new URL(request.url).origin) return reply(403);
  let visitorId: string;
  try {
    const text = await request.text();
    if (text.length > 1024) return reply(413);
    const body = JSON.parse(text);
    if (!body || typeof body.visitorId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitorId)) return reply(400);
    visitorId = body.visitorId;
  } catch { return reply(400); }
  let target: URL;
  try {
    target = new URL(endpoint);
    if (target.protocol !== "https:" || target.username || target.password) return reply(503);
    // Reuse CRM_LEADS_ENDPOINT; never accept the destination URL from the browser.
    target.pathname = target.pathname.replace(/\/leads\/?$/, "/landing-visits");
    if (!target.pathname.endsWith("/landing-visits")) return reply(503);
    target.search = ""; target.hash = "";
  } catch { return reply(503); }
  try {
    const response = await fetch(target.href, {
      method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({ url, productId, visitorId }),
      signal: AbortSignal.timeout(5_000), cache: "no-store", redirect: "error",
    });
    return reply(response.status === 204 ? 204 : 502);
  } catch { return reply(502); }
}

import { NextResponse } from "next/server";
import { prepareOrder, validateOrder } from "@/lib/order";

export const runtime = "nodejs";

const errorMessage = "Не вдалося відправити замовлення. Спробуйте ще раз";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(status: number, fieldErrors?: ReturnType<typeof validateOrder>) {
  return NextResponse.json({ success: false, error: errorMessage, ...(fieldErrors ? { fieldErrors } : {}) }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return fail(415);
  if (Number(request.headers.get("content-length")) > 4096) return fail(413);

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 4096) return fail(413);
    body = JSON.parse(text);
  } catch { return fail(400); }

  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400);
  const data = body as Record<string, unknown>;
  const fields = { name: typeof data.name === "string" ? data.name : "", phone: typeof data.phone === "string" ? data.phone : "" };
  const fieldErrors = validateOrder(fields);
  if (Object.keys(fieldErrors).length) return fail(400, fieldErrors);
  if (typeof data.requestId !== "string" || !uuidPattern.test(data.requestId)) return fail(400);

  const endpoint = process.env.CRM_LEADS_ENDPOINT?.trim();
  const apiKey = process.env.LANDING_API_KEY?.trim();
  const landingId = process.env.LANDING_ID?.trim();
  if (!endpoint || !apiKey || !landingId || landingId.length > 120) return fail(503);
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password) return fail(503);
  } catch { return fail(503); }

  const customer = prepareOrder(fields);
  try {
    // CRM resolves the product name from its active Landing record.
    // CRM owns name, price and quantity. Browser overrides are never forwarded.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        customerName: customer.name,
        customerPhone: customer.phone,
        source: "Лендинг 3",
        landingId,
        requestId: data.requestId,
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) return fail(502);
    const confirmation: unknown = await response.json();
    if (!confirmation || typeof confirmation !== "object" || !("success" in confirmation) || confirmation.success !== true || !("orderId" in confirmation) || typeof confirmation.orderId !== "string" || !confirmation.orderId.trim()) return fail(502);

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Do not log the upstream response, request body, contacts or API key.
    // Retry is initiated by the customer with the same requestId (CRM deduplicates it).
    return fail(502);
  }
}

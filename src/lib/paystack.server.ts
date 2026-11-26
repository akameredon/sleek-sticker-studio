// Direct Paystack API calls with the business's own secret key. Server-only.
const API = "https://api.paystack.co";

function key() {
  const k = process.env["PAYSTACK_SECRET_KEY"];
  if (!k) throw new Error("Payments are not set up yet. Please contact us on WhatsApp.");
  return k;
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const payload = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !payload?.status) {
    throw new Error(`Paystack ${path} failed [${res.status}]: ${payload?.message ?? "no response"}`);
  }
  return payload.data as T;
}

export function initializeTransaction(input: {
  email: string; amountKobo: number; reference: string; callbackUrl: string; orderId: string;
}) {
  return call<{ authorization_url: string; access_code: string; reference: string }>("transaction/initialize", {
    method: "POST",
    body: {
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order_id: input.orderId },
    },
  });
}

export function verifyTransaction(reference: string) {
  return call<{ status: string; amount: number; currency: string }>(`transaction/verify/${encodeURIComponent(reference)}`);
}

export async function validWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret || !signature) return false;
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(rawBody)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

/** Marks an order paid only after Paystack confirms the exact amount. Safe to call repeatedly. */
export async function confirmPayment(reference: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order } = await supabaseAdmin.from("orders").select("id, status, total_naira").eq("reference", reference).maybeSingle();
  if (!order) return { paid: false };
  if (order.status !== "awaiting_payment") return { paid: true };
  const tx = await verifyTransaction(reference);
  const paid = tx.status === "success" && tx.amount === order.total_naira * 100 && tx.currency === "NGN";
  if (paid) {
    await supabaseAdmin.from("orders").update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id).eq("status", "awaiting_payment");
  }
  return { paid };
}

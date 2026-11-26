import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SIZES, quoteTotal } from "@/lib/pricing";

const PUBLISHED_URL = "https://project--9c4fec72-d235-465f-83c1-7a396326c399.lovable.app";

function returnOrigin(browserOrigin: string): string {
  if (!URL.canParse(browserOrigin)) return PUBLISHED_URL;
  const { protocol, hostname, origin } = new URL(browserOrigin);
  const ok = protocol === "https:" && (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com"));
  return ok ? origin : PUBLISHED_URL;
}

const OrderInput = z.object({
  sizeId: z.string(),
  quantity: z.number().int(),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(200),
  notes: z.string().trim().max(500).optional(),
  prompt: z.string().trim().max(500).optional(),
  design: z.string().startsWith("data:").max(21_000_000),
  origin: z.string().max(300),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof OrderInput>) => OrderInput.parse(input))
  .handler(async ({ data }) => {
    const size = SIZES.find((s) => s.id === data.sizeId);
    if (!size) throw new Error("Pick a sticker size");
    const total = quoteTotal(size.widthMm, size.heightMm, data.quantity);
    if (!total) throw new Error("That size and quantity needs a custom quote");

    const match = /^data:([\w/+.-]+);base64,(.+)$/.exec(data.design);
    if (!match) throw new Error("Design file is not valid");
    const mime = match[1]!;
    if (!/^(image\/(png|jpeg|webp|svg\+xml)|application\/pdf)$/.test(mime)) throw new Error("Use a PNG, JPG, WEBP, SVG or PDF design");
    const bytes = Uint8Array.from(atob(match[2]!), (c) => c.charCodeAt(0));
    const ext = mime === "application/pdf" ? "pdf" : mime === "image/svg+xml" ? "svg" : mime.split("/")[1];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reference = `SB-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const path = `${reference}.${ext}`;
    const up = await supabaseAdmin.storage.from("designs").upload(path, bytes, { contentType: mime });
    if (up.error) throw new Error("Could not save your design, please try again");

    const { data: order, error } = await supabaseAdmin.from("orders").insert({
      reference,
      customer_name: data.name,
      customer_phone: data.phone,
      customer_email: data.email,
      width_mm: size.widthMm,
      height_mm: size.heightMm,
      quantity: data.quantity,
      total_naira: total,
      design_path: path,
      design_prompt: data.prompt ?? null,
      notes: data.notes ?? null,
    }).select("id").single();
    if (error || !order) throw new Error("Could not create your order, please try again");

    const { initializeTransaction } = await import("@/lib/paystack.server");
    const tx = await initializeTransaction({
      email: data.email,
      amountKobo: total * 100,
      reference,
      orderId: order.id,
      callbackUrl: `${returnOrigin(data.origin)}/order/${reference}`,
    });
    await supabaseAdmin.from("orders").update({ paystack_access_code: tx.access_code }).eq("id", order.id);
    return { reference, authorizationUrl: tx.authorization_url };
  });

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { reference: string }) => z.object({ reference: z.string().regex(/^SB-[A-Z0-9-]{4,30}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { confirmPayment } = await import("@/lib/paystack.server");
    try { await confirmPayment(data.reference); } catch (e) { console.error(e); }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: o } = await supabaseAdmin.from("orders")
      .select("reference, status, total_naira, quantity, width_mm, height_mm, customer_name")
      .eq("reference", data.reference).maybeSingle();
    if (!o) return null;
    return { ...o, customer_name: o.customer_name.split(" ")[0] ?? "" };
  });

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Only the shop owner can see orders");
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const paths = data.map((o) => o.design_path);
    const { data: signed } = paths.length
      ? await supabaseAdmin.storage.from("designs").createSignedUrls(paths, 60 * 60)
      : { data: [] as { signedUrl: string | null }[] };
    return data.map((o, i) => ({ ...o, design_url: signed?.[i]?.signedUrl ?? null }));
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "paid" | "printing" | "delivered" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["paid", "printing", "delivered"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { admin: !!data };
  });

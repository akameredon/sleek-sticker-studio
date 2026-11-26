import { createFileRoute } from "@tanstack/react-router";
import { confirmPayment, validWebhookSignature } from "@/lib/paystack.server";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        if (!(await validWebhookSignature(raw, request.headers.get("x-paystack-signature")))) {
          return new Response("invalid signature", { status: 401 });
        }
        try {
          const { event, data } = JSON.parse(raw) as { event?: string; data?: { reference?: unknown } };
          if (event === "charge.success" && typeof data?.reference === "string") await confirmPayment(data.reference);
        } catch (e) {
          console.error("paystack webhook", e);
        }
        return new Response("ok");
      },
    },
  },
});

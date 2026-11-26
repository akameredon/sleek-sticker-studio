import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderStatus } from "@/lib/orders.functions";
import { naira } from "@/lib/pricing";

export const Route = createFileRoute("/order/$reference")({
  head: () => ({
    meta: [
      { title: "Your sticker order — Sleekblue" },
      { name: "description", content: "Check the payment and print status of your Sleekblue sticker order." },
      { property: "og:title", content: "Your sticker order — Sleekblue" },
      { property: "og:description", content: "Payment and print status for your sticker order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const LABEL: Record<string, string> = {
  awaiting_payment: "Waiting for payment",
  paid: "Paid — we're preparing your print",
  printing: "Printing now",
  delivered: "Delivered",
};

function OrderPage() {
  const { reference } = Route.useParams();
  const fetchStatus = useServerFn(getOrderStatus);
  const q = useQuery({
    queryKey: ["order", reference],
    queryFn: () => fetchStatus({ data: { reference } }),
    refetchInterval: (query) => (query.state.data?.status === "awaiting_payment" ? 4000 : false),
  });
  const o = q.data;
  const paid = o && o.status !== "awaiting_payment";

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl bg-card p-7 text-center shadow-sticker">
        {q.isLoading ? <Loader2 className="mx-auto size-10 animate-spin text-primary" /> : !o ? (
          <><h1 className="text-2xl font-extrabold">Order not found</h1><p className="mt-2 text-muted-foreground">Check the link and try again.</p></>
        ) : (
          <>
            {paid ? <CheckCircle2 className="mx-auto size-14 text-success animate-pop" /> : <Clock className="mx-auto size-14 text-primary" />}
            <h1 className="mt-4 text-3xl font-extrabold">{paid ? `Thank you, ${o.customer_name}!` : "Almost there"}</h1>
            <p className="mt-2 text-muted-foreground">{LABEL[o.status] ?? o.status}</p>
            <div className="mt-6 space-y-1 rounded-2xl bg-muted p-4 text-sm">
              <div className="flex justify-between"><span>Order</span><b>{o.reference}</b></div>
              <div className="flex justify-between"><span>Stickers</span><b>{o.quantity} × {o.width_mm / 10}×{o.height_mm / 10} cm</b></div>
              <div className="flex justify-between"><span>Total</span><b>{naira(o.total_naira)}</b></div>
            </div>
            {paid && <p className="mt-4 text-sm text-muted-foreground">We'll message you on WhatsApp when it's printed. Ready in about 3 days.</p>}
          </>
        )}
        <Button asChild variant="outline" className="mt-6 h-12 w-full rounded-xl"><Link to="/">Design another sticker</Link></Button>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { amIAdmin, listOrders, setOrderStatus } from "@/lib/orders.functions";
import { naira } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Orders — Sleekblue admin" },
      { name: "description", content: "Paid sticker orders ready to print." },
      { property: "og:title", content: "Orders — Sleekblue admin" },
      { property: "og:description", content: "Paid sticker orders ready to print." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const NEXT: Record<string, "printing" | "delivered" | undefined> = { paid: "printing", printing: "delivered" };
const BADGE: Record<string, string> = {
  awaiting_payment: "bg-muted text-muted-foreground",
  paid: "bg-accent text-accent-foreground",
  printing: "bg-secondary text-secondary-foreground",
  delivered: "bg-success text-success-foreground",
};

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(amIAdmin);
  const list = useServerFn(listOrders);
  const update = useServerFn(setOrderStatus);
  const role = useQuery({ queryKey: ["admin-role"], queryFn: () => check() });
  const orders = useQuery({ queryKey: ["orders"], queryFn: () => list(), enabled: !!role.data?.admin, refetchInterval: 30000 });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: "printing" | "delivered" }) => update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const paidOnly = (orders.data ?? []).filter((o) => o.status !== "awaiting_payment");
  const unpaid = (orders.data ?? []).length - paidOnly.length;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Orders</h1>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut />Sign out</Button>
      </div>
      {role.isLoading || orders.isLoading ? <Loader2 className="mx-auto mt-16 size-8 animate-spin text-primary" /> :
        !role.data?.admin ? <p className="mt-10 text-muted-foreground">This account isn't the shop owner.</p> : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">{paidOnly.length} paid · {unpaid} not paid yet</p>
          <div className="mt-5 space-y-3">
            {paidOnly.length === 0 && <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground">No paid orders yet. Share your link!</p>}
            {paidOnly.map((o) => (
              <div key={o.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-sticker">
                <a href={o.design_url ?? "#"} target="_blank" rel="noreferrer" className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {o.design_url && !o.design_path.endsWith(".pdf") ? <img src={o.design_url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs">PDF</span>}
                </a>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{o.customer_name}</b>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[o.status] ?? ""}`}>{o.status}</span>
                  </div>
                  <div className="text-muted-foreground">{o.quantity} × {o.width_mm / 10}×{o.height_mm / 10} cm · {naira(o.total_naira)}</div>
                  <div className="text-muted-foreground"><a className="underline" href={`https://wa.me/${o.customer_phone.replace(/\D/g, "").replace(/^0/, "234")}`} target="_blank" rel="noreferrer">{o.customer_phone}</a> · {o.customer_email}</div>
                  {o.notes && <div className="mt-1">{o.notes}</div>}
                  <div className="mt-2 flex gap-2">
                    {o.design_url && <Button asChild size="sm" variant="outline"><a href={o.design_url} download><Download />Design</a></Button>}
                    {NEXT[o.status] && <Button size="sm" variant="hero" disabled={mut.isPending} onClick={() => mut.mutate({ id: o.id, status: NEXT[o.status]! })}>Mark {NEXT[o.status]}</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

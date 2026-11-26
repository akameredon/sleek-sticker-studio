import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Upload, Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StickerPreview } from "@/components/StickerPreview";
import { QUANTITIES, SIZES, naira, quoteTotal, type Shape } from "@/lib/pricing";
import { streamImage } from "@/lib/stream-image";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sleekblue Stickers — Design & order custom stickers in 60 seconds" },
      { name: "description", content: "Design your sticker or label with AI or upload your own, pick a size, pay, and we print and deliver." },
      { property: "og:title", content: "Sleekblue Stickers — Custom stickers in 60 seconds" },
      { property: "og:description", content: "Design with AI or upload, pick a size, pay. We print and deliver." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const SHAPES: { id: Shape; label: string }[] = [
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "rectangle", label: "Label" },
];
const IDEAS = ["Logo for 'Mama's Kitchen' jollof", "Cute cat with sunglasses", "Organic shea butter label, green leaves"];

function Studio() {
  const [shape, setShape] = useState<Shape>("round");
  const [sizeId, setSizeId] = useState("r50");
  const [qty, setQty] = useState<number>(100);
  const [idea, setIdea] = useState("");
  const [design, setDesign] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [partial, setPartial] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const submit = useServerFn(createOrder);

  const size = SIZES.find((s) => s.id === sizeId)!;
  const total = useMemo(() => quoteTotal(size.widthMm, size.heightMm, qty), [size, qty]);

  function pickShape(s: Shape) {
    setShape(s);
    const first = SIZES.find((x) => x.shape === s && x.hint === "Most popular") ?? SIZES.find((x) => x.shape === s)!;
    setSizeId(first.id);
  }

  async function generate() {
    if (idea.trim().length < 2) { toast.error("Describe your sticker in a few words"); return; }
    setGenerating(true); setIsPdf(false);
    try {
      await streamImage("/api/generate-image", { idea, shape }, (url, final) => { setDesign(url); setPartial(!final); });
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace(/^Image generation failed: \d+ /, "") || "Could not create the design" : "Could not create the design");
    } finally { setGenerating(false); }
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { toast.error("File is too big (max 15 MB)"); return; }
    const r = new FileReader();
    r.onload = () => { setDesign(String(r.result)); setIsPdf(f.type === "application/pdf"); setPartial(false); };
    r.readAsDataURL(f);
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!design) { toast.error("Add a design first"); document.getElementById("design")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!total) return;
    setPaying(true);
    try {
      const res = await submit({ data: { sizeId, quantity: qty, ...form, notes: form.notes || undefined, prompt: idea || undefined, design, origin: window.location.origin } });
      window.location.href = res.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <header className="bg-hero px-5 pb-16 pt-6 text-primary-foreground">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <span className="font-display text-lg font-extrabold">sleekblue<span className="text-accent">.</span></span>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">Printed in 3 days</span>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">Your sticker,<br />ready in 60 seconds.</h1>
          <p className="mt-3 text-primary-foreground/80">Design it, pick a size, pay. We print and deliver.</p>
        </div>
      </header>

      <form onSubmit={pay} className="mx-auto -mt-10 max-w-xl space-y-4 px-4">
        {/* 1. Design */}
        <section id="design" className="rounded-3xl bg-card p-5 shadow-sticker">
          <Step n={1} title="Your design" done={!!design && !partial} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {SHAPES.map((s) => (
              <button type="button" key={s.id} data-active={shape === s.id} onClick={() => pickShape(s.id)} className="chip text-center text-sm font-semibold">{s.label}</button>
            ))}
          </div>
          <div className="mt-5"><StickerPreview src={design} shape={shape} isPdf={isPdf} partial={partial} className={design ? "animate-pop" : ""} /></div>
          <div className="mt-5 flex gap-2">
            <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe it: brand name, colours, vibe…" className="h-12 rounded-xl" maxLength={500}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void generate(); } }} />
            <Button type="button" variant="hero" className="h-12 rounded-xl px-4" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}<span className="hidden sm:inline">{design && !isPdf ? "Redo" : "Create"}</span>
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {IDEAS.map((i) => <button type="button" key={i} onClick={() => setIdea(i)} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-secondary">{i}</button>)}
          </div>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" className="h-12 w-full rounded-xl" onClick={() => fileRef.current?.click()}><Upload />Upload my own design</Button>
          <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf" onChange={(e) => onFile(e.target.files?.[0])} />
        </section>

        {/* 2. Size & quantity */}
        <section className="rounded-3xl bg-card p-5 shadow-sticker">
          <Step n={2} title="Size & quantity" done />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {SIZES.filter((s) => s.shape === shape).map((s) => (
              <button type="button" key={s.id} data-active={sizeId === s.id} onClick={() => setSizeId(s.id)} className="chip">
                <div className="font-bold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {QUANTITIES.map((q) => {
              const t = quoteTotal(size.widthMm, size.heightMm, q);
              return (
                <button type="button" key={q} data-active={qty === q} onClick={() => setQty(q)} className="chip text-center">
                  <div className="font-bold">{q}</div>
                  <div className="text-xs text-muted-foreground">{t ? `${naira(Math.round((t / q) * 10) / 10)}/pc` : "—"}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Details */}
        <section className="rounded-3xl bg-card p-5 shadow-sticker">
          <Step n={3} title="Where do we send it?" done={!!(form.name && form.phone && form.email)} />
          <div className="mt-4 space-y-2.5">
            <Input required placeholder="Full name" autoComplete="name" className="h-12 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input required type="tel" placeholder="WhatsApp number" autoComplete="tel" className="h-12 rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input required type="email" placeholder="Email (for your receipt)" autoComplete="email" className="h-12 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Delivery address or notes (optional)" className="h-12 rounded-xl" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </section>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:underline">Shop owner</Link>
        </p>

        {/* Sticky pay bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 shadow-bar backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">{qty} × {size.label} {shape === "round" ? "round" : ""}</div>
              <div className="font-display text-2xl font-extrabold">{total ? naira(total) : "Custom quote"}</div>
            </div>
            <Button type="submit" variant="hero" size="xl" disabled={paying || generating || !total}>
              {paying ? <Loader2 className="animate-spin" /> : <Lock />} Pay now
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Step({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex size-7 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>
        {done ? <Check className="size-4" /> : n}
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

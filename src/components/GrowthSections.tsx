import type { Quantity } from "@/lib/pricing";
import { TEMPLATES, type Template } from "@/lib/growth-content";

const PACKAGES: Array<{
  name: string;
  quantity: Quantity;
  eyebrow: string;
  detail: string;
  featured?: boolean;
}> = [
  {
    name: "Starter",
    quantity: 100,
    eyebrow: "Test a new idea",
    detail: "A small first batch for launches, events, or a new product.",
  },
  {
    name: "Business",
    quantity: 500,
    eyebrow: "Most popular",
    detail: "The practical batch for packaging you use every week.",
    featured: true,
  },
  {
    name: "Growth",
    quantity: 1000,
    eyebrow: "Best value",
    detail: "Keep your production line stocked and reduce repeat setup.",
  },
];

export function GrowthSections({
  quoteUrl,
  onTemplate,
  onPackage,
}: {
  quoteUrl: string | null;
  onTemplate: (template: Template) => void;
  onPackage: (quantity: Quantity) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-card p-5 shadow-sticker">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Start with a shortcut
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">Made for your kind of business</h2>
          </div>
          <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground sm:inline">
            No design skills needed
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a direction, change the words, and make it yours. You can still upload your
          finished artwork.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TEMPLATES.map((template) => (
            <button
              type="button"
              key={template.id}
              onClick={() => onTemplate(template)}
              className="group rounded-2xl border border-border bg-background p-3 text-left transition hover:-translate-y-0.5 hover:border-primary"
            >
              <span
                className={`mb-3 block h-12 w-12 ${template.shape === "round" ? "rounded-full" : "rounded-xl"} bg-gradient-to-br from-primary via-primary/80 to-accent shadow-sm`}
              />
              <span className="block text-sm font-bold">{template.label}</span>
              <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sticker">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Choose your batch
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">A simple way to buy more confidently</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <button
              type="button"
              key={pkg.name}
              onClick={() => onPackage(pkg.quantity)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary ${pkg.featured ? "border-primary bg-secondary" : "border-border bg-background"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{pkg.name}</span>
                {pkg.featured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold text-primary">
                {pkg.eyebrow} · {pkg.quantity} stickers
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{pkg.detail}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sticker">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              See the idea
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">Your label belongs on the product</h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">Original examples</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A sticker is more than a file. It is the first thing customers notice on the shelf, at an
          event, or in a delivery bag.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Mockup type="jar" title="Beauty jars" label="GLOW" />
          <Mockup type="bottle" title="Drink bottles" label="FRESH" />
          <Mockup type="box" title="Food packs" label="MADE" />
        </div>
      </section>

      <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sticker">
        <div className="grid gap-5 sm:grid-cols-3">
          <Promise
            title="1. Create"
            detail="Upload your logo or describe the direction you want."
          />
          <Promise title="2. Confirm" detail="See the size, choose a batch, and pay securely." />
          <Promise
            title="3. Collect"
            detail="We print your order and arrange delivery in Owerri."
          />
        </div>
        {quoteUrl && (
          <a
            href={quoteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-primary-foreground px-4 py-2 text-sm font-bold text-primary hover:bg-primary-foreground/90"
          >
            Have a question? Chat with us
          </a>
        )}
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-sticker">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Good to know</p>
        <h2 className="mt-1 text-2xl font-extrabold">Questions before you order?</h2>
        <div className="mt-4 divide-y divide-border">
          <Faq
            question="Can I use my existing logo?"
            answer="Yes. Upload a PNG, JPG, WEBP, SVG, or PDF and we will work from your file."
          />
          <Faq
            question="What if I need a size I do not see?"
            answer="Choose your closest option, then use the WhatsApp quote button. We will confirm the right size and price."
          />
          <Faq
            question="Can I reorder later?"
            answer="Keep your order reference after payment. We can use it to help you repeat the same sticker batch."
          />
          <Faq
            question="Where do you deliver?"
            answer="We are set up for Owerri orders first. For other locations, chat with us so we can confirm delivery."
          />
        </div>
      </section>
    </div>
  );
}

function Promise({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <div className="text-sm font-extrabold">{title}</div>
      <p className="mt-1 text-sm text-primary-foreground/75">{detail}</p>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group py-3">
      <summary className="cursor-pointer list-none text-sm font-bold group-open:text-primary">
        {question}
        <span className="float-right text-lg leading-4">+</span>
      </summary>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{answer}</p>
    </details>
  );
}

function Mockup({
  type,
  title,
  label,
}: {
  type: "jar" | "bottle" | "box";
  title: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div
        className={`relative mx-auto flex h-32 w-full max-w-[120px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-background ${type === "bottle" ? "rounded-[2rem]" : type === "jar" ? "rounded-[1.5rem]" : "rounded-lg"}`}
      >
        <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-md bg-accent px-1 py-2 text-[10px] font-black tracking-[0.2em] text-accent-foreground shadow-sm">
          {label}
        </span>
        <span className="absolute bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/15" />
      </div>
      <p className="mt-2 text-xs font-semibold">{title}</p>
    </div>
  );
}

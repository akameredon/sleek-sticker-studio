import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Shop owner sign in — Sleekblue" },
      { name: "description", content: "Sign in to manage Sleekblue sticker orders." },
      { property: "og:title", content: "Shop owner sign in — Sleekblue" },
      { property: "og:description", content: "Manage Sleekblue sticker orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    if (mode === "up" && !res.data.session) { toast.success("Check your email to confirm your account"); return; }
    nav({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={go} className="w-full max-w-sm space-y-3 rounded-3xl bg-card p-7 shadow-sticker">
        <h1 className="text-2xl font-extrabold">Shop owner</h1>
        <p className="text-sm text-muted-foreground">{mode === "in" ? "Sign in to see orders." : "The first account created becomes the owner."}</p>
        <Input type="email" required placeholder="Email" className="h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={8} placeholder="Password" className="h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="hero" className="h-12 w-full rounded-xl" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "First time? Create the owner account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateImage, imageSettings } from "@/lib/image-gateway.server";

const Body = z.object({
  idea: z.string().trim().min(2).max(500),
  shape: z.enum(["round", "square", "rectangle"]),
  stream: z.boolean().optional(),
});

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Describe your sticker in a few words", { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const { idea, shape, stream = true } = parsed.data;
        const prompt = `Print-ready ${shape} sticker / product label design, flat vector style, bold clean shapes, high contrast, centered on a plain white background, crisp edges, no mockup, no hands, no shadows. Any text must be spelled exactly as written. Design: ${idea}`;
        const upstream = await generateImage({ ...imageSettings, apiKey }, prompt, stream);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});

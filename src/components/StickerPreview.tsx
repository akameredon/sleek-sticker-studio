import type { Shape } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function StickerPreview({ src, shape, isPdf, partial, className }: {
  src: string | null; shape: Shape; isPdf?: boolean; partial?: boolean; className?: string;
}) {
  const frame = shape === "round" ? "rounded-full aspect-square" : shape === "square" ? "rounded-2xl aspect-square" : "rounded-2xl aspect-[2/1]";
  return (
    <div className={cn("relative mx-auto w-full max-w-[260px] overflow-hidden border-4 border-card bg-card shadow-sticker", frame, className)}>
      {src && !isPdf ? (
        <img src={src} alt="Your sticker design" className={cn("h-full w-full object-cover transition-[filter] duration-500", partial ? "blur-2xl" : "blur-0")} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
          {isPdf ? "PDF design attached ✓" : "Your design shows here"}
        </div>
      )}
    </div>
  );
}

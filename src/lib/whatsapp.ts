const number = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

/** Returns null until the owner configures a WhatsApp Business number. */
export function waLink(message: string): string | null {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function safeHttpUrl(value: string | null | undefined): string {
  if (!value) return "";
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}

export function safeReturnPath(value: string | null | undefined, origin: string): string {
  try { const url = new URL(value || "/feed", origin); return url.origin === origin ? url.pathname + url.search : "/feed"; }
  catch { return "/feed"; }
}

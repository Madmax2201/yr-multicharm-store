export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== "function") return;
  try {
    fbq("track", event, data || {});
  } catch {
    // ignore
  }
}
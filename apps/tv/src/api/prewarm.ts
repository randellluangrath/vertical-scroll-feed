const warmed = new Set<string>();
const inFlight = new Set<string>();

export function prewarmStream(url?: string | null): void {
  if (!url || warmed.has(url) || inFlight.has(url)) return;
  inFlight.add(url);
  fetch(url, { method: "GET" })
    .then(() => {
      warmed.add(url);
    })
    .catch(() => {})
    .finally(() => {
      inFlight.delete(url);
    });
}

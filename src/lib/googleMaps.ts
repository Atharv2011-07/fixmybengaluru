/// <reference types="google.maps" />
// Loads the Google Maps JS API once, via the Lovable connector browser key.
let promise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  const w = window as unknown as { google?: { maps?: typeof google.maps } };
  if (w.google?.maps) return Promise.resolve(w.google.maps);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string;
    const cb = "__initNammaGoogleMaps__";
    (window as unknown as Record<string, () => void>)[cb] = () =>
      resolve((window as unknown as { google: { maps: typeof google.maps } }).google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${cb}&channel=${channel}`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return promise;
}

export function pinIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 1C7.3 1 1 7 1 14.4 1 24 15 39 15 39s14-15 14-24.6C29 7 22.7 1 15 1z" fill="${color}" stroke="#0b1020" stroke-width="2"/><circle cx="15" cy="14" r="5.2" fill="#ffffff"/></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

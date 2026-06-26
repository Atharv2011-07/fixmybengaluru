/// <reference types="google.maps" />
// Loads the Google Maps JS API once, via the Lovable connector browser key.
import { getCustomMapsKey } from "./mapsKey.functions";

let promise: Promise<typeof google.maps> | null = null;

// On *.lovable.app / *.lovableproject.com the Lovable-managed key works. On a
// custom domain that key is referrer-blocked, so use the project's own key.
function isLovableHost(): boolean {
  const h = window.location.hostname;
  return h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h === "localhost";
}

async function resolveKey(): Promise<string> {
  const managed = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
  if (isLovableHost()) return managed;
  try {
    const { key } = await getCustomMapsKey();
    return key || managed;
  } catch {
    return managed;
  }
}

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  const w = window as unknown as { google?: { maps?: typeof google.maps } };
  if (w.google?.maps) return Promise.resolve(w.google.maps);
  if (promise) return promise;

  promise = (async () => {
    const key = await resolveKey();
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string;
    return await new Promise<typeof google.maps>((resolve, reject) => {
      const cb = "__initNammaGoogleMaps__";
      (window as unknown as Record<string, () => void>)[cb] = () =>
        resolve((window as unknown as { google: { maps: typeof google.maps } }).google.maps);
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${cb}&channel=${channel}`;
      s.async = true;
      s.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(s);
    });
  })();
  return promise;
}

export function pinIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 1C7.3 1 1 7 1 14.4 1 24 15 39 15 39s14-15 14-24.6C29 7 22.7 1 15 1z" fill="${color}" stroke="#0b1020" stroke-width="2"/><circle cx="15" cy="14" r="5.2" fill="#ffffff"/></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

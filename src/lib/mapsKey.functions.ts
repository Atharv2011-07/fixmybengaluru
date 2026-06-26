import { createServerFn } from "@tanstack/react-start";

// Returns the custom Google Maps browser key for use on the custom domain.
// This is a referrer-restricted browser key, so it is safe to expose to the client.
export const getCustomMapsKey = createServerFn({ method: "GET" }).handler(async () => {
  return { key: process.env.GOOGLE_API_KEY ?? "" };
});
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://fixmybengaluru.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "hourly", priority: "1.0" },
          { path: "/report", changefreq: "monthly", priority: "0.8" },
          { path: "/hall-of-shame", changefreq: "daily", priority: "0.8" },
          { path: "/quiz", changefreq: "monthly", priority: "0.5" },
          { path: "/contact", changefreq: "yearly", priority: "0.4" },
        ];

        // Public reports: one entry per report so Google can index them.
        // Uses the publishable key + public SELECT policy only.
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL!,
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false } },
        );
        const PAGE = 1000;
        let from = 0;
        for (;;) {
          const { data, error } = await supabase
            .from("reports")
            .select("id, updated_at")
            .order("created_at", { ascending: false })
            .range(from, from + PAGE - 1);
          if (error) {
            return new Response(`Sitemap data unavailable: ${error.message}`, { status: 502 });
          }
          for (const row of data ?? []) {
            entries.push({
              path: `/reports/${row.id}`,
              changefreq: "weekly",
              priority: "0.6",
              lastmod: row.updated_at?.slice(0, 10),
            });
          }
          if (!data || data.length < PAGE) break;
          from += PAGE;
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

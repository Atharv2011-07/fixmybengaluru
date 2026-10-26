import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import BlobCursor from "@/components/BlobCursor";
import { fetchSettings } from "@/lib/settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "ibUgtAvsaVc6ILPi0M9NpobfOFnjs1EZUIeXtOT0Nts" },
      { title: "FixMyBengaluru — Report Today. Fix Tomorrow." },
      {
        name: "description",
        content:
          "Report potholes in Bengaluru to BBMP, track repair status on a live city map, and help prioritize fixes with community verification.",
      },
      { property: "og:title", content: "Pothole Bengaluru — Report & Track Potholes" },
      {
        property: "og:description",
        content: "Crowdsourced pothole reporting and resolution tracking for Bengaluru.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Pothole Bengaluru — Report & Track Potholes" },
      { name: "description", content: "Bengaluru Road Watch lets citizens report potholes and track their repair status." },
      { property: "og:description", content: "Bengaluru Road Watch lets citizens report potholes and track their repair status." },
      { name: "twitter:description", content: "Bengaluru Road Watch lets citizens report potholes and track their repair status." },
      { property: "og:image", content: "https://fixmybengaluru.com/__l5e/assets-v1/8ad146f1-a9ca-4fb0-8245-08cce8e2134b/og-preview.png" },
      { name: "twitter:image", content: "https://fixmybengaluru.com/__l5e/assets-v1/8ad146f1-a9ca-4fb0-8245-08cce8e2134b/og-preview.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/__l5e/assets-v1/1f30fe21-7ffc-4405-baa2-d310fbc2a8c3/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/__l5e/assets-v1/1f30fe21-7ffc-4405-baa2-d310fbc2a8c3/favicon-32x32.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/__l5e/assets-v1/2091e6ac-c98f-4490-99c3-4888531828e2/favicon-180x180.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  // No logins: every visitor gets a silent, persistent anonymous session so
  // reporting, chat, quiz and voting keep working without any sign-in screen.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && !data.session) supabase.auth.signInAnonymously();
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div>
        <Outlet />
      </div>
      <GlobalBlobCursor />
      {mounted && <Toaster position="top-center" richColors />}
    </QueryClientProvider>
  );
}

function GlobalBlobCursor() {
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: fetchSettings });
  if (data && data.show_blobcursor === false) return null;
  return <BlobCursor global fillColor="#5227FF" zIndex={50} />;
}

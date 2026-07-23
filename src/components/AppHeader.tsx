import { Link } from "@tanstack/react-router";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import PillNav from "@/components/PillNav";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "List", href: "/hall-of-shame" },
  { label: "Quiz", href: "/quiz" },
  { label: "Contact", href: "/contact" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.assign("/");
          }}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <MapPin className="size-5 text-primary" />
          FixMyBengaluru
        </a>

        <div className="hidden md:block">
          <PillNav
            items={NAV_ITEMS}
            baseColor="color-mix(in oklab, var(--card) 70%, transparent)"
            pillColor="var(--primary)"
            hoveredPillTextColor="var(--primary-foreground)"
            pillTextColor="var(--foreground)"
          />
        </div>

        <nav className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="default" size="sm" className="gap-1.5">
            <Link to="/report">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Report</span>
            </Link>
          </Button>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-2 md:hidden">
        <PillNav
          items={NAV_ITEMS}
          className="w-full overflow-x-auto"
          baseColor="color-mix(in oklab, var(--card) 70%, transparent)"
          pillColor="var(--primary)"
          hoveredPillTextColor="var(--primary-foreground)"
          pillTextColor="var(--foreground)"
        />
      </div>
    </header>
  );
}

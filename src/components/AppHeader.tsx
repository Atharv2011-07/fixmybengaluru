import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Plus, LogOut, User as UserIcon, ShieldAlert, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import PillNav from "@/components/PillNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shame", href: "/hall-of-shame" },
  { label: "Community", href: "/community" },
  { label: "Quiz", href: "/quiz" },
  { label: "Contact", href: "/contact" },
];

export function AppHeader() {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

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
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/developer">
                <ShieldAlert className="size-4" />
                <span className="hidden sm:inline">Developer</span>
              </Link>
            </Button>
          )}
          <Button asChild variant="default" size="sm" className="gap-1.5">
            <Link to="/report">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Report</span>
            </Link>
          </Button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account">
                  <UserIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1100]">
                <DropdownMenuItem disabled className="text-xs opacity-100">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="mr-2 size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
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

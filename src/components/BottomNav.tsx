import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Skull, MessagesSquare, Brain, Phone } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/hall-of-shame", label: "Shame", icon: Skull },
  { to: "/community", label: "Community", icon: MessagesSquare },
  { to: "/quiz", label: "Quiz", icon: Brain },
  { to: "/contact", label: "Contact", icon: Phone },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border/70 bg-background/90 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
        {ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`size-5 ${active ? "scale-110" : ""} transition-transform`} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
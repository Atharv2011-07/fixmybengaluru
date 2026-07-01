import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MessagesSquare, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { moderateMessage } from "@/lib/moderation";
import { AppHeader } from "@/components/AppHeader";
import DotField from "@/components/DotField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Chat — Pothole Bengaluru" },
      {
        name: "description",
        content:
          "Join the Pothole Bengaluru community chat to discuss road issues, coordinate reports, and push for faster repairs.",
      },
    ],
  }),
  component: CommunityPage,
});

type Message = {
  id: string;
  user_id: string;
  display_name: string;
  content: string;
  created_at: string;
};

function CommunityPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Could not load messages");
        else setMessages((data ?? []) as Message[]);
        setLoadingMsgs(false);
      });

    const channel = supabase
      .channel("community_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => {
          setMessages((prev) => {
            const msg = payload.new as Message;
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user) return;
    const { clean, flagged, count } = moderateMessage(content);
    if (flagged) {
      toast.warning(
        count > 2
          ? "Message blocked — let's keep the chat respectful."
          : "Heads up: inappropriate language was filtered out.",
      );
      if (count > 2) return; // too much abuse — refuse to post
    }
    setSending(true);
    const display_name =
      (user.user_metadata?.name as string) || user.email?.split("@")[0] || "Citizen";
    const { error } = await supabase
      .from("community_messages")
      .insert({ user_id: user.id, display_name, content: clean });
    setSending(false);
    if (error) {
      toast.error("Message failed to send");
      return;
    }
    setText("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("community_messages").delete().eq("id", id);
    if (error) toast.error("Could not delete message");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-hero text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <DotField bulgeStrength={67} glowRadius={160} />
        </div>
        <div className="relative mx-auto flex max-w-3xl items-center gap-3 px-4 py-6">
          <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <MessagesSquare className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Community Chat</h1>
            <p className="text-sm text-primary-foreground/80">
              One room for all of Bengaluru — talk roads, repairs and action.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
        {loading ? (
          <div className="grid flex-1 place-items-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <div className="grid flex-1 place-items-center py-20">
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Sign in to read and join the conversation.</p>
              <Button asChild className="mt-4">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {loadingMsgs ? (
                <div className="grid place-items-center py-16 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No messages yet. Say hello 👋
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`group max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-[var(--shadow-card)] ${
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-card-foreground"
                        }`}
                      >
                        {!mine && (
                          <p className="mb-0.5 text-xs font-semibold text-accent">{m.display_name}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <div className="mt-1 flex items-center justify-end gap-2">
                          <span className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {mine && (
                            <button
                              onClick={() => remove(m.id)}
                              aria-label="Delete message"
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="sticky bottom-0 flex items-center gap-2 border-t border-border/70 bg-background/90 py-3 backdrop-blur"
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                maxLength={1000}
                autoFocus
              />
              <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Send">
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { notifications } from "@/mocks/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · TalentForge AI" }] }),
  component: () => (
    <AppShell role="recruiter">
      <NotificationsView />
    </AppShell>
  ),
});

function NotificationsView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Inbox" title="Notifications" description="Everything happening across your hiring org." />
      <GlassCard className="!p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 px-5 py-4", !n.read && "surface-1")}>
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.priority === "high" && "bg-aurora-cyan",
                  n.priority === "medium" && "bg-aurora-violet",
                  n.priority === "low" && "bg-white/30",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/AppShell";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings · TalentForge AI" }] }),
  component: () => (
    <AppShell role="recruiter">
      <Settings />
    </AppShell>
  ),
});

function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Workspace" title="Settings" description="Preferences, appearance, and integrations." />

      <GlassCard>
        <h3 className="mb-4 text-sm font-medium text-foreground">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Full name</Label>
            <input defaultValue="Alex Rivera" className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/40" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <input defaultValue="alex@northwind.co" className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/40" />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-sm font-medium text-foreground">Appearance</h3>
        <div className="space-y-3">
          {[
            { label: "Dark mode", desc: "Aurora is best in dark — always on for now" },
            { label: "Reduce motion", desc: "Tone down animations across the app" },
            { label: "Aurora background", desc: "Show the animated aurora on every screen" },
          ].map((r, i) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border hairline surface-1 p-3">
              <div>
                <p className="text-sm text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Switch defaultChecked={i !== 1} />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-sm font-medium text-foreground">AI</h3>
        <div className="space-y-3">
          {[
            { label: "AI ranking", desc: "Automatically rank candidates by match score" },
            { label: "AI outreach drafts", desc: "Pre-draft first-touch messages" },
            { label: "Duplicate detection", desc: "Warn when a candidate already exists" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border hairline surface-1 p-3">
              <div>
                <p className="text-sm text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}